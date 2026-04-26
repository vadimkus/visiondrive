import { NextRequest, NextResponse } from 'next/server'
import { ClinicAppointmentEventType, ClinicAppointmentStatus, ClinicVisitStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { handleLowStockNotificationsForItem } from '@/lib/clinic/inventory-low-stock-notify'
import { applyProcedureLinkedInventoryDeduction } from '@/lib/clinic/inventory-visit-consume'
import { getClinicSession } from '@/lib/clinic/session'
import { writeAppointmentEvent } from '@/lib/clinic/appointments'

function parseVisitStatus(v: string): ClinicVisitStatus | null {
  const u = v.toUpperCase().trim()
  if (u === 'IN_PROGRESS' || u === 'COMPLETED' || u === 'CANCELLED') {
    return u as ClinicVisitStatus
  }
  return null
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const existing = await prisma.clinicVisit.findFirst({
    where: { id, tenantId: session.tenantId },
    select: {
      id: true,
      status: true,
      appointmentId: true,
      inventoryConsumedAt: true,
    },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const data: {
    visitAt?: Date
    status?: ClinicVisitStatus
    chiefComplaint?: string | null
    procedureSummary?: string | null
    staffNotes?: string | null
    nextSteps?: string | null
  } = {}

  if (body.visitAt !== undefined) {
    const d = new Date(String(body.visitAt))
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json({ error: 'visitAt must be a valid ISO datetime' }, { status: 400 })
    }
    data.visitAt = d
  }
  if (body.status !== undefined) {
    const s = parseVisitStatus(String(body.status))
    if (!s) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    data.status = s
  }
  if (body.chiefComplaint !== undefined) {
    data.chiefComplaint = body.chiefComplaint == null ? null : String(body.chiefComplaint).trim() || null
  }
  if (body.procedureSummary !== undefined) {
    data.procedureSummary =
      body.procedureSummary == null ? null : String(body.procedureSummary).trim() || null
  }
  if (body.staffNotes !== undefined) {
    data.staffNotes = body.staffNotes == null ? null : String(body.staffNotes).trim() || null
  }
  if (body.nextSteps !== undefined) {
    data.nextSteps = body.nextSteps == null ? null : String(body.nextSteps).trim() || null
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const nextStatus = data.status ?? existing.status
  const shouldConsumeInventory =
    nextStatus === 'COMPLETED' &&
    !existing.inventoryConsumedAt &&
    !!existing.appointmentId

  const { visit, inventoryDeduction } = await prisma.$transaction(async (tx) => {
    let v = await tx.clinicVisit.update({
      where: { id },
      data,
      select: {
        id: true,
        patientId: true,
        visitAt: true,
        status: true,
        chiefComplaint: true,
        procedureSummary: true,
        staffNotes: true,
        nextSteps: true,
        inventoryConsumedAt: true,
        updatedAt: true,
        appointmentId: true,
      },
    })

    let inventoryDeduction = {
      deducted: [] as { itemId: string; name: string; qty: number }[],
      skipped: [] as { itemId: string; name: string; reason: string }[],
    }

    if (shouldConsumeInventory && existing.appointmentId) {
      const consumedAt = new Date()
      const claimed = await tx.clinicVisit.updateMany({
        where: { id, tenantId: session.tenantId, inventoryConsumedAt: null },
        data: { inventoryConsumedAt: consumedAt },
      })
      if (claimed.count === 1) {
        inventoryDeduction = await applyProcedureLinkedInventoryDeduction(tx, {
          tenantId: session.tenantId,
          appointmentId: existing.appointmentId,
          createdByUserId: session.userId,
        })
        v = { ...v, inventoryConsumedAt: consumedAt }
      }
    }

    if (existing.appointmentId && data.status === ClinicVisitStatus.COMPLETED) {
      await tx.clinicAppointment.update({
        where: { id: existing.appointmentId },
        data: { status: ClinicAppointmentStatus.COMPLETED, completedAt: new Date() },
      })
      await writeAppointmentEvent(tx, {
        tenantId: session.tenantId,
        appointmentId: existing.appointmentId,
        type: ClinicAppointmentEventType.VISIT_COMPLETED,
        message: 'Visit completed',
        after: { visitId: id },
        createdByUserId: session.userId,
      })
    }

    return { visit: v, inventoryDeduction }
  })

  for (const d of inventoryDeduction.deducted) {
    void handleLowStockNotificationsForItem(d.itemId).catch((e) => console.error(e))
  }

  return NextResponse.json({ visit, inventoryDeduction })
}
