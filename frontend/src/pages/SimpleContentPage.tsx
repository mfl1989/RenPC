import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export type ContentSection = {
  id?: string
  title: string
  body?: string[]
  bullets?: string[]
  orderedItems?: string[]
  visuals?: Array<{
    title: string
    caption: string
    aspect?: 'landscape' | 'square' | 'wide'
  }>
  cards?: Array<{
    title: string
    body: string
    tone?: 'neutral' | 'success' | 'warning' | 'danger'
  }>
  note?: string
}

type RelatedLink = {
  label: string
  to: string
}

type SimpleContentPageProps = {
  eyebrow: string
  title: string
  lead: string
  effectiveDate?: string
  lastUpdated?: string
  contactName?: string
  contactDetails?: string[]
  relatedLinks?: RelatedLink[]
  sections: ContentSection[]
}

export default function SimpleContentPage({
  eyebrow,
  title,
  lead,
  effectiveDate,
  lastUpdated,
  contactName,
  contactDetails,
  relatedLinks,
  sections,
}: SimpleContentPageProps) {
  useEffect(() => {
    document.title = `${title} | Recycle PC`
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [title])

  const normalizedSections = sections.map((section, index) => ({
    ...section,
    id: section.id ?? `section-${index + 1}`,
  }))

  const cardToneClass = {
    neutral: 'border-slate-200 bg-white text-slate-900',
    success: 'border-emerald-200 bg-emerald-50/70 text-emerald-950',
    warning: 'border-amber-200 bg-amber-50/80 text-amber-950',
    danger: 'border-red-200 bg-red-50/80 text-red-950',
  } as const

  const visualAspectClass = {
    landscape: 'aspect-[4/3]',
    square: 'aspect-square',
    wide: 'aspect-[16/9]',
  } as const

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf5_0%,#f8fafc_22%,#f8fafc_100%)] py-8 text-slate-900 sm:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
          >
            ← トップへ戻る
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
          <aside className="space-y-4 lg:sticky lg:top-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold tracking-[0.08em] text-orange-600">文書情報</p>
              <dl className="mt-4 space-y-3 text-sm text-slate-700">
                {effectiveDate ? (
                  <div>
                    <dt className="font-medium text-slate-500">施行日</dt>
                    <dd className="mt-1 font-semibold text-slate-900">{effectiveDate}</dd>
                  </div>
                ) : null}
                {lastUpdated ? (
                  <div>
                    <dt className="font-medium text-slate-500">最終更新日</dt>
                    <dd className="mt-1 font-semibold text-slate-900">{lastUpdated}</dd>
                  </div>
                ) : null}
                {contactName ? (
                  <div>
                    <dt className="font-medium text-slate-500">お問い合わせ窓口</dt>
                    <dd className="mt-1 font-semibold text-slate-900">{contactName}</dd>
                  </div>
                ) : null}
              </dl>
              {contactDetails?.length ? (
                <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  {contactDetails.map((detail) => (
                    <p key={detail}>{detail}</p>
                  ))}
                </div>
              ) : null}
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold tracking-[0.08em] text-orange-600">目次</p>
              <nav className="mt-4 space-y-2" aria-label="ページ内目次">
                {normalizedSections.map((section, index) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-orange-50 hover:text-orange-700"
                  >
                    {`${index + 1}. ${section.title}`}
                  </a>
                ))}
              </nav>
            </section>

            {relatedLinks?.length ? (
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold tracking-[0.08em] text-orange-600">関連ページ</p>
                <div className="mt-4 space-y-2">
                  {relatedLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="flex min-h-11 items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                    >
                      <span>{link.label}</span>
                      <span aria-hidden>→</span>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </aside>

          <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <header className="border-b border-slate-200 pb-6">
              <p className="text-xs font-semibold tracking-[0.08em] text-orange-600">{eyebrow}</p>
              <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.02em] text-slate-950 sm:text-[36px]">
                {title}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{lead}</p>
            </header>

            <div className="mt-6 space-y-4">
              {normalizedSections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-8 rounded-2xl border border-slate-200 bg-slate-50/70 p-5"
                >
                  <h2 className="text-lg font-semibold tracking-[-0.02em] text-slate-900">
                    {section.title}
                  </h2>
                  {section.body?.length ? (
                    <div className="mt-3 space-y-3 text-sm leading-7 text-slate-700">
                      {section.body.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  ) : null}
                  {section.bullets?.length ? (
                    <ul className="mt-3 space-y-2 pl-5 text-sm leading-7 text-slate-700 list-disc marker:text-orange-500">
                      {section.bullets.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                  {section.orderedItems?.length ? (
                    <ol className="mt-3 space-y-2 pl-5 text-sm leading-7 text-slate-700 list-decimal marker:font-semibold marker:text-slate-500">
                      {section.orderedItems.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ol>
                  ) : null}
                  {section.visuals?.length ? (
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {section.visuals.map((visual) => (
                        <figure
                          key={`${section.id}-${visual.title}`}
                          className="rounded-2xl border border-dashed border-slate-300 bg-white p-4"
                        >
                          <div
                            className={`flex w-full items-center justify-center rounded-xl border border-slate-200 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_55%,#f8fafc_100%)] ${visualAspectClass[visual.aspect ?? 'landscape']}`}
                          >
                            <div className="text-center">
                              <p className="text-xs font-semibold tracking-[0.08em] text-orange-600">
                                IMAGE PLACEHOLDER
                              </p>
                              <p className="mt-2 text-sm font-semibold text-slate-900">{visual.title}</p>
                              <p className="mt-2 px-6 text-xs leading-6 text-slate-500">
                                差し替え予定のダミー画像枠です
                              </p>
                            </div>
                          </div>
                          <figcaption className="mt-3 text-sm leading-6 text-slate-600">
                            {visual.caption}
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  ) : null}
                  {section.cards?.length ? (
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {section.cards.map((card) => (
                        <article
                          key={`${section.id}-${card.title}`}
                          className={`rounded-2xl border p-4 ${cardToneClass[card.tone ?? 'neutral']}`}
                        >
                          <h3 className="text-sm font-semibold tracking-[-0.01em]">{card.title}</h3>
                          <p className="mt-2 text-sm leading-7">{card.body}</p>
                        </article>
                      ))}
                    </div>
                  ) : null}
                  {section.note ? (
                    <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm leading-6 text-orange-900">
                      {section.note}
                    </div>
                  ) : null}
                </section>
              ))}
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}