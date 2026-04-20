import type { FieldPath } from 'react-hook-form'
import { Controller, useFormContext } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { applyZodIssuesToForm } from '../../lib/zodToRhfErrors.ts'
import type { RecycleOrderFormValues } from '../../schemas/recycleOrderSchema.ts'
import { recycleOrderStep2Schema } from '../../schemas/recycleOrderSchema.ts'
import { ApplyStepShell } from './ApplyStepShell.tsx'

export default function Step2Schedule() {
  const navigate = useNavigate()
  const {
    control,
    handleSubmit,
    register,
    setError,
    clearErrors,
    setFocus,
    formState: { errors },
  } = useFormContext<RecycleOrderFormValues>()

  const minDate = new Date().toISOString().slice(0, 10)

  const onSubmit = handleSubmit((values) => {
    clearErrors()
    const parsed = recycleOrderStep2Schema.safeParse({
      collectionDate: values.collectionDate,
      timeSlot: values.timeSlot,
      cardboardDeliveryRequested: values.cardboardDeliveryRequested,
    })
    if (!parsed.success) {
      applyZodIssuesToForm(parsed.error, setError)
      const firstPath = parsed.error.issues[0]?.path[0]
      if (typeof firstPath === 'string') {
        setFocus(firstPath as FieldPath<RecycleOrderFormValues>, {
          shouldSelect: true,
        })
      }
      return
    }
    navigate('/apply/step3')
  })

  const goBack = () => navigate('/apply/step1')

  const fieldBorder = (hasError: boolean) =>
    hasError
      ? 'border-red-500 ring-1 ring-red-200 focus:border-red-500 focus:ring-red-300'
      : 'border-slate-300 focus:border-orange-400 focus:ring-orange-200'

  return (
    <ApplyStepShell
      step={2}
      title="回収日時の指定"
      description="回収希望日と時間帯をご指定ください。"
      noticeTitle="日時指定に関するご案内"
      noticeItems={[
        'ご希望日時は受付時点の目安であり、配送会社の事情により前後する場合があります。',
        '段ボールの事前送付を希望する場合は、余裕をもった日程でお申し込みください。',
        '正式な手配内容は、申込完了後のご案内にてご確認ください。',
      ]}
    >
        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
            <div>
              <label
                htmlFor="collection-date"
                className="block text-sm font-bold text-slate-900"
              >
                回収希望日
              </label>
              <p className="mt-1 text-sm text-slate-600">
                本日以降の日付を選択してください。
              </p>
              <input
                id="collection-date"
                type="date"
                min={minDate}
                className={`mt-2 w-full rounded-md border px-3 py-2.5 text-slate-900 outline-none focus:ring-2 ${fieldBorder(Boolean(errors.collectionDate))}`}
                aria-invalid={errors.collectionDate ? 'true' : 'false'}
                aria-describedby={
                  errors.collectionDate ? 'collection-date-error' : undefined
                }
                {...register('collectionDate')}
              />
              {errors.collectionDate?.message ? (
                <p
                  id="collection-date-error"
                  className="mt-2 text-sm font-medium text-red-600"
                  role="alert"
                >
                  {errors.collectionDate.message}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="time-slot"
                className="block text-sm font-bold text-slate-900"
              >
                時間帯
              </label>
              <select
                id="time-slot"
                className={`mt-2 w-full rounded-md border px-3 py-2.5 text-slate-900 outline-none focus:ring-2 ${fieldBorder(Boolean(errors.timeSlot))}`}
                aria-invalid={errors.timeSlot ? 'true' : 'false'}
                aria-describedby={
                  errors.timeSlot ? 'time-slot-error' : undefined
                }
                {...register('timeSlot')}
              >
                <option value="unspecified">指定なし</option>
                <option value="morning">午前中</option>
                <option value="t12_14">12:00〜14:00</option>
                <option value="t14_16">14:00〜16:00</option>
                <option value="t16_18">16:00〜18:00</option>
                <option value="t18_21">18:00〜21:00</option>
              </select>
              {errors.timeSlot?.message ? (
                <p
                  id="time-slot-error"
                  className="mt-2 text-sm font-medium text-red-600"
                  role="alert"
                >
                  {errors.timeSlot.message}
                </p>
              ) : null}
            </div>

            <div>
              <Controller
                name="cardboardDeliveryRequested"
                control={control}
                render={({ field: { value, onChange, onBlur, name, ref } }) => (
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 has-focus-visible:ring-2 has-focus-visible:ring-orange-300">
                    <input
                      ref={ref}
                      name={name}
                      onBlur={onBlur}
                      type="checkbox"
                      checked={Boolean(value)}
                      onChange={(e) => onChange(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-slate-800">
                      段ボールの事前送付を希望する
                    </span>
                  </label>
                )}
              />
              {errors.cardboardDeliveryRequested?.message ? (
                <p className="mt-2 text-sm font-medium text-red-600" role="alert">
                  {errors.cardboardDeliveryRequested.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={goBack}
              className="inline-flex h-12 min-w-32 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-orange-400 hover:bg-orange-50 hover:text-orange-700"
            >
              戻る
            </button>
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-orange-300 bg-white px-8 text-base font-bold text-orange-700 shadow-sm transition hover:-translate-y-px hover:border-orange-400 hover:bg-orange-50 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
            >
              次へ：お客様情報
            </button>
          </div>
        </form>
    </ApplyStepShell>
  )
}
