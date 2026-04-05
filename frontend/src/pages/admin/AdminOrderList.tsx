import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'

const PAGE_SIZE = 20

type OrderStatusCode =
  | 'RECEIVED'
  | 'KIT_SHIPPED'
  | 'COLLECTING'
  | 'ARRIVED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'CANCELLED'

interface OrderListRow {
  orderId: number
  userName: string
  userPhone: string
  collectionDate: string
  collectionTime: string
  orderStatus: OrderStatusCode
  totalAmount: number
  createdAt: string
}

interface OrderListPageData {
  content: OrderListRow[]
  totalPages: number
  totalElements: number
}

interface ApiEnvelope<T> {
  code: number
  message: string
  data: T | null
}

function statusBadgeClass(status: string): string {
  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset'
  switch (status) {
    case 'RECEIVED':
      return `${base} bg-sky-50 text-sky-800 ring-sky-600/20`
    case 'KIT_SHIPPED':
      return `${base} bg-slate-50 text-slate-700 ring-slate-600/20`
    case 'COLLECTING':
      return `${base} bg-amber-50 text-amber-900 ring-amber-600/30`
    case 'ARRIVED':
      return `${base} bg-violet-50 text-violet-800 ring-violet-600/20`
    case 'PROCESSING':
      return `${base} bg-orange-50 text-orange-900 ring-orange-600/25`
    case 'COMPLETED':
      return `${base} bg-emerald-50 text-emerald-800 ring-emerald-600/20`
    case 'CANCELLED':
      return `${base} bg-red-50 text-red-800 ring-red-600/20`
    default:
      return `${base} bg-gray-50 text-gray-700 ring-gray-500/20`
  }
}

function formatYen(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function AdminOrderList() {
  const [page, setPage] = useState(0)
  const [rows, setRows] = useState<OrderListRow[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (p: number) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await axios.get<ApiEnvelope<OrderListPageData>>('/api/admin/orders', {
        params: { page: p, size: PAGE_SIZE },
      })
      if (data.code !== 200 || !data.data) {
        setError(data.message || 'データの取得に失敗しました')
        setRows([])
        setTotalPages(0)
        setTotalElements(0)
        return
      }
      setRows(data.data.content)
      setTotalPages(data.data.totalPages)
      setTotalElements(data.data.totalElements)
    } catch {
      setError('サーバーに接続できませんでした')
      setRows([])
      setTotalPages(0)
      setTotalElements(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(page)
  }, [load, page])

  const canPrev = page > 0 && !loading
  const canNext = totalPages > 0 && page < totalPages - 1 && !loading

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">注文一覧</h1>
            <p className="text-sm text-slate-500">管理画面 · 回収申込</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {error && (
          <div
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-600">注文ID</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-600">氏名</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-600">電話</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-600">回収日</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-600">時間帯</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-600">ステータス</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-600 text-right">金額</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-600">申込日時</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                      読み込み中…
                    </td>
                  </tr>
                )}
                {!loading && rows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                      注文はまだありません
                    </td>
                  </tr>
                )}
                {!loading &&
                  rows.map((row) => (
                    <tr key={row.orderId} className="hover:bg-slate-50/60">
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-slate-800">{row.orderId}</td>
                      <td className="max-w-[10rem] truncate px-4 py-3 text-slate-800" title={row.userName}>
                        {row.userName}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-slate-700">{row.userPhone}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-700">{row.collectionDate}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-700">{row.collectionTime}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className={statusBadgeClass(row.orderStatus)}>{row.orderStatus}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-slate-800">
                        {formatYen(row.totalAmount)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{row.createdAt}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <footer className="flex flex-col items-stretch justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-4 py-3 sm:flex-row sm:items-center">
            <p className="text-xs text-slate-500">
              全 {totalElements} 件
              {totalPages > 0 && (
                <>
                  {' '}
                  · ページ {page + 1} / {totalPages}
                </>
              )}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!canPrev}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                前へ
              </button>
              <button
                type="button"
                disabled={!canNext}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                次へ
              </button>
            </div>
          </footer>
        </div>
      </main>
    </div>
  )
}
