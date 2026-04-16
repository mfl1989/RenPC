import { z } from 'zod'

/**
 * データ消去オプション（docs/03_frontend_features.md Step 1）
 */
export const DATA_ERASURE_OPTIONS = ['self_erase_free', 'full_service_paid'] as const
export type DataErasureOption = (typeof DATA_ERASURE_OPTIONS)[number]

/**
 * 回収希望時間帯（docs/03_frontend_features.md Step 2）
 */
export const TIME_SLOT_OPTIONS = [
  'unspecified',
  'morning',
  't12_14',
  't14_16',
  't16_18',
  't18_21',
] as const
export type TimeSlotOption = (typeof TIME_SLOT_OPTIONS)[number]

/** 全角カタカナ（長音・中黒・全角スペースを許容） */
const KATAKANA_REGEX = /^[ァ-ヶー・\u3000\s]+$/u

const itemCount = z.number().int().min(0).max(99)

/**
 * フィールド定義のみ（refine 前のベース）
 */
const recycleOrderFields = {
  /** パソコン台数 */
  pcCount: itemCount,
  /** モニター台数 */
  monitorCount: itemCount,
  /** 小型家電が入る段ボールの箱数 */
  smallApplianceBoxCount: itemCount,
  dataErasureOption: z.enum(DATA_ERASURE_OPTIONS),
  /** yyyy-MM-dd（空文字時は日付未選択のみ1件の issue にする） */
  collectionDate: z.string().superRefine((val, ctx) => {
    if (!val || val.trim() === '') {
      ctx.addIssue({
        code: 'custom',
        message: '回収希望日を選択してください',
      })
      return
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      ctx.addIssue({
        code: 'custom',
        message: '日付の形式が正しくありません',
      })
    }
  }),
  timeSlot: z.enum(TIME_SLOT_OPTIONS),
  cardboardDeliveryRequested: z.boolean(),
  customerNameKanji: z.string().min(1, '氏名（漢字）を入力してください'),
  customerNameKana: z.string().superRefine((val, ctx) => {
    if (!val || val.trim() === '') {
      ctx.addIssue({
        code: 'custom',
        message: '氏名（フリガナ）を入力してください',
      })
      return
    }
    if (!KATAKANA_REGEX.test(val)) {
      ctx.addIssue({
        code: 'custom',
        message: 'フリガナは全角カタカナで入力してください',
      })
    }
  }),
  /** ハイフンなし7桁 */
  postalCode: z
    .string()
    .regex(/^\d{7}$/, '郵便番号は7桁の半角数字で入力してください'),
  prefecture: z.string().min(1, '都道府県を入力してください'),
  city: z.string().min(1, '市区町村を入力してください'),
  addressLine1: z.string().min(1, '番地・建物名までを入力してください'),
  addressLine2: z.string().optional(),
  phone: z.string().superRefine((val, ctx) => {
    if (!val || val.trim() === '') {
      ctx.addIssue({
        code: 'custom',
        message: '電話番号を入力してください',
      })
      return
    }
    if (!/^[0-9+\-()]{10,16}$/u.test(val)) {
      ctx.addIssue({
        code: 'custom',
        message: '電話番号の形式をご確認ください',
      })
    }
  }),
  email: z.email('メールアドレスの形式が正しくありません'),
  /** Step 4: 利用規約同意（最終スキーマで true を検証） */
  termsAccepted: z.boolean(),
}

function atLeastOneLineItem(data: {
  pcCount: number
  monitorCount: number
  smallApplianceBoxCount: number
}) {
  return data.pcCount + data.monitorCount + data.smallApplianceBoxCount >= 1
}

const recycleOrderObject = z.object(recycleOrderFields)

/**
 * 回収申込フォームの完全スキーマ（最終送信・型の正本）
 * アーキテクト要件の RecycleOrderSchema としても利用
 */
export const RecycleOrderSchema = recycleOrderObject
  .refine(atLeastOneLineItem, {
    message: '回収品目を1点以上お選びください',
    path: ['pcCount'],
  })
  .refine((d) => d.termsAccepted === true, {
    message: '利用規約に同意してください',
    path: ['termsAccepted'],
  })
  .describe('RecycleOrderForm')

/** エイリアス（実装内での読みやすさ用） */
export const recycleOrderFormSchema = RecycleOrderSchema

export type RecycleOrderFormValues = z.infer<typeof RecycleOrderSchema>

/** Step 1 用（画面遷移時に safeParse） */
export const recycleOrderStep1Schema = recycleOrderObject
  .pick({
    pcCount: true,
    monitorCount: true,
    smallApplianceBoxCount: true,
    dataErasureOption: true,
  })
  .refine(atLeastOneLineItem, {
    message: '回収品目を1点以上お選びください',
    path: ['pcCount'],
  })

/** Step 2 */
export const recycleOrderStep2Schema = recycleOrderObject.pick({
  collectionDate: true,
  timeSlot: true,
  cardboardDeliveryRequested: true,
})

/** Step 3 */
export const recycleOrderStep3Schema = recycleOrderObject.pick({
  customerNameKanji: true,
  customerNameKana: true,
  postalCode: true,
  prefecture: true,
  city: true,
  addressLine1: true,
  addressLine2: true,
  phone: true,
  email: true,
})

/** Step 4（同意のみ） */
export const recycleOrderStep4Schema = z
  .object({ termsAccepted: z.boolean() })
  .refine((d) => d.termsAccepted === true, {
    message: '利用規約に同意してください',
    path: ['termsAccepted'],
  })

/**
 * 初期値（全ステップで共有）
 */
export const defaultRecycleOrderValues: RecycleOrderFormValues = {
  pcCount: 0,
  monitorCount: 0,
  smallApplianceBoxCount: 0,
  dataErasureOption: 'self_erase_free',
  collectionDate: '',
  timeSlot: 'unspecified',
  cardboardDeliveryRequested: false,
  customerNameKanji: '',
  customerNameKana: '',
  postalCode: '',
  prefecture: '',
  city: '',
  addressLine1: '',
  addressLine2: '',
  phone: '',
  email: '',
  termsAccepted: false,
}

/** 税込の宅配枠基本料金モック（パソコン非含有時の目安） */
export const MOCK_BASE_LOGISTICS_FEE_YEN_TAX_IN = 1848

/**
 * 基本送料の目安（モック）
 * パソコン本体を1台以上含む場合は0円、それ以外は1箱あたりの基本料金を表示用に返す
 */
export function getBaseLogisticsFeeHint(pcCount: number): {
  isWaived: boolean
  amountYenTaxIn: number
} {
  if (pcCount >= 1) {
    return { isWaived: true, amountYenTaxIn: 0 }
  }
  return { isWaived: false, amountYenTaxIn: MOCK_BASE_LOGISTICS_FEE_YEN_TAX_IN }
}

/** おまかせデータ消去の追加料金モック（docs の例に合わせ 3,000 円） */
export const MOCK_DATA_ERASE_FEE_YEN = 3000

export function getDataErasureFeeYen(option: DataErasureOption): number {
  return option === 'full_service_paid' ? MOCK_DATA_ERASE_FEE_YEN : 0
}
