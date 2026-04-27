import type { ClinicStockVarianceReason } from '@prisma/client'

export const STOCK_VARIANCE_REASONS = [
  'COUNT_CORRECTION',
  'EXPIRED',
  'DAMAGED',
  'LOST',
  'FOUND',
  'OTHER',
] as const satisfies readonly ClinicStockVarianceReason[]

export type StockVarianceReason = (typeof STOCK_VARIANCE_REASONS)[number]

export function normalizeCountedQuantity(value: unknown): number | null {
  if (value == null || value === '') return null
  const n = Number(value)
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) return null
  return n
}

export function stockVarianceQuantity(expectedQuantity: number, countedQuantity: number | null) {
  if (countedQuantity == null) return 0
  return countedQuantity - expectedQuantity
}

export function normalizeVarianceReason(value: unknown): StockVarianceReason | null {
  if (value == null || value === '') return null
  const reason = String(value).trim().toUpperCase()
  return STOCK_VARIANCE_REASONS.includes(reason as StockVarianceReason)
    ? (reason as StockVarianceReason)
    : null
}

export function isVarianceReasonRequired(varianceQuantity: number) {
  return varianceQuantity !== 0
}
