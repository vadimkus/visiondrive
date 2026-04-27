import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildConsentSnapshot, consentAcceptedAt } from '@/lib/clinic/consents'
import { getClinicSession } from '@/lib/clinic/session'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: patientId } = await context.params
  const patient = await prisma.clinicPatient.findFirst({
    where: { id: patientId, tenantId: session.tenantId },
    select: { id: true },
  })
  if (!patient) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
  }

  const consents = await prisma.clinicConsentRecord.findMany({
    where: { tenantId: session.tenantId, patientId },
    include: {
      procedure: { select: { id: true, name: true } },
      visit: { select: { id: true, visitAt: true } },
      appointment: { select: { id: true, startsAt: true } },
      template: { select: { id: true, title: true, active: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ consents })
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

  const { id: patientId } = await context.params
  const patient = await prisma.clinicPatient.findFirst({
    where: { id: patientId, tenantId: session.tenantId },
    select: { id: true, firstName: true, lastName: true, middleName: true },
  })
  if (!patient) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
  }

  const templateId = String(body.templateId ?? '').trim()
  if (!templateId) {
    return NextResponse.json({ error: 'templateId is required' }, { status: 400 })
  }

  const template = await prisma.clinicConsentTemplate.findFirst({
    where: { id: templateId, tenantId: session.tenantId, active: true },
    select: {
      id: true,
      title: true,
      body: true,
      contraindications: true,
      procedureId: true,
      aftercareText: true,
    },
  })
  if (!template) {
    return NextResponse.json({ error: 'Consent template not found' }, { status: 404 })
  }

  const appointmentId =
    body.appointmentId != null && String(body.appointmentId).trim()
      ? String(body.appointmentId).trim()
      : null
  const visitId =
    body.visitId != null && String(body.visitId).trim() ? String(body.visitId).trim() : null

  if (visitId) {
    const visit = await prisma.clinicVisit.findFirst({
      where: { id: visitId, tenantId: session.tenantId, patientId },
      select: { id: true },
    })
    if (!visit) {
      return NextResponse.json({ error: 'Visit not found for this patient' }, { status: 400 })
    }
  }

  if (appointmentId) {
    const appointment = await prisma.clinicAppointment.findFirst({
      where: { id: appointmentId, tenantId: session.tenantId, patientId },
      select: { id: true },
    })
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found for this patient' }, { status: 400 })
    }
  }

  const patientName =
    String(body.patientNameSnapshot ?? '').trim() ||
    [patient.firstName, patient.middleName, patient.lastName].filter(Boolean).join(' ')
  const accepted = body.accepted === true
  const acceptedAt = consentAcceptedAt({ accepted, acceptedAt: body.acceptedAt as string | null })
  const signatureText = String(body.signatureText ?? '').trim().slice(0, 240) || null
  const aftercareAcknowledged = body.aftercareAcknowledged === true

  if (!accepted || !signatureText) {
    return NextResponse.json(
      { error: 'Patient acceptance and signature text are required' },
      { status: 400 }
    )
  }

  const snapshot = buildConsentSnapshot({
    templateTitle: template.title,
    templateBody: template.body,
    contraindications: template.contraindications,
    checkedItems: body.checkedItems as string[] | undefined,
    patientName,
  })

  const consent = await prisma.clinicConsentRecord.create({
    data: {
      tenantId: session.tenantId,
      patientId,
      templateId: template.id,
      procedureId: template.procedureId,
      appointmentId,
      visitId,
      ...snapshot,
      accepted,
      acceptedAt,
      signatureText,
      aftercareAcknowledged,
      note: String(body.note ?? '').trim().slice(0, 2000) || null,
      createdByUserId: session.userId,
    },
    include: {
      procedure: { select: { id: true, name: true } },
      visit: { select: { id: true, visitAt: true } },
      appointment: { select: { id: true, startsAt: true } },
      template: { select: { id: true, title: true, active: true } },
    },
  })

  return NextResponse.json({ consent }, { status: 201 })
}
