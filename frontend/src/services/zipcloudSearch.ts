/**
 * 郵便番号検索 — docs/03_frontend_features.md Step 3
 * 常に同一オリジンの /api/zip/search を呼ぶ（Spring が ZipCloud へサーバー転送）。
 * ブラウザで zipcloud.ibsnet.co.jp を直叩きしない（CORS・404 誤解を避ける）。
 */

const zipSearchUrl = (zipcode: string) =>
  `/api/zip/search?zipcode=${encodeURIComponent(zipcode)}`

export type ZipCloudResult = {
  zipcode: string
  prefcode: string
  address1: string
  address2: string
  address3: string
}

export type ZipCloudSearchResponse = {
  status: number
  message: string | null
  results: ZipCloudResult[] | null
}

export type ZipCloudLookupOk = {
  ok: true
  prefecture: string
  city: string
}

export type ZipCloudLookupErr = {
  ok: false
  /** ユーザー向け日本語メッセージ */
  messageJa: string
}

/** UTF-8 BOM を除き、前後空白を削る */
function stripBomAndTrim(s: string): string {
  return s.replace(/^\uFEFF/, '').trim()
}

/**
 * 統一 API ラップ `{ code, message, data }` のときは内側の data を ZipCloud 形として扱う。
 * Spring が String を二重 JSON 化していた場合の文字列ラップも剥がす。
 */
function parseZipCloudPayload(raw: unknown): ZipCloudSearchResponse | null {
  let cur: unknown = raw
  for (let i = 0; i < 5; i++) {
    if (typeof cur === 'string') {
      const t = stripBomAndTrim(cur)
      if (!t) {
        return null
      }
      try {
        cur = JSON.parse(t) as unknown
      } catch {
        return null
      }
      continue
    }
    break
  }

  if (!cur || typeof cur !== 'object' || Array.isArray(cur)) {
    return null
  }

  let o = cur as Record<string, unknown>

  // プロジェクト標準: { code, data, message } の data が ZipCloud 互換オブジェクト
  const data = o.data
  if (data !== null && data !== undefined && typeof data === 'object' && !Array.isArray(data)) {
    const inner = data as Record<string, unknown>
    if ('status' in inner) {
      o = inner
    }
  }

  const statusRaw = o.status
  const statusNum =
    typeof statusRaw === 'number'
      ? statusRaw
      : typeof statusRaw === 'string'
        ? Number(statusRaw)
        : NaN
  if (!Number.isFinite(statusNum)) {
    return null
  }

  const message =
    o.message === null || o.message === undefined
      ? null
      : String(o.message)

  let results: ZipCloudResult[] | null = null
  if (Array.isArray(o.results)) {
    results = o.results as ZipCloudResult[]
  } else if (o.results !== null && o.results !== undefined) {
    return null
  }

  return {
    status: statusNum,
    message,
    results,
  }
}

/**
 * 7桁郵便番号で住所の先頭（都道府県・市区町村）を取得する
 */
export async function lookupAddressByPostalCode(
  zipDigits: string,
): Promise<ZipCloudLookupOk | ZipCloudLookupErr> {
  const zip = zipDigits.replace(/\D/g, '')
  if (zip.length !== 7) {
    return { ok: false, messageJa: '郵便番号は7桁の半角数字で入力してください。' }
  }

  let res: Response
  try {
    res = await fetch(zipSearchUrl(zip))
  } catch {
    return {
      ok: false,
      messageJa:
        '郵便番号検索に失敗しました。ネットワークをご確認のうえ、再度お試しください。',
    }
  }

  let text: string
  try {
    text = await res.text()
  } catch {
    return {
      ok: false,
      messageJa:
        '郵便番号検索の応答を読み取れませんでした。バックエンド（:8080）が起動しているか確認してください。',
    }
  }

  const cleaned = stripBomAndTrim(text)

  if (!cleaned) {
    return {
      ok: false,
      messageJa:
        '郵便番号検索の応答が空です。バックエンド（:8080）が起動しているか確認してください。',
    }
  }

  // プロキシ先ダウン時に Vite が index.html を返すことがある
  if (cleaned.startsWith('<!') || cleaned.startsWith('<html')) {
    return {
      ok: false,
      messageJa:
        '郵便番号検索サーバーから HTML が返されました。Spring Boot（ポート 8080）を起動し、ブラウザを再読み込みしてください。',
    }
  }

  let parsedUnknown: unknown
  try {
    parsedUnknown = JSON.parse(cleaned)
  } catch {
    return {
      ok: false,
      messageJa:
        '郵便番号検索の応答が JSON ではありません。バックエンド（:8080）が起動しているか、開発サーバの /api プロキシ設定を確認してください。',
    }
  }

  const json = parseZipCloudPayload(parsedUnknown)
  if (!json) {
    if (import.meta.env.DEV) {
      console.warn(
        '[zip search] 想定外の JSON 形です。先頭 200 文字:',
        cleaned.slice(0, 200),
      )
    }
    return {
      ok: false,
      messageJa:
        '郵便番号検索の応答形式が想定と異なります。バックエンドを最新版に更新して再起動してください。',
    }
  }

  if (json.status !== 200) {
    return {
      ok: false,
      messageJa:
        json.message?.trim() ||
        '郵便番号の形式が正しくないか、検索できませんでした。',
    }
  }

  const first = json.results?.[0]
  if (!first) {
    return {
      ok: false,
      messageJa: '該当する住所が見つかりませんでした。手入力でご入力ください。',
    }
  }

  const city = `${first.address2 ?? ''}${first.address3 ?? ''}`.trim()

  return {
    ok: true,
    prefecture: first.address1 ?? '',
    city,
  }
}
