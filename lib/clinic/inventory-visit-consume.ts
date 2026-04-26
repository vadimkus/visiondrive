import type { Prisma } from '@prisma/client'

export type VisitInventoryDeductionResult = {
  deducted: { itemId: string; name: string; qty: number }[]
  skipped: { itemId: string; name: string; reason: string }[]
}

/**
 * For a completed visit with an appointment that has a procedure: deduct
 * `consumePerVisit` from each active stock item linked to that procedure.
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

  const items = await tx.clinicStockItem.findMany({
    where: {
      tenantId: params.tenantId,
      active: true,
      procedureId: appt.procedureId,
      consumePerVisit: { gt: 0 },
    },
  })

  for (const item of items) {
    const delta = -item.consumePerVisit
    const updated = await tx.clinicStockItem.updateMany({
      where: {
        id: item.id,
        tenantId: params.tenantId,
        quantityOnHand: { gte: item.consumePerVisit },
      },
      data: { quantityOnHand: { decrement: item.consumePerVisit } },
    })

    if (updated.count !== 1) {
      const fresh = await tx.clinicStockItem.findUnique({
        where: { id: item.id },
        select: { quantityOnHand: true },
      })
      skipped.push({
        itemId: item.id,
        name: item.name,
        reason: `need ${item.consumePerVisit}, have ${fresh?.quantityOnHand ?? item.quantityOnHand}`,
      })
      continue
    }

    await tx.clinicStockMovement.create({
      data: {
        tenantId: params.tenantId,
        stockItemId: item.id,
        type: 'CONSUMPTION',
        quantityDelta: delta,
        note: 'Auto: visit completed',
        reference: `APPOINTMENT:${params.appointmentId}`,
        createdByUserId: params.createdByUserId ?? null,
      },
    })
    deducted.push({ itemId: item.id, name: item.name, qty: item.consumePerVisit })
  }

  return { deducted, skipped }
}
