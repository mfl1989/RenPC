import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { StepProgress } from './StepProgress.tsx'

type ApplyStepShellProps = {
  step: 1 | 2 | 3 | 4
  title: string
  description: string
  noticeTitle?: string
  noticeItems?: string[]
  children: ReactNode
}

export function ApplyStepShell({
  step,
  title,
  description,
  noticeTitle,
  noticeItems,
  children,
}: ApplyStepShellProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf5_0%,#f8fafc_22%,#f8fafc_100%)] pb-16 pt-8 font-sans text-slate-800">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-6 flex justify-center lg:justify-start">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
          >
            ← トップへ戻る
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <main className="min-w-0">
            <StepProgress step={step} />

            <header className="mb-8 rounded-4xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur sm:p-8">
              <p className="text-xs font-semibold tracking-[0.08em] text-orange-600">Recycle PC Apply Flow</p>
              <h1 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-900 md:text-3xl">
                {title}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                {description}
              </p>
            </header>

            {children}
          </main>

          <aside className="space-y-4 lg:sticky lg:top-6">
            {noticeTitle && noticeItems?.length ? (
              <section className="rounded-[28px] border border-orange-200 bg-orange-50/85 p-5 shadow-sm">
                <h2 className="text-sm font-bold tracking-[0.02em] text-orange-900 md:text-base">
                  {noticeTitle}
                </h2>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-orange-900">
                  {noticeItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold tracking-[0.08em] text-slate-500">ご案内</p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
                <p>入力途中でも、各ステップで内容を確認しながら進められます。</p>
                <p>回収条件、個人情報の取扱い、キャンセル条件は申込前にご確認ください。</p>
              </div>
              <div className="mt-4 space-y-2">
                <Link
                  to="/terms"
                  className="flex min-h-11 items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                >
                  <span>利用規約</span>
                  <span aria-hidden>→</span>
                </Link>
                <Link
                  to="/privacy"
                  className="flex min-h-11 items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                >
                  <span>個人情報保護方針</span>
                  <span aria-hidden>→</span>
                </Link>
                <Link
                  to="/contact"
                  className="flex min-h-11 items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                >
                  <span>お問い合わせ窓口</span>
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}