import type { HTMLAttributes } from 'react'
import { useEffect, useRef, useState } from 'react'
import type { FieldPath } from 'react-hook-form'
import { useFormContext, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import type { RecycleOrderFormValues } from '../../schemas/recycleOrderSchema.ts'
import { recycleOrderStep3Schema } from '../../schemas/recycleOrderSchema.ts'
import { applyZodIssuesToForm } from '../../lib/zodToRhfErrors.ts'
import { lookupAddressByPostalCode } from '../../services/zipcloudSearch.ts'
import { StepProgress } from './StepProgress.tsx'

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
  | 'password'

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
  const zipDebounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )
  const [zipLookupLoading, setZipLookupLoading] = useState(false)
  const [zipLookupHint, setZipLookupHint] = useState<{
    variant: 'success' | 'error'
    text: string
  } | null>(null)

  useEffect(() => {
    if (zipDebounceRef.current !== undefined) {
      clearTimeout(zipDebounceRef.current)
    }
    setZipLookupHint(null)

    const digits = (postalCode ?? '').replace(/\D/g, '')
    if (digits.length !== 7) {
      setZipLookupLoading(false)
      return
    }

    zipDebounceRef.current = setTimeout(() => {
      void (async () => {
        setZipLookupLoading(true)
        const result = await lookupAddressByPostalCode(digits)
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
            variant: 'success',
            text: '住所を自動入力しました。番地・建物名をご確認ください。',
          })
        } else {
          setZipLookupHint({
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
  }, [postalCode, setValue, clearErrors])

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
      password: values.password,
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

        <StepProgress step={3} />

        <header className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            お客様情報の入力
          </h1>
          <p className="mt-2 text-sm text-slate-600 md:text-base">
            お届け先・連絡先をご入力ください。郵便番号（7桁）を入力すると
            ZipCloud API により都道府県・市区町村を自動入力します。
          </p>
        </header>

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
                7桁・ハイフンなし（例：1000001）。入力後、自動で住所を検索します。
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
                    : zipLookupHint
                      ? 'step3-postalCode-hint'
                      : undefined
                }
                {...register('postalCode')}
              />
              {zipLookupLoading ? (
                <p className="mt-2 text-sm text-slate-500">住所を検索しています…</p>
              ) : null}
              {zipLookupHint ? (
                <p
                  id="step3-postalCode-hint"
                  className={`mt-2 text-sm font-medium ${
                    zipLookupHint.variant === 'success'
                      ? 'text-emerald-700'
                      : 'text-red-600'
                  }`}
                  role="status"
                >
                  {zipLookupHint.text}
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
              register={register}
              error={errors.email?.message}
            />
            <Step3Field
              name="password"
              label="パスワード"
              hint="マイページ用・8文字以上"
              type="password"
              register={register}
              error={errors.password?.message}
            />
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={goBack}
              className="inline-flex h-12 min-w-[8rem] items-center justify-center rounded-lg border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              戻る
            </button>
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-orange-500 px-8 text-base font-bold text-white shadow-md transition hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
            >
              次へ：内容確認
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
