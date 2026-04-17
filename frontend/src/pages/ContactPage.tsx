import { useState } from 'react'
import { Link } from 'react-router-dom'
import { contactInquiryCategoryOptions, contactInquirySchema, type ContactInquiryValues } from '../schemas/contactInquirySchema.ts'
import { submitContactInquiry } from '../services/contactInquiry.ts'

const SUPPORT_FAQS = [
  {
    question: 'パソコン本体を複数台入れても無料ですか？',
    answer:
      '1 箱に収まる範囲でパソコン本体をまとめて送れる、という見せ方にしておくと利用者が判断しやすくなります。正式版では箱サイズ、重量上限、2 箱目以降の扱いを明記してください。',
  },
  {
    question: '梱包は段ボールでないといけませんか？',
    answer:
      '段ボールを基本案内にしつつ、配送中に中身が出ない梱包条件を明示するのが実運用向きです。詳しくは梱包方法ページへ誘導します。',
  },
  {
    question: '申込完了メールが届かない場合は？',
    answer:
      '迷惑メールフォルダ、ドメイン受信設定、入力メールアドレスの誤り確認を先に案内しておくと、問い合わせ前に自己解決しやすくなります。',
  },
] as const

export default function ContactPage() {
  const [values, setValues] = useState<ContactInquiryValues>({
    name: '',
    email: '',
    category: 'items',
    orderId: '',
    message: '',
    privacyConsent: false,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof ContactInquiryValues, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitted, setSubmitted] = useState<{ inquiryId: string; createdAt: string } | null>(null)

  const handleChange = <K extends keyof ContactInquiryValues>(key: K, value: ContactInquiryValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
    setSubmitError('')
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const parsed = contactInquirySchema.safeParse(values)

    if (!parsed.success) {
      const nextErrors: Partial<Record<keyof ContactInquiryValues, string>> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof ContactInquiryValues | undefined
        if (key && nextErrors[key] == null) {
          nextErrors[key] = issue.message
        }
      }
      setErrors(nextErrors)
      return
    }

    setSubmitting(true)
    setSubmitError('')

    try {
      const result = await submitContactInquiry(parsed.data)
      setSubmitted(result)
      setValues({
        name: '',
        email: '',
        category: 'items',
        orderId: '',
        message: '',
        privacyConsent: false,
      })
      setErrors({})
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '送信に失敗しました。時間をおいて再度お試しください。')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.08em] text-orange-600">お客様サポート</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-slate-900 md:text-3xl">
              ご相談窓口
            </h1>
          </div>
          <Link
            to="/"
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
          >
            トップへ戻る
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-sm leading-7 text-slate-600 md:text-base">
            お客様より寄せられやすい内容を先にまとめています。フォーム送信の前に、まずはこちらをご確認ください。
          </p>
          <div className="mt-6 grid gap-4">
            {SUPPORT_FAQS.map((item, index) => (
              <article
                key={item.question}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">
                    Q{index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-semibold leading-7 text-slate-900">
                      {item.question}
                    </h2>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/guide/packing"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
            >
              梱包方法を見る
            </Link>
            <Link
              to="/orders/lookup"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
            >
              申込状況を確認する
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <article className="rounded-[28px] border border-orange-200 bg-linear-to-br from-orange-50 via-white to-amber-50 p-6 shadow-sm md:p-8">
            <p className="text-xs font-semibold tracking-[0.08em] text-orange-700">送信前の確認</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-slate-900">
              申込番号があるとご案内がスムーズです
            </h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
              <li className="flex gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-orange-400" />
                <span>申込済みの場合は、お申込み番号を本文に添える前提で案内してください。</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-orange-400" />
                <span>回収予定日、対象品目、梱包方法、データ消去の相談内容を先に整理すると、問い合わせ対応が早くなります。</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-orange-400" />
                <span>土日祝日や営業時間外の問い合わせは、翌営業日対応の注意書きを出しておくと親切です。</span>
              </li>
            </ul>
          </article>

          <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <p className="text-xs font-semibold tracking-[0.08em] text-slate-500">相談フォーム</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-slate-900">
              必要事項を入力して送信してください
            </h2>
            {submitted ? (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <p className="text-sm font-semibold text-emerald-900">送信を受け付けました。</p>
                <p className="mt-2 text-sm leading-7 text-emerald-900/90">
                  受付番号：{submitted.inquiryId}
                  <br />
                  受付日時：{new Date(submitted.createdAt).toLocaleString('ja-JP')}
                </p>
                <p className="mt-3 text-sm leading-7 text-emerald-900/90">
                  内容を確認のうえ、担当者より順次ご案内します。通知メール設定が有効な環境では受付メールも送信されます。
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(null)}
                  className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl border border-emerald-300 bg-white px-5 py-3 text-sm font-semibold text-emerald-800 shadow-sm transition hover:-translate-y-px hover:bg-emerald-100"
                >
                  続けて送信する
                </button>
              </div>
            ) : (
              <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-800">お名前</span>
                    <input
                      value={values.name}
                      onChange={(event) => handleChange('name', event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white"
                      placeholder="例）山田 太郎"
                    />
                    {errors.name ? <span className="mt-2 block text-xs text-rose-600">{errors.name}</span> : null}
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold text-slate-800">メールアドレス</span>
                    <input
                      type="email"
                      value={values.email}
                      onChange={(event) => handleChange('email', event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white"
                      placeholder="例）demo@example.com"
                    />
                    {errors.email ? <span className="mt-2 block text-xs text-rose-600">{errors.email}</span> : null}
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-800">ご相談内容</span>
                    <select
                      value={values.category}
                      onChange={(event) => handleChange('category', event.target.value as ContactInquiryValues['category'])}
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white"
                    >
                      {contactInquiryCategoryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.category ? <span className="mt-2 block text-xs text-rose-600">{errors.category}</span> : null}
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold text-slate-800">お申込み番号</span>
                    <input
                      value={values.orderId}
                      onChange={(event) => handleChange('orderId', event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white"
                      inputMode="numeric"
                      placeholder="申込済みの方のみ"
                    />
                    {errors.orderId ? <span className="mt-2 block text-xs text-rose-600">{errors.orderId}</span> : null}
                  </label>
                </div>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-800">ご相談内容の詳細</span>
                  <textarea
                    value={values.message}
                    onChange={(event) => handleChange('message', event.target.value)}
                    rows={7}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white"
                    placeholder="回収対象、梱包方法、回収希望日、データ消去など、確認したい内容を入力してください。"
                  />
                  {errors.message ? <span className="mt-2 block text-xs text-rose-600">{errors.message}</span> : null}
                </label>

                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <input
                    type="checkbox"
                    checked={values.privacyConsent}
                    onChange={(event) => handleChange('privacyConsent', event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm leading-7 text-slate-700">
                    <Link to="/privacy" className="font-semibold text-slate-900 underline underline-offset-4 hover:text-orange-600">
                      個人情報保護方針
                    </Link>
                    に同意のうえ送信します。
                  </span>
                </label>
                {errors.privacyConsent ? <span className="block text-xs text-rose-600">{errors.privacyConsent}</span> : null}

                {submitError ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {submitError}
                  </div>
                ) : null}

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-orange-300 bg-white px-6 py-3 text-sm font-semibold text-orange-700 shadow-sm transition hover:-translate-y-px hover:border-orange-400 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? '送信中...' : 'この内容で送信する'}
                  </button>
                  <p className="text-xs leading-6 text-slate-500">
                    受付時間外のご相談は、翌営業日以降の確認を想定しています。
                  </p>
                </div>
              </form>
            )}
          </article>
        </section>
      </main>
    </div>
  )
}