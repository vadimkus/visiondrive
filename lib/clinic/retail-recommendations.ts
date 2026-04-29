export type RetailRecommendationReason = 'SERVICE_MATCH' | 'PATIENT_REPEAT' | 'POPULAR'

export type RetailStockItemLike = {
  id: string
  name: string
  sku?: string | null
  unit: string
  quantityOnHand: number
  active: boolean
  procedureId?: string | null
  procedure?: { id: string; name: string } | null
}

export type RetailSaleLineLike = {
  stockItemId: string
  quantity: number
  unitPriceCents: number
  productSale?: {
    patientId?: string | null
    soldAt?: Date | string | null
  } | null
}

export type RetailRecommendation = {
  id: string
  name: string
  sku: string | null
  unit: string
  quantityOnHand: number
  procedure: { id: string; name: string } | null
  reason: RetailRecommendationReason
  score: number
  lastUnitPriceCents: number | null
}

type RecommendationInput = {
  items: RetailStockItemLike[]
  recentSaleLines?: RetailSaleLineLike[]
  procedureId?: string | null
  patientId?: string | null
  limit?: number
}

export function buildRetailRecommendations({
  items,
  recentSaleLines = [],
  procedureId,
  patientId,
  limit = 6,
}: RecommendationInput): RetailRecommendation[] {
  const eligible = items.filter((item) => item.active && item.quantityOnHand > 0)
  const byId = new Map(eligible.map((item) => [item.id, item]))
  const stats = new Map<string, { patientQty: number; totalQty: number; lastUnitPriceCents: number | null }>()

  for (const line of recentSaleLines) {
    if (!byId.has(line.stockItemId)) continue
    const current = stats.get(line.stockItemId) ?? {
      patientQty: 0,
      totalQty: 0,
      lastUnitPriceCents: null,
    }
    const quantity = Number.isFinite(line.quantity) ? Math.max(0, Math.round(line.quantity)) : 0
    current.totalQty += quantity
    if (patientId && line.productSale?.patientId === patientId) current.patientQty += quantity
    if (line.unitPriceCents > 0 && current.lastUnitPriceCents == null) {
      current.lastUnitPriceCents = line.unitPriceCents
    }
    stats.set(line.stockItemId, current)
  }

  return eligible
    .map((item) => {
      const itemProcedureId = item.procedureId ?? item.procedure?.id ?? null
      const stat = stats.get(item.id) ?? { patientQty: 0, totalQty: 0, lastUnitPriceCents: null }
      const serviceMatch = Boolean(procedureId && itemProcedureId === procedureId)
      const patientRepeat = stat.patientQty > 0
      const reason: RetailRecommendationReason = serviceMatch
        ? 'SERVICE_MATCH'
        : patientRepeat
          ? 'PATIENT_REPEAT'
          : 'POPULAR'
      const score =
        (serviceMatch ? 1_000 : 0) +
        stat.patientQty * 100 +
        stat.totalQty * 10 +
        Math.min(item.quantityOnHand, 50)

      return {
        id: item.id,
        name: item.name,
        sku: item.sku ?? null,
        unit: item.unit,
        quantityOnHand: item.quantityOnHand,
        procedure: item.procedure ?? null,
        reason,
        score,
        lastUnitPriceCents: stat.lastUnitPriceCents,
      }
    })
    .filter((recommendation) => recommendation.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, Math.max(1, limit))
}
