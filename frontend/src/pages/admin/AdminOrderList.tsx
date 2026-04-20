import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../contexts/auth-context'
import axios from '../../lib/axios'
import { formatOrderId } from '../../lib/orderId'
import AdminDashboardHeader from './AdminDashboardHeader.tsx'

const PAGE_SIZE = 20

type OrderStatusCode = 'RECEIVED' | 'KIT_SHIPPED' | 'COLLECTING' | 'ARRIVED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED'

interface OrderListRow {
  orderId: number; contactName: string; contactPhone: string; collectionDate: string; collectionTime: string;
  orderStatus: OrderStatusCode; totalAmount: number; pricingConfirmed: boolean; finalAmount: number | null; createdAt: string; version: number;
}

// —— 【新增】订单详情的数据类型 ——
interface OrderDetailData {
  orderId: number; version: number; orderStatus: string; collectionDate: string; collectionTimeSlot: string; totalAmount: number;
  pricingConfirmed: boolean; finalAmount: number | null; pricingConfirmedAt: string; pricingConfirmedBy: string | null; pricingConfirmationNote: string | null; createdAt: string;
  lastUpdatedAt: string;
  pcCount: number; monitorCount: number; smallApplianceBoxCount: number; dataErasureOption: string; cardboardDeliveryRequested: boolean;
  customerNameKanji: string; customerNameKana: string; postalCode: string; prefecture: string; city: string; addressLine1: string; addressLine2: string; phone: string; email: string; customerNote: string | null; internalNote: string | null;
  internalNoteHistories: { historyId: number; previousNote: string | null; newNote: string | null; changedBy: string; changedAt: string; }[];
  statusHistories: { historyId: number; previousStatus: string | null; newStatus: string; changedBy: string; changedAt: string; changeReason: string | null; }[];
}

interface OrderListPageData { content: OrderListRow[]; totalPages: number; totalElements: number; }
interface ApiEnvelope<T> { code: number; message: string; data: T | null; }

const STATUS_OPTIONS: { value: OrderStatusCode; label: string }[] = [
  { value: 'RECEIVED', label: '受付済' }, { value: 'KIT_SHIPPED', label: 'キット発送済' }, { value: 'COLLECTING', label: '回収中' },
  { value: 'ARRIVED', label: '到着済' }, { value: 'PROCESSING', label: '処理中' }, { value: 'COMPLETED', label: '完了' }, { value: 'CANCELLED', label: 'キャンセル' },
]

function statusBadgeClass(status: string): string {
  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset'
  switch (status) {
    case 'RECEIVED': return `${base} bg-sky-50 text-sky-800 ring-sky-600/20`
    case 'KIT_SHIPPED': return `${base} bg-slate-50 text-slate-700 ring-slate-600/20`
    case 'COLLECTING': return `${base} bg-amber-50 text-amber-900 ring-amber-600/30`
    case 'ARRIVED': return `${base} bg-violet-50 text-violet-800 ring-violet-600/20`
    case 'PROCESSING': return `${base} bg-orange-50 text-orange-900 ring-orange-600/25`
    case 'COMPLETED': return `${base} bg-emerald-50 text-emerald-800 ring-emerald-600/20`
    case 'CANCELLED': return `${base} bg-red-50 text-red-800 ring-red-600/20`
    default: return `${base} bg-gray-50 text-gray-700 ring-gray-500/20`
  }
}

function formatYen(amount: number): string { return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(amount) }

function getDisplayedAmount(totalAmount: number, pricingConfirmed: boolean, finalAmount: number | null): number {
  return pricingConfirmed && finalAmount != null ? finalAmount : totalAmount
}

function pricingBadgeClass(pricingConfirmed: boolean): string {
  return pricingConfirmed
    ? 'inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-200'
    : 'inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900 ring-1 ring-inset ring-amber-200'
}

function getStatusLabel(status: OrderStatusCode): string {
  return STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status
}

export default function AdminOrderList() {
  const { logout } = useAuth()
  const [page, setPage] = useState(0)
  const [rows, setRows] = useState<OrderListRow[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [keyword, setKeyword] = useState("")
  const [appliedKeyword, setAppliedKeyword] = useState("")

  // —— 【新增】弹窗相关状态 ——
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [detailData, setDetailData] = useState<OrderDetailData | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailNoteDraft, setDetailNoteDraft] = useState('')
  const [detailInternalNoteDraft, setDetailInternalNoteDraft] = useState('')
  const [detailStatusDraft, setDetailStatusDraft] = useState<OrderStatusCode>('RECEIVED')
  const [detailStatusReasonDraft, setDetailStatusReasonDraft] = useState('')
  const [detailSaving, setDetailSaving] = useState(false)
  const [detailStatusSaving, setDetailStatusSaving] = useState(false)
  const [detailPricingDraft, setDetailPricingDraft] = useState('')
  const [detailPricingNoteDraft, setDetailPricingNoteDraft] = useState('')
  const [detailPricingSaving, setDetailPricingSaving] = useState(false)
  const [selectedRow, setSelectedRow] = useState<OrderListRow | null>(null)
  const [detailSaveMessage, setDetailSaveMessage] = useState<string | null>(null)
  const [detailSaveError, setDetailSaveError] = useState<string | null>(null)
  const [detailPricingMessage, setDetailPricingMessage] = useState<string | null>(null)
  const [detailPricingError, setDetailPricingError] = useState<string | null>(null)
  const [listActionMessage, setListActionMessage] = useState<string | null>(null)
  const [listActionError, setListActionError] = useState<string | null>(null)

  const fetchOrderDetail = useCallback(async (orderId: number) => {
    const { data } = await axios.get<ApiEnvelope<OrderDetailData>>(`/api/admin/orders/${orderId}`)
    if (data.code !== 200 || !data.data) {
      throw new Error('detail fetch failed')
    }
    return data.data
  }, [])

  const load = useCallback(async (p: number, searchKeyword: string = "") => {
    setLoading(true); setError(null)
    try {
      const { data } = await axios.get<ApiEnvelope<OrderListPageData>>('/api/admin/orders', { params: { page: p, size: PAGE_SIZE, keyword: searchKeyword } })
      if (data.code !== 200 || !data.data) { setError('データの取得に失敗しました'); return }
      setRows(data.data.content); setTotalPages(data.data.totalPages); setTotalElements(data.data.totalElements)
    } catch { setError('サーバーに接続できませんでした') } finally { setLoading(false) }
  }, [])

  useEffect(() => { void load(page, appliedKeyword) }, [appliedKeyword, load, page])

  const handleSearch = () => {
    setListActionMessage(null)
    setListActionError(null)
    setAppliedKeyword(keyword)
    setPage(0)
  }

  const handleExportCsv = async () => {
    try {
      const response = await axios.get('/api/admin/orders/export', { params: { keyword }, responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a'); link.href = url; link.setAttribute('download', `orders_export.csv`);
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url)
    } catch { alert('CSVの出力に失敗しました') }
  }

  // —— 【新增】打开弹窗并请求详情数据 ——
  const handleOpenDetail = async (row: OrderListRow) => {
    setSelectedRow(row)
    setIsModalOpen(true)
    setDetailLoading(true)
    setDetailData(null)
    setDetailSaveMessage(null)
    setDetailSaveError(null)
    setDetailPricingMessage(null)
    setDetailPricingError(null)
    setDetailStatusDraft(row.orderStatus)
    setDetailStatusReasonDraft('')
    try {
      const detail = await fetchOrderDetail(row.orderId)
      setDetailData(detail)
      setDetailNoteDraft(detail.customerNote ?? '')
      setDetailInternalNoteDraft(detail.internalNote ?? '')
      setDetailPricingDraft(String(detail.finalAmount ?? detail.totalAmount))
      setDetailPricingNoteDraft(detail.pricingConfirmationNote ?? '')
    } catch {
      alert("通信エラーが発生しました。")
    } finally {
      setDetailLoading(false)
    }
  }

  const handleConfirmPricing = async () => {
    if (!detailData || !selectedRow || detailPricingSaving) return

    const normalizedAmount = detailPricingDraft.trim()
    if (!/^\d+$/.test(normalizedAmount)) {
      setDetailPricingError('正式料金は0円以上の整数で入力してください。')
      return
    }
    if (!detailPricingNoteDraft.trim()) {
      setDetailPricingError('料金確定メモを入力してください。')
      return
    }

    setDetailPricingSaving(true)
    setDetailPricingMessage(null)
    setDetailPricingError(null)
    try {
      await axios.put(`/api/admin/orders/${detailData.orderId}/pricing`, {
        finalAmount: Number(normalizedAmount),
        version: detailData.version,
        pricingConfirmationNote: detailPricingNoteDraft,
      })
      const refreshedDetail = await fetchOrderDetail(detailData.orderId)
      setDetailData(refreshedDetail)
      setDetailPricingDraft(String(refreshedDetail.finalAmount ?? refreshedDetail.totalAmount))
      setDetailPricingNoteDraft(refreshedDetail.pricingConfirmationNote ?? '')
      const refreshedRow = {
        ...selectedRow,
        version: refreshedDetail.version,
        totalAmount: refreshedDetail.totalAmount,
        pricingConfirmed: refreshedDetail.pricingConfirmed,
        finalAmount: refreshedDetail.finalAmount,
      }
      setSelectedRow(refreshedRow)
      setRows((current) => current.map((row) => row.orderId === refreshedRow.orderId ? refreshedRow : row))
      setDetailPricingMessage('正式料金を確定しました。')
      setListActionMessage(`注文 ${formatOrderId(refreshedRow.orderId)} の正式料金を確定しました。`)
    } catch (error) {
      if (axios.isAxiosError<ApiEnvelope<null>>(error)) {
        setDetailPricingError(error.response?.data?.message ?? '正式料金の確定に失敗しました。')
      } else {
        setDetailPricingError('正式料金の確定に失敗しました。')
      }
      if (selectedRow) {
        void handleOpenDetail(selectedRow)
      }
    } finally {
      setDetailPricingSaving(false)
    }
  }

  const handleSaveCustomerNote = async () => {
    if (!detailData || !selectedRow || detailSaving) return
    setDetailSaving(true)
    setDetailSaveMessage(null)
    setDetailSaveError(null)
    try {
      await axios.put(`/api/admin/orders/${detailData.orderId}/status`, {
        status: selectedRow.orderStatus,
        version: detailData.version,
        customerNote: detailNoteDraft,
        internalNote: detailInternalNoteDraft,
      })
      const refreshedRow = { ...selectedRow, version: detailData.version + 1 }
      setSelectedRow(refreshedRow)
      setRows((current) => current.map((row) => row.orderId === refreshedRow.orderId ? refreshedRow : row))
      const refreshedDetail = await fetchOrderDetail(detailData.orderId)
      setDetailData(refreshedDetail)
      setDetailStatusDraft(refreshedRow.orderStatus)
      setDetailSaveMessage('メモを保存しました。')
    } catch {
      setDetailSaveError('保存に失敗しました。別の更新が入った可能性があります。最新データを再取得しました。')
      if (selectedRow) {
        void handleOpenDetail(selectedRow)
      }
    } finally {
      setDetailSaving(false)
    }
  }

  const handleSaveDetailStatus = async () => {
    if (!detailData || !selectedRow || detailStatusSaving) return
    if (detailStatusDraft === selectedRow.orderStatus) {
      setDetailSaveError('変更後のステータスを選択してください。')
      return
    }
    if (!detailStatusReasonDraft.trim()) {
      setDetailSaveError('ステータス変更理由を入力してください。')
      return
    }

    setDetailStatusSaving(true)
    setDetailSaveMessage(null)
    setDetailSaveError(null)
    try {
      await axios.put(`/api/admin/orders/${detailData.orderId}/status`, {
        status: detailStatusDraft,
        version: detailData.version,
        statusChangeReason: detailStatusReasonDraft,
      })
      const updatedRow = { ...selectedRow, orderStatus: detailStatusDraft, version: detailData.version + 1 }
      setSelectedRow(updatedRow)
      setRows((current) => current.map((row) => row.orderId === updatedRow.orderId ? updatedRow : row))
      const refreshedDetail = await fetchOrderDetail(detailData.orderId)
      setDetailData(refreshedDetail)
      setDetailStatusDraft(updatedRow.orderStatus)
      setDetailStatusReasonDraft('')
      setDetailSaveMessage('ステータスを更新しました。')
      setListActionMessage(`注文 ${formatOrderId(updatedRow.orderId)} のステータスを更新しました。`)
    } catch (error) {
      if (axios.isAxiosError<ApiEnvelope<null>>(error)) {
        setDetailSaveError(error.response?.data?.message ?? 'ステータスの更新に失敗しました。')
      } else {
        setDetailSaveError('ステータスの更新に失敗しました。')
      }
      if (selectedRow) {
        void handleOpenDetail(selectedRow)
      }
    } finally {
      setDetailStatusSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AdminDashboardHeader
        title="注文一覧"
        subtitle="管理画面 · 回収申込"
        currentSection="orders"
        onLogout={() => { if (window.confirm('ログアウトしますか？')) logout() }}
      />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
        {listActionMessage && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{listActionMessage}</div>}
        {listActionError && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{listActionError}</div>}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 max-w-lg gap-2">
            <input type="text" placeholder="注文ID、氏名、電話番号で検索..." className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500" value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
            <button onClick={handleSearch} className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500">検索</button>
            <button onClick={handleExportCsv} className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors">CSV出力</button>
          </div>
          <div className="text-sm text-slate-500 font-medium">全 {totalElements} 件</div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-600">注文ID</th>
                  <th className="px-4 py-3 font-medium text-slate-600">氏名</th>
                  <th className="px-4 py-3 font-medium text-slate-600">電話</th>
                  <th className="px-4 py-3 font-medium text-slate-600 text-center">ステータス</th>
                  <th className="px-4 py-3 font-medium text-slate-600 text-right">金額</th>
                  <th className="px-4 py-3 font-medium text-slate-600 text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">読み込み中…</td></tr> : rows.map((row) => (
                  <tr key={row.orderId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-800">{formatOrderId(row.orderId)}</td>
                    <td className="px-4 py-3 text-slate-800 font-medium">{row.contactName}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{row.contactPhone}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={statusBadgeClass(row.orderStatus)}>{getStatusLabel(row.orderStatus)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="tabular-nums font-medium text-slate-800">
                          {formatYen(getDisplayedAmount(row.totalAmount, row.pricingConfirmed, row.finalAmount))}
                        </span>
                        <span className={pricingBadgeClass(row.pricingConfirmed)}>
                          {row.pricingConfirmed ? '正式料金' : '受付金額'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleOpenDetail(row)}
                        className="inline-flex min-w-20 items-center justify-center rounded-lg border border-sky-200 bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-px hover:bg-sky-700 hover:shadow focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-1 active:translate-y-0 active:bg-sky-800"
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
            <p className="text-xs text-slate-500 font-medium">ページ {page + 1} / {totalPages || 1}</p>
            <div className="flex gap-2">
              <button disabled={page === 0 || loading} onClick={() => setPage(p => p - 1)} className="rounded-lg border bg-white px-4 py-1.5 text-xs shadow-sm hover:bg-slate-50 disabled:opacity-40">前へ</button>
              <button disabled={page >= totalPages - 1 || loading} onClick={() => setPage(p => p + 1)} className="rounded-lg border bg-white px-4 py-1.5 text-xs shadow-sm hover:bg-slate-50 disabled:opacity-40">次へ</button>
            </div>
          </footer>
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b px-6 py-4 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">
                {detailData ? `注文詳細 ${formatOrderId(detailData.orderId)}` : '読み込み中...'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 text-sm">
              {detailLoading ? (
                <div className="text-center py-10 text-slate-500">データを取得しています...</div>
              ) : detailData ? (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <h4 className="font-bold text-slate-700 mb-3 border-b pb-2">お客様情報・回収先</h4>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                      <div><span className="text-slate-500 text-xs block">氏名</span><span className="font-medium">{detailData.customerNameKanji} ({detailData.customerNameKana})</span></div>
                      <div><span className="text-slate-500 text-xs block">連絡先</span><span className="font-medium">{detailData.phone} <br/> {detailData.email}</span></div>
                      <div className="col-span-2"><span className="text-slate-500 text-xs block">住所</span>
                        <span className="font-medium">〒{detailData.postalCode} {detailData.prefecture}{detailData.city}{detailData.addressLine1} {detailData.addressLine2 || ''}</span>
                      </div>
                      <div><span className="text-slate-500 text-xs block">回収希望日</span><span className="font-medium">{detailData.collectionDate}</span></div>
                      <div><span className="text-slate-500 text-xs block">時間帯</span><span className="font-medium">{detailData.collectionTimeSlot}</span></div>
                      <div><span className="text-slate-500 text-xs block">最終更新日時</span><span className="font-medium">{detailData.lastUpdatedAt}</span></div>
                      <div><span className="text-slate-500 text-xs block">バージョン</span><span className="font-medium">v{detailData.version}</span></div>
                    </div>
                  </div>

                  <div className="bg-sky-50 p-4 rounded-lg border border-sky-100">
                    <h4 className="font-bold text-sky-800 mb-3 border-b border-sky-200 pb-2">回収品目・オプション</h4>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                      <div><span className="text-sky-700 text-xs block">パソコン台数</span><span className="font-bold text-lg">{detailData.pcCount} 台</span></div>
                      <div><span className="text-sky-700 text-xs block">モニター台数</span><span className="font-bold text-lg">{detailData.monitorCount} 台</span></div>
                      <div><span className="text-sky-700 text-xs block">小型家電ダンボール</span><span className="font-bold text-lg">{detailData.smallApplianceBoxCount} 箱</span></div>
                      <div><span className="text-sky-700 text-xs block">データ消去</span><span className="font-medium">{detailData.dataErasureOption}</span></div>
                      <div><span className="text-sky-700 text-xs block">段ボール事前配送</span><span className="font-medium">{detailData.cardboardDeliveryRequested ? '希望する' : '希望しない'}</span></div>
                      <div><span className="text-sky-700 text-xs block">受付金額</span><span className="font-bold text-xl text-red-600">{formatYen(detailData.totalAmount)}</span></div>
                    </div>
                  </div>

                  <div className="bg-rose-50 p-4 rounded-lg border border-rose-100">
                    <h4 className="font-bold text-rose-800 mb-3 border-b border-rose-200 pb-2">正式料金の確定</h4>
                    {detailPricingMessage ? <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{detailPricingMessage}</div> : null}
                    {detailPricingError ? <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{detailPricingError}</div> : null}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <span className="mb-1 block text-xs text-rose-700">現在の状態</span>
                        <div className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-slate-800">
                          <span className={pricingBadgeClass(detailData.pricingConfirmed)}>
                            {detailData.pricingConfirmed ? '正式料金確定済' : '受付金額のまま未確定'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="mb-1 block text-xs text-rose-700">正式料金</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={detailPricingDraft}
                          onChange={(event) => {
                            setDetailPricingDraft(event.target.value.replace(/\D/g, ''))
                            setDetailPricingError(null)
                          }}
                          disabled={detailPricingSaving || selectedRow?.orderStatus === 'COMPLETED' || selectedRow?.orderStatus === 'CANCELLED'}
                          className="block w-full rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
                          placeholder="例: 3550"
                        />
                      </div>
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div className="rounded-lg border border-rose-200 bg-white px-3 py-3">
                        <span className="block text-xs text-rose-700">受付金額</span>
                        <span className="mt-1 block text-base font-semibold text-slate-900">{formatYen(detailData.totalAmount)}</span>
                      </div>
                      <div className="rounded-lg border border-rose-200 bg-white px-3 py-3">
                        <span className="block text-xs text-rose-700">現在の正式金額</span>
                        <span className="mt-1 block text-base font-semibold text-slate-900">
                          {detailData.pricingConfirmed && detailData.finalAmount != null ? formatYen(detailData.finalAmount) : '未確定'}
                        </span>
                        {detailData.pricingConfirmedAt ? (
                          <span className="mt-1 block text-xs text-slate-500">
                            確定日時: {detailData.pricingConfirmedAt}
                            {detailData.pricingConfirmedBy ? ` / ${detailData.pricingConfirmedBy}` : ''}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="mb-1 block text-xs text-rose-700">料金確定メモ</span>
                      <textarea
                        value={detailPricingNoteDraft}
                        onChange={(event) => {
                          setDetailPricingNoteDraft(event.target.value)
                          setDetailPricingError(null)
                        }}
                        maxLength={500}
                        rows={3}
                        disabled={detailPricingSaving || selectedRow?.orderStatus === 'COMPLETED' || selectedRow?.orderStatus === 'CANCELLED'}
                        className="block w-full rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
                        placeholder="例: 到着品の内容確認の結果、申込どおりのため正式料金を確定。"
                      />
                      <div className="mt-2 flex items-center justify-between text-xs text-rose-800/80">
                        <span>完了前に正式料金の確定が必要です。受付金額と差がある場合は理由を残してください。</span>
                        <span>{detailPricingNoteDraft.length} / 500</span>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={handleConfirmPricing}
                        disabled={detailPricingSaving || !detailPricingDraft.trim() || !detailPricingNoteDraft.trim() || selectedRow?.orderStatus === 'COMPLETED' || selectedRow?.orderStatus === 'CANCELLED'}
                        className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {detailPricingSaving ? '確定中…' : detailData.pricingConfirmed ? '正式料金を更新する' : '正式料金を確定する'}
                      </button>
                    </div>
                  </div>

                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                    <h4 className="font-bold text-indigo-800 mb-3 border-b border-indigo-200 pb-2">ステータス更新</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <span className="mb-1 block text-xs text-indigo-700">現在のステータス</span>
                        <div className="rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-slate-800">{selectedRow ? getStatusLabel(selectedRow.orderStatus) : detailData.orderStatus}</div>
                      </div>
                      <div>
                        <span className="mb-1 block text-xs text-indigo-700">変更後のステータス</span>
                        <select value={detailStatusDraft} onChange={(event) => setDetailStatusDraft(event.target.value as OrderStatusCode)} disabled={detailStatusSaving || selectedRow?.orderStatus === 'COMPLETED' || selectedRow?.orderStatus === 'CANCELLED'} className="block w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                          {STATUS_OPTIONS.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}
                        </select>
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="mb-1 block text-xs text-indigo-700">変更理由</span>
                      <textarea
                        value={detailStatusReasonDraft}
                        onChange={(event) => setDetailStatusReasonDraft(event.target.value)}
                        maxLength={500}
                        rows={3}
                        className="block w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        placeholder="例: 集荷日が確定したため。"
                      />
                      <div className="mt-2 flex items-center justify-between text-xs text-indigo-800/80">
                        <span>ステータスを変更する場合は理由が必須です。完了にする前に正式料金を確定してください。</span>
                        <span>{detailStatusReasonDraft.length} / 500</span>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button onClick={handleSaveDetailStatus} disabled={detailStatusSaving || detailStatusDraft === selectedRow?.orderStatus || !detailStatusReasonDraft.trim() || (detailStatusDraft === 'COMPLETED' && !detailData.pricingConfirmed)} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
                        {detailStatusSaving ? '更新中…' : 'ステータスを更新'}
                      </button>
                    </div>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                    <h4 className="font-bold text-amber-800 mb-3 border-b border-amber-200 pb-2">申込者への個別案内</h4>
                    {detailSaveMessage ? <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{detailSaveMessage}</div> : null}
                    {detailSaveError ? <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{detailSaveError}</div> : null}
                    <textarea
                      value={detailNoteDraft}
                      onChange={(event) => setDetailNoteDraft(event.target.value)}
                      maxLength={1000}
                      rows={4}
                      className="block w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
                      placeholder="例: 回収前日にお電話で訪問時間をご連絡します。"
                    />
                    <div className="mt-2 flex items-center justify-between text-xs text-amber-800/80">
                      <span>注文照会画面と通知メールに表示されます。</span>
                      <span>{detailNoteDraft.length} / 1000</span>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={handleSaveCustomerNote}
                        disabled={detailSaving}
                        className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {detailSaving ? '保存中…' : '個別案内を保存'}
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
                    <h4 className="font-bold text-slate-800 mb-3 border-b border-slate-300 pb-2">内部メモ</h4>
                    <textarea
                      value={detailInternalNoteDraft}
                      onChange={(event) => setDetailInternalNoteDraft(event.target.value)}
                      maxLength={1000}
                      rows={4}
                      className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                      placeholder="例: 本人確認書類の案内を別途送付予定。"
                    />
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                      <span>この欄は管理画面のみで使用され、申込者には公開されません。</span>
                      <span>{detailInternalNoteDraft.length} / 1000</span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <h4 className="font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">ステータス更新履歴</h4>
                    {detailData.statusHistories.length === 0 ? (
                      <p className="text-sm text-slate-500">まだ履歴はありません。</p>
                    ) : (
                      <div className="space-y-3">
                        {detailData.statusHistories.map((history) => (
                          <div key={history.historyId} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                              <span>{history.changedBy}</span>
                              <span>{history.changedAt}</span>
                            </div>
                            <div className="grid gap-2 md:grid-cols-2">
                              <div>
                                <div className="mb-1 text-xs font-medium text-slate-500">変更前</div>
                                <div className="rounded border border-slate-200 bg-white p-2 text-sm text-slate-700">{history.previousStatus || '初回設定'}</div>
                              </div>
                              <div>
                                <div className="mb-1 text-xs font-medium text-slate-500">変更後</div>
                                <div className="rounded border border-slate-200 bg-white p-2 text-sm text-slate-700">{history.newStatus}</div>
                              </div>
                            </div>
                            <div className="mt-2">
                              <div className="mb-1 text-xs font-medium text-slate-500">変更理由</div>
                              <div className="rounded border border-slate-200 bg-white p-2 text-sm text-slate-700 whitespace-pre-wrap">{history.changeReason || '未入力'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <h4 className="font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">内部メモ更新履歴</h4>
                    {detailData.internalNoteHistories.length === 0 ? (
                      <p className="text-sm text-slate-500">まだ履歴はありません。</p>
                    ) : (
                      <div className="space-y-3">
                        {detailData.internalNoteHistories.map((history) => (
                          <div key={history.historyId} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                              <span>{history.changedBy}</span>
                              <span>{history.changedAt}</span>
                            </div>
                            <div className="grid gap-2 md:grid-cols-2">
                              <div>
                                <div className="mb-1 text-xs font-medium text-slate-500">変更前</div>
                                <div className="min-h-16 rounded border border-slate-200 bg-white p-2 text-sm text-slate-700 whitespace-pre-wrap">{history.previousNote || '未入力'}</div>
                              </div>
                              <div>
                                <div className="mb-1 text-xs font-medium text-slate-500">変更後</div>
                                <div className="min-h-16 rounded border border-slate-200 bg-white p-2 text-sm text-slate-700 whitespace-pre-wrap">{history.newNote || '未入力'}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-red-500">データの読み込みに失敗しました</div>
              )}
            </div>

            <div className="border-t px-6 py-4 bg-slate-50 flex justify-end">
              <button onClick={() => setIsModalOpen(false)} className="bg-slate-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-700 transition-colors">
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}