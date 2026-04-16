import { Link } from 'react-router-dom'

type ContentSection = {
  title: string
  body: string[]
}

type SimpleContentPageProps = {
  eyebrow: string
  title: string
  lead: string
  sections: ContentSection[]
}

export default function SimpleContentPage({
  eyebrow,
  title,
  lead,
  sections,
}: SimpleContentPageProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf5_0%,#f8fafc_22%,#f8fafc_100%)] py-8 text-slate-900 sm:py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
          >
            ← トップへ戻る
          </Link>
        </div>

        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <header className="border-b border-slate-200 pb-6">
            <p className="text-xs font-semibold tracking-[0.08em] text-orange-600">{eyebrow}</p>
            <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.02em] text-slate-950 sm:text-[34px]">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{lead}</p>
          </header>

          <div className="mt-6 space-y-4">
            {sections.map((section) => (
              <section key={section.title} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                <h2 className="text-lg font-semibold tracking-[-0.02em] text-slate-900">
                  {section.title}
                </h2>
                <div className="mt-3 space-y-3 text-sm leading-7 text-slate-700">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>
      </div>
    </div>
  )
}