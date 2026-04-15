import axios from '../../lib/axios'
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

const PAGE_SIZE = 20

type OrderStatusCode = 'RECEIVED' | 'KIT_SHIPPED' | 'COLLECTING' | 'ARRIVED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED'

interface OrderListRow {
  orderId: number; userName: string; userPhone: string; collectionDate: string; collectionTime: string;
  orderStatus: OrderStatusCode; totalAmount: number; createdAt: string; version: number;
}

// —— 【新增】订单详情的数据类型 ——
interface OrderDetailData {
  orderId: number; orderStatus: string; collectionDate: string; collectionTimeSlot: string; totalAmount: number; createdAt: string;
  pcCount: number; monitorCount: number; smallApplianceBoxCount: number; dataErasureOption: string; cardboardDeliveryRequested: boolean;
  customerNameKanji: string; customerNameKana: string; postalCode: string; prefecture: string; city: string; addressLine1: string; addressLine2: string; phone: string; email: string;
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

export default function AdminOrderList() {
  const { logout } = useAuth()
  const [page, setPage] = useState(0)
  const [rows, setRows] = useState<OrderListRow[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [keyword, setKeyword] = useState("")

  // —— 【新增】弹窗相关状态 ——
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [detailData, setDetailData] = useState<OrderDetailData | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const load = useCallback(async (p: number, searchKeyword: string = "") => {
    setLoading(true); setError(null)
    try {
      const { data } = await axios.get<ApiEnvelope<OrderListPageData>>('/api/admin/orders', { params: { page: p, size: PAGE_SIZE, keyword: searchKeyword } })
      if (data.code !== 200 || !data.data) { setError('データの取得に失敗しました'); return }
      setRows(data.data.content); setTotalPages(data.data.totalPages); setTotalElements(data.data.totalElements)
    } catch { setError('サーバーに接続できませんでした') } finally { setLoading(false) }
  }, [])

  useEffect(() => { void load(page, keyword) }, [load, page])

  const handleSearch = () => { setPage(0); void load(0, keyword); }

  const handleExportCsv = async () => {
    try {
      const response = await axios.get('/api/admin/orders/export', { params: { keyword }, responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a'); link.href = url; link.setAttribute('download', `orders_export.csv`);
      document.body.appendChild(link); link.click(); link.remove();
    } catch { alert('CSVの出力に失敗しました') }
  }

  // —— 【新增】打开弹窗并请求详情数据 ——
  const handleOpenDetail = async (orderId: number) => {
    setIsModalOpen(true)
    setDetailLoading(true)
    setDetailData(null)
    try {
      const { data } = await axios.get<ApiEnvelope<OrderDetailData>>(`/api/admin/orders/${orderId}`)
      if (data.code === 200 && data.data) {
        setDetailData(data.data)
      } else {
        alert("詳細情報の取得に失敗しました。")
      }
    } catch {
      alert("通信エラーが発生しました。")
    } finally {
      setDetailLoading(false)
    }
  }

  const handleStatusChange = async (orderId: number, currentVersion: number, newStatus: string) => {
    if (!window.confirm('ステータスを更新しますか？')) return
    try {
      await axios.put(`/api/admin/orders/${orderId}/status`, { status: newStatus, version: currentVersion })
      void load(page, keyword)
    } catch { alert('ステータスの更新に失败しました'); void load(page, keyword) }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div><h1 className="text-lg font-semibold tracking-tight text-slate-900">注文一覧</h1><p className="text-sm text-slate-500">管理画面 · 回収申込</p></div>
          <button onClick={() => { if (window.confirm('ログアウトしますか？')) logout() }} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">ログアウト</button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}

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
                  <th className="px-4 py-3 font-medium text-slate-600 text-right">金额</th>
                  <th className="px-4 py-3 font-medium text-slate-600 text-center">操作</th> {/* 👈 新增操作列 */}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">読み込み中…</td></tr> : rows.map((row) => (
                  <tr key={row.orderId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-800">#{row.orderId}</td>
                    <td className="px-4 py-3 text-slate-800 font-medium">{row.userName}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{row.userPhone}</td>
                    <td className="px-4 py-3 text-center">
                      <select value={row.orderStatus} onChange={(e) => handleStatusChange(row.orderId, row.version, e.target.value)} disabled={row.orderStatus === 'COMPLETED' || row.orderStatus === 'CANCELLED'} className={`${statusBadgeClass(row.orderStatus)} cursor-pointer border-none py-1 focus:ring-2`}>
                        {STATUS_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-800 font-medium">{formatYen(row.totalAmount)}</td>
                    <td className="px-4 py-3 text-center">
                      {/* —— 【新增】详细按钮 —— */}
                      <button onClick={() => handleOpenDetail(row.orderId)} className="text-sky-600 hover:text-sky-800 font-medium px-2 py-1 bg-sky-50 rounded transition-colors">
                        詳細
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

      {/* —— 【新增】详情信息弹窗 (Modal) —— */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* 弹窗头部 */}
            <div className="flex justify-between items-center border-b px-6 py-4 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">
                {detailData ? `注文詳細 #${detailData.orderId}` : '読み込み中...'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>
            
            {/* 弹窗内容 (滚动区) */}
            <div className="p-6 overflow-y-auto flex-1 text-sm">
              {detailLoading ? (
                <div className="text-center py-10 text-slate-500">データを取得しています...</div>
              ) : detailData ? (
                <div className="space-y-6">
                  {/* 客户与地址区块 */}
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
                    </div>
                  </div>

                  {/* 回收品目区块 */}
                  <div className="bg-sky-50 p-4 rounded-lg border border-sky-100">
                    <h4 className="font-bold text-sky-800 mb-3 border-b border-sky-200 pb-2">回収品目・オプション</h4>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                      <div><span className="text-sky-700 text-xs block">パソコン台数</span><span className="font-bold text-lg">{detailData.pcCount} 台</span></div>
                      <div><span className="text-sky-700 text-xs block">モニター台数</span><span className="font-bold text-lg">{detailData.monitorCount} 台</span></div>
                      <div><span className="text-sky-700 text-xs block">小型家電ダンボール</span><span className="font-bold text-lg">{detailData.smallApplianceBoxCount} 箱</span></div>
                      <div><span className="text-sky-700 text-xs block">データ消去</span><span className="font-medium">{detailData.dataErasureOption}</span></div>
                      <div><span className="text-sky-700 text-xs block">段ボール事前配送</span><span className="font-medium">{detailData.cardboardDeliveryRequested ? '希望する' : '希望しない'}</span></div>
                      <div><span className="text-sky-700 text-xs block">合計金額</span><span className="font-bold text-xl text-red-600">{formatYen(detailData.totalAmount)}</span></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-red-500">データの読み込みに失敗しました</div>
              )}
            </div>

            {/* 弹窗底部 */}
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