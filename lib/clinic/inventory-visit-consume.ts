import type { Prisma } from '@prisma/client'

export type VisitInventoryDeductionResult = {
  deducted: { itemId: string; name: string; qty: number }[]
  skipped: { itemId: string; name: string; reason: string }[]
}

type ConsumptionLine = {
  itemId: string
  name: string
  quantityOnHand: number
  quantityToConsume: number
  movementNote: string
}

/**
 * For a completed visit with an appointment that has a procedure: deduct the
 * procedure BOM if configured; otherwise fall back to legacy stock item links.
 */
export async function applyProcedureLinkedInventoryDeduction(
  tx: Prisma.TransactionClient,
  params: { tenantId: string; appointmentId: string | null; createdByUserId?: string | null }
): Promise<VisitInventoryDeductionResult> {
  const deducted: VisitInventoryDeductionResult['deducted'] = []
  const skipped: VisitInventoryDeductionResult['skipped'] = []

  if (!params.appointmentId) {
    return { deducted, skipped }
  }

  const appt = await tx.clinicAppointment.findFirst({
    where: { id: params.appointmentId, tenantId: params.tenantId },
    select: { procedureId: true },
  })
  if (!appt?.procedureId) {
    return { deducted, skipped }
  }

  const materials = await tx.clinicProcedureMaterial.findMany({
    where: {
      tenantId: params.tenantId,
      active: true,
      procedureId: appt.procedureId,
      quantityPerVisit: { gt: 0 },
    },
    include: { stockItem: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  })

  const lines: ConsumptionLine[] =
    materials.length > 0
      ? materials
          .filter((material) => material.stockItem.active)
          .map((material) => ({
            itemId: material.stockItem.id,
            name: material.stockItem.name,
            quantityOnHand: material.stockItem.quantityOnHand,
            quantityToConsume: material.quantityPerVisit,
            movementNote: 'Auto: visit completed (procedure BOM)',
          }))
      : (
          await tx.clinicStockItem.findMany({
            where: {
              tenantId: params.tenantId,
              active: true,
              procedureId: appt.procedureId,
              consumePerVisit: { gt: 0 },
            },
          })
        ).map((item) => ({
          itemId: item.id,
          name: item.name,
          quantityOnHand: item.quantityOnHand,
          quantityToConsume: item.consumePerVisit,
          movementNote: 'Auto: visit completed',
        }))

  for (const item of lines) {
    const delta = -item.quantityToConsume
    const updated = await tx.clinicStockItem.updateMany({
      where: {
        id: item.itemId,
        tenantId: params.tenantId,
        quantityOnHand: { gte: item.quantityToConsume },
      },
      data: { quantityOnHand: { decrement: item.quantityToConsume } },
    })

    if (updated.count !== 1) {
      const fresh = await tx.clinicStockItem.findUnique({
        where: { id: item.itemId },
        select: { quantityOnHand: true },
      })
      skipped.push({
        itemId: item.itemId,
        name: item.name,
        reason: `need ${item.quantityToConsume}, have ${fresh?.quantityOnHand ?? item.quantityOnHand}`,
      })
      continue
    }

    await tx.clinicStockMovement.create({
      data: {
        tenantId: params.tenantId,
        stockItemId: item.itemId,
        type: 'CONSUMPTION',
        quantityDelta: delta,
        note: item.movementNote,
        reference: `APPOINTMENT:${params.appointmentId}`,
        createdByUserId: params.createdByUserId ?? null,
      },
    })
    deducted.push({ itemId: item.itemId, name: item.name, qty: item.quantityToConsume })
  }

  return { deducted, skipped }
}
