import { Link, useLocation } from 'react-router-dom'

import { formatOrderId } from '../../lib/orderId'

type CompleteLocationState = { orderId?: number } | null

export default function ApplyComplete() {
  const location = useLocation()
  const state = location.state as CompleteLocationState
  const orderId = state?.orderId

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf5_0%,#f8fafc_22%,#f8fafc_100%)] pb-20 pt-8 font-sans text-slate-800">
      <div className="mx-auto max-w-lg px-4 text-center md:px-6">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
          >
            ← トップへ戻る
          </Link>
        </div>
        <div className="rounded-[28px] border border-emerald-200 bg-white p-7 shadow-sm sm:p-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-xl text-emerald-700">
            ✓
          </div>
          <p className="text-xs font-semibold tracking-[0.08em] text-emerald-700">申込完了</p>
          <h1 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-slate-900 sm:text-xl">
            お申し込みを受け付けました
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            ご入力ありがとうございます。内容を確認のうえ、メールまたはお電話で折り返しご連絡いたします。
          </p>
          {orderId != null ? (
            <p className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
              お申し込み番号（注文ID）:{' '}
              <span className="font-mono font-semibold text-slate-900">{formatOrderId(orderId)}</span>
            </p>
          ) : null}
          <p className="mt-4 text-xs leading-6 text-slate-500">
            お問い合わせの際は、お申し込み番号とメールアドレスをお手元にご用意ください。
          </p>
          <div className="mt-6">
            <Link
              to="/orders/lookup"
              className="inline-flex h-12 min-w-32 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-400 hover:bg-orange-50 hover:text-orange-700 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
            >
              申込状況を確認する
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
