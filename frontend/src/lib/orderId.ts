export function formatOrderId(orderId: number | string | null | undefined): string {
  if (orderId == null || orderId === '') {
    return ''
  }

  const digits = String(orderId).replace(/\D/g, '')
  if (!digits) {
    return ''
  }

  return digits.padStart(10, '0')
}