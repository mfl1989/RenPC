import { type ReactNode } from 'react'
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form'
import {
    createDefaultRecycleOrderValues,
    type RecycleOrderFormValues,
} from '../schemas/recycleOrderSchema.ts'

/**
 * 申込ステップ間で入力を保持するための RHF FormProvider。
 * ステップ単位の検証は各画面で Zod の pick スキーマ + safeParse を使用する
 *（zodResolver は全項目を一度に検証するため、未入力ステップがあると Step1 から進めない）。
 */
export function FormContextProvider({ children }: { children: ReactNode }) {
  const methods = useForm<RecycleOrderFormValues>({
    defaultValues: createDefaultRecycleOrderValues(),
    mode: 'onBlur',
  })

  return <FormProvider {...methods}>{children}</FormProvider>
}

export type RecycleOrderFormMethods = UseFormReturn<RecycleOrderFormValues>
