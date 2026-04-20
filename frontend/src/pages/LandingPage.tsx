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
    description: '台数と希望日時を入力してお申し込みください。',
    Icon: IconApply,
  },
  {
    step: 2,
    title: '段ボールへ梱包',
    description: 'お手持ちの箱で梱包し、発送準備を進めます。',
    Icon: IconPack,
  },
  {
    step: 3,
    title: '宅配業者へ引渡し',
    description: 'ご指定日時に集荷し、進捗はメールと注文照会で確認できます。',
    Icon: IconHandover,
  },
] as const

const MOCK_ITEM_CATEGORIES = [
  {
    title: '無料対象の目安',
    toneClass: 'border-emerald-200 bg-emerald-50/70 text-emerald-950',
    labelClass: 'text-emerald-700',
    body: 'ノートパソコン、デスクトップパソコン、一体型パソコン、タブレット端末など。パソコン本体を含む申込を基本とします。',
    examples: ['ノートパソコン', 'デスクトップパソコン', '一体型パソコン', 'タブレット端末'],
  },
  {
    title: '条件確認が必要',
    toneClass: 'border-amber-200 bg-amber-50/80 text-amber-950',
    labelClass: 'text-amber-700',
    body: 'モニターのみ、小型家電のみ、複数箱になる申込は、通常申込と条件が異なる場合があります。',
    examples: ['液晶モニターのみ', '小型家電のみ', '複数箱の申込'],
  },
  {
    title: '有料・別ルートの例',
    toneClass: 'border-orange-200 bg-orange-50/80 text-orange-950',
    labelClass: 'text-orange-700',
    body: '特殊処理や法令対応が必要な品目は、自動受付ではなく個別案内を前提とします。',
    examples: ['CRT モニター', 'テレビ・冷蔵庫・洗濯機・エアコン', '大型・重量物'],
  },
  {
    title: '受付対象外の例',
    toneClass: 'border-red-200 bg-red-50/80 text-red-950',
    labelClass: 'text-red-700',
    body: '危険物、電池のみの送付、液漏れや著しい破損がある機器は配送規定上お受けできない場合があります。',
    examples: ['リチウムイオン電池のみ', '液漏れ・膨張した機器', '著しい破損がある機器'],
  },
] as const

const MOCK_FREE_CONDITIONS = [
  {
    label: '基本送料',
    value: 'パソコン本体を含む 1 箱分は無料想定',
  },
  {
    label: '機器状態',
    value: '故障品・旧型機種も受付対象',
  },
  {
    label: '同梱品',
    value: 'マウス、キーボード、ケーブルもまとめて発送可能',
  },
] as const

const MOCK_RECOVERY_OK_POINTS = [
  {
    title: 'どんなパソコンでもOK',
    description: 'ノート、デスクトップ、一体型、タブレットに対応します。',
  },
  {
    title: '壊れていてもOK',
    description: '電源が入らない機器や古い機種も受付対象です。',
  },
  {
    title: '周辺機器も同梱しやすい',
    description: 'マウス、キーボード、ケーブル類もまとめて送れます。',
  },
] as const

const MOCK_DATA_ERASURE_GUIDES = [
  {
    title: 'ご自身で消去する場合',
    points: [
      '初期化だけでなく、専用ソフト等での消去を推奨します。',
      '発送前にバックアップとログアウトをご確認ください。',
    ],
  },
  {
    title: 'おまかせ消去サービスを利用する場合',
    points: [
      '有料オプションとして受付し、対象条件を事前にご案内します。',
      '故障品や旧型機種も個別条件に応じて確認します。',
    ],
  },
] as const

const MOCK_TRUST_POINTS = [
  {
    title: '受付条件を事前に確認できる',
    body: '料金、対象品目、変更期限を公開ページで確認できます。',
  },
  {
    title: '申込後は注文照会で確認',
    body: 'メールに加えて、注文照会ページから進捗を確認できます。',
  },
  {
    title: '不明点は個別相談に対応',
    body: '特殊品目や確認事項がある場合は、問い合わせフォームから相談できます。',
  },
] as const

const MOCK_FAQS = [
  {
    question: '壊れたパソコンも回収できますか？',
    answer:
      'はい。故障品も受付対象です。著しい破損がある場合のみ個別確認となります。',
  },
  {
    question: '段ボールはどんな箱でも大丈夫ですか？',
    answer:
      '一般的な段ボールをご利用いただけます。サイズ上限は梱包方法ページでご確認ください。',
  },
  {
    question: '回収日時はあとから変更できますか？',
    answer:
      '原則として回収日前日の15時まで、メール返信またはお問い合わせから変更できます。',
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
  { label: '対応エリア・料金', to: '/guide/area-and-fees' },
  { label: '梱包方法', to: '/guide/packing' },
  { label: '回収品目', to: '/guide/items' },
  { label: 'データ消去', to: '/guide/data-erasure' },
  { label: 'サポート', to: '/contact' },
] as const

const headerUtilityLinkClass =
  'inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 md:min-w-[9rem]'

const footerLinkGroups = [
  {
    title: 'ご利用案内',
    links: [
      { label: '宅配回収の流れ', to: '/guide/flow' },
      { label: '対応エリア・料金', to: '/guide/area-and-fees' },
      { label: '梱包方法', to: '/guide/packing' },
      { label: '回収品目', to: '/guide/items' },
    ],
  },
  {
    title: 'サポート',
    links: [
      { label: 'FAQ', to: '/faq' },
      { label: 'お問い合わせ', to: '/contact' },
      { label: '申込状況の確認', to: '/orders/lookup' },
      { label: 'データ消去', to: '/guide/data-erasure' },
    ],
  },
  {
    title: '関連情報',
    links: [
      { label: '会社概要', to: '/company' },
      { label: '利用規約', to: '/terms' },
      { label: '個人情報保護方針', to: '/privacy' },
    ],
  },
] as const

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      {/* ヘッダー：ロゴ左・オレンジ CTA 右（リネット風） */}
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between md:px-6">
            <p className="text-xs leading-6 text-slate-600 md:text-sm">
              申込前の確認や申込後の照会は、こちらからご利用いただけます。
            </p>
            <div className="grid w-full gap-2 sm:grid-cols-2 lg:w-auto lg:grid-cols-3">
              <Link
                to="/faq"
                className={headerUtilityLinkClass}
              >
                FAQ 一覧
              </Link>
              <Link
                to="/contact"
                className={headerUtilityLinkClass}
              >
                相談フォーム
              </Link>
              <a
                href="#faq"
                className={headerUtilityLinkClass}
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
                パソコン・小型機器の宅配回収サービス
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
                  Recycle PC
                </span>
                <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-900">
                  全国対応
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
              <Link
                key={link.to}
                to={link.to}
                className="font-medium text-slate-700 underline-offset-4 hover:text-orange-600 hover:underline"
              >
                {link.label}
              </Link>
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
                全国対応のパソコン宅配回収
              </p>
              <h1
                id="hero-heading"
                className="mb-4 text-[30px] font-semibold leading-tight tracking-[-0.03em] text-slate-900 md:text-[46px] md:leading-[1.2]"
              >
                パソコンを、
                <br className="hidden sm:block" />
                手間なく正しいルートで回収。
              </h1>
              <p className="mx-auto mb-8 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                申込み、梱包、集荷、進捗確認までをシンプルにまとめた宅配回収サービスです。
              </p>
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
                    to="/guide/area-and-fees"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                  >
                    対応エリア・料金条件
                  </Link>
                  <Link
                    to="/guide/items"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                  >
                    回収品目を見る
                  </Link>
                  <Link
                    to="/orders/lookup"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                  >
                    申込状況を確認する
                  </Link>
                </div>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-slate-500">
                <span className="rounded-full bg-slate-100 px-3 py-1.5">全国対応</span>
                <span className="rounded-full bg-slate-100 px-3 py-1.5">注文照会対応</span>
                <span className="rounded-full bg-slate-100 px-3 py-1.5">データ消去案内あり</span>
              </div>
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
                    まず確認したい無料条件
                  </h2>
                </div>
                <div className="px-6 py-6 md:px-8 md:py-7">
                  <div className="grid gap-3">
                    {MOCK_FREE_CONDITIONS.map((condition) => (
                      <div
                        key={condition.label}
                        className="grid gap-2 rounded-2xl border border-emerald-100 bg-white/85 p-4 md:grid-cols-[120px_minmax(0,1fr)] md:items-center"
                      >
                        <p className="text-xs font-semibold tracking-[0.08em] text-emerald-700 md:text-sm">
                          {condition.label}
                        </p>
                        <p className="text-sm font-medium leading-7 text-slate-700 md:text-base">
                          {condition.value}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-5 text-xs leading-6 text-slate-500 md:text-sm">
                    箱数や重量制限、対象外品は詳細ページでご確認ください。
                  </p>
                </div>
              </article>

              <article className="overflow-hidden rounded-[28px] border border-orange-200 bg-linear-to-br from-orange-50 via-white to-amber-50 shadow-sm">
                <div className="border-b border-orange-200 px-6 py-4 md:px-8">
                  <p className="text-xs font-semibold tracking-[0.08em] text-orange-700">
                    回収OK条件
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-slate-900 md:text-3xl">
                    迷いやすい品目の扱い
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
                  <Link
                    to="/guide/items"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                  >
                    専用ページで確認する
                  </Link>
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
              自己消去とおまかせ消去の違いを、申込前に簡単に確認できます。
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
            <div className="mt-8 flex justify-center">
              <Link
                to="/guide/data-erasure"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
              >
                データ消去の詳細を見る
              </Link>
            </div>
          </div>
        </section>

        {/* 信頼・注意（サイト中段の「法律」「無許可業者」系ブロックの簡易版） */}
        <section
          id="trust"
          className="border-b border-slate-200 bg-slate-50 py-14 md:py-16"
          aria-labelledby="trust-heading"
        >
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold tracking-[0.08em] text-orange-600">安心して使うために</p>
              <h2 id="trust-heading" className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-slate-900 md:text-3xl">
                必要な確認先を、分かりやすくまとめています
              </h2>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {MOCK_TRUST_POINTS.map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.body}</p>
                </article>
              ))}
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
              申込みから引渡しまで、3 ステップで進みます。
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
              回収品目の区分
            </h2>
            <p className="mx-auto mb-10 max-w-3xl text-center text-sm leading-7 text-slate-600 md:text-base">
              無料対象、条件確認が必要な内容、有料または別ルート、受付対象外の例をトップでも確認できます。
            </p>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {MOCK_ITEM_CATEGORIES.map((category) => (
                <article
                  key={category.title}
                  className={`rounded-3xl border p-5 shadow-sm ${category.toneClass}`}
                >
                  <p className={`text-xs font-semibold tracking-[0.08em] ${category.labelClass}`}>
                    回収区分
                  </p>
                  <h3 className="mt-2 text-base font-semibold tracking-[-0.02em]">
                    {category.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7">{category.body}</p>
                  <ul className="mt-4 space-y-2 text-sm leading-7">
                    {category.examples.map((example) => (
                      <li key={example} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70" />
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-7 text-slate-700">
              迷いやすい品目は、トップの概要だけで判断せず、詳細ページまたは申込画面の案内をご確認ください。申込後はメールで個別条件をご案内する場合があります。
            </div>
            <div className="mt-8 flex justify-center">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/guide/items"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                >
                  回収品目の詳細ページへ
                </Link>
                <Link
                  to="/guide/area-and-fees"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                >
                  料金条件を確認する
                </Link>
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
              申込前によく確認される内容だけを先にまとめています。
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
            <div className="mt-8 flex justify-center">
              <Link
                to="/faq"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
              >
                FAQ を詳しく見る
              </Link>
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
              <div className="flex flex-col gap-3 text-left md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-[0.08em] text-orange-600">お客様サポート</p>
                  <h2
                    id="support-heading"
                    className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-slate-900 md:text-3xl"
                  >
                    迷ったら、先に確認する項目
                  </h2>
                </div>
                <Link
                  to="/faq"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                >
                  FAQ を見る
                </Link>
              </div>
              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <article className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-sm font-semibold text-slate-900">対象品目と料金</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">回収対象、無料条件、追加費用の有無を先に確認できます。</p>
                  <div className="mt-4">
                    <Link
                      to="/guide/area-and-fees"
                      className="text-sm font-semibold text-orange-700 underline underline-offset-4 hover:text-orange-800"
                    >
                      料金条件を見る
                    </Link>
                  </div>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-sm font-semibold text-slate-900">申込後の確認</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">注文照会から、進捗や個別案内をすぐ確認できます。</p>
                  <div className="mt-4">
                    <Link
                      to="/orders/lookup"
                      className="text-sm font-semibold text-orange-700 underline underline-offset-4 hover:text-orange-800"
                    >
                      注文照会へ
                    </Link>
                  </div>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-sm font-semibold text-slate-900">個別の相談</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">特殊品目や変更依頼などは、相談フォームから連絡できます。</p>
                  <div className="mt-4">
                    <Link
                      to="/contact"
                      className="text-sm font-semibold text-orange-700 underline underline-offset-4 hover:text-orange-800"
                    >
                      相談フォームへ
                    </Link>
                  </div>
                </article>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:hidden">
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
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-100 py-12">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-12">
            <div className="rounded-[28px] border border-slate-200 bg-white/70 p-6 shadow-sm">
              <p className="text-sm font-semibold tracking-[0.02em] text-slate-900">Recycle PC</p>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
                申込み前の確認、申込み後の照会、各種案内をまとめたパソコン回収サービスのご案内です。
              </p>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                <Link
                  to="/apply/step1"
                  className="font-semibold text-slate-700 underline underline-offset-4 transition hover:text-orange-700"
                >
                  お申込み
                </Link>
                <Link
                  to="/orders/lookup"
                  className="font-semibold text-slate-700 underline underline-offset-4 transition hover:text-orange-700"
                >
                  注文照会
                </Link>
                <Link
                  to="/contact"
                  className="font-semibold text-slate-700 underline underline-offset-4 transition hover:text-orange-700"
                >
                  お問い合わせ
                </Link>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold tracking-[0.08em] text-slate-500">お問い合わせ窓口</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">平日 9:00〜18:00</p>
                  <p className="mt-1 text-xs leading-6 text-slate-500">土日祝日・年末年始を除く</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold tracking-[0.08em] text-slate-500">申込後の確認</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">メールと注文照会で確認できます</p>
                  <p className="mt-1 text-xs leading-6 text-slate-500">お申し込み番号とメールアドレスをご用意ください</p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {footerLinkGroups.map((group) => (
                <div key={group.title}>
                  <p className="text-sm font-semibold text-slate-900">{group.title}</p>
                  <nav className="mt-4 flex flex-col gap-3" aria-label={group.title}>
                    {group.links.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="text-sm leading-6 text-slate-600 transition hover:text-orange-600 hover:underline underline-offset-4"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 border-t border-slate-200 pt-5 text-xs leading-6 text-slate-500">
            <p>© Recycle PC</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
