export type ProfitabilityPayment = {
  id?: string | null
  amountCents: number
  processorFeeCents?: number | null
  status: string
}

export type ProfitabilityMaterial = {
  quantityPerVisit: number
  unitCostCents: number
  active?: boolean | null
}

export type ProcedureVisitProfitabilityInput = {
  procedureId: string | null
  procedureName: string
  durationMinutes: number
  expectedRevenueCents: number
  materials: ProfitabilityMaterial[]
  payments: ProfitabilityPayment[]
}

export type ProcedureProfitabilityRow = {
  procedureId: string | null
  procedureName: string
  visits: number
  totalMinutes: number
  expectedRevenueCents: number
  paidRevenueCents: number
  refundsCents: number
  netRevenueCents: number
  materialCostCents: number
  processorFeeCents: number
  grossProfitCents: number
  marginPct: number
  profitPerHourCents: number
}

function positiveCents(value: number) {
  return Number.isFinite(value) && value > 0 ? Math.round(value) : 0
}

function positiveMinutes(value: number) {
  return Number.isFinite(value) && value > 0 ? Math.round(value) : 0
}

export function materialCostPerVisit(materials: ProfitabilityMaterial[]) {
  return materials
    .filter((material) => material.active !== false)
    .reduce(
      (sum, material) =>
        sum + Math.max(0, Math.round(material.quantityPerVisit)) * positiveCents(material.unitCostCents),
      0
    )
}

export function paymentNetTotals(payments: ProfitabilityPayment[]) {
  const seen = new Set<string>()
  let paidRevenueCents = 0
  let refundsCents = 0
  let processorFeeCents = 0

  for (const payment of payments) {
    if (payment.id) {
      if (seen.has(payment.id)) continue
      seen.add(payment.id)
    }
    const amountCents = positiveCents(payment.amountCents)
    const paymentProcessorFeeCents = positiveCents(payment.processorFeeCents ?? 0)
    const status = payment.status.toUpperCase()
    if (status === 'PAID') paidRevenueCents += amountCents
    if (status === 'REFUNDED') refundsCents += amountCents
    if (status === 'PAID' || status === 'REFUNDED') processorFeeCents += paymentProcessorFeeCents
  }

  return {
    paidRevenueCents,
    refundsCents,
    processorFeeCents,
    netRevenueCents: paidRevenueCents - refundsCents,
  }
}

export function buildProcedureProfitability(
  visits: ProcedureVisitProfitabilityInput[]
): ProcedureProfitabilityRow[] {
  const rows = new Map<string, ProcedureProfitabilityRow>()

  for (const visit of visits) {
    const key = visit.procedureId ?? 'unassigned'
    const existing =
      rows.get(key) ??
      ({
        procedureId: visit.procedureId,
        procedureName: visit.procedureName,
        visits: 0,
        totalMinutes: 0,
        expectedRevenueCents: 0,
        paidRevenueCents: 0,
        refundsCents: 0,
        netRevenueCents: 0,
        materialCostCents: 0,
        processorFeeCents: 0,
        grossProfitCents: 0,
        marginPct: 0,
        profitPerHourCents: 0,
      } satisfies ProcedureProfitabilityRow)

    const paymentTotals = paymentNetTotals(visit.payments)
    existing.visits += 1
    existing.totalMinutes += positiveMinutes(visit.durationMinutes)
    existing.expectedRevenueCents += positiveCents(visit.expectedRevenueCents)
    existing.paidRevenueCents += paymentTotals.paidRevenueCents
    existing.refundsCents += paymentTotals.refundsCents
    existing.netRevenueCents += paymentTotals.netRevenueCents
    existing.materialCostCents += materialCostPerVisit(visit.materials)
    existing.processorFeeCents += paymentTotals.processorFeeCents
    existing.grossProfitCents =
      existing.netRevenueCents - existing.materialCostCents - existing.processorFeeCents
    existing.marginPct =
      existing.netRevenueCents > 0
        ? Number(((existing.grossProfitCents / existing.netRevenueCents) * 100).toFixed(1))
        : 0
    existing.profitPerHourCents =
      existing.totalMinutes > 0
        ? Math.round((existing.grossProfitCents / existing.totalMinutes) * 60)
        : 0

    rows.set(key, existing)
  }

  return [...rows.values()].sort((a, b) => b.grossProfitCents - a.grossProfitCents)
}
