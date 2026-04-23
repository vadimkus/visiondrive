import { NextRequest, NextResponse } from 'next/server'
import { ClinicVisitStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'

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

  const statusRaw = body.status != null ? String(body.status) : 'COMPLETED'
  const status = parseVisitStatus(statusRaw) ?? ClinicVisitStatus.COMPLETED

  const chiefComplaint =
    body.chiefComplaint != null ? String(body.chiefComplaint).trim() || null : null
  const procedureSummary =
    body.procedureSummary != null ? String(body.procedureSummary).trim() || null : null
  const staffNotes = body.staffNotes != null ? String(body.staffNotes).trim() || null : null
  const nextSteps = body.nextSteps != null ? String(body.nextSteps).trim() || null : null

  const visit = await prisma.clinicVisit.create({
    data: {
      tenantId: session.tenantId,
      patientId,
      appointmentId,
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
      visitAt: true,
      status: true,
      chiefComplaint: true,
      procedureSummary: true,
      staffNotes: true,
      nextSteps: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ visit }, { status: 201 })
}
