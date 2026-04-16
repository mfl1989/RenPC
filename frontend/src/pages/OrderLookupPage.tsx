import { useState } from 'react'
import { Link } from 'react-router-dom'

import { formatOrderId } from '../lib/orderId.ts'
import { lookupRecycleOrder, type OrderLookupResult } from '../services/orderApi.ts'

export default function OrderLookupPage() {
  const [orderId, setOrderId] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<OrderLookupResult | null>(null)

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
                  <span className="inline-flex w-fit rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-200">
                    {result.orderStatus}
                  </span>
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
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}