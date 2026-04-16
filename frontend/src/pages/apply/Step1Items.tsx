import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { applyZodIssuesToForm } from '../../lib/zodToRhfErrors.ts'
import {
    type DataErasureOption,
    getBaseLogisticsFeeHint,
    getDataErasureFeeYen,
    type RecycleOrderFormValues,
    recycleOrderStep1Schema,
} from '../../schemas/recycleOrderSchema.ts'
import { StepProgress } from './StepProgress.tsx'

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
  const dataErasure = useWatch({ control, name: 'dataErasureOption' })

  const baseFee = getBaseLogisticsFeeHint(pcCount)
  const eraseFee = getDataErasureFeeYen(dataErasure)
  const subtotalHint = baseFee.isWaived ? eraseFee : baseFee.amountYenTaxIn + eraseFee

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
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf5_0%,#f8fafc_22%,#f8fafc_100%)] pb-16 pt-8 font-sans text-slate-800">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <div className="mb-6 text-center">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
          >
            ← トップへ戻る
          </Link>
        </div>

        <StepProgress step={1} />

        <header className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            回収品目の入力
          </h1>
          <p className="mt-2 text-sm leading-7 text-slate-600 md:text-base">
            回収する台数と、データ消去の方法を選択してください。
          </p>
        </header>

        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold tracking-[-0.02em] text-slate-900 sm:text-xl">
                回収品目
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                各項目の数量を入力してください。数量の増減は右側のボタンから操作できます。
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
          </section>

          <fieldset className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <legend className="px-1 text-lg font-bold text-slate-900">
              データ消去方法
            </legend>
            <p className="mb-4 text-sm leading-6 text-slate-600">
              発送前にご自身で対応するか、当社のおまかせ消去サービスを利用するかを選択してください。
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
                        発送前にご自身で消去作業を行っていただきます。
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
                        専門工程でデータ消去を行う想定のオプションです。料金の目安は 3,000 円です。
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
                <span>宅配枠・基本料金（パソコン1台以上で免除イメージ）</span>
                <span className="shrink-0 font-semibold tabular-nums">
                  {baseFee.isWaived
                    ? '0 円'
                    : `${baseFee.amountYenTaxIn.toLocaleString()} 円（税込） / 箱`}
                </span>
              </li>
              <li className="flex justify-between gap-4 border-b border-emerald-200/80 pb-2">
                <span>データ消去サービス</span>
                <span className="shrink-0 font-semibold tabular-nums">
                  {eraseFee > 0
                    ? `+${eraseFee.toLocaleString()} 円`
                    : '0 円'}
                </span>
              </li>
              <li className="flex items-baseline justify-end gap-3 pt-2 font-bold text-right">
                <span>小計（参考）</span>
                <span className="shrink-0 tabular-nums text-lg">
                  {subtotalHint.toLocaleString()} 円
                </span>
              </li>
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-emerald-800">
              ※
              正式な料金は Step 4 の確認画面およびバックエンド計算に準じます。モニターのみ等のケースは別条件となる場合があります。
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
      </div>
    </div>
  )
}
