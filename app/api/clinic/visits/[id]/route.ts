import { NextRequest, NextResponse } from 'next/server'
import { ClinicAppointmentEventType, ClinicAppointmentStatus, ClinicVisitStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { handleLowStockNotificationsForItem } from '@/lib/clinic/inventory-low-stock-notify'
import { applyProcedureLinkedInventoryDeduction } from '@/lib/clinic/inventory-visit-consume'
import { applyPatientPackageDeduction } from '@/lib/clinic/patient-packages'
import { renderAftercareTemplate } from '@/lib/clinic/aftercare'
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
      visitAt: true,
      appointmentId: true,
      patientId: true,
      treatmentPlanId: true,
      inventoryConsumedAt: true,
      patient: { select: { firstName: true, lastName: true } },
      appointment: {
        select: {
          titleOverride: true,
          procedureId: true,
          procedure: { select: { id: true, name: true } },
        },
      },
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
    aftercareTemplateId?: string | null
    aftercareTitleSnapshot?: string | null
    aftercareTextSnapshot?: string | null
    aftercareDocumentNameSnapshot?: string | null
    aftercareDocumentUrlSnapshot?: string | null
    aftercareSentAt?: Date | null
    treatmentPlanId?: string | null
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
  if (body.aftercareTemplateId !== undefined) {
    const aftercareTemplateId =
      body.aftercareTemplateId != null && String(body.aftercareTemplateId).trim()
        ? String(body.aftercareTemplateId).trim()
        : null
    if (!aftercareTemplateId) {
      data.aftercareTemplateId = null
      data.aftercareTitleSnapshot = null
      data.aftercareTextSnapshot = null
      data.aftercareDocumentNameSnapshot = null
      data.aftercareDocumentUrlSnapshot = null
      data.aftercareSentAt = null
    } else {
      const template = await prisma.clinicAftercareTemplate.findFirst({
        where: {
          id: aftercareTemplateId,
          tenantId: session.tenantId,
          active: true,
          ...(existing.appointment?.procedureId
            ? { OR: [{ procedureId: existing.appointment.procedureId }, { procedureId: null }] }
            : {}),
        },
        include: { procedure: { select: { id: true, name: true } } },
      })
      if (!template) {
        return NextResponse.json({ error: 'Aftercare template not found' }, { status: 400 })
      }
      const visitAtForRender = data.visitAt ?? existing.visitAt
      const rendered = renderAftercareTemplate(
        template.messageBody || '',
        {
          patient: existing.patient,
          procedure: existing.appointment?.procedure ?? template.procedure,
          titleOverride: existing.appointment?.titleOverride ?? null,
          visitAt: visitAtForRender,
        },
        'en-GB'
      )
      data.aftercareTemplateId = template.id
      data.aftercareTitleSnapshot = template.title
      data.aftercareTextSnapshot = rendered || null
      data.aftercareDocumentNameSnapshot = template.documentName
      data.aftercareDocumentUrlSnapshot = template.documentUrl
      data.aftercareSentAt = body.aftercareSent === true ? new Date() : null
      if (body.nextSteps === undefined && rendered) data.nextSteps = rendered
    }
  }
  if (body.treatmentPlanId !== undefined) {
    const treatmentPlanId =
      body.treatmentPlanId != null && String(body.treatmentPlanId).trim()
        ? String(body.treatmentPlanId).trim()
        : null
    if (treatmentPlanId) {
      const plan = await prisma.clinicTreatmentPlan.findFirst({
        where: { id: treatmentPlanId, patientId: existing.patientId, tenantId: session.tenantId },
        select: { id: true },
      })
      if (!plan) {
        return NextResponse.json({ error: 'Treatment plan not found for this patient' }, { status: 400 })
      }
    }
    data.treatmentPlanId = treatmentPlanId
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const nextStatus = data.status ?? existing.status
  const shouldConsumeInventory =
    nextStatus === 'COMPLETED' &&
    !existing.inventoryConsumedAt &&
    !!existing.appointmentId

  const { visit, inventoryDeduction, packageDeduction } = await prisma.$transaction(async (tx) => {
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
        aftercareTemplateId: true,
        aftercareTitleSnapshot: true,
        aftercareTextSnapshot: true,
        aftercareDocumentNameSnapshot: true,
        aftercareDocumentUrlSnapshot: true,
        aftercareSentAt: true,
        treatmentPlanId: true,
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
      const packageDeduction = await applyPatientPackageDeduction(tx, {
        tenantId: session.tenantId,
        patientId: existing.patientId,
        visitId: id,
        appointmentId: existing.appointmentId,
        createdByUserId: session.userId,
      })
      await tx.clinicAppointment.update({
        where: { id: existing.appointmentId },
        data: { status: ClinicAppointmentStatus.COMPLETED, completedAt: new Date() },
      })
      await writeAppointmentEvent(tx, {
        tenantId: session.tenantId,
        appointmentId: existing.appointmentId,
        type: ClinicAppointmentEventType.VISIT_COMPLETED,
        message: 'Visit completed',
        after: { visitId: id, packageDeducted: packageDeduction.deducted },
        createdByUserId: session.userId,
      })
      if (packageDeduction.deducted) {
        await writeAppointmentEvent(tx, {
          tenantId: session.tenantId,
          appointmentId: existing.appointmentId,
          type: ClinicAppointmentEventType.PACKAGE_DEBITED,
          message: `Package session used: ${packageDeduction.deducted.name}`,
          after: packageDeduction.deducted,
          createdByUserId: session.userId,
        })
      }
      return { visit: v, inventoryDeduction, packageDeduction }
    }

    return { visit: v, inventoryDeduction, packageDeduction: { deducted: null, skipped: null } }
  })

  for (const d of inventoryDeduction.deducted) {
    void handleLowStockNotificationsForItem(d.itemId).catch((e) => console.error(e))
  }

  return NextResponse.json({ visit, inventoryDeduction, packageDeduction })
}
