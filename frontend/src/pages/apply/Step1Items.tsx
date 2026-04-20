import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { applyZodIssuesToForm } from '../../lib/zodToRhfErrors.ts'
import {
  calculateOrderPricing,
  type DataErasureOption,
  type RecycleOrderFormValues,
  recycleOrderStep1Schema,
} from '../../schemas/recycleOrderSchema.ts'
import { ApplyStepShell } from './ApplyStepShell.tsx'

function CountStepper({
  id,
  label,
  description,
  value,
  onChange,
  error,
}: {
  id: string
  label: string
  description?: string
  value: number
  onChange: (n: number) => void
  error?: string
}) {
  const dec = () => onChange(Math.max(0, value - 1))
  const inc = () => onChange(Math.min(99, value + 1))

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div className="min-w-0">
          <label
            htmlFor={id}
            className="text-base font-bold leading-6 text-slate-900 md:text-lg"
          >
            {label}
          </label>
          {description ? (
            <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
          ) : null}
        </div>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 md:min-w-49 md:justify-center">
          <button
            type="button"
            onClick={dec}
            className="flex h-11 w-11 items-center justify-center rounded-lg border-2 border-slate-300 bg-white text-xl font-bold text-slate-700 transition hover:border-orange-400 hover:bg-orange-50 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
            aria-label={`${label}を減らす`}
          >
            −
          </button>
          <span
            id={id}
            className="min-w-14 text-center text-2xl font-bold tabular-nums text-slate-900"
          >
            {value}
          </span>
          <button
            type="button"
            onClick={inc}
            className="flex h-11 w-11 items-center justify-center rounded-lg border-2 border-slate-300 bg-white text-xl font-bold text-slate-700 transition hover:border-orange-400 hover:bg-orange-50 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
            aria-label={`${label}を増やす`}
          >
            ＋
          </button>
        </div>
      </div>
      {error ? (
        <p className="mt-2 text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default function Step1Items() {
  const navigate = useNavigate()
  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext<RecycleOrderFormValues>()

  const pcCount = useWatch({ control, name: 'pcCount' })
  const monitorCount = useWatch({ control, name: 'monitorCount' })
  const smallApplianceBoxCount = useWatch({ control, name: 'smallApplianceBoxCount' })
  const dataErasure = useWatch({ control, name: 'dataErasureOption' })
  const cardboardDeliveryRequested = useWatch({ control, name: 'cardboardDeliveryRequested' })

  const pricing = calculateOrderPricing({
    pcCount,
    dataErasureOption: dataErasure,
    cardboardDeliveryRequested,
  })
  const hasAnySelectedItem = pcCount + monitorCount + smallApplianceBoxCount > 0
  const hasPcItems = pcCount > 0
  const requiresSpecialConfirmation = pcCount === 0 && (monitorCount > 0 || smallApplianceBoxCount > 0)
  const hasMonitorItems = monitorCount > 0
  const hasSmallApplianceItems = smallApplianceBoxCount > 0

  const onSubmit = handleSubmit((values) => {
    clearErrors()
    const parsed = recycleOrderStep1Schema.safeParse({
      pcCount: values.pcCount,
      monitorCount: values.monitorCount,
      smallApplianceBoxCount: values.smallApplianceBoxCount,
      dataErasureOption: values.dataErasureOption,
    })
    if (!parsed.success) {
      applyZodIssuesToForm(parsed.error, setError)
      return
    }
    navigate('/apply/step2')
  })

  return (
    <ApplyStepShell
      step={1}
      title="回収品目の入力"
      description="回収を希望する品目数と、データ消去の対応方法を選択してください。"
      noticeTitle="ご入力前の確認事項"
      noticeItems={[
        'パソコン本体を含む申込を基本としてご案内しています。',
        'モニターのみ、小型家電のみ、複数箱になる申込は条件確認が必要な場合があります。',
        '危険物、電池のみの送付、著しい破損がある機器は受付対象外となる場合があります。',
      ]}
    >
        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold tracking-[-0.02em] text-slate-900 sm:text-xl">
                回収品目
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                各項目の数量をご入力ください。数量の増減は右側のボタンから操作できます。
              </p>
            </div>

            <div className="space-y-4">
              <Controller
                name="pcCount"
                control={control}
                render={({ field }) => (
                  <CountStepper
                    id="pc-count"
                    label="パソコン台数"
                    description="デスクトップ・ノートパソコンの合計台数"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.pcCount?.message}
                  />
                )}
              />

              <Controller
                name="monitorCount"
                control={control}
                render={({ field }) => (
                  <CountStepper
                    id="monitor-count"
                    label="モニター台数"
                    description="液晶ディスプレイや外付けモニターの台数"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.monitorCount?.message}
                  />
                )}
              />

              <Controller
                name="smallApplianceBoxCount"
                control={control}
                render={({ field }) => (
                  <CountStepper
                    id="small-appliance-boxes"
                    label="小型家電の箱数"
                    description="パソコン以外の小型家電を入れる段ボール箱の数"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.smallApplianceBoxCount?.message}
                  />
                )}
              />
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <article className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm leading-7 text-emerald-950">
                <p className="text-xs font-semibold tracking-[0.08em] text-emerald-700">無料対象の目安</p>
                <p className="mt-2 font-semibold">パソコン本体を含む申込</p>
                <p className="mt-2">ノート、デスクトップ、一体型パソコンは基本対象です。周辺機器も同梱しやすい構成です。</p>
              </article>
              <article className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm leading-7 text-amber-950">
                <p className="text-xs font-semibold tracking-[0.08em] text-amber-700">条件確認が必要</p>
                <p className="mt-2 font-semibold">モニターのみ・小型家電のみ</p>
                <p className="mt-2">通常申込と料金や受付条件が異なる場合があります。確認画面と受付後の案内をご確認ください。</p>
              </article>
              <article className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm leading-7 text-red-950">
                <p className="text-xs font-semibold tracking-[0.08em] text-red-700">受付対象外の例</p>
                <p className="mt-2 font-semibold">危険物・電池のみの送付</p>
                <p className="mt-2">液漏れ、膨張、著しい破損がある機器は配送規定上お受けできない場合があります。</p>
              </article>
            </div>

            {hasAnySelectedItem ? (
              <div className="mt-5 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm leading-7 text-sky-950">
                <p className="text-xs font-semibold tracking-[0.08em] text-sky-700">現在の申込内容の見方</p>
                <p className="mt-2 font-semibold">
                  {hasPcItems
                    ? 'パソコン本体を含む申込として進めています。'
                    : 'パソコン本体を含まない申込として確認が必要な可能性があります。'}
                </p>
                <p className="mt-2">
                  {hasPcItems
                    ? 'パソコン本体が含まれているため、通常の回収条件で案内しやすい内容です。'
                    : 'モニターのみ、小型家電のみ等の内容は、基本料金や受付条件が通常申込と異なる場合があります。'}
                </p>
                {hasMonitorItems || hasSmallApplianceItems ? (
                  <p className="mt-2">
                    {hasMonitorItems && hasSmallApplianceItems
                      ? 'モニターと小型家電を含むため、梱包条件と箱数の確認もあわせて行う想定です。'
                      : hasMonitorItems
                        ? 'モニターを含むため、液晶か CRT かによって案内条件が変わる場合があります。'
                        : '小型家電を含むため、箱数や内容に応じて条件確認が必要な場合があります。'}
                  </p>
                ) : null}
              </div>
            ) : null}

            {requiresSpecialConfirmation ? (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-7 text-amber-950">
                <p className="text-xs font-semibold tracking-[0.08em] text-amber-700">条件付き受付の可能性があります</p>
                <p className="mt-2 font-semibold">
                  現在の入力内容は、パソコン本体を含まない申込として扱われる可能性があります。
                </p>
                <p className="mt-2">
                  モニターのみ、小型家電のみ等の回収は、基本料金や受付条件が通常申込と異なる場合があります。正式条件は確認画面と受付後のご案内をご確認ください。
                </p>
                <div className="mt-3">
                  <Link
                    to="/guide/items"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-800 shadow-sm transition hover:-translate-y-px hover:bg-amber-100"
                  >
                    回収品目の条件を見る
                  </Link>
                </div>
              </div>
            ) : null}

            {hasMonitorItems ? (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-700">
                <p className="font-semibold text-slate-900">モニターを含むお申し込みについて</p>
                <p className="mt-2">
                  液晶モニターは通常の対象品として案内できる構成ですが、CRT モニターなど特殊処理が必要な品目は追加料金または別案内となる場合があります。
                </p>
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/guide/items"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
              >
                回収品目の詳細を見る
              </Link>
              <Link
                to="/guide/area-and-fees"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
              >
                料金条件を見る
              </Link>
            </div>
          </section>

          <fieldset className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <legend className="px-1 text-lg font-bold text-slate-900">
              データ消去方法
            </legend>
            <p className="mb-4 text-sm leading-6 text-slate-600">
              発送前にお客様ご自身で対応するか、当社のおまかせ消去サービスを利用するかを選択してください。
            </p>
            <Controller
              name="dataErasureOption"
              control={control}
              render={({ field }) => (
                <div className="space-y-3">
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition has-checked:border-orange-400 has-checked:bg-orange-50 has-checked:shadow-sm">
                    <input
                      type="radio"
                      className="mt-1 h-4 w-4 border-slate-300 text-orange-500 focus:ring-orange-500"
                      checked={field.value === 'self_erase_free'}
                      onChange={() => field.onChange('self_erase_free' satisfies DataErasureOption)}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-slate-900">
                          ご自身で事前に消去する
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          追加料金なし
                        </span>
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-slate-600">
                        発送前に、お客様ご自身で消去作業を実施していただきます。
                      </span>
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition has-checked:border-orange-400 has-checked:bg-orange-50 has-checked:shadow-sm">
                    <input
                      type="radio"
                      className="mt-1 h-4 w-4 border-slate-300 text-orange-500 focus:ring-orange-500"
                      checked={field.value === 'full_service_paid'}
                      onChange={() =>
                        field.onChange('full_service_paid' satisfies DataErasureOption)
                      }
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-slate-900">
                          おまかせ消去サービスを利用する
                        </span>
                        <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
                          ＋3,000円
                        </span>
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-slate-600">
                        専門工程でデータ消去を行う想定の有料オプションです。料金の目安は 3,000 円です。
                      </span>
                    </span>
                  </label>
                </div>
              )}
            />
            {errors.dataErasureOption?.message ? (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {errors.dataErasureOption.message}
              </p>
            ) : null}
          </fieldset>

          <section
            className="rounded-[28px] border border-emerald-200 bg-emerald-50/80 p-5 md:p-6"
            aria-live="polite"
          >
            <h2 className="text-sm font-bold text-emerald-900 md:text-base">
              料金の目安（モック）
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-emerald-900">
              <li className="flex justify-between gap-4 border-b border-emerald-200/80 pb-2">
                <span>宅配枠・基本料金（パソコン本体を含む申込で免除）</span>
                <span className="shrink-0 font-semibold tabular-nums">
                  {!hasAnySelectedItem
                    ? '0 円'
                    : pricing.baseLogisticsFee.isWaived
                    ? '0 円'
                    : `${pricing.baseLogisticsFee.amountYenTaxIn.toLocaleString()} 円（税込）`}
                </span>
              </li>
              <li className="flex justify-between gap-4 border-b border-emerald-200/80 pb-2">
                <span>データ消去サービス</span>
                <span className="shrink-0 font-semibold tabular-nums">
                  {hasAnySelectedItem && pricing.dataErasureFee > 0
                    ? `+${pricing.dataErasureFee.toLocaleString()} 円`
                    : '0 円'}
                </span>
              </li>
              <li className="flex justify-between gap-4 border-b border-emerald-200/80 pb-2">
                <span>段ボール事前送付</span>
                <span className="shrink-0 font-semibold tabular-nums">
                  {hasAnySelectedItem && pricing.cardboardDeliveryFee > 0
                    ? `+${pricing.cardboardDeliveryFee.toLocaleString()} 円`
                    : '0 円'}
                </span>
              </li>
              <li className="flex items-baseline justify-end gap-3 pt-2 font-bold text-right">
                <span>小計（参考）</span>
                <span className="shrink-0 tabular-nums text-lg">
                  {(hasAnySelectedItem ? pricing.subtotalYen : 0).toLocaleString()} 円
                </span>
              </li>
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-emerald-800">
              ※ 正式な料金は Step 4 の確認画面および受付内容に基づく計算結果に準じます。特殊品目や対象外品は別条件となる場合があります。
            </p>
          </section>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
            <Link
              to="/"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-400 hover:bg-orange-50 hover:text-orange-700"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-orange-300 bg-white px-8 text-base font-bold text-orange-700 shadow-sm transition hover:-translate-y-px hover:border-orange-400 hover:bg-orange-50 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
            >
              次へ：日時指定
            </button>
          </div>
        </form>
    </ApplyStepShell>
  )
}
