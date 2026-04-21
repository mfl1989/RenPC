import type {
    DataErasureOption,
    RecycleOrderFormValues,
    TimeSlotOption,
} from '../schemas/recycleOrderSchema.ts'

const DATA_ERASURE_LABEL: Record<DataErasureOption, string> = {
  self_erase_free: 'ご自身で事前に消去する',
  full_service_paid: 'おまかせ消去サービスを利用する',
}

const TIME_SLOT_LABEL: Record<TimeSlotOption, string> = {
  unspecified: '指定なし',
  morning: '午前中',
  t12_14: '12:00〜14:00',
  t14_16: '14:00〜16:00',
  t16_18: '16:00〜18:00',
  t18_21: '18:00〜21:00',
}

/** 確認・ログ用の日本語ラベル（キーはフォーム／API フィールド名） */
const FIELD_LABEL_JA: Record<keyof RecycleOrderFormValues, string> = {
  idempotencyKey: '送信識別子',
  pcCount: 'パソコン台数',
  monitorCount: 'モニター台数',
  smallApplianceBoxCount: '小型家電の箱数',
  dataErasureOption: 'データ消去方法',
  collectionDate: '回収希望日',
  timeSlot: '希望時間帯',
  cardboardDeliveryRequested: '段ボール事前送付',
  customerNameKanji: '氏名（漢字）',
  customerNameKana: '氏名（フリガナ）',
  postalCode: '郵便番号',
  prefecture: '都道府県',
  city: '市区町村',
  addressLine1: '番地・建物名',
  addressLine2: '建物名・部屋番号（任意）',
  phone: '電話番号',
  email: 'メールアドレス',
  termsAccepted: '利用規約への同意',
}

function formatValueJa(
  key: keyof RecycleOrderFormValues,
  value: RecycleOrderFormValues[keyof RecycleOrderFormValues],
): string | number {
  if (key === 'dataErasureOption') {
    return DATA_ERASURE_LABEL[value as DataErasureOption]
  }
  if (key === 'timeSlot') {
    return TIME_SLOT_LABEL[value as TimeSlotOption]
  }
  if (key === 'cardboardDeliveryRequested') {
    return value ? '希望する' : '希望しない'
  }
  if (key === 'termsAccepted') {
    return value ? '同意する' : '未同意'
  }
  if (typeof value === 'boolean') {
    return value ? 'はい' : 'いいえ'
  }
  if (typeof value === 'number') {
    return value
  }
  return String(value ?? '')
}

/**
 * Zod 検証済みデータを、日本語ラベル付きで console に整形出力する（API 送信前モック用）
 */
export function logValidatedRecycleOrderJa(data: RecycleOrderFormValues): void {
  const 日本語サマリー: Record<string, string | number> = {}

  for (const key of Object.keys(data) as (keyof RecycleOrderFormValues)[]) {
    if (key === 'idempotencyKey') {
      continue
    }
    const label = FIELD_LABEL_JA[key]
    日本語サマリー[label] = formatValueJa(key, data[key])
  }

  const payload = {
    検証結果: '成功',
    検証メッセージ: 'RecycleOrderSchema（Zod）に適合したデータです。',
    日本語サマリー,
    API用データ_英キー: data,
  }

  console.log('[RecycleOrder] 検証済み JSON（日本語サマリー + API 用キー）', JSON.stringify(payload, null, 2))
}
