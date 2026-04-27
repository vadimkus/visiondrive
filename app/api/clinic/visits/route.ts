import { NextRequest, NextResponse } from 'next/server'
import { ClinicAppointmentEventType, ClinicAppointmentStatus, ClinicVisitStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { handleLowStockNotificationsForItem } from '@/lib/clinic/inventory-low-stock-notify'
import { applyProcedureLinkedInventoryDeduction } from '@/lib/clinic/inventory-visit-consume'
import { applyPatientPackageDeduction } from '@/lib/clinic/patient-packages'
import { getClinicSession } from '@/lib/clinic/session'
import { writeAppointmentEvent } from '@/lib/clinic/appointments'

function parseVisitStatus(v: string): ClinicVisitStatus | null {
  const u = v.toUpperCase().trim()
  if (u === 'IN_PROGRESS' || u === 'COMPLETED' || u === 'CANCELLED') {
    return u as ClinicVisitStatus
  }
  return null
}

export async function POST(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const patientId = String(body.patientId ?? '').trim()
  const visitAtRaw = String(body.visitAt ?? '')
  const appointmentId =
    body.appointmentId != null && String(body.appointmentId).trim()
      ? String(body.appointmentId).trim()
      : null
  const treatmentPlanId =
    body.treatmentPlanId != null && String(body.treatmentPlanId).trim()
      ? String(body.treatmentPlanId).trim()
      : null

  if (!patientId || !visitAtRaw) {
    return NextResponse.json({ error: 'patientId and visitAt are required' }, { status: 400 })
  }

  const visitAt = new Date(visitAtRaw)
  if (Number.isNaN(visitAt.getTime())) {
    return NextResponse.json({ error: 'visitAt must be a valid ISO datetime' }, { status: 400 })
  }

  const patient = await prisma.clinicPatient.findFirst({
    where: { id: patientId, tenantId: session.tenantId },
    select: { id: true },
  })
  if (!patient) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
  }

  if (appointmentId) {
    const appt = await prisma.clinicAppointment.findFirst({
      where: {
        id: appointmentId,
        patientId,
        tenantId: session.tenantId,
      },
      select: { id: true },
    })
    if (!appt) {
      return NextResponse.json({ error: 'Appointment not found for this patient' }, { status: 400 })
    }
  }

  if (treatmentPlanId) {
    const plan = await prisma.clinicTreatmentPlan.findFirst({
      where: { id: treatmentPlanId, patientId, tenantId: session.tenantId },
      select: { id: true },
    })
    if (!plan) {
      return NextResponse.json({ error: 'Treatment plan not found for this patient' }, { status: 400 })
    }
  }

  const statusRaw = body.status != null ? String(body.status) : 'COMPLETED'
  const status = parseVisitStatus(statusRaw)
  if (!status) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const chiefComplaint =
    body.chiefComplaint != null ? String(body.chiefComplaint).trim() || null : null
  const procedureSummary =
    body.procedureSummary != null ? String(body.procedureSummary).trim() || null : null
  const staffNotes = body.staffNotes != null ? String(body.staffNotes).trim() || null : null
  const nextSteps = body.nextSteps != null ? String(body.nextSteps).trim() || null : null

  const { visit, inventoryDeduction, packageDeduction } = await prisma.$transaction(async (tx) => {
    let visit = await tx.clinicVisit.create({
      data: {
        tenantId: session.tenantId,
        patientId,
        appointmentId,
        treatmentPlanId,
        visitAt,
        status,
        chiefComplaint,
        procedureSummary,
        staffNotes,
        nextSteps,
      },
      select: {
        id: true,
        patientId: true,
        appointmentId: true,
        treatmentPlanId: true,
        visitAt: true,
        status: true,
        chiefComplaint: true,
        procedureSummary: true,
        staffNotes: true,
        nextSteps: true,
        inventoryConsumedAt: true,
        createdAt: true,
      },
    })

    let inventoryDeduction = {
      deducted: [] as { itemId: string; name: string; qty: number }[],
      skipped: [] as { itemId: string; name: string; reason: string }[],
    }

    if (visit.status === 'COMPLETED' && appointmentId) {
      inventoryDeduction = await applyProcedureLinkedInventoryDeduction(tx, {
        tenantId: session.tenantId,
        appointmentId,
        createdByUserId: session.userId,
      })
      visit = await tx.clinicVisit.update({
        where: { id: visit.id },
        data: { inventoryConsumedAt: new Date() },
        select: {
          id: true,
          patientId: true,
          appointmentId: true,
          treatmentPlanId: true,
          visitAt: true,
          status: true,
          chiefComplaint: true,
          procedureSummary: true,
          staffNotes: true,
          nextSteps: true,
          inventoryConsumedAt: true,
          createdAt: true,
        },
      })
      await tx.clinicAppointment.update({
        where: { id: appointmentId },
        data: { status: ClinicAppointmentStatus.COMPLETED, completedAt: new Date() },
      })
      const packageDeduction = await applyPatientPackageDeduction(tx, {
        tenantId: session.tenantId,
        patientId,
        visitId: visit.id,
        appointmentId,
        createdByUserId: session.userId,
      })
      await writeAppointmentEvent(tx, {
        tenantId: session.tenantId,
        appointmentId,
        type: ClinicAppointmentEventType.VISIT_COMPLETED,
        message: 'Visit completed',
        after: { visitId: visit.id, packageDeducted: packageDeduction.deducted },
        createdByUserId: session.userId,
      })
      if (packageDeduction.deducted) {
        await writeAppointmentEvent(tx, {
          tenantId: session.tenantId,
          appointmentId,
          type: ClinicAppointmentEventType.PACKAGE_DEBITED,
          message: `Package session used: ${packageDeduction.deducted.name}`,
          after: packageDeduction.deducted,
          createdByUserId: session.userId,
        })
      }
      return { visit, inventoryDeduction, packageDeduction }
    } else if (visit.status === 'IN_PROGRESS' && appointmentId) {
      await tx.clinicAppointment.update({
        where: { id: appointmentId },
        data: { status: ClinicAppointmentStatus.ARRIVED, arrivedAt: new Date() },
      })
      await writeAppointmentEvent(tx, {
        tenantId: session.tenantId,
        appointmentId,
        type: ClinicAppointmentEventType.VISIT_STARTED,
        message: 'Visit started',
        after: { visitId: visit.id },
        createdByUserId: session.userId,
      })
    }

    return { visit, inventoryDeduction, packageDeduction: { deducted: null, skipped: null } }
  })

  for (const d of inventoryDeduction.deducted) {
    void handleLowStockNotificationsForItem(d.itemId).catch((e) => console.error(e))
  }

  return NextResponse.json({ visit, inventoryDeduction, packageDeduction }, { status: 201 })
}
