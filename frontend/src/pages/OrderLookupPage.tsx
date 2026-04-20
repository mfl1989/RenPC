import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { formatOrderId } from '../lib/orderId.ts'
import { contactInquirySchema } from '../schemas/contactInquirySchema.ts'
import { submitContactInquiry } from '../services/contactInquiry.ts'
import {
    lookupRecycleOrder,
    type OrderLookupResult,
    type OrderStatusCode,
} from '../services/orderApi.ts'

type ChangeRequestTopic = 'collection-date' | 'time-slot' | 'contact' | 'items' | 'data-erasure' | 'other'

type StoredChangeRequestSummary = {
  orderId: number
  email: string
  inquiryId: string
  createdAt: string
  topic: ChangeRequestTopic
  details: string
}

const CHANGE_REQUEST_STORAGE_KEY = 'recycle-order-change-request-history'

const CHANGE_REQUEST_TOPIC_OPTIONS: Array<{ value: ChangeRequestTopic; label: string }> = [
  { value: 'collection-date', label: '回収希望日の変更' },
  { value: 'time-slot', label: '時間帯の変更' },
  { value: 'contact', label: '連絡先情報の変更' },
  { value: 'items', label: '回収品目の変更' },
  { value: 'data-erasure', label: 'データ消去方法の変更' },
  { value: 'other', label: 'その他の変更相談' },
] as const

function getChangeTopicLabel(topic: ChangeRequestTopic): string {
  return CHANGE_REQUEST_TOPIC_OPTIONS.find((option) => option.value === topic)?.label ?? '変更依頼'
}

function loadStoredChangeRequests(): StoredChangeRequestSummary[] {
  try {
    const raw = localStorage.getItem(CHANGE_REQUEST_STORAGE_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.filter((item): item is StoredChangeRequestSummary => {
      if (!item || typeof item !== 'object') {
        return false
      }
      const record = item as Record<string, unknown>
      return typeof record.orderId === 'number'
        && typeof record.email === 'string'
        && typeof record.inquiryId === 'string'
        && typeof record.createdAt === 'string'
        && typeof record.topic === 'string'
        && typeof record.details === 'string'
    })
  } catch {
    return []
  }
}

function saveStoredChangeRequests(records: StoredChangeRequestSummary[]): void {
  localStorage.setItem(CHANGE_REQUEST_STORAGE_KEY, JSON.stringify(records.slice(0, 10)))
}

function canSubmitChangeRequest(statusCode: OrderStatusCode): boolean {
  return statusCode === 'RECEIVED' || statusCode === 'KIT_SHIPPED'
}

function categoryFromChangeTopic(topic: ChangeRequestTopic): 'items' | 'schedule' | 'status' | 'data-erasure' | 'other' {
  switch (topic) {
    case 'collection-date':
    case 'time-slot':
      return 'schedule'
    case 'items':
      return 'items'
    case 'data-erasure':
      return 'data-erasure'
    case 'contact':
      return 'status'
    case 'other':
      return 'other'
  }
}

function buildChangeRequestMessage(params: {
  topic: ChangeRequestTopic
  details: string
  result: OrderLookupResult
}): string {
  const topicLabel = getChangeTopicLabel(params.topic)
  return [
    `変更種別: ${topicLabel}`,
    `対象注文: ${formatOrderId(params.result.orderId)}`,
    `現在の回収希望日: ${params.result.collectionDate}`,
    `現在の時間帯: ${params.result.collectionTimeSlot}`,
    '',
    'ご依頼内容:',
    params.details.trim(),
  ].join('\n')
}

const ORDER_PROGRESS_STEPS: Array<{
  code: Exclude<OrderStatusCode, 'CANCELLED'>
  label: string
  summary: string
}> = [
  {
    code: 'RECEIVED',
    label: '受付済',
    summary: 'お申し込み内容を受け付け、確認を進めています。',
  },
  {
    code: 'KIT_SHIPPED',
    label: 'キット発送済',
    summary: '必要な梱包キットの発送手配が完了した状態です。',
  },
  {
    code: 'COLLECTING',
    label: '回収中',
    summary: '回収日当日の集荷準備または輸送中の状態です。',
  },
  {
    code: 'ARRIVED',
    label: '到着済',
    summary: '回収品がセンターに到着し、受領確認を行っています。',
  },
  {
    code: 'PROCESSING',
    label: '処理中',
    summary: 'データ消去や確認作業を進めています。',
  },
  {
    code: 'COMPLETED',
    label: '完了',
    summary: '一連の回収対応が完了した状態です。',
  },
]

function getStatusCommunicationGuide(statusCode: OrderStatusCode): {
  title: string
  lead: string
  checkpoints: string[]
  toneClass: string
} {
  switch (statusCode) {
    case 'RECEIVED':
      return {
        title: '受付内容を確認しています',
        lead: '受付内容の確認後、必要に応じて確認メールや個別連絡をお送りします。特殊品目や確認事項がある場合は、この段階でご案内します。',
        checkpoints: [
          '受付完了メールが受信できているかをご確認ください。',
          '差出人メール、迷惑メールフォルダ、受信設定をご確認ください。',
          '変更がある場合は、回収日前日の15時までにご連絡ください。',
        ],
        toneClass: 'border-sky-200 bg-sky-50 text-sky-950',
      }
    case 'KIT_SHIPPED':
      return {
        title: '梱包キットの到着をご確認ください',
        lead: '段ボール事前配送をご希望の場合は、キットの到着後に梱包準備を進めてください。到着遅延や不足がある場合はご相談ください。',
        checkpoints: [
          '梱包キットの到着有無をご確認ください。',
          '同梱予定品と申込内容に差異がないかをご確認ください。',
          '回収日に備えてデータ消去やアカウント解除をお済ませください。',
        ],
        toneClass: 'border-slate-200 bg-slate-50 text-slate-900',
      }
    case 'COLLECTING':
      return {
        title: '本日の回収または輸送を進めています',
        lead: '現在は集荷または輸送中です。回収日当日はメールを中心にご案内し、必要な場合のみ個別にご連絡します。',
        checkpoints: [
          '梱包済みの荷物が引渡し可能な状態かをご確認ください。',
          '緊急の連絡が必要な場合は、できるだけ早くお問い合わせください。',
          '通常の変更受付はこの段階では終了しています。',
        ],
        toneClass: 'border-amber-200 bg-amber-50 text-amber-950',
      }
    case 'ARRIVED':
      return {
        title: 'センターで受領確認を行っています',
        lead: '到着後は荷受け確認を進めています。内容確認が必要な場合や特殊品目が含まれる場合は、個別案内をお送りします。',
        checkpoints: [
          '担当者からの個別案内がないかメールをご確認ください。',
          '受付内容と実際の梱包物に差異がある場合、追加連絡が入ることがあります。',
          '返送や追加費用が必要なケースでは別途ご案内します。',
        ],
        toneClass: 'border-violet-200 bg-violet-50 text-violet-950',
      }
    case 'PROCESSING':
      return {
        title: 'データ消去や確認工程を進めています',
        lead: 'センター到着後の確認が完了し、データ消去や処理工程を進めています。完了通知や追加案内はメールでお送りします。',
        checkpoints: [
          'おまかせ消去をご利用の場合は、完了案内メールをご確認ください。',
          '個別案内がある場合は、注文照会にも同内容が反映されることがあります。',
          'この段階では申込内容の変更は受け付けていません。',
        ],
        toneClass: 'border-orange-200 bg-orange-50 text-orange-950',
      }
    case 'COMPLETED':
      return {
        title: 'お手続きは完了しています',
        lead: '一連の回収対応は完了しています。完了案内や個別通知がある場合は、登録メールアドレス宛てのご案内をご確認ください。',
        checkpoints: [
          '完了案内メールや個別連絡の有無をご確認ください。',
          '追加確認が必要な場合は、お申し込み番号を添えてお問い合わせください。',
          '再度ご利用の場合は、新しいお申し込みとしてお手続きください。',
        ],
        toneClass: 'border-emerald-200 bg-emerald-50 text-emerald-950',
      }
    case 'CANCELLED':
      return {
        title: 'キャンセル済みのお申し込みです',
        lead: '現在のお申し込みはキャンセル扱いです。再申込や詳細確認が必要な場合は、お申し込み番号を添えてご相談ください。',
        checkpoints: [
          '再申込が必要な場合は、あらためてフォームからお申し込みください。',
          '既に発送済みの荷物がある場合は、個別案内をご確認ください。',
          '不明点がある場合は受付メールへの返信またはお問い合わせをご利用ください。',
        ],
        toneClass: 'border-red-200 bg-red-50 text-red-950',
      }
  }
}

function getChangeRequestGuide(statusCode: OrderStatusCode): {
  title: string
  body: string
  toneClass: string
} {
  switch (statusCode) {
    case 'RECEIVED':
    case 'KIT_SHIPPED':
      return {
        title: '申込内容の変更について',
        body: '回収希望日やご連絡先などの変更は、原則として回収日前日の15時まで承ります。受付完了メールへの返信、またはお問い合わせ窓口からお申し込み番号を添えてご連絡ください。',
        toneClass: 'border-sky-200 bg-sky-50 text-sky-950',
      }
    case 'COLLECTING':
      return {
        title: '変更受付の締切後です',
        body: '現在は回収手配に入っているため、Web上での変更受付期限を過ぎています。やむを得ないご事情がある場合は、至急メールまたはお問い合わせ窓口からご相談ください。',
        toneClass: 'border-amber-200 bg-amber-50 text-amber-950',
      }
    case 'ARRIVED':
    case 'PROCESSING':
    case 'COMPLETED':
      return {
        title: '申込内容の変更受付は終了しています',
        body: '回収品の受領または処理工程に入っているため、申込内容の変更は承っていません。ご不明点がある場合は、受付メールへの返信またはお問い合わせ窓口からご連絡ください。',
        toneClass: 'border-slate-200 bg-slate-50 text-slate-900',
      }
    case 'CANCELLED':
      return {
        title: '再申込や確認のご相談',
        body: 'キャンセル済みのお申し込みに関する確認や再申込をご希望の場合は、受付メールへの返信またはお問い合わせ窓口からご相談ください。',
        toneClass: 'border-red-200 bg-red-50 text-red-950',
      }
  }
}

function getStatusBadgeClass(statusCode: OrderStatusCode): string {
  switch (statusCode) {
    case 'RECEIVED':
      return 'bg-sky-50 text-sky-800 ring-sky-200'
    case 'KIT_SHIPPED':
      return 'bg-slate-100 text-slate-700 ring-slate-200'
    case 'COLLECTING':
      return 'bg-amber-50 text-amber-900 ring-amber-200'
    case 'ARRIVED':
      return 'bg-violet-50 text-violet-800 ring-violet-200'
    case 'PROCESSING':
      return 'bg-orange-50 text-orange-800 ring-orange-200'
    case 'COMPLETED':
      return 'bg-emerald-50 text-emerald-800 ring-emerald-200'
    case 'CANCELLED':
      return 'bg-red-50 text-red-800 ring-red-200'
  }
}

function getCurrentStepIndex(statusCode: OrderStatusCode): number {
  if (statusCode === 'CANCELLED') {
    return -1
  }
  return ORDER_PROGRESS_STEPS.findIndex((step) => step.code === statusCode)
}

export default function OrderLookupPage() {
  const [orderId, setOrderId] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<OrderLookupResult | null>(null)
  const [changeTopic, setChangeTopic] = useState<ChangeRequestTopic>('collection-date')
  const [changeDetails, setChangeDetails] = useState('')
  const [changeConsent, setChangeConsent] = useState(false)
  const [changeSubmitting, setChangeSubmitting] = useState(false)
  const [changeError, setChangeError] = useState<string | null>(null)
  const [changeSuccess, setChangeSuccess] = useState<{ inquiryId: string; createdAt: string } | null>(null)
  const [storedChangeRequest, setStoredChangeRequest] = useState<StoredChangeRequestSummary | null>(null)

  const currentStepIndex = result ? getCurrentStepIndex(result.orderStatusCode) : -1
  const changeRequestGuide = result ? getChangeRequestGuide(result.orderStatusCode) : null
  const communicationGuide = result ? getStatusCommunicationGuide(result.orderStatusCode) : null

  useEffect(() => {
    setChangeTopic('collection-date')
    setChangeDetails('')
    setChangeConsent(false)
    setChangeError(null)
    setChangeSuccess(null)
  }, [result?.orderId])

  useEffect(() => {
    if (!result) {
      setStoredChangeRequest(null)
      return
    }
    const matched = loadStoredChangeRequests().find(
      (record) => record.orderId === result.orderId && record.email === result.email,
    )
    setStoredChangeRequest(matched ?? null)
  }, [result])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (loading) {
      return
    }

    const normalizedOrderId = Number(orderId)
    if (!Number.isInteger(normalizedOrderId) || normalizedOrderId <= 0) {
      setError('お申し込み番号を正しく入力してください。')
      setResult(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await lookupRecycleOrder({ orderId: normalizedOrderId, email: email.trim() })
      setResult(data)
    } catch (submitError) {
      setResult(null)
      setError(submitError instanceof Error ? submitError.message : '照会に失敗しました。')
    } finally {
      setLoading(false)
    }
  }

  const handleChangeRequestSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!result || changeSubmitting || !canSubmitChangeRequest(result.orderStatusCode)) {
      return
    }

    const payload = {
      name: result.contactName,
      email: result.email,
      category: categoryFromChangeTopic(changeTopic),
      orderId: String(result.orderId),
      message: buildChangeRequestMessage({ topic: changeTopic, details: changeDetails, result }),
      privacyConsent: changeConsent,
    }

    const parsed = contactInquirySchema.safeParse(payload)
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      setChangeError(firstIssue?.message ?? '変更依頼の入力内容を確認してください。')
      return
    }

    setChangeSubmitting(true)
    setChangeError(null)
    try {
      const response = await submitContactInquiry(parsed.data)
      setChangeSuccess(response)
      const storedRecord: StoredChangeRequestSummary = {
        orderId: result.orderId,
        email: result.email,
        inquiryId: response.inquiryId,
        createdAt: response.createdAt,
        topic: changeTopic,
        details: changeDetails.trim(),
      }
      const nextRecords = [
        storedRecord,
        ...loadStoredChangeRequests().filter(
          (record) => !(record.orderId === result.orderId && record.email === result.email),
        ),
      ]
      saveStoredChangeRequests(nextRecords)
      setStoredChangeRequest(storedRecord)
      setChangeDetails('')
      setChangeConsent(false)
    } catch (submitError) {
      setChangeError(submitError instanceof Error ? submitError.message : '変更依頼の送信に失敗しました。')
    } finally {
      setChangeSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf5_0%,#f8fafc_24%,#f8fafc_100%)] py-8 text-left text-slate-900 sm:py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="rounded-[28px] border border-orange-100 bg-white/90 p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] backdrop-blur sm:p-8">
          <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-[0.08em] text-orange-600">申込後の確認</p>
              <h1 className="mt-2 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-slate-950 sm:text-[34px]">
                注文照会
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
                お申し込み番号とメールアドレスを入力すると、現在の受付状況や回収予定、担当者からの個別案内を確認できます。
              </p>
            </div>

            <Link
              to="/"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:ring-offset-2"
            >
              トップへ戻る
            </Link>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-start">
            <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm sm:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-semibold tracking-[-0.02em] text-slate-900 sm:text-xl">申込情報を入力</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  受付完了メールに記載されたお申し込み番号と、ご登録のメールアドレスをご入力ください。
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="orderId" className="mb-2 block text-sm font-semibold text-slate-700">
                    お申し込み番号
                  </label>
                  <input
                    id="orderId"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={orderId}
                    onChange={(event) => setOrderId(event.target.value.replace(/\D/g, ''))}
                    className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-100"
                    placeholder="例: 0000012345"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
                    メールアドレス
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-100"
                    placeholder="例: sample@example.com"
                  />
                </div>

                {error ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-px hover:bg-orange-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? '照会中…' : '申込状況を確認する'}
                </button>
              </form>
            </section>

            {result ? (
              <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-3 border-b border-emerald-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.08em] text-emerald-700">照会結果</p>
                    <h2 className="mt-2 text-xl font-semibold leading-tight tracking-[-0.02em] text-slate-950 sm:text-2xl">
                      お申し込み {formatOrderId(result.orderId)}
                    </h2>
                  </div>
                  <span
                    className={`inline-flex w-fit rounded-full px-4 py-1.5 text-sm font-semibold ring-1 ${getStatusBadgeClass(result.orderStatusCode)}`}
                  >
                    {result.orderStatus}
                  </span>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-white/95 p-4 sm:p-5">
                  <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold tracking-[0.08em] text-slate-500">進行ステータス</p>
                      <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-slate-950">現在の進み具合</h3>
                    </div>
                    <p className="text-sm font-medium text-slate-600">
                      管理画面の状態コードに基づいて表示しています。
                    </p>
                  </div>

                  {result.orderStatusCode === 'CANCELLED' ? (
                    <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm leading-7 text-red-900">
                      <p className="text-xs font-semibold tracking-[0.08em] text-red-700">現在の状態</p>
                      <p className="mt-2 text-base font-semibold">お申し込みはキャンセル扱いとなっています。</p>
                      <p className="mt-2">
                        詳細の確認や再申込をご希望の場合は、受付メールへの返信またはお問い合わせフォームからご連絡ください。
                      </p>
                    </div>
                  ) : (
                    <>
                      <ol className="mt-4 grid gap-3 lg:grid-cols-6">
                        {ORDER_PROGRESS_STEPS.map((step, index) => {
                          const isCompleted = currentStepIndex > index
                          const isCurrent = currentStepIndex === index
                          const cardClass = isCurrent
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-950 shadow-sm'
                            : isCompleted
                              ? 'border-sky-200 bg-sky-50 text-slate-900'
                              : 'border-slate-200 bg-slate-50 text-slate-500'

                          const bulletClass = isCurrent
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : isCompleted
                              ? 'border-sky-500 bg-sky-500 text-white'
                              : 'border-slate-300 bg-white text-slate-400'

                          return (
                            <li key={step.code} className={`rounded-2xl border p-4 transition ${cardClass}`}>
                              <div className="flex items-center gap-3">
                                <span
                                  className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${bulletClass}`}
                                >
                                  {index + 1}
                                </span>
                                <div>
                                  <p className="text-xs font-semibold tracking-[0.08em]">STEP {index + 1}</p>
                                  <p className="mt-1 text-sm font-semibold">{step.label}</p>
                                </div>
                              </div>
                              <p className="mt-3 text-xs leading-6">{step.summary}</p>
                            </li>
                          )
                        })}
                      </ol>

                      <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-7 text-emerald-950">
                        <p className="text-xs font-semibold tracking-[0.08em] text-emerald-700">現在のご案内</p>
                        <p className="mt-2 font-semibold">{result.progressSummary}</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-5 rounded-2xl border border-emerald-200 bg-white/90 p-4 sm:p-5">
                  <p className="text-xs font-semibold tracking-[0.08em] text-emerald-700">ご案内</p>
                  <p className="mt-3 text-sm leading-7 text-slate-700">{result.progressSummary}</p>
                  {result.customerNote ? (
                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-7 text-amber-900">
                      <p className="text-xs font-semibold tracking-[0.08em] text-amber-700">個別案内</p>
                      <p className="mt-2 whitespace-pre-wrap">{result.customerNote}</p>
                    </div>
                  ) : null}
                </div>

                {changeRequestGuide ? (
                  <div className={`mt-5 rounded-2xl border p-4 sm:p-5 ${changeRequestGuide.toneClass}`}>
                    <p className="text-xs font-semibold tracking-[0.08em]">変更・キャンセルのご案内</p>
                    <p className="mt-2 text-base font-semibold">{changeRequestGuide.title}</p>
                    <p className="mt-3 text-sm leading-7">{changeRequestGuide.body}</p>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      {canSubmitChangeRequest(result.orderStatusCode) ? (
                        <a
                          href="#change-request-form"
                          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-current/20 bg-white px-5 py-3 text-sm font-semibold shadow-sm transition hover:-translate-y-px"
                        >
                          この画面から変更依頼を送る
                        </a>
                      ) : null}
                      <Link
                        to="/contact"
                        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-current/20 bg-white px-5 py-3 text-sm font-semibold shadow-sm transition hover:-translate-y-px"
                      >
                        お問い合わせ窓口へ
                      </Link>
                    </div>
                  </div>
                ) : null}

                {canSubmitChangeRequest(result.orderStatusCode) ? (
                  <section
                    id="change-request-form"
                    className="mt-5 rounded-2xl border border-sky-200 bg-white/95 p-4 shadow-sm sm:p-5"
                  >
                    <div className="border-b border-sky-100 pb-4">
                      <p className="text-xs font-semibold tracking-[0.08em] text-sky-700">申込後の変更依頼</p>
                      <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-slate-950">
                        この画面から変更希望を送信できます
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        回収希望日や時間帯、ご連絡先、回収品目の変更希望を送信できます。受付後、担当窓口で確認し、必要に応じてメールまたはお電話でご案内します。
                      </p>
                    </div>

                    {changeSuccess ? (
                      <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-7 text-emerald-950">
                        <p className="font-semibold">変更依頼を受け付けました</p>
                        <p className="mt-2">
                          受付番号: {changeSuccess.inquiryId}
                          <br />
                          受付日時: {new Date(changeSuccess.createdAt).toLocaleString('ja-JP')}
                        </p>
                        <p className="mt-2">
                          内容確認後、必要に応じて登録メールアドレス宛てにご連絡します。追加の修正がある場合は、この受付番号を添えてお問い合わせください。
                        </p>
                      </div>
                    ) : null}

                    {storedChangeRequest ? (
                      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-700">
                        <p className="text-xs font-semibold tracking-[0.08em] text-slate-500">直近の変更依頼</p>
                        <p className="mt-2 font-semibold text-slate-900">
                          {getChangeTopicLabel(storedChangeRequest.topic)}
                        </p>
                        <p className="mt-2 text-sm leading-7 whitespace-pre-wrap">{storedChangeRequest.details}</p>
                        <p className="mt-3 text-xs leading-6 text-slate-500">
                          受付番号: {storedChangeRequest.inquiryId}
                          <br />
                          送信日時: {new Date(storedChangeRequest.createdAt).toLocaleString('ja-JP')}
                        </p>
                        <p className="mt-2 text-xs leading-6 text-slate-500">
                          追加で送信する前に、すでに同内容を送っていないかご確認ください。
                        </p>
                      </div>
                    ) : null}

                    <form className="mt-4 space-y-4" onSubmit={handleChangeRequestSubmit}>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="mb-2 block text-sm font-semibold text-slate-700">お申し込み番号</p>
                          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900">
                            {formatOrderId(result.orderId)}
                          </div>
                        </div>
                        <div>
                          <p className="mb-2 block text-sm font-semibold text-slate-700">登録メールアドレス</p>
                          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 break-all">
                            {result.email}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="changeTopic" className="mb-2 block text-sm font-semibold text-slate-700">
                          変更したい内容
                        </label>
                        <select
                          id="changeTopic"
                          value={changeTopic}
                          onChange={(event) => setChangeTopic(event.target.value as ChangeRequestTopic)}
                          className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-100"
                        >
                          {CHANGE_REQUEST_TOPIC_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="changeDetails" className="mb-2 block text-sm font-semibold text-slate-700">
                          ご依頼内容
                        </label>
                        <textarea
                          id="changeDetails"
                          value={changeDetails}
                          onChange={(event) => {
                            setChangeDetails(event.target.value)
                            setChangeError(null)
                          }}
                          rows={6}
                          className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-7 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-100"
                          placeholder="例: 回収希望日を 4月25日 から 4月27日 に変更したいです。時間帯は午後希望です。"
                        />
                        <p className="mt-2 text-xs leading-6 text-slate-500">
                          変更後の希望内容を具体的にご入力ください。回収希望日、時間帯、連絡先、品目変更などが分かると確認が早くなります。
                        </p>
                      </div>

                      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-700">
                        <input
                          type="checkbox"
                          checked={changeConsent}
                          onChange={(event) => {
                            setChangeConsent(event.target.checked)
                            setChangeError(null)
                          }}
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                        />
                        <span>
                          個人情報保護方針に同意のうえ、変更依頼を送信します。
                          <span className="mt-1 block text-xs leading-6 text-slate-500">
                            送信内容は変更依頼の確認およびご連絡のために利用します。
                          </span>
                        </span>
                      </label>

                      {changeError ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                          {changeError}
                        </div>
                      ) : null}

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs leading-6 text-slate-500">
                          原則として回収日前日の15時まで受け付けます。締切後は内容により対応できない場合があります。
                        </p>
                        <button
                          type="submit"
                          disabled={changeSubmitting}
                          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-px hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {changeSubmitting ? '送信中…' : '変更依頼を送信する'}
                        </button>
                      </div>
                    </form>
                  </section>
                ) : null}

                {communicationGuide ? (
                  <div className={`mt-5 rounded-2xl border p-4 sm:p-5 ${communicationGuide.toneClass}`}>
                    <p className="text-xs font-semibold tracking-[0.08em]">次のご案内予定</p>
                    <p className="mt-2 text-base font-semibold">{communicationGuide.title}</p>
                    <p className="mt-3 text-sm leading-7">{communicationGuide.lead}</p>
                    <div className="mt-4 rounded-xl border border-current/15 bg-white/70 px-4 py-4">
                      <p className="text-sm font-semibold">今確認しておくこと</p>
                      <ul className="mt-2 space-y-2 text-sm leading-7">
                        {communicationGuide.checkpoints.map((checkpoint) => (
                          <li key={checkpoint} className="flex gap-3">
                            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-current/70" />
                            <span>{checkpoint}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <Link
                        to="/faq"
                        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-current/20 bg-white px-5 py-3 text-sm font-semibold shadow-sm transition hover:-translate-y-px"
                      >
                        FAQ を見る
                      </Link>
                      <Link
                        to="/contact"
                        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-current/20 bg-white px-5 py-3 text-sm font-semibold shadow-sm transition hover:-translate-y-px"
                      >
                        お問い合わせ窓口へ
                      </Link>
                    </div>
                  </div>
                ) : null}

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white/90 p-4">
                    <p className="text-xs font-semibold tracking-[0.08em] text-slate-500">お名前</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{result.contactName}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white/90 p-4">
                    <p className="text-xs font-semibold tracking-[0.08em] text-slate-500">メールアドレス</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-900 break-all">{result.email}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white/90 p-4">
                    <p className="text-xs font-semibold tracking-[0.08em] text-slate-500">回収希望日</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{result.collectionDate}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white/90 p-4">
                    <p className="text-xs font-semibold tracking-[0.08em] text-slate-500">時間帯</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{result.collectionTimeSlot}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 sm:col-span-2">
                    <p className="text-xs font-semibold tracking-[0.08em] text-slate-500">
                      {result.pricingConfirmed ? '正式金額' : '受付金額'}
                    </p>
                    <p className="mt-2 text-lg font-semibold leading-6 text-slate-900 tabular-nums">
                      {(result.pricingConfirmed && result.finalAmount != null ? result.finalAmount : result.totalAmount).toLocaleString()} 円
                    </p>
                    <p className="mt-2 text-xs leading-6 text-slate-500">
                      {result.pricingConfirmed
                        ? `確定日時: ${result.pricingConfirmedAt || '反映済み'}`
                        : 'センター到着後の内容確認をもとに、完了前に正式金額を確定します。'}
                    </p>
                    {result.pricingConfirmed && result.finalAmount != null && result.finalAmount !== result.totalAmount ? (
                      <p className="mt-1 text-xs leading-6 text-slate-500">
                        受付金額: {result.totalAmount.toLocaleString()} 円
                      </p>
                    ) : null}
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 sm:col-span-2">
                    <p className="text-xs font-semibold tracking-[0.08em] text-slate-500">受付日時</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{result.createdAt}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 sm:col-span-2">
                    <p className="text-xs font-semibold tracking-[0.08em] text-slate-500">最終更新日時</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{result.lastUpdatedAt}</p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-white/90 p-4 sm:p-5">
                  <p className="text-xs font-semibold tracking-[0.08em] text-slate-600">回収内容</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-xs font-medium text-slate-500">パソコン</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{result.pcCount} 台</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-xs font-medium text-slate-500">モニター</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{result.monitorCount} 台</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-xs font-medium text-slate-500">小型家電ダンボール</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{result.smallApplianceBoxCount} 箱</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:col-span-2 xl:col-span-1">
                      <p className="text-xs font-medium text-slate-500">データ消去</p>
                      <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{result.dataErasureOptionLabel}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:col-span-2">
                      <p className="text-xs font-medium text-slate-500">段ボール事前配送</p>
                      <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{result.cardboardDeliveryLabel}</p>
                    </div>
                  </div>
                </div>
              </section>
            ) : (
              <section className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 shadow-sm sm:p-8">
                <p className="text-xs font-semibold tracking-[0.08em] text-slate-500">照会前のご案内</p>
                <h2 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-slate-900 sm:text-2xl">
                  入力後に現在の受付状況を表示します
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                  申込内容の確認、回収希望日、現在の進行状況、担当者からの個別案内がこのエリアに表示されます。番号が分からない場合は、受付完了メールをご確認ください。
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="text-xs font-semibold tracking-[0.08em] text-slate-500">必要な情報</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">お申し込み番号 10 桁とメールアドレス</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="text-xs font-semibold tracking-[0.08em] text-slate-500">確認できる内容</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">受付状況、回収予定、個別案内</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 sm:col-span-2">
                    <p className="text-xs font-semibold tracking-[0.08em] text-slate-500">照会前の確認ポイント</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">
                      受付完了メール、迷惑メールフォルダ、登録メールアドレスの入力内容をご確認ください。
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to="/faq"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                  >
                    FAQ を見る
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                  >
                    お問い合わせ窓口へ
                  </Link>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}