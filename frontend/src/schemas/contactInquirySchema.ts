import { z } from 'zod'

export const contactInquiryCategoryOptions = [
  { value: 'items', label: '回収対象について' },
  { value: 'packing', label: '梱包方法について' },
  { value: 'schedule', label: '回収日時について' },
  { value: 'status', label: '申込状況について' },
  { value: 'data-erasure', label: 'データ消去について' },
  { value: 'other', label: 'その他' },
] as const

const contactInquiryCategoryValues = [
  'items',
  'packing',
  'schedule',
  'status',
  'data-erasure',
  'other',
] as const

export const contactInquirySchema = z.object({
  name: z.string().trim().min(1, 'お名前を入力してください。').max(60, 'お名前は60文字以内で入力してください。'),
  email: z.string().trim().min(1, 'メールアドレスを入力してください。').email('メールアドレスの形式が正しくありません。'),
  category: z.enum(contactInquiryCategoryValues, 'お問い合わせ内容を選択してください。'),
  orderId: z
    .string()
    .trim()
    .regex(/^$|^\d{1,10}$/, 'お申込み番号は10桁以内の数字で入力してください。'),
  message: z.string().trim().min(10, 'お問い合わせ内容は10文字以上で入力してください。').max(1000, 'お問い合わせ内容は1000文字以内で入力してください。'),
  privacyConsent: z.boolean().refine((value) => value, '個人情報保護方針への同意が必要です。'),
})

export type ContactInquiryValues = z.infer<typeof contactInquirySchema>
