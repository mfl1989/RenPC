import type { ReactNode } from 'react'
import { useState } from 'react'
import type { FieldPath } from 'react-hook-form'
import { Controller, useFormContext } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { logValidatedRecycleOrderJa } from '../../lib/recycleOrderJapaneseLog.ts'
import { applyZodIssuesToForm } from '../../lib/zodToRhfErrors.ts'
import {
    calculateOrderPricing,
    RecycleOrderSchema,
    type DataErasureOption,
    type RecycleOrderFormValues,
    type TimeSlotOption,
} from '../../schemas/recycleOrderSchema.ts'
import { submitRecycleOrder } from '../../services/orderApi.ts'
import { ApplyStepShell } from './ApplyStepShell.tsx'

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

function SummaryCard({
  label,
  value,
  subtext,
}: {
  label: string
  value: ReactNode
  subtext?: string
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold tracking-[0.08em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-bold tracking-[-0.02em] text-slate-900">{value}</p>
      {subtext ? <p className="mt-1 text-xs leading-6 text-slate-500">{subtext}</p> : null}
    </article>
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
  const pricing = calculateOrderPricing({
    pcCount: v.pcCount,
    dataErasureOption: v.dataErasureOption,
    cardboardDeliveryRequested: v.cardboardDeliveryRequested,
  })
  const totalItems = v.pcCount + v.monitorCount + v.smallApplianceBoxCount
  const hasPcItems = v.pcCount > 0
  const hasMonitorItems = v.monitorCount > 0
  const hasSmallApplianceItems = v.smallApplianceBoxCount > 0
  const requiresConditionalConfirmation = !hasPcItems && (hasMonitorItems || hasSmallApplianceItems)
  const formattedPostalCode = v.postalCode ? `${v.postalCode.slice(0, 3)}-${v.postalCode.slice(3)}` : ''
  const formattedAddress = [v.prefecture, v.city, v.addressLine1, v.addressLine2]
    .filter((part) => part && part.trim().length > 0)
    .join(' ')
  const itemCategoryLabel = hasPcItems
    ? '無料対象の目安に近い申込です'
    : requiresConditionalConfirmation
      ? '条件確認が必要な可能性がある申込です'
      : '品目未選択です'
  const itemCategoryKey = hasPcItems
    ? 'standard'
    : requiresConditionalConfirmation
      ? 'conditional'
      : 'empty'
  const itemCategoryClass = hasPcItems
    ? 'border-emerald-200 bg-emerald-50/80 text-emerald-950'
    : requiresConditionalConfirmation
      ? 'border-amber-200 bg-amber-50/80 text-amber-950'
      : 'border-slate-200 bg-slate-50 text-slate-800'
  const itemCategoryLabelClass = hasPcItems
    ? 'text-emerald-700'
    : requiresConditionalConfirmation
      ? 'text-amber-700'
      : 'text-slate-500'
  const itemCategoryDescription = hasPcItems
    ? 'パソコン本体を含むため、通常の回収条件で案内しやすい内容です。'
    : requiresConditionalConfirmation
      ? 'モニターのみ、小型家電のみ、またはその組み合わせのため、受付条件や料金が通常申込と異なる場合があります。'
      : '回収品目がまだ選択されていないため、このままでは正式なお申し込みとして確定できません。'
  const itemCategoryDetail = hasMonitorItems && hasSmallApplianceItems
    ? 'モニターと小型家電を含むため、梱包条件や箱数の確認もあわせてご案内する想定です。'
    : hasMonitorItems
      ? 'モニターを含むため、液晶か CRT かによって案内条件が変わる場合があります。'
      : hasSmallApplianceItems
        ? '小型家電を含むため、内容や箱数に応じて条件確認が必要な場合があります。'
        : null

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
      navigate('/apply/complete', {
        replace: true,
        state: {
          orderId,
          itemCategoryKey,
        },
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : '送信に失敗しました'
      setSubmitError(msg)
    } finally {
      setSubmitting(false)
    }
  })

  return (
    <ApplyStepShell
      step={4}
      title="申込内容の確認"
      description="以下の内容をご確認のうえ、問題なければ申し込みを完了してください。"
      noticeTitle="最終確認事項"
      noticeItems={[
        '入力内容に誤りがないか、回収先住所と連絡先を再確認してください。',
        '正式な受付内容は、申込完了後のご案内または注文照会ページでご確認いただけます。',
        '送信後は二重申込を避けるため、完了画面が表示されるまでそのままお待ちください。',
      ]}
    >
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

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="回収点数"
            value={`${totalItems} 点`}
            subtext="パソコン・モニター・小型家電箱の合計"
          />
          <SummaryCard
            label="回収希望日時"
            value={
              <span className="text-base md:text-lg">
                {v.collectionDate || '未入力'}
                <span className="ml-2 text-sm font-semibold text-slate-600">{TIME_SLOT_LABEL[v.timeSlot]}</span>
              </span>
            }
            subtext="配送会社の事情により前後する場合があります"
          />
          <SummaryCard
            label="ご連絡先"
            value={v.customerNameKanji || '未入力'}
            subtext={v.email || 'メールアドレス未入力'}
          />
          <SummaryCard
            label="受付金額"
            value={`${pricing.subtotalYen.toLocaleString()} 円`}
            subtext="センター確認後、完了前に正式金額を確定します"
          />
        </section>

        <section className={`rounded-[28px] border p-5 shadow-sm sm:p-6 ${itemCategoryClass}`}>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className={`text-xs font-semibold tracking-[0.08em] ${itemCategoryLabelClass}`}>
                回収品目の見方
              </p>
              <h2 className="mt-2 text-lg font-bold tracking-[-0.02em] sm:text-xl">
                {itemCategoryLabel}
              </h2>
              <p className="mt-2 text-sm leading-7">{itemCategoryDescription}</p>
              {itemCategoryDetail ? (
                <p className="mt-2 text-sm leading-7">{itemCategoryDetail}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/guide/items"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/70 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
              >
                回収品目の詳細を見る
              </Link>
              <Link
                to="/guide/area-and-fees"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/70 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
              >
                料金条件を見る
              </Link>
            </div>
          </div>
        </section>

        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          <section className="rounded-[28px] border border-emerald-200 bg-emerald-50/80 p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.08em] text-emerald-800">料金のご確認</p>
                <h2 className="mt-2 text-lg font-bold tracking-[-0.02em] text-emerald-950 sm:text-xl">
                  申込内容に基づく参考料金
                </h2>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold tracking-[0.08em] text-emerald-700">小計（参考）</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-950">
                  {pricing.subtotalYen.toLocaleString()} 円
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-emerald-200 bg-white/80 p-4">
                <p className="text-xs font-semibold tracking-[0.08em] text-emerald-700">宅配枠・基本料金</p>
                <p className="mt-2 text-lg font-bold tabular-nums text-slate-900">
                  {pricing.baseLogisticsFee.isWaived ? '0 円' : `${pricing.baseLogisticsFee.amountYenTaxIn.toLocaleString()} 円`}
                </p>
                <p className="mt-1 text-xs leading-6 text-slate-500">
                  {pricing.baseLogisticsFee.isWaived ? 'パソコン本体を含むため免除の想定' : 'パソコン本体を含まない申込の基本料金'}
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-white/80 p-4">
                <p className="text-xs font-semibold tracking-[0.08em] text-emerald-700">データ消去</p>
                <p className="mt-2 text-lg font-bold tabular-nums text-slate-900">
                  {pricing.dataErasureFee > 0 ? `${pricing.dataErasureFee.toLocaleString()} 円` : '0 円'}
                </p>
                <p className="mt-1 text-xs leading-6 text-slate-500">
                  {DATA_ERASURE_LABEL[v.dataErasureOption]}
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-white/80 p-4">
                <p className="text-xs font-semibold tracking-[0.08em] text-emerald-700">段ボール事前送付</p>
                <p className="mt-2 text-lg font-bold tabular-nums text-slate-900">
                  {pricing.cardboardDeliveryFee > 0 ? `${pricing.cardboardDeliveryFee.toLocaleString()} 円` : '0 円'}
                </p>
                <p className="mt-1 text-xs leading-6 text-slate-500">
                  {v.cardboardDeliveryRequested ? '希望あり（手数料込み）' : '希望なし'}
                </p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-6 text-emerald-900/80">
              正式な料金は受付内容、対象品目、条件確認の結果により変動する場合があります。モニターのみ等のケースは別条件となる場合があります。
            </p>
          </section>

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
              value={formattedPostalCode}
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
              label="住所"
              value={formattedAddress}
              errorMessage={errors.addressLine1?.message}
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
              申込前のご確認
            </h2>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
              <p className="font-semibold text-slate-900">以下の文書をご確認のうえ、お申し込みください。</p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Link
                  to="/terms"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                >
                  利用規約を見る
                </Link>
                <Link
                  to="/privacy"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                >
                  個人情報保護方針を見る
                </Link>
              </div>
              <p className="mt-3 text-xs leading-6 text-slate-500">
                回収条件、キャンセル条件、データ管理上の注意事項および個人情報の取扱いをご確認ください。
              </p>
            </div>
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
                    <span className="font-semibold">利用規約に同意し、申込内容を確定する</span>
                    <span className="mt-1 block text-slate-600">
                      内容をご確認のうえ、同意いただける場合のみチェックを入れてください。
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
    </ApplyStepShell>
  )
}
