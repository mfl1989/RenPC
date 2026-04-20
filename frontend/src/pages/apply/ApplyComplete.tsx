import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { formatOrderId } from '../../lib/orderId'

type CompletionItemCategory = 'standard' | 'conditional' | 'empty'

type CompleteLocationState = {
  orderId?: number
  itemCategoryKey?: CompletionItemCategory
} | null

export default function ApplyComplete() {
  const location = useLocation()
  const state = location.state as CompleteLocationState
  const orderId = state?.orderId
  const itemCategoryKey = state?.itemCategoryKey ?? 'standard'

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

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
            このたびはお申し込みいただきありがとうございます。内容を確認のうえ、必要に応じてメールまたはお電話でご連絡いたします。
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
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left text-sm leading-7 text-slate-700">
            <p className="font-semibold text-slate-900">今後のご案内</p>
            <ul className="mt-2 space-y-1">
              <li>1. 受付内容の確認後、必要なご案内を順次お送りします。</li>
              <li>2. 集荷条件や確認事項がある場合は、個別にご連絡することがあります。</li>
              <li>3. 申込状況は注文照会ページからもご確認いただけます。</li>
            </ul>
          </div>
          <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-left text-sm leading-7 text-sky-950">
            <p className="font-semibold">申込内容の変更について</p>
            <p className="mt-2">
              回収希望日、ご連絡先などの変更は、原則として回収日前日の15時まで承ります。受付完了メールへの返信、またはお問い合わせ窓口からお申し込み番号を添えてご連絡ください。
            </p>
          </div>
          {itemCategoryKey === 'conditional' ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-left text-sm leading-7 text-amber-950">
              <p className="font-semibold">今回の申込は条件確認が入る可能性があります</p>
              <p className="mt-2">
                モニターのみ、小型家電のみ、またはその組み合わせを含む内容は、通常申込と受付条件や料金が異なる場合があります。受付確認後に、必要に応じてメールまたはお電話でご案内します。
              </p>
            </div>
          ) : null}
          {itemCategoryKey === 'empty' ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left text-sm leading-7 text-slate-700">
              <p className="font-semibold text-slate-900">申込内容の確認が必要です</p>
              <p className="mt-2">
                回収品目が確認できない場合は、受付確認時にご連絡することがあります。メールをご確認のうえ、必要に応じて注文照会ページまたはお問い合わせ窓口をご利用ください。
              </p>
            </div>
          ) : null}
          <div className="mt-6">
            <Link
              to="/orders/lookup"
              className="inline-flex h-12 min-w-32 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-400 hover:bg-orange-50 hover:text-orange-700 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
            >
              申込状況を確認する
            </Link>
          </div>
          <div className="mt-3">
            <Link
              to="/contact"
              className="inline-flex h-11 min-w-32 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-400 hover:bg-orange-50 hover:text-orange-700 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
            >
              お問い合わせ窓口へ
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
