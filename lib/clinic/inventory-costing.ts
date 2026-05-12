import type { Prisma } from '@prisma/client'

export type InventoryCostLayer = {
  quantity: number
  unitCostCents: number
}

export type InventoryCostMeta = {
  method: 'RECEIPT' | 'FIFO'
  quantity: number
  unitCostCents: number
  totalCostCents: number
  layers?: InventoryCostLayer[]
}

const COST_META_PREFIX = 'VD_COST '
const COST_META_PATTERN = /\n?\[\[VD_COST [A-Za-z0-9+/=]+]]$/

function positiveInt(value: unknown, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : fallback
}

function encodeCostMeta(meta: InventoryCostMeta) {
  if (typeof Buffer === 'undefined') return ''
  return `[[${COST_META_PREFIX}${Buffer.from(JSON.stringify(meta), 'utf8').toString('base64')}]]`
}

export function parseInventoryCostMeta(note: string | null | undefined): InventoryCostMeta | null {
  const match = note?.match(COST_META_PATTERN)
  if (!match || typeof Buffer === 'undefined') return null
  const payload = match[0].replace('[[VD_COST ', '').replace(']]', '').trim()
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64').toString('utf8')) as Partial<InventoryCostMeta>
    const quantity = positiveInt(parsed.quantity)
    const totalCostCents = positiveInt(parsed.totalCostCents)
    const unitCostCents =
      parsed.unitCostCents != null
        ? positiveInt(parsed.unitCostCents)
        : quantity > 0
          ? Math.round(totalCostCents / quantity)
          : 0
    const method = parsed.method === 'FIFO' ? 'FIFO' : 'RECEIPT'
    const layers = Array.isArray(parsed.layers)
      ? parsed.layers.map((layer) => ({
          quantity: positiveInt(layer.quantity),
          unitCostCents: positiveInt(layer.unitCostCents),
        })).filter((layer) => layer.quantity > 0)
      : undefined
    return { method, quantity, unitCostCents, totalCostCents, layers }
  } catch {
    return null
  }
}

export function stripInventoryCostMeta(note: string | null | undefined) {
  return (note ?? '').replace(COST_META_PATTERN, '').trim() || null
}

export function withReceiptCostMeta(note: string | null, quantity: number, unitCostCents: number | null | undefined) {
  const qty = positiveInt(quantity)
  const unit = positiveInt(unitCostCents)
  if (qty <= 0 || unit <= 0) return note
  const meta: InventoryCostMeta = {
    method: 'RECEIPT',
    quantity: qty,
    unitCostCents: unit,
    totalCostCents: qty * unit,
  }
  return [note?.trim(), encodeCostMeta(meta)].filter(Boolean).join('\n') || null
}

export async function fifoCostForConsumption(
  tx: Prisma.TransactionClient,
  params: { tenantId: string; stockItemId: string; quantity: number }
) {
  const quantity = positiveInt(params.quantity)
  if (quantity <= 0) {
    return { quantity: 0, unitCostCents: 0, totalCostCents: 0, layers: [] as InventoryCostLayer[] }
  }

  const movements = await tx.clinicStockMovement.findMany({
    where: { tenantId: params.tenantId, stockItemId: params.stockItemId },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    select: { quantityDelta: true, note: true },
  })

  const availableLayers: InventoryCostLayer[] = []
  for (const movement of movements) {
    if (movement.quantityDelta > 0) {
      const meta = parseInventoryCostMeta(movement.note)
      availableLayers.push({
        quantity: movement.quantityDelta,
        unitCostCents: meta?.unitCostCents ?? 0,
      })
      continue
    }

    let toConsume = Math.abs(movement.quantityDelta)
    while (toConsume > 0 && availableLayers.length > 0) {
      const layer = availableLayers[0]
      const used = Math.min(layer.quantity, toConsume)
      layer.quantity -= used
      toConsume -= used
      if (layer.quantity <= 0) availableLayers.shift()
    }
  }

  let remaining = quantity
  const consumedLayers: InventoryCostLayer[] = []
  while (remaining > 0 && availableLayers.length > 0) {
    const layer = availableLayers[0]
    const used = Math.min(layer.quantity, remaining)
    consumedLayers.push({ quantity: used, unitCostCents: layer.unitCostCents })
    layer.quantity -= used
    remaining -= used
    if (layer.quantity <= 0) availableLayers.shift()
  }

  if (remaining > 0) {
    consumedLayers.push({ quantity: remaining, unitCostCents: 0 })
  }

  const totalCostCents = consumedLayers.reduce(
    (sum, layer) => sum + layer.quantity * layer.unitCostCents,
    0
  )
  const unitCostCents = quantity > 0 ? Math.round(totalCostCents / quantity) : 0

  return { quantity, unitCostCents, totalCostCents, layers: consumedLayers }
}

export function withFifoCostMeta(
  note: string | null,
  fifoCost: Awaited<ReturnType<typeof fifoCostForConsumption>>
) {
  if (fifoCost.quantity <= 0) return note
  const meta: InventoryCostMeta = {
    method: 'FIFO',
    quantity: fifoCost.quantity,
    unitCostCents: fifoCost.unitCostCents,
    totalCostCents: fifoCost.totalCostCents,
    layers: fifoCost.layers,
  }
  return [note?.trim(), encodeCostMeta(meta)].filter(Boolean).join('\n') || null
}
