import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import {
  type DataErasureOption,
  type RecycleOrderFormValues,
  recycleOrderStep1Schema,
  getBaseLogisticsFeeHint,
  getDataErasureFeeYen,
} from '../../schemas/recycleOrderSchema.ts'
import { applyZodIssuesToForm } from '../../lib/zodToRhfErrors.ts'
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
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <label
            htmlFor={id}
            className="text-base font-bold text-slate-900 md:text-lg"
          >
            {label}
          </label>
          {description ? (
            <p className="mt-1 text-sm text-slate-600">{description}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={dec}
            className="flex h-11 w-11 items-center justify-center rounded-lg border-2 border-slate-300 bg-white text-xl font-bold text-slate-700 transition hover:border-orange-400 hover:bg-orange-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
            aria-label={`${label}を減らす`}
          >
            −
          </button>
          <span
            id={id}
            className="min-w-[2.5rem] text-center text-2xl font-bold tabular-nums text-slate-900"
          >
            {value}
          </span>
          <button
            type="button"
            onClick={inc}
            className="flex h-11 w-11 items-center justify-center rounded-lg border-2 border-slate-300 bg-white text-xl font-bold text-slate-700 transition hover:border-orange-400 hover:bg-orange-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
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
    <div className="min-h-screen bg-slate-50 pb-16 pt-8 font-sans text-slate-800">
      <div className="mx-auto max-w-2xl px-4 md:px-6">
        <div className="mb-6 text-center">
          <Link
            to="/"
            className="text-sm font-medium text-orange-600 hover:underline"
          >
            ← トップへ戻る
          </Link>
        </div>

        <StepProgress step={1} />

        <header className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            回収品目の入力
          </h1>
          <p className="mt-2 text-sm text-slate-600 md:text-base">
            台数を選択し、データ消去方法をお選びください。
          </p>
        </header>

        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          <Controller
            name="pcCount"
            control={control}
            render={({ field }) => (
              <CountStepper
                id="pc-count"
                label="パソコン台数"
                description="デスクトップ・ノートの合計台数"
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
                description="液晶ディスプレイなど"
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
                description="パソコン以外の小型家電が入る段ボールの箱数"
                value={field.value}
                onChange={field.onChange}
                error={errors.smallApplianceBoxCount?.message}
              />
            )}
          />

          <fieldset className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <legend className="px-1 text-base font-bold text-slate-900">
              データ消去サービス
            </legend>
            <p className="mb-4 text-sm text-slate-600">
              ご自身での消去か、おまかせ消去（有料）をお選びください。
            </p>
            <Controller
              name="dataErasureOption"
              control={control}
              render={({ field }) => (
                <div className="space-y-3">
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 has-[:checked]:border-orange-400 has-[:checked]:bg-orange-50">
                    <input
                      type="radio"
                      className="mt-1 h-4 w-4 border-slate-300 text-orange-500 focus:ring-orange-500"
                      checked={field.value === 'self_erase_free'}
                      onChange={() => field.onChange('self_erase_free' satisfies DataErasureOption)}
                    />
                    <span>
                      <span className="font-semibold text-slate-900">
                        自分でデータ消去する（無料）
                      </span>
                      <span className="mt-0.5 block text-sm text-slate-600">
                        発送前にご自身で消去作業を行っていただきます。
                      </span>
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 has-[:checked]:border-orange-400 has-[:checked]:bg-orange-50">
                    <input
                      type="radio"
                      className="mt-1 h-4 w-4 border-slate-300 text-orange-500 focus:ring-orange-500"
                      checked={field.value === 'full_service_paid'}
                      onChange={() =>
                        field.onChange('full_service_paid' satisfies DataErasureOption)
                      }
                    />
                    <span>
                      <span className="font-semibold text-slate-900">
                        おまかせデータ消去（有料）
                      </span>
                      <span className="mt-0.5 block text-sm text-slate-600">
                        認定工程での消去（証明書発行を想定）／モック +3,000円
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
            className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 md:p-5"
            aria-live="polite"
          >
            <h2 className="text-sm font-bold text-emerald-900 md:text-base">
              料金の目安（モック）
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-emerald-900">
              <li className="flex justify-between gap-4 border-b border-emerald-200/80 pb-2">
                <span>宅配枠・基本料金（パソコン1台以上で免除イメージ）</span>
                <span className="shrink-0 font-semibold tabular-nums">
                  {baseFee.isWaived
                    ? '0 円'
                    : `${baseFee.amountYenTaxIn.toLocaleString()} 円（税込） / 箱`}
                </span>
              </li>
              <li className="flex justify-between gap-4 border-b border-emerald-200/80 pb-2">
                <span>データ消去オプション</span>
                <span className="shrink-0 font-semibold tabular-nums">
                  {eraseFee > 0
                    ? `+${eraseFee.toLocaleString()} 円`
                    : '0 円'}
                </span>
              </li>
              <li className="flex justify-between gap-4 pt-1 font-bold">
                <span>小計（参考）</span>
                <span className="shrink-0 tabular-nums">
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
              className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-orange-500 px-8 text-base font-bold text-white shadow-md transition hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
            >
              次へ：日時指定
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
