import { Link, useLocation } from 'react-router-dom'

type CompleteLocationState = { orderId?: number } | null

export default function ApplyComplete() {
  const location = useLocation()
  const state = location.state as CompleteLocationState
  const orderId = state?.orderId

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-8 font-sans text-slate-800">
      <div className="mx-auto max-w-lg px-4 text-center md:px-6">
        <div className="mb-6">
          <Link to="/" className="text-sm font-medium text-orange-600 hover:underline">
            ← トップへ戻る
          </Link>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-white p-8 shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">
            ✓
          </div>
          <h1 className="text-xl font-bold text-slate-900 md:text-2xl">お申し込みを受け付けました</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            ご入力ありがとうございます。内容を確認のうえ、折り返しご連絡いたします。
          </p>
          {orderId != null ? (
            <p className="mt-6 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
              お申し込み番号（注文ID）:{' '}
              <span className="font-mono font-semibold text-slate-900">{orderId}</span>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
