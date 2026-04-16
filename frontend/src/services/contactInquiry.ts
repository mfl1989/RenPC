import type { ContactInquiryValues } from '../schemas/contactInquirySchema.ts'

const STORAGE_KEY = 'recycle-pc-contact-inquiries'

interface StoredContactInquiry extends ContactInquiryValues {
  inquiryId: string
  createdAt: string
}

export interface ContactInquiryResult {
  inquiryId: string
  createdAt: string
}

function createInquiryId() {
  return `CI${Date.now().toString().slice(-10)}`
}

export async function submitContactInquiry(
  payload: ContactInquiryValues,
): Promise<ContactInquiryResult> {
  const inquiry = {
    ...payload,
    inquiryId: createInquiryId(),
    createdAt: new Date().toISOString(),
  } satisfies StoredContactInquiry

  const current = globalThis.localStorage?.getItem(STORAGE_KEY)
  const existing = current ? (JSON.parse(current) as StoredContactInquiry[]) : []

  globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify([inquiry, ...existing]))

  await new Promise((resolve) => {
    globalThis.setTimeout(resolve, 700)
  })

  return {
    inquiryId: inquiry.inquiryId,
    createdAt: inquiry.createdAt,
  }
}
