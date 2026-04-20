import type { HTMLAttributes } from 'react'
import { useEffect, useRef, useState } from 'react'
import type { FieldPath } from 'react-hook-form'
import { useFormContext, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { applyZodIssuesToForm } from '../../lib/zodToRhfErrors.ts'
import type { RecycleOrderFormValues } from '../../schemas/recycleOrderSchema.ts'
import { recycleOrderStep3Schema } from '../../schemas/recycleOrderSchema.ts'
import { lookupAddressByPostalCode } from '../../services/zipcloudSearch.ts'
import { ApplyStepShell } from './ApplyStepShell.tsx'

type Step3FieldName =
  | 'customerNameKanji'
  | 'customerNameKana'
  | 'postalCode'
  | 'prefecture'
  | 'city'
  | 'addressLine1'
  | 'addressLine2'
  | 'phone'
  | 'email'

function fieldBorder(hasError: boolean) {
  return hasError
    ? 'border-red-500 ring-1 ring-red-200 focus:border-red-500 focus:ring-red-300'
    : 'border-slate-300 focus:border-orange-400 focus:ring-orange-200'
}

function Step3Field({
  name,
  label,
  hint,
  type = 'text',
  inputMode,
  register,
  error,
}: {
  name: Step3FieldName
  label: string
  hint?: string
  type?: string
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode']
  register: ReturnType<typeof useFormContext<RecycleOrderFormValues>>['register']
  error?: string
}) {
  const id = `step3-${name}`
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-slate-900">
        {label}
      </label>
      {hint ? <p className="mt-1 text-sm text-slate-600">{hint}</p> : null}
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        className={`mt-2 w-full rounded-md border px-3 py-2.5 text-slate-900 outline-none focus:ring-2 ${fieldBorder(Boolean(error))}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : undefined}
        {...register(name)}
      />
      {error ? (
        <p
          id={`${id}-error`}
          className="mt-2 text-sm font-medium text-red-600"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default function Step3Customer() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    setValue,
    setFocus,
    formState: { errors },
  } = useFormContext<RecycleOrderFormValues>()

  const postalCode = useWatch({ name: 'postalCode' })
  const postalCodeDigits = (postalCode ?? '').replace(/\D/g, '')
  const zipDebounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )
  const zipLookupRequestIdRef = useRef(0)
  const [zipLookupLoading, setZipLookupLoading] = useState(false)
  const [zipLookupHint, setZipLookupHint] = useState<{
    postalCode: string
    variant: 'success' | 'error'
    text: string
  } | null>(null)

  const activeZipLookupHint =
    postalCodeDigits.length === 7 && zipLookupHint?.postalCode === postalCodeDigits
      ? zipLookupHint
      : null

  useEffect(() => {
    if (zipDebounceRef.current !== undefined) {
      clearTimeout(zipDebounceRef.current)
    }

    const requestId = ++zipLookupRequestIdRef.current
    if (postalCodeDigits.length !== 7) {
      return
    }

    zipDebounceRef.current = setTimeout(() => {
      void (async () => {
        setZipLookupLoading(true)
        const result = await lookupAddressByPostalCode(postalCodeDigits)

        if (zipLookupRequestIdRef.current !== requestId) {
          return
        }

        setZipLookupLoading(false)

        if (result.ok) {
          setValue('prefecture', result.prefecture, {
            shouldDirty: true,
            shouldValidate: false,
          })
          setValue('city', result.city, {
            shouldDirty: true,
            shouldValidate: false,
          })
          clearErrors(['prefecture', 'city'])
          setZipLookupHint({
            postalCode: postalCodeDigits,
            variant: 'success',
            text: '住所を自動入力しました。番地・建物名をご確認ください。',
          })
        } else {
          setZipLookupHint({
            postalCode: postalCodeDigits,
            variant: 'error',
            text: result.messageJa,
          })
        }
      })()
    }, 450)

    return () => {
      if (zipDebounceRef.current !== undefined) {
        clearTimeout(zipDebounceRef.current)
      }
    }
  }, [postalCodeDigits, setValue, clearErrors])

  const onSubmit = handleSubmit((values) => {
    clearErrors()
    const parsed = recycleOrderStep3Schema.safeParse({
      customerNameKanji: values.customerNameKanji,
      customerNameKana: values.customerNameKana,
      postalCode: values.postalCode,
      prefecture: values.prefecture,
      city: values.city,
      addressLine1: values.addressLine1,
      addressLine2: values.addressLine2,
      phone: values.phone,
      email: values.email,
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
    navigate('/apply/step4')
  })

  const goBack = () => navigate('/apply/step2')

  return (
    <ApplyStepShell
      step={3}
      title="お客様情報の入力"
      description="お届け先およびご連絡先をご入力ください。郵便番号（7桁）を入力すると、ZipCloud API により都道府県・市区町村を自動入力します。"
      noticeTitle="ご入力にあたっての注意事項"
      noticeItems={[
        '受付確認やご案内は、入力いただいたメールアドレス宛に送信されます。',
        '郵便番号検索後も、番地・建物名・部屋番号は必ずご確認ください。',
        '申込内容確認のため、お電話にてご連絡する場合があります。',
      ]}
    >
        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
            <Step3Field
              name="customerNameKanji"
              label="氏名（漢字）"
              register={register}
              error={errors.customerNameKanji?.message}
            />
            <Step3Field
              name="customerNameKana"
              label="氏名（フリガナ）"
              hint="全角カタカナで入力してください。"
              register={register}
              error={errors.customerNameKana?.message}
            />
            <div>
              <label
                htmlFor="step3-postalCode"
                className="block text-sm font-bold text-slate-900"
              >
                郵便番号
              </label>
              <p className="mt-1 text-sm text-slate-600">
                7 桁・ハイフンなし（例: 1000001）。入力後、自動で住所を検索します。
              </p>
              <input
                id="step3-postalCode"
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                className={`mt-2 w-full rounded-md border px-3 py-2.5 text-slate-900 outline-none focus:ring-2 ${fieldBorder(Boolean(errors.postalCode))}`}
                aria-invalid={errors.postalCode ? 'true' : 'false'}
                aria-describedby={
                  errors.postalCode
                    ? 'step3-postalCode-error'
                    : activeZipLookupHint
                      ? 'step3-postalCode-hint'
                      : undefined
                }
                {...register('postalCode')}
              />
              {zipLookupLoading && postalCodeDigits.length === 7 ? (
                <p className="mt-2 text-sm text-slate-500">住所を検索しています…</p>
              ) : null}
              {activeZipLookupHint ? (
                <p
                  id="step3-postalCode-hint"
                  className={`mt-2 text-sm font-medium ${
                    activeZipLookupHint.variant === 'success'
                      ? 'text-emerald-700'
                      : 'text-red-600'
                  }`}
                  role="status"
                >
                  {activeZipLookupHint.text}
                </p>
              ) : null}
              {errors.postalCode?.message ? (
                <p
                  id="step3-postalCode-error"
                  className="mt-2 text-sm font-medium text-red-600"
                  role="alert"
                >
                  {errors.postalCode.message}
                </p>
              ) : null}
            </div>
            <Step3Field
              name="prefecture"
              label="都道府県"
              register={register}
              error={errors.prefecture?.message}
            />
            <Step3Field
              name="city"
              label="市区町村"
              register={register}
              error={errors.city?.message}
            />
            <Step3Field
              name="addressLine1"
              label="番地・建物名"
              register={register}
              error={errors.addressLine1?.message}
            />
            <Step3Field
              name="addressLine2"
              label="建物名・部屋番号（任意）"
              register={register}
              error={errors.addressLine2?.message}
            />
            <Step3Field
              name="phone"
              label="電話番号"
              hint="半角数字・ハイフン可"
              inputMode="tel"
              register={register}
              error={errors.phone?.message}
            />
            <Step3Field
              name="email"
              label="メールアドレス"
              type="email"
              hint="受付確認、進行状況のご案内および必要なご連絡に使用します。"
              register={register}
              error={errors.email?.message}
            />
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
              次へ：内容確認
            </button>
          </div>
        </form>
    </ApplyStepShell>
  )
}
