export type ProcedureMaterialInput = {
  quantityPerVisit?: unknown
  unitCostCents?: unknown
  sortOrder?: unknown
}

export type ProcedureMaterialCostInput = {
  quantityPerVisit: number
  unitCostCents?: number | null
  active?: boolean | null
}

export function normalizeMaterialQuantity(value: unknown, fallback = 1) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(Math.max(Math.floor(parsed), 1), 1_000_000)
}

export function normalizeUnitCostCents(value: unknown, fallback = 0) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(Math.max(Math.round(parsed), 0), 1_000_000_000)
}

export function normalizeMaterialSortOrder(value: unknown, fallback = 0) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(Math.max(Math.round(parsed), -1_000_000), 1_000_000)
}

export function materialLineCostCents(material: ProcedureMaterialCostInput) {
  if (material.active === false) return 0
  return normalizeMaterialQuantity(material.quantityPerVisit, 1) * normalizeUnitCostCents(material.unitCostCents ?? 0)
}

export function procedureMaterialCostCents(materials: ProcedureMaterialCostInput[]) {
  return materials.reduce((sum, material) => sum + materialLineCostCents(material), 0)
}
