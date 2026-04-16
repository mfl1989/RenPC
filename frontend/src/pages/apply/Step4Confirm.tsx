import type { ReactNode } from 'react'
import { useState } from 'react'
import type { FieldPath } from 'react-hook-form'
import { Controller, useFormContext } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { logValidatedRecycleOrderJa } from '../../lib/recycleOrderJapaneseLog.ts'
import { applyZodIssuesToForm } from '../../lib/zodToRhfErrors.ts'
import {
    RecycleOrderSchema,
    type DataErasureOption,
    type RecycleOrderFormValues,
    type TimeSlotOption,
} from '../../schemas/recycleOrderSchema.ts'
import { submitRecycleOrder } from '../../services/orderApi.ts'
import { StepProgress } from './StepProgress.tsx'

/** 確認画面用ラベル（値は Schema と同期） */
const DATA_ERASURE_LABEL: Record<DataErasureOption, string> = {
  self_erase_free: 'ご自身で事前に消去する',
  full_service_paid: 'おまかせ消去サービスを利用する',
}

const TIME_SLOT_LABEL: Record<TimeSlotOption, string> = {
  unspecified: '指定なし',
  morning: '午前中',
  t12_14: '12:00〜14:00',
  t14_16: '14:00〜16:00',
  t16_18: '16:00〜18:00',
  t18_21: '18:00〜21:00',
}

function ConfirmSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <h2 className="border-b border-slate-100 pb-2 text-sm font-bold text-slate-800 md:text-base">
        {title}
      </h2>
      <dl className="mt-3 space-y-0 divide-y divide-slate-100">{children}</dl>
    </section>
  )
}

function ConfirmRow({
  label,
  value,
  errorMessage,
  anchorId,
}: {
  label: string
  value: ReactNode
  errorMessage?: string
  /** 検証エラー時に scrollIntoView するための id（例: confirm-pcCount） */
  anchorId?: string
}) {
  return (
    <div className="py-3 first:pt-0" id={anchorId}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <dt className="shrink-0 text-sm font-medium text-slate-600">{label}</dt>
        <dd className="min-w-0 text-right text-sm font-semibold text-slate-900 sm:text-left">
          {value === '' || value === null || value === undefined ? (
            <span className="font-normal text-slate-400">—</span>
          ) : (
            value
          )}
        </dd>
      </div>
      {errorMessage ? (
        <p className="mt-1 text-sm font-medium text-red-600" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}

export default function Step4Confirm() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    handleSubmit,
    watch,
    setError,
    clearErrors,
    setFocus,
    control,
    formState: { errors },
  } = useFormContext<RecycleOrderFormValues>()

  const v = watch()

  const goBack = () => navigate('/apply/step3')

  /**
   * Zod で最終検証後、API 送信 → 完了画面へ遷移。
   * 成功時のみ検証済み JSON をコンソールに出力（開発用）。
   */
  const onSubmit = handleSubmit(async (data) => {
    clearErrors()
    setSubmitError(null)
    const parsed = RecycleOrderSchema.safeParse(data)
    if (!parsed.success) {
      applyZodIssuesToForm(parsed.error, setError)
      const firstPath = parsed.error.issues[0]?.path[0]
      if (typeof firstPath === 'string') {
        if (firstPath === 'termsAccepted') {
          setFocus('termsAccepted' as FieldPath<RecycleOrderFormValues>)
        } else {
          requestAnimationFrame(() => {
            document
              .getElementById(`confirm-${firstPath}`)
              ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          })
        }
      }
      return
    }

    setSubmitting(true)
    try {
      logValidatedRecycleOrderJa(parsed.data)
      const { orderId } = await submitRecycleOrder(parsed.data)
      navigate('/apply/complete', { replace: true, state: { orderId } })
    } catch (e) {
      const msg = e instanceof Error ? e.message : '送信に失敗しました'
      setSubmitError(msg)
    } finally {
      setSubmitting(false)
    }
  })

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf5_0%,#f8fafc_22%,#f8fafc_100%)] pb-20 pt-8 font-sans text-slate-800">
      <div className="mx-auto max-w-2xl px-4 md:px-6">
        <div className="mb-6 text-center">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
          >
            ← トップへ戻る
          </Link>
        </div>

        <StepProgress step={4} />

        <header className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            申込内容の確認
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            以下の内容をご確認のうえ、問題なければ申し込みを完了してください。
          </p>
        </header>

        {errors.root?.message ? (
          <p
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            role="alert"
          >
            {errors.root.message}
          </p>
        ) : null}

        {submitError ? (
          <p
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            role="alert"
          >
            {submitError}
          </p>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          <ConfirmSection title="回収品目（Step 1）">
            <ConfirmRow
              anchorId="confirm-pcCount"
              label="パソコン台数"
              value={`${v.pcCount} 台`}
              errorMessage={errors.pcCount?.message}
            />
            <ConfirmRow
              anchorId="confirm-monitorCount"
              label="モニター台数"
              value={`${v.monitorCount} 台`}
              errorMessage={errors.monitorCount?.message}
            />
            <ConfirmRow
              anchorId="confirm-smallApplianceBoxCount"
              label="小型家電の箱数"
              value={`${v.smallApplianceBoxCount} 箱`}
              errorMessage={errors.smallApplianceBoxCount?.message}
            />
            <ConfirmRow
              anchorId="confirm-dataErasureOption"
              label="データ消去方法"
              value={DATA_ERASURE_LABEL[v.dataErasureOption]}
              errorMessage={errors.dataErasureOption?.message}
            />
          </ConfirmSection>

          <ConfirmSection title="回収日時（Step 2）">
            <ConfirmRow
              anchorId="confirm-collectionDate"
              label="回収希望日"
              value={v.collectionDate}
              errorMessage={errors.collectionDate?.message}
            />
            <ConfirmRow
              anchorId="confirm-timeSlot"
              label="時間帯"
              value={TIME_SLOT_LABEL[v.timeSlot]}
              errorMessage={errors.timeSlot?.message}
            />
            <ConfirmRow
              anchorId="confirm-cardboardDeliveryRequested"
              label="段ボール事前送付"
              value={v.cardboardDeliveryRequested ? '希望する' : '希望しない'}
              errorMessage={errors.cardboardDeliveryRequested?.message}
            />
          </ConfirmSection>

          <ConfirmSection title="お客様情報（Step 3）">
            <ConfirmRow
              anchorId="confirm-customerNameKanji"
              label="氏名（漢字）"
              value={v.customerNameKanji}
              errorMessage={errors.customerNameKanji?.message}
            />
            <ConfirmRow
              anchorId="confirm-customerNameKana"
              label="氏名（フリガナ）"
              value={v.customerNameKana}
              errorMessage={errors.customerNameKana?.message}
            />
            <ConfirmRow
              anchorId="confirm-postalCode"
              label="郵便番号"
              value={
                v.postalCode
                  ? `${v.postalCode.slice(0, 3)}-${v.postalCode.slice(3)}`
                  : ''
              }
              errorMessage={errors.postalCode?.message}
            />
            <ConfirmRow
              anchorId="confirm-prefecture"
              label="都道府県"
              value={v.prefecture}
              errorMessage={errors.prefecture?.message}
            />
            <ConfirmRow
              anchorId="confirm-city"
              label="市区町村"
              value={v.city}
              errorMessage={errors.city?.message}
            />
            <ConfirmRow
              anchorId="confirm-addressLine1"
              label="番地・建物名"
              value={v.addressLine1}
              errorMessage={errors.addressLine1?.message}
            />
            <ConfirmRow
              anchorId="confirm-addressLine2"
              label="建物名・部屋番号（任意）"
              value={v.addressLine2 ?? ''}
              errorMessage={errors.addressLine2?.message}
            />
            <ConfirmRow
              anchorId="confirm-phone"
              label="電話番号"
              value={v.phone}
              errorMessage={errors.phone?.message}
            />
            <ConfirmRow
              anchorId="confirm-email"
              label="メールアドレス"
              value={v.email}
              errorMessage={errors.email?.message}
            />
          </ConfirmSection>

          <section
            id="confirm-termsAccepted"
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5"
          >
            <h2 className="border-b border-slate-100 pb-2 text-sm font-bold text-slate-800 md:text-base">
              利用規約
            </h2>
            <Controller
              name="termsAccepted"
              control={control}
              render={({ field: { value, onChange, onBlur, name, ref } }) => (
                <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm text-slate-800">
                  <input
                    type="checkbox"
                    ref={ref}
                    name={name}
                    onBlur={onBlur}
                    checked={Boolean(value)}
                    onChange={(e) => onChange(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span>
                    <span className="font-semibold">利用規約に同意する</span>
                    <span className="mt-1 block text-slate-600">
                      内容をご確認のうえチェックを入れてください。
                    </span>
                  </span>
                </label>
              )}
            />
            {errors.termsAccepted?.message ? (
              <p className="mt-2 text-sm font-medium text-red-600" role="alert">
                {errors.termsAccepted.message}
              </p>
            ) : null}
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between sm:gap-4">
            <button
              type="button"
              onClick={goBack}
              disabled={submitting}
              className="inline-flex h-12 min-w-32 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-400 hover:bg-orange-50 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              戻る
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-12 min-w-32 flex-1 items-center justify-center rounded-xl border-2 border-orange-300 bg-white px-6 text-base font-bold text-orange-700 shadow-sm transition hover:-translate-y-px hover:border-orange-400 hover:bg-orange-50 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-orange-200 disabled:bg-orange-50 disabled:text-orange-300"
            >
              {submitting ? '送信中…' : 'この内容で申し込む'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
