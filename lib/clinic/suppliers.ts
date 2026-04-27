export type SupplierPurchaseOrderLineLike = {
  quantityReceived: number
  quantityOrdered: number
  unitCostCents: number | null
}

export type SupplierPurchaseOrderLike = {
  status: string
  lines: SupplierPurchaseOrderLineLike[]
}

export type SupplierSettlementLike = {
  amountCents: number
}

export function normalizeSupplierText(value: unknown, max = 500) {
  const text = String(value ?? '').trim().slice(0, max)
  return text || null
}

export function normalizeSupplierName(value: unknown) {
  return String(value ?? '').trim().slice(0, 200)
}

export function normalizeSupplierMoneyCents(value: unknown) {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount < 0 || amount > 1_000_000_000) return null
  return Math.round(amount)
}

export function supplierOrderReceivedCost(order: SupplierPurchaseOrderLike) {
  if (order.status === 'CANCELLED') return 0
  return order.lines.reduce((sum, line) => {
    const unitCost = line.unitCostCents ?? 0
    return sum + Math.max(0, line.quantityReceived) * unitCost
  }, 0)
}

export function supplierOrderOrderedCost(order: SupplierPurchaseOrderLike) {
  if (order.status === 'CANCELLED') return 0
  return order.lines.reduce((sum, line) => {
    const unitCost = line.unitCostCents ?? 0
    return sum + Math.max(0, line.quantityOrdered) * unitCost
  }, 0)
}

export function buildSupplierSettlementSummary(
  purchaseOrders: SupplierPurchaseOrderLike[],
  settlements: SupplierSettlementLike[]
) {
  const orderedCents = purchaseOrders.reduce((sum, order) => sum + supplierOrderOrderedCost(order), 0)
  const receivedCents = purchaseOrders.reduce((sum, order) => sum + supplierOrderReceivedCost(order), 0)
  const paidCents = settlements.reduce((sum, settlement) => sum + Math.max(0, settlement.amountCents), 0)
  return {
    orderedCents,
    receivedCents,
    paidCents,
    outstandingCents: Math.max(0, receivedCents - paidCents),
  }
}
