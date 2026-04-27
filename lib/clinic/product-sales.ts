export const PRODUCT_SALE_PAYMENT_REFERENCE_PREFIX = 'PRODUCT_SALE:'

export type ProductSaleLineInput = {
  stockItemId?: unknown
  quantity?: unknown
  unitPriceCents?: unknown
}

export function productSalePaymentReference(productSaleId: string) {
  return `${PRODUCT_SALE_PAYMENT_REFERENCE_PREFIX}${productSaleId}`
}

export function isProductSalePaymentReference(reference: string | null | undefined) {
  return !!reference?.startsWith(PRODUCT_SALE_PAYMENT_REFERENCE_PREFIX)
}

export function normalizeSaleQuantity(value: unknown, fallback = 1) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(Math.max(Math.round(parsed), 1), 1_000_000)
}

export function normalizeSalePriceCents(value: unknown, fallback = 0) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) return fallback
  return Math.min(Math.round(parsed), 1_000_000_000)
}

export function productSaleLineTotalCents(line: { quantity: number; unitPriceCents: number }) {
  return normalizeSaleQuantity(line.quantity) * normalizeSalePriceCents(line.unitPriceCents)
}

export function productSaleTotalCents(lines: Array<{ quantity: number; unitPriceCents: number }>, discountCents = 0) {
  const subtotalCents = lines.reduce((sum, line) => sum + productSaleLineTotalCents(line), 0)
  const normalizedDiscount = Math.min(normalizeSalePriceCents(discountCents), subtotalCents)
  return {
    subtotalCents,
    discountCents: normalizedDiscount,
    totalCents: Math.max(subtotalCents - normalizedDiscount, 0),
  }
}
