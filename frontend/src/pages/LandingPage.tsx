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

const MOCK_FREE_CONDITIONS = [
  'パソコン本体を含む回収は 1 箱分無料を想定',
  '壊れていても古くても回収対象の想定',
  'キーボード・マウス・ケーブル類も同梱しやすい構成',
] as const

const MOCK_RECOVERY_OK_POINTS = [
  {
    title: 'どんなパソコンでもOK',
    description: 'ノート、デスクトップ、一体型、タブレットなど幅広い機種を対象とする想定です。',
  },
  {
    title: '壊れていてもOK',
    description: '電源が入らない機器や古い機種でも、回収対象として案内できる構成にしています。',
  },
  {
    title: '周辺機器も同梱しやすい',
    description: 'マウス、キーボード、ケーブル類などをまとめて梱包しやすい想定です。',
  },
] as const

const MOCK_DATA_ERASURE_GUIDES = [
  {
    title: 'ご自身で消去する場合',
    points: [
      '初期化だけでは完全に消えないケースがあるため、専用ソフト等の利用を想定した案内を掲載します。',
      '発送前にバックアップを行い、必要なデータが残っていないかをご確認ください。',
    ],
  },
  {
    title: 'おまかせ消去サービスを利用する場合',
    points: [
      '専門工程で消去を行う有料オプションとして案内し、証明書の有無や対象条件を明示します。',
      '壊れたパソコンや古い機種でも対応可能かどうかを、正式版では明確に記載します。',
    ],
  },
] as const

const MOCK_FAQS = [
  {
    question: '壊れたパソコンも回収できますか？',
    answer:
      'はい。壊れていても回収対象とする想定です。正式運用時は、無料条件や対象外ケースを併記してください。',
  },
  {
    question: '段ボールはどんな箱でも大丈夫ですか？',
    answer:
      '一般的な段ボールを利用できる想定です。サイズ上限や重量制限は梱包方法ページで案内すると分かりやすくなります。',
  },
  {
    question: '回収日時はあとから変更できますか？',
    answer:
      '変更受付の締切や方法をマイページまたは問い合わせ窓口に紐づけて案内すると、実運用に近い構成になります。',
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
  { label: '宅配回収の流れ', to: '/guide/flow' },
  { label: '梱包方法', to: '/guide/packing' },
  { label: '回収品目', href: '#items' },
  { label: 'サポート', to: '/contact' },
] as const

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      {/* ヘッダー：ロゴ左・オレンジ CTA 右（リネット風） */}
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6">
            <p className="text-xs leading-6 text-slate-600 md:text-sm">
              ご不明点がある場合は、申込前でも相談できます。対象品目や梱包方法の確認もこちらからどうぞ。
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/contact"
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
              >
                相談フォーム
              </Link>
              <a
                href="#faq"
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
              >
                よくある質問
              </a>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 pt-4 md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
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
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/contact"
                className="inline-flex min-h-11 min-w-32 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
              >
                サポート
              </Link>
              <Link
                to="/apply/step1"
                className="inline-flex min-h-11 min-w-44 items-center justify-center rounded-xl border border-orange-300 bg-white px-6 py-2.5 text-sm font-bold text-orange-700 shadow-sm transition hover:-translate-y-px hover:border-orange-400 hover:bg-orange-50 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
              >
                カンタンお申込み
              </Link>
            </div>
          </div>
          <nav
            className="flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100 py-3 text-sm"
            aria-label="サブナビゲーション"
          >
            {subNavLinks.map((link) => (
              'to' in link ? (
                <Link
                  key={link.to}
                  to={link.to}
                  className="font-medium text-slate-700 underline-offset-4 hover:text-orange-600 hover:underline"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="font-medium text-slate-700 underline-offset-4 hover:text-orange-600 hover:underline"
                >
                  {link.label}
                </a>
              )
            ))}
          </nav>
        </div>
      </header>

      <main>
        {/* ヒーロー：実績・認定を前に出す */}
        <section
          id="apply"
          className="border-b border-slate-200 bg-linear-to-b from-slate-50 to-white"
          aria-labelledby="hero-heading"
        >
          <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-20">
            <div className="mx-auto max-w-4xl text-center">
              <p className="mb-3 text-xs font-semibold tracking-[0.08em] text-emerald-800 md:text-sm">
                環境省認定 × 自治体連携のパソコン回収（デモコピー）
              </p>
              <h1
                id="hero-heading"
                className="mb-4 text-[30px] font-semibold leading-tight tracking-[-0.03em] text-slate-900 md:text-[46px] md:leading-[1.2]"
              >
                豊富なパソコン回収実績。
                <br className="hidden sm:block" />
                法律に基づく正しいルートで処分します。
              </h1>
              <div className="mx-auto mb-10 max-w-xl text-left">
                <p className="text-[17px] font-semibold leading-8 text-slate-800 md:text-[19px]">
                  パソコンの宅配便回収にご協力ください。
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600 md:text-[15px]">
                  小型家電リサイクル法に基づく認定の枠組みを想定したデモ画面です。実際の料金・対象エリアは公開時に定義してください。
                </p>
              </div>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  to="/apply/step1"
                  className="inline-flex min-h-12 min-w-56 items-center justify-center rounded-xl border border-orange-300 bg-white px-10 py-3 text-base font-bold text-orange-700 shadow-sm transition hover:-translate-y-px hover:border-orange-400 hover:bg-orange-50 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 md:text-lg"
                >
                  カンタンお申込み
                </Link>
                <div className="grid w-full max-w-md gap-3 sm:w-auto sm:grid-cols-2">
                  <Link
                    to="/guide/flow"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                  >
                    宅配回収の流れ
                  </Link>
                  <Link
                    to="/guide/packing"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                  >
                    梱包方法
                  </Link>
                  <a
                    href="#items"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                  >
                    回収品目・条件を見る
                  </a>
                  <Link
                    to="/orders/lookup"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                  >
                    申込状況を確認する
                  </Link>
                </div>
              </div>
              <p className="mt-8 text-xs leading-relaxed text-slate-500">
                ※ パソコン本体を含む回収の場合の料金イメージなどは、運用ポリシーに合わせて記載してください（リネット公式サイトの注意書き構成を参考）。
              </p>
            </div>
          </div>
        </section>

        <section
          id="free-conditions"
          className="border-b border-slate-200 bg-white py-12 md:py-16"
          aria-labelledby="free-conditions-heading"
        >
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-8">
              <article className="overflow-hidden rounded-[28px] border border-emerald-200 bg-linear-to-br from-emerald-50 via-white to-emerald-100 shadow-sm">
                <div className="border-b border-emerald-200 px-6 py-4 md:px-8">
                  <p className="text-xs font-semibold tracking-[0.08em] text-emerald-700">
                    無料条件
                  </p>
                  <h2
                    id="free-conditions-heading"
                    className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-slate-900 md:text-3xl"
                  >
                    パソコン回収の無料条件を先に確認できます
                  </h2>
                </div>
                <div className="px-6 py-6 md:px-8 md:py-7">
                  <ul className="space-y-4">
                    {MOCK_FREE_CONDITIONS.map((condition) => (
                      <li key={condition} className="flex gap-4 rounded-2xl border border-emerald-100 bg-white/80 p-4">
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                          OK
                        </span>
                        <span className="text-sm font-medium leading-7 text-slate-700 md:text-base">
                          {condition}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 text-xs leading-6 text-slate-500 md:text-sm">
                    ※ 実際の無料条件、箱数制限、重量上限、対象外品目は公開時の運用ポリシーに合わせて確定してください。
                  </p>
                </div>
              </article>

              <article className="overflow-hidden rounded-[28px] border border-orange-200 bg-linear-to-br from-orange-50 via-white to-amber-50 shadow-sm">
                <div className="border-b border-orange-200 px-6 py-4 md:px-8">
                  <p className="text-xs font-semibold tracking-[0.08em] text-orange-700">
                    回収OK条件
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-slate-900 md:text-3xl">
                    処分に迷いやすい機器もまとめて確認
                  </h3>
                </div>
                <div className="grid gap-3 px-6 py-6 md:px-8 md:py-7">
                  {MOCK_RECOVERY_OK_POINTS.map((point) => (
                    <div key={point.title} className="rounded-2xl border border-orange-100 bg-white/85 p-4">
                      <p className="text-sm font-semibold text-slate-900 md:text-base">
                        {point.title}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        {point.description}
                      </p>
                    </div>
                  ))}
                  <a
                    href="#items"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-orange-300 bg-white px-5 py-3 text-sm font-semibold text-orange-700 shadow-sm transition hover:-translate-y-px hover:border-orange-400 hover:bg-orange-50"
                  >
                    回収品目の詳細を見る
                  </a>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section
          id="data"
          className="border-b border-slate-200 bg-white py-14 md:py-20"
          aria-labelledby="data-heading"
        >
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <h2
              id="data-heading"
              className="mb-2 text-center text-2xl font-bold text-slate-900 md:text-3xl"
            >
              パソコンのデータ消去について
            </h2>
            <p className="mx-auto mb-10 max-w-3xl text-center text-sm leading-7 text-slate-600 md:text-base">
              renet.jp でも重要な訴求になっているため、トップ上でも簡潔に説明しておくと安心感が出ます。自己消去とおまかせ消去の違いがすぐ分かる構成にしています。
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              {MOCK_DATA_ERASURE_GUIDES.map((guide) => (
                <article
                  key={guide.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 shadow-sm"
                >
                  <h3 className="text-lg font-semibold tracking-[-0.02em] text-slate-900">
                    {guide.title}
                  </h3>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                    {guide.points.map((point) => (
                      <li key={point} className="flex gap-3">
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-orange-400" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
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
            <p className="mb-8 text-center text-sm leading-7 text-slate-600 md:text-base">
              まずは事前申込み。梱包後、宅配業者がご指定の日時にお伺いします。
            </p>
            <div className="mb-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/guide/flow"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
              >
                流れを詳しく見る
              </Link>
              <Link
                to="/guide/packing"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
              >
                梱包方法を見る
              </Link>
            </div>
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

        <section
          id="faq"
          className="border-t border-slate-200 bg-slate-50 py-14 md:py-20"
          aria-labelledby="faq-heading"
        >
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <h2
              id="faq-heading"
              className="mb-2 text-center text-2xl font-bold text-slate-900 md:text-3xl"
            >
              よくある質問
            </h2>
            <p className="mx-auto mb-10 max-w-3xl text-center text-sm leading-7 text-slate-600 md:text-base">
              renet.jp では FAQ がかなり強い導線になっています。このデモでも、申込前に不安が残りやすいポイントだけ先に見せておく構成にしています。
            </p>
            <div className="grid gap-4">
              {MOCK_FAQS.map((item, index) => (
                <article
                  key={item.question}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">
                      Q{index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold leading-7 text-slate-900">
                        {item.question}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="support"
          className="border-t border-slate-200 bg-white py-14 md:py-20"
          aria-labelledby="support-heading"
        >
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-6 shadow-sm md:p-8">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="text-left">
                  <p className="text-xs font-semibold tracking-[0.08em] text-orange-600">お客様サポート</p>
                  <h2
                    id="support-heading"
                    className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-slate-900 md:text-3xl"
                  >
                    申込前の不安やご不明点はこちら
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                    対象品目、梱包方法、回収日時、データ消去、申込状況などで迷った場合は、まずガイドと FAQ をご確認ください。個別の確認が必要な場合は、サポートページの相談フォームをご利用ください。
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <Link
                    to="/contact"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                  >
                    相談フォームへ
                  </Link>
                  <Link
                    to="/orders/lookup"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                  >
                    申込状況を確認する
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-100 py-10">
        <div className="mx-auto max-w-6xl px-4 text-center md:px-6">
          <div className="mb-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs font-medium text-slate-600">
            <Link to="/company" className="hover:text-orange-600 hover:underline underline-offset-4">会社概要</Link>
            <span className="text-slate-300" aria-hidden>
              |
            </span>
            <Link to="/terms" className="hover:text-orange-600 hover:underline underline-offset-4">利用規約</Link>
            <span className="text-slate-300" aria-hidden>
              |
            </span>
            <Link to="/privacy" className="hover:text-orange-600 hover:underline underline-offset-4">個人情報保護方針</Link>
            <span className="text-slate-300" aria-hidden>
              |
            </span>
            <Link to="/contact" className="hover:text-orange-600 hover:underline underline-offset-4">お問い合わせ</Link>
          </div>
          <p className="text-xs leading-6 text-slate-500">
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
