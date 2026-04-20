import axios, { isAxiosError } from 'axios'
import type { RecycleOrderFormValues } from '../schemas/recycleOrderSchema.ts'

interface ApiEnvelope<T> {
  code: number
  message: string
  data: T | null
}

export interface OrderSubmitResult {
  orderId: number
}

export interface OrderLookupPayload {
  orderId: number
  email: string
}

export type OrderStatusCode =
  | 'RECEIVED'
  | 'KIT_SHIPPED'
  | 'COLLECTING'
  | 'ARRIVED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'CANCELLED'

export interface OrderLookupResult {
  orderId: number
  contactName: string
  email: string
  orderStatusCode: OrderStatusCode
  orderStatus: string
  progressSummary: string
  collectionDate: string
  collectionTimeSlot: string
  createdAt: string
  lastUpdatedAt: string
  totalAmount: number
  pcCount: number
  monitorCount: number
  smallApplianceBoxCount: number
  dataErasureOptionLabel: string
  cardboardDeliveryLabel: string
  customerNote: string | null
}

function messageFromAxiosError(e: unknown): string {
  if (isAxiosError(e)) {
    const body = e.response?.data
    if (body && typeof body === 'object' && 'message' in body) {
      const m = (body as ApiEnvelope<unknown>).message
      if (typeof m === 'string' && m.trim() !== '') {
        return m
      }
    }
    if (e.code === 'ERR_NETWORK') {
      return 'サーバーに接続できません。バックエンドが起動しているか確認してください。'
    }
  }
  return '送信に失敗しました。しばらくしてから再度お試しください。'
}

/**
 * 回収申込の確定送信（POST /api/orders）。
 */
export async function submitRecycleOrder(
  payload: RecycleOrderFormValues,
): Promise<OrderSubmitResult> {
  try {
    const { data } = await axios.post<ApiEnvelope<OrderSubmitResult>>('/api/orders', payload)
    if (data.code !== 200 || data.data == null) {
      throw new Error(data.message || '送信に失敗しました')
    }
    return data.data
  } catch (e) {
    if (isAxiosError(e)) {
      throw new Error(messageFromAxiosError(e))
    }
    if (e instanceof Error) {
      throw e
    }
    throw new Error(messageFromAxiosError(e))
  }
}

export async function lookupRecycleOrder(
  payload: OrderLookupPayload,
): Promise<OrderLookupResult> {
  try {
    const { data } = await axios.post<ApiEnvelope<OrderLookupResult>>('/api/orders/lookup', payload)
    if (data.code !== 200 || data.data == null) {
      throw new Error(data.message || '照会に失敗しました')
    }
    return data.data
  } catch (e) {
    if (isAxiosError(e)) {
      throw new Error(messageFromAxiosError(e))
    }
    if (e instanceof Error) {
      throw e
    }
    throw new Error(messageFromAxiosError(e))
  }
}
