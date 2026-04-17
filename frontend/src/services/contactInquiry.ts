import axios, { isAxiosError } from 'axios'
import type { ContactInquiryValues } from '../schemas/contactInquirySchema.ts'

interface ApiEnvelope<T> {
  code: number
  message: string
  data: T | null
}

export interface ContactInquiryResult {
  inquiryId: string
  createdAt: string
}

function messageFromAxiosError(error: unknown): string {
  if (isAxiosError(error)) {
    const body = error.response?.data
    if (body && typeof body === 'object' && 'message' in body) {
      const message = (body as ApiEnvelope<unknown>).message
      if (typeof message === 'string' && message.trim() !== '') {
        return message
      }
    }
    if (error.code === 'ERR_NETWORK') {
      return 'サーバーに接続できません。バックエンドが起動しているか確認してください。'
    }
  }
  return '送信に失敗しました。しばらくしてから再度お試しください。'
}

export async function submitContactInquiry(
  payload: ContactInquiryValues,
): Promise<ContactInquiryResult> {
  try {
    const { data } = await axios.post<ApiEnvelope<ContactInquiryResult>>('/api/contact-inquiries', payload)
    if (data.code !== 200 || data.data == null) {
      throw new Error(data.message || '送信に失敗しました')
    }
    return data.data
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(messageFromAxiosError(error))
    }
    if (error instanceof Error) {
      throw error
    }
    throw new Error(messageFromAxiosError(error))
  }
}
