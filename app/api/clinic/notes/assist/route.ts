import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildVisitNoteDraft } from '@/lib/clinic/note-assistant'
import { getClinicSession } from '@/lib/clinic/session'

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
  if (!patientId) {
    return NextResponse.json({ error: 'patientId is required' }, { status: 400 })
  }

  const patient = await prisma.clinicPatient.findFirst({
    where: { id: patientId, tenantId: session.tenantId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      appointments: {
        orderBy: { startsAt: 'desc' },
        take: 1,
        select: { procedure: { select: { name: true } }, titleOverride: true },
      },
      visits: {
        orderBy: { visitAt: 'desc' },
        take: 1,
        select: { procedureSummary: true, nextSteps: true },
      },
    },
  })

  if (!patient) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
  }

  const latestAppointment = patient.appointments[0]
  const latestVisit = patient.visits[0]
  const draft = buildVisitNoteDraft({
    locale: body.locale != null ? String(body.locale) : 'en',
    patientName: `${patient.firstName} ${patient.lastName}`.trim(),
    procedureName: latestAppointment?.procedure?.name || latestAppointment?.titleOverride || null,
    rawNote: body.rawNote,
    chiefComplaint: body.chiefComplaint,
    procedureSummary: body.procedureSummary,
    nextSteps: body.nextSteps,
    staffNotes: body.staffNotes,
    lastVisitSummary: [latestVisit?.procedureSummary, latestVisit?.nextSteps]
      .filter((part): part is string => Boolean(part?.trim()))
      .join(' / '),
  })

  return NextResponse.json({ draft })
}
