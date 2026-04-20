import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../contexts/auth-context'
import axios from '../../lib/axios'
import { formatInquiryId } from '../../lib/orderId'
import AdminDashboardHeader from './AdminDashboardHeader.tsx'

const PAGE_SIZE = 20

interface ApiEnvelope<T> {
  code: number
  message: string
  data: T | null
}

interface InquiryListRow {
  inquiryId: number
  name: string
  email: string
  category: string
  changeRequest: boolean
  changeRequestTopic: string | null
  inquiryStatus: string
  assignedTo: string | null
  orderReference: string | null
  createdAt: string
}

interface InquiryListPageData {
  content: InquiryListRow[]
  totalPages: number
  totalElements: number
  summary: {
    openCount: number
    inProgressCount: number
    resolvedCount: number
  }
}

interface InquiryDetailData {
  inquiryId: number
  version: number
  name: string
  email: string
  category: string
  changeRequest: boolean
  changeRequestTopic: string | null
  inquiryStatus: string
  assignedTo: string | null
  orderReference: string | null
  message: string
  adminNote: string | null
  privacyConsented: boolean
  createdAt: string
  lastUpdatedAt: string
  handledAt: string
}

type InquiryStatusCode = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'

const INQUIRY_STATUS_OPTIONS: { value: InquiryStatusCode; label: string }[] = [
  { value: 'OPEN', label: '未対応' },
  { value: 'IN_PROGRESS', label: '対応中' },
  { value: 'RESOLVED', label: '対応完了' },
]

function inquiryStatusBadgeClass(status: string): string {
  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset'
  switch (status) {
    case '未対応':
      return `${base} bg-amber-50 text-amber-900 ring-amber-600/20`
    case '対応中':
      return `${base} bg-sky-50 text-sky-800 ring-sky-600/20`
    case '対応完了':
      return `${base} bg-emerald-50 text-emerald-800 ring-emerald-600/20`
    default:
      return `${base} bg-slate-100 text-slate-700 ring-slate-600/20`
  }
}

function changeRequestBadgeClass(): string {
  return 'inline-flex items-center rounded-full bg-fuchsia-100 px-2.5 py-1 text-xs font-semibold text-fuchsia-900 ring-1 ring-inset ring-fuchsia-200'
}

function statusCodeFromLabel(label: string): InquiryStatusCode {
  switch (label) {
    case '対応中':
      return 'IN_PROGRESS'
    case '対応完了':
      return 'RESOLVED'
    default:
      return 'OPEN'
  }
}

function summaryCardClass(active: boolean, tone: 'slate' | 'amber' | 'sky' | 'emerald'): string {
  const palette = {
    slate: active
      ? 'border-slate-400 bg-linear-to-br from-slate-100 to-white ring-2 ring-slate-300'
      : 'border-slate-200 bg-linear-to-br from-slate-50 to-white hover:border-slate-300 hover:shadow-md',
    amber: active
      ? 'border-amber-400 bg-linear-to-br from-amber-100 to-white ring-2 ring-amber-300'
      : 'border-amber-200 bg-linear-to-br from-amber-50 to-white hover:border-amber-300 hover:shadow-md',
    sky: active
      ? 'border-sky-400 bg-linear-to-br from-sky-100 to-white ring-2 ring-sky-300'
      : 'border-sky-200 bg-linear-to-br from-sky-50 to-white hover:border-sky-300 hover:shadow-md',
    emerald: active
      ? 'border-emerald-400 bg-linear-to-br from-emerald-100 to-white ring-2 ring-emerald-300'
      : 'border-emerald-200 bg-linear-to-br from-emerald-50 to-white hover:border-emerald-300 hover:shadow-md',
  }

  return `rounded-2xl border p-4 text-left shadow-sm transition ${palette[tone]}`
}

export default function AdminInquiryList() {
  const { logout } = useAuth()
  const [page, setPage] = useState(0)
  const [rows, setRows] = useState<InquiryListRow[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [summary, setSummary] = useState({ openCount: 0, inProgressCount: 0, resolvedCount: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [keyword, setKeyword] = useState('')
  const [appliedKeyword, setAppliedKeyword] = useState('')
  const [assignedToFilter, setAssignedToFilter] = useState('')
  const [appliedAssignedToFilter, setAppliedAssignedToFilter] = useState('')
  const [changeRequestOnly, setChangeRequestOnly] = useState(false)
  const [appliedChangeRequestOnly, setAppliedChangeRequestOnly] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'ALL' | InquiryStatusCode>('ALL')
  const [appliedStatusFilter, setAppliedStatusFilter] = useState<'ALL' | InquiryStatusCode>('ALL')
  const [selectedInquiryId, setSelectedInquiryId] = useState<number | null>(null)
  const [detail, setDetail] = useState<InquiryDetailData | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [detailStatusDraft, setDetailStatusDraft] = useState<InquiryStatusCode>('OPEN')
  const [detailAssignedToDraft, setDetailAssignedToDraft] = useState('')
  const [detailAdminNoteDraft, setDetailAdminNoteDraft] = useState('')
  const [detailSaving, setDetailSaving] = useState(false)
  const [detailSaveMessage, setDetailSaveMessage] = useState<string | null>(null)

  const load = useCallback(async (
    nextPage: number,
    searchKeyword: string,
    searchStatus: 'ALL' | InquiryStatusCode,
    searchAssignedTo: string,
    searchChangeRequestOnly: boolean,
  ) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await axios.get<ApiEnvelope<InquiryListPageData>>('/api/admin/contact-inquiries', {
        params: {
          page: nextPage,
          size: PAGE_SIZE,
          keyword: searchKeyword,
          status: searchStatus === 'ALL' ? undefined : searchStatus,
          assignedTo: searchAssignedTo || undefined,
          changeRequestOnly: searchChangeRequestOnly || undefined,
        },
      })
      if (data.code !== 200 || !data.data) {
        setError('問い合わせ一覧の取得に失敗しました。')
        return
      }
      setRows(data.data.content)
      setTotalPages(data.data.totalPages)
      setTotalElements(data.data.totalElements)
      setSummary(data.data.summary)
    } catch {
      setError('サーバーに接続できませんでした。')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(page, appliedKeyword, appliedStatusFilter, appliedAssignedToFilter, appliedChangeRequestOnly)
  }, [appliedAssignedToFilter, appliedChangeRequestOnly, appliedKeyword, appliedStatusFilter, load, page])

  const applyFilters = (nextStatus: 'ALL' | InquiryStatusCode) => {
    setAppliedKeyword(keyword)
    setAppliedStatusFilter(nextStatus)
    setAppliedAssignedToFilter(assignedToFilter.trim())
    setAppliedChangeRequestOnly(changeRequestOnly)
    setPage(0)
  }

  const handleSearch = () => {
    applyFilters(statusFilter)
  }

  const handleSummaryClick = (nextStatus: InquiryStatusCode) => {
    setStatusFilter(nextStatus)
    applyFilters(nextStatus)
  }

  const handleClearStatusFilter = () => {
    setStatusFilter('ALL')
    applyFilters('ALL')
  }

  const openDetail = async (inquiryId: number) => {
    setSelectedInquiryId(inquiryId)
    setDetail(null)
    setDetailLoading(true)
    setDetailError(null)
    try {
      const { data } = await axios.get<ApiEnvelope<InquiryDetailData>>(`/api/admin/contact-inquiries/${inquiryId}`)
      if (data.code !== 200 || !data.data) {
        setDetailError('問い合わせ詳細の取得に失敗しました。')
        return
      }
      setDetail(data.data)
      setDetailStatusDraft(statusCodeFromLabel(data.data.inquiryStatus))
      setDetailAssignedToDraft(data.data.assignedTo ?? '')
      setDetailAdminNoteDraft(data.data.adminNote ?? '')
    } catch {
      setDetailError('問い合わせ詳細の取得に失敗しました。')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleSave = async () => {
    if (!detail || detailSaving) return

    setDetailSaving(true)
    setDetailSaveMessage(null)
    setDetailError(null)

    try {
      const { data } = await axios.put<ApiEnvelope<null>>(`/api/admin/contact-inquiries/${detail.inquiryId}`, {
        status: detailStatusDraft,
        version: detail.version,
        assignedTo: detailAssignedToDraft,
        adminNote: detailAdminNoteDraft,
      })
      if (data.code !== 200) {
        setDetailError(data.message || '更新に失敗しました。')
        return
      }
      await openDetail(detail.inquiryId)
      await load(page, appliedKeyword, appliedStatusFilter, appliedAssignedToFilter, appliedChangeRequestOnly)
      setDetailSaveMessage('問い合わせ対応情報を更新しました。')
    } catch (error) {
      if (axios.isAxiosError<ApiEnvelope<null>>(error)) {
        setDetailError(error.response?.data?.message ?? '更新に失敗しました。')
      } else {
        setDetailError('更新に失敗しました。')
      }
    } finally {
      setDetailSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AdminDashboardHeader
        title="問い合わせ一覧"
        subtitle="管理画面 · ご相談フォーム"
        currentSection="inquiries"
        onLogout={() => {
          if (window.confirm('ログアウトしますか？')) logout()
        }}
      />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
        ) : null}

        <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <button type="button" onClick={handleClearStatusFilter} className={summaryCardClass(appliedStatusFilter === 'ALL', 'slate')}>
            <p className="text-xs font-semibold tracking-wide text-slate-600">総件数</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{totalElements}</p>
            <p className="mt-1 text-xs text-slate-700/80">すべての問い合わせを表示</p>
          </button>
          <button type="button" onClick={() => handleSummaryClick('OPEN')} className={summaryCardClass(appliedStatusFilter === 'OPEN', 'amber')}>
            <p className="text-xs font-semibold tracking-wide text-amber-700">未対応</p>
            <p className="mt-2 text-3xl font-bold text-amber-950">{summary.openCount}</p>
            <p className="mt-1 text-xs text-amber-800/80">優先対応が必要な問い合わせ</p>
          </button>
          <button type="button" onClick={() => handleSummaryClick('IN_PROGRESS')} className={summaryCardClass(appliedStatusFilter === 'IN_PROGRESS', 'sky')}>
            <p className="text-xs font-semibold tracking-wide text-sky-700">対応中</p>
            <p className="mt-2 text-3xl font-bold text-sky-950">{summary.inProgressCount}</p>
            <p className="mt-1 text-xs text-sky-800/80">現在フォロー中の問い合わせ</p>
          </button>
          <button type="button" onClick={() => handleSummaryClick('RESOLVED')} className={summaryCardClass(appliedStatusFilter === 'RESOLVED', 'emerald')}>
            <p className="text-xs font-semibold tracking-wide text-emerald-700">対応完了</p>
            <p className="mt-2 text-3xl font-bold text-emerald-950">{summary.resolvedCount}</p>
            <p className="mt-1 text-xs text-emerald-800/80">対応を完了した問い合わせ</p>
          </button>
        </section>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full max-w-5xl flex-col gap-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <input
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
              placeholder="受付番号、氏名、メール、申込番号で検索..."
              className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 lg:max-w-xl"
            />
            <input
              type="text"
              value={assignedToFilter}
              onChange={(event) => setAssignedToFilter(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
              placeholder="担当者名で絞り込み..."
              className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 lg:max-w-xs"
            />
            <button onClick={handleSearch} className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500">
              検索
            </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleClearStatusFilter}
                className={statusFilter === 'ALL'
                  ? 'rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm'
                  : 'rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50'}
              >
                すべて
              </button>
              {INQUIRY_STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSummaryClick(option.value)}
                  className={statusFilter === option.value
                    ? 'rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm'
                    : 'rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50'}
                >
                  {option.label}
                </button>
              ))}
              <label className={changeRequestOnly
                ? 'inline-flex cursor-pointer items-center gap-2 rounded-lg bg-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-sm'
                : 'inline-flex cursor-pointer items-center gap-2 rounded-lg border border-fuchsia-200 bg-white px-4 py-2 text-sm font-semibold text-fuchsia-800 shadow-sm hover:bg-fuchsia-50'}>
                <input
                  type="checkbox"
                  checked={changeRequestOnly}
                  onChange={(event) => setChangeRequestOnly(event.target.checked)}
                  className="h-4 w-4 rounded border-white/60 text-fuchsia-600 focus:ring-fuchsia-300"
                />
                <span>変更依頼のみ</span>
              </label>
            </div>
          </div>
          <div className="text-sm font-medium text-slate-500">
            {appliedChangeRequestOnly ? '変更依頼のみ ' : ''}全 {totalElements} 件
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-600">受付番号</th>
                  <th className="px-4 py-3 font-medium text-slate-600">氏名</th>
                  <th className="px-4 py-3 font-medium text-slate-600">メール</th>
                  <th className="px-4 py-3 font-medium text-slate-600">種別</th>
                  <th className="px-4 py-3 font-medium text-slate-600">対応状況</th>
                  <th className="px-4 py-3 font-medium text-slate-600">担当者</th>
                  <th className="px-4 py-3 font-medium text-slate-600">申込番号</th>
                  <th className="px-4 py-3 font-medium text-slate-600">受付日時</th>
                  <th className="px-4 py-3 text-center font-medium text-slate-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-slate-400">読み込み中…</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-slate-400">該当する問い合わせはありません。</td></tr>
                ) : rows.map((row) => (
                  <tr
                    key={row.inquiryId}
                    className={row.changeRequest
                      ? 'bg-fuchsia-50/40 transition-colors hover:bg-fuchsia-50/70'
                      : 'transition-colors hover:bg-slate-50/60'}
                  >
                    <td className="px-4 py-3 font-mono text-slate-800">{formatInquiryId(row.inquiryId)}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{row.name}</td>
                    <td className="px-4 py-3 text-slate-600">{row.email}</td>
                    <td className="px-4 py-3 text-slate-700">
                      <div className="flex flex-col gap-2">
                        <span>{row.category}</span>
                        {row.changeRequest ? (
                          <span className={changeRequestBadgeClass()}>
                            変更依頼{row.changeRequestTopic ? ` · ${row.changeRequestTopic}` : ''}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className={inquiryStatusBadgeClass(row.inquiryStatus)}>{row.inquiryStatus}</span></td>
                    <td className="px-4 py-3 text-slate-600">{row.assignedTo || '-'}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{row.orderReference || '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{row.createdAt}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => void openDetail(row.inquiryId)}
                        className="inline-flex min-w-20 items-center justify-center rounded-lg border border-sky-200 bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-px hover:bg-sky-700"
                      >
                        詳細を見る
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <footer className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-3">
            <p className="text-xs font-medium text-slate-500">ページ {page + 1} / {totalPages || 1}</p>
            <div className="flex gap-2">
              <button disabled={page === 0 || loading} onClick={() => setPage((current) => current - 1)} className="rounded-lg border bg-white px-4 py-1.5 text-xs shadow-sm hover:bg-slate-50 disabled:opacity-40">前へ</button>
              <button disabled={page >= totalPages - 1 || loading} onClick={() => setPage((current) => current + 1)} className="rounded-lg border bg-white px-4 py-1.5 text-xs shadow-sm hover:bg-slate-50 disabled:opacity-40">次へ</button>
            </div>
          </footer>
        </div>
      </main>

      {selectedInquiryId != null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b bg-slate-50 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-800">問い合わせ詳細 {formatInquiryId(selectedInquiryId)}</h3>
              <button onClick={() => setSelectedInquiryId(null)} className="text-2xl leading-none text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 text-sm">
              {detailLoading ? <div className="py-10 text-center text-slate-500">データを取得しています...</div> : null}
              {detailError ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{detailError}</div> : null}
              {detail ? (
                <div className="space-y-5">
                  <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <h4 className="mb-3 border-b pb-2 font-bold text-slate-700">基本情報</h4>
                    {detail.changeRequest ? (
                      <div className="mb-4 rounded-lg border border-fuchsia-200 bg-fuchsia-50 px-4 py-3 text-sm leading-7 text-fuchsia-950">
                        <p className="font-semibold">注文照会画面から送信された変更依頼です</p>
                        <p className="mt-1">変更種別: {detail.changeRequestTopic ?? '未指定'}</p>
                        <p className="mt-1 text-fuchsia-900/80">
                          回収日、時間帯、連絡先、品目などの変更相談の可能性があります。本文と申込番号をあわせて確認してください。
                        </p>
                      </div>
                    ) : null}
                    <div className="grid gap-3 md:grid-cols-2">
                      <div><span className="block text-xs text-slate-500">受付番号</span><span className="font-medium text-slate-800">{formatInquiryId(detail.inquiryId)}</span></div>
                      <div><span className="block text-xs text-slate-500">受付日時</span><span className="font-medium text-slate-800">{detail.createdAt}</span></div>
                      <div><span className="block text-xs text-slate-500">氏名</span><span className="font-medium text-slate-800">{detail.name}</span></div>
                      <div><span className="block text-xs text-slate-500">メールアドレス</span><span className="font-medium text-slate-800">{detail.email}</span></div>
                      <div><span className="block text-xs text-slate-500">お問い合わせ種別</span><span className="font-medium text-slate-800">{detail.category}</span></div>
                      <div><span className="block text-xs text-slate-500">対応状況</span><span className={inquiryStatusBadgeClass(detail.inquiryStatus)}>{detail.inquiryStatus}</span></div>
                      <div><span className="block text-xs text-slate-500">担当者</span><span className="font-medium text-slate-800">{detail.assignedTo || '未設定'}</span></div>
                      <div><span className="block text-xs text-slate-500">申込番号</span><span className="font-medium text-slate-800">{detail.orderReference || '未入力'}</span></div>
                      <div><span className="block text-xs text-slate-500">個人情報保護方針</span><span className="font-medium text-slate-800">{detail.privacyConsented ? '同意済み' : '未同意'}</span></div>
                      <div><span className="block text-xs text-slate-500">最終更新日時</span><span className="font-medium text-slate-800">{detail.lastUpdatedAt}</span></div>
                      <div><span className="block text-xs text-slate-500">対応完了日時</span><span className="font-medium text-slate-800">{detail.handledAt || '未完了'}</span></div>
                    </div>
                  </section>

                  <section className="rounded-lg border border-slate-200 bg-white p-4">
                    <h4 className="mb-3 border-b pb-2 font-bold text-slate-700">問い合わせ本文</h4>
                    <p className="whitespace-pre-wrap leading-7 text-slate-700">{detail.message}</p>
                  </section>

                  <section className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
                    <h4 className="mb-3 border-b border-indigo-200 pb-2 font-bold text-indigo-900">対応管理</h4>
                    {detailSaveMessage ? <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{detailSaveMessage}</div> : null}
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="block">
                        <span className="mb-1 block text-xs text-indigo-700">対応状況</span>
                        <select value={detailStatusDraft} onChange={(event) => setDetailStatusDraft(event.target.value as InquiryStatusCode)} className="block w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                          {INQUIRY_STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs text-indigo-700">担当者</span>
                        <input value={detailAssignedToDraft} onChange={(event) => setDetailAssignedToDraft(event.target.value)} maxLength={100} className="block w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200" placeholder="例: 山田" />
                      </label>
                    </div>
                    <label className="mt-4 block">
                      <span className="mb-1 block text-xs text-indigo-700">管理メモ</span>
                      <textarea value={detailAdminNoteDraft} onChange={(event) => setDetailAdminNoteDraft(event.target.value)} maxLength={1000} rows={5} className="block w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200" placeholder="社内向け対応メモを入力してください。" />
                      <span className="mt-2 block text-right text-xs text-indigo-800/80">{detailAdminNoteDraft.length} / 1000</span>
                    </label>
                    <div className="mt-4 flex justify-end">
                      <button onClick={() => void handleSave()} disabled={detailSaving} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
                        {detailSaving ? '更新中…' : '対応内容を保存'}
                      </button>
                    </div>
                  </section>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}