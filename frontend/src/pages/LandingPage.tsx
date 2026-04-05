/**
 * ランディングページ（docs/03_frontend_features.md §2）
 * レイアウト・情報優先度はリネットジャパン公式サイトを参照したコーポレート LP 風（デモ用コピー）。
 * @see https://www.renet.jp
 */

import { Link } from 'react-router-dom'

/** 宅配回収の流れ（静的モック／サイト構成に準拠した 3 ステップ要約） */
const MOCK_PROCESS_STEPS = [
  {
    step: 1,
    title: '事前に申込み',
    description:
      'Web フォームから台数・希望日時をお知らせください。最短翌日からの集荷など、スムーズな手配が可能です。',
    Icon: IconApply,
  },
  {
    step: 2,
    title: '段ボールへ梱包',
    description:
      'お手持ちの段ボールに梱包いただけます。クッション材で保護し、破損しにくいようお包みください。',
    Icon: IconPack,
  },
  {
    step: 3,
    title: '宅配業者へ引渡し',
    description:
      'ご指定の日時に宅配業者がお伺いし、玄関先でお預かりします。工場到着後はメール等で状況をお知らせします。',
    Icon: IconHandover,
  },
] as const

/** 無料回収の対象品目（モック・サイト記載の例に沿った表現） */
const MOCK_FREE_ITEMS = [
  { name: 'ノートパソコン', note: '電源アダプタ同梱推奨' },
  { name: 'タブレット端末', note: 'Surface 等（パスコード解除済み）' },
  {
    name: 'デスクトップパソコン',
    note: 'モニター・キーボード等の周辺機器も同梱可（モック）',
  },
  { name: '一体型パソコン', note: '梱包時のサイズ・重量制限にご注意ください' },
  { name: 'iPad', note: 'Apple 製タブレット' },
] as const

/** 有料・別ルートが必要な例（FAQ の整理に近いモック） */
const MOCK_SPECIAL_ROUTE_ITEMS = [
  {
    name: 'CRT モニター',
    note: '有害物質処理のため別途料金が発生する場合があります（モック価格表記は省略）',
  },
  {
    name: 'テレビ・冷蔵庫・洗濯機・エアコン（家電 4 品目）',
    note: '専用の回収チャネルからお申し込みください（本デモではリンクなし）',
  },
  {
    name: 'リチウムイオン電池のみの送付',
    note: '危険物取扱の都合によりお受けできない場合があります',
  },
] as const

function IconApply(props: { className?: string }) {
  return (
    <svg
      className={props.className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="8"
        y="6"
        width="32"
        height="36"
        rx="3"
        className="stroke-current"
        strokeWidth="2"
      />
      <path
        d="M16 14h16M16 22h10M16 30h14"
        className="stroke-current"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconPack(props: { className?: string }) {
  return (
    <svg
      className={props.className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M6 16 L24 8 L42 16 L24 24 Z"
        className="stroke-current"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M6 16v18l18 8 18-8V16"
        className="stroke-current"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M24 24v18"
        className="stroke-current"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconHandover(props: { className?: string }) {
  return (
    <svg
      className={props.className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="5"
        y="18"
        width="26"
        height="18"
        rx="2"
        className="stroke-current"
        strokeWidth="2"
      />
      <path
        d="M31 24h8l4 4v6h-6"
        className="stroke-current"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="37" cy="34" r="3" className="stroke-current" strokeWidth="2" />
    </svg>
  )
}

const subNavLinks = [
  { label: '宅配回収の流れ', href: '#flow' },
  { label: '回収品目', href: '#items' },
  { label: 'データ消去', href: '#trust' },
] as const

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      {/* ヘッダー：ロゴ左・オレンジ CTA 右（リネット風） */}
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-4 pt-4 md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
            <div>
              <p className="text-xs font-medium text-slate-500 md:text-sm">
                パソコン・ノート PC の無料回収（処分・廃棄）デモサイト
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
                  Recycle PC
                </span>
                <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-900">
                  認定事業者（デモ）
                </span>
              </div>
            </div>
            <Link
              to="/apply/step1"
              className="inline-flex min-h-11 min-w-[11rem] items-center justify-center rounded-md bg-orange-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
            >
              カンタンお申込み
            </Link>
          </div>
          <nav
            className="flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100 py-3 text-sm"
            aria-label="サブナビゲーション"
          >
            {subNavLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-medium text-slate-700 underline-offset-4 hover:text-orange-600 hover:underline"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main>
        {/* ヒーロー：実績・認定を前に出す */}
        <section
          id="apply"
          className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white"
          aria-labelledby="hero-heading"
        >
          <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-20">
            <div className="mx-auto max-w-4xl text-center">
              <p className="mb-3 text-sm font-bold text-emerald-800 md:text-base">
                環境省認定 × 自治体連携のパソコン回収（デモコピー）
              </p>
              <h1
                id="hero-heading"
                className="mb-4 text-2xl font-bold leading-snug tracking-tight text-slate-900 md:text-4xl md:leading-tight"
              >
                豊富なパソコン回収実績。
                <br className="hidden sm:block" />
                法律に基づく正しいルートで処分します。
              </h1>
              <p className="mx-auto mb-2 max-w-2xl text-lg font-semibold text-slate-800 md:text-xl">
                パソコンの宅配便回収にご協力ください。
              </p>
              <p className="mx-auto mb-10 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
                小型家電リサイクル法に基づく認定の枠組みを想定したデモ画面です。実際の料金・対象エリアは公開時に定義してください。
              </p>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  to="/apply/step1"
                  className="inline-flex min-h-12 min-w-[14rem] items-center justify-center rounded-lg bg-orange-500 px-10 py-3 text-base font-bold text-white shadow-md transition hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 md:text-lg"
                >
                  カンタンお申込み
                </Link>
                <a
                  href="#items"
                  className="text-sm font-semibold text-slate-700 underline-offset-4 hover:text-orange-600 hover:underline"
                >
                  回収品目・条件を見る
                </a>
              </div>
              <p className="mt-8 text-xs leading-relaxed text-slate-500">
                ※ パソコン本体を含む回収の場合の料金イメージなどは、運用ポリシーに合わせて記載してください（リネット公式サイトの注意書き構成を参考）。
              </p>
            </div>
          </div>
        </section>

        {/* 信頼・注意（サイト中段の「法律」「無許可業者」系ブロックの簡易版） */}
        <section
          id="trust"
          className="border-b border-slate-200 bg-emerald-900 py-10 text-white"
          aria-labelledby="trust-heading"
        >
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <h2 id="trust-heading" className="sr-only">
              信頼情報と注意喚起
            </h2>
            <div className="grid gap-8 md:grid-cols-2 md:gap-12">
              <div>
                <h3 className="text-lg font-bold md:text-xl">
                  法律に基づく宅配回収
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-emerald-100">
                  国から認定を受けた事業者による、適正な回収・再資源化の流れをイメージしたコピーです。自治体との連携や認定番号の表記は、公開時に実データへ差し替えてください。
                </p>
              </div>
              <div className="rounded-lg border border-emerald-700 bg-emerald-950/40 p-5">
                <h3 className="text-lg font-bold text-amber-100">
                  無許可の業者にご注意ください
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-emerald-100">
                  チラシ・ネット広告・空き地回収など、不審な回収には十分ご注意ください。行政や認定事業者の情報を確認のうえ、安心できるルートをお選びください（環境省資料の構成を参考したデモ文面）。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 宅配回収の流れ */}
        <section
          id="flow"
          className="border-b border-slate-200 bg-slate-50 py-14 md:py-20"
          aria-labelledby="process-heading"
        >
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <h2
              id="process-heading"
              className="mb-2 text-center text-2xl font-bold text-slate-900 md:text-3xl"
            >
              宅配回収の流れ
            </h2>
            <p className="mb-12 text-center text-sm text-slate-600 md:text-base">
              まずは事前申込み。梱包後、宅配業者がご指定の日時にお伺いします。
            </p>
            <div className="grid gap-8 md:grid-cols-3 md:gap-6">
              {MOCK_PROCESS_STEPS.map(({ step, title, description, Icon }) => (
                <article
                  key={step}
                  className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-900">
                      {step}
                    </span>
                    <Icon className="h-10 w-10 text-orange-700" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-slate-900">
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 対象品目 */}
        <section
          id="items"
          className="bg-white py-14 md:py-20"
          aria-labelledby="items-heading"
        >
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <h2
              id="items-heading"
              className="mb-2 text-center text-2xl font-bold text-slate-900 md:text-3xl"
            >
              回収品目の目安
            </h2>
            <p className="mb-10 text-center text-sm text-slate-600 md:text-base">
              無料回収の対象例と、別途料金・別ルートが必要な例です（モック）。
            </p>

            <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
              <div className="overflow-hidden rounded-xl border border-emerald-200 bg-white shadow-sm ring-1 ring-emerald-100">
                <div className="border-b border-emerald-600 bg-emerald-700 px-4 py-3">
                  <h3 className="text-sm font-bold text-white md:text-base">
                    無料回収の対象品（例）
                  </h3>
                </div>
                <ul className="divide-y divide-slate-100">
                  {MOCK_FREE_ITEMS.map((item) => (
                    <li
                      key={item.name}
                      className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="font-semibold text-slate-900">
                        {item.name}
                      </span>
                      <span className="text-xs text-slate-600 sm:text-right sm:text-sm">
                        {item.note}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm ring-1 ring-amber-100">
                <div className="border-b border-amber-700 bg-amber-800 px-4 py-3">
                  <h3 className="text-sm font-bold text-white md:text-base">
                    有料・別ルートの例
                  </h3>
                </div>
                <ul className="divide-y divide-slate-100">
                  {MOCK_SPECIAL_ROUTE_ITEMS.map((item) => (
                    <li
                      key={item.name}
                      className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <span className="font-semibold text-slate-900">
                        {item.name}
                      </span>
                      <span className="text-xs text-slate-600 sm:text-right sm:text-sm">
                        {item.note}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-100 py-10">
        <div className="mx-auto max-w-6xl px-4 text-center md:px-6">
          <div className="mb-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-slate-600">
            <span className="cursor-default hover:text-slate-800">会社概要</span>
            <span className="text-slate-300" aria-hidden>
              |
            </span>
            <span className="cursor-default hover:text-slate-800">利用規約</span>
            <span className="text-slate-300" aria-hidden>
              |
            </span>
            <span className="cursor-default hover:text-slate-800">
              個人情報保護方針
            </span>
          </div>
          <p className="text-xs text-slate-500">
            © Recycle PC デモ — レイアウト参考：
            <a
              href="https://www.renet.jp"
              className="ml-1 font-medium text-slate-600 underline-offset-2 hover:text-orange-600 hover:underline"
              target="_blank"
              rel="noreferrer noopener"
            >
              リネットジャパン公式サイト
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
