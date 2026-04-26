import { NextRequest, NextResponse } from 'next/server'
import { anamnesisFromJson } from '@/lib/clinic/anamnesis'
import { buildClinicPatientSummaryPdf } from '@/lib/clinic/patient-summary-pdf'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'

function appointmentLabel(
  procedureName: string | null | undefined,
  titleOverride: string | null | undefined
): string {
  return procedureName?.trim() || titleOverride?.trim() || 'Appointment'
}

function safeFilenamePart(s: string): string {
  return s.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'patient'
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

  const patient = await prisma.clinicPatient.findFirst({
    where: { id, tenantId: session.tenantId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      middleName: true,
      dateOfBirth: true,
      phone: true,
      email: true,
      anamnesisJson: true,
      tenant: { select: { name: true } },
      appointments: {
        where: {
          startsAt: { gte: twelveMonthsAgo },
          status: { not: 'CANCELLED' },
        },
        orderBy: { startsAt: 'asc' },
        take: 80,
        select: {
          startsAt: true,
          status: true,
          titleOverride: true,
          procedure: { select: { name: true } },
        },
      },
      visits: {
        where: { visitAt: { gte: twelveMonthsAgo } },
        orderBy: { visitAt: 'desc' },
        take: 40,
        select: { visitAt: true },
      },
    },
  })

  if (!patient) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const isUpcomingScheduled = (a: (typeof patient.appointments)[0]) =>
    a.status === 'SCHEDULED' && a.startsAt.getTime() >= startOfToday.getTime()

  const upcoming = patient.appointments.filter(isUpcomingScheduled)
  const pastAppts = patient.appointments
    .filter((a) => !isUpcomingScheduled(a))
    .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime())
    .slice(0, 25)

  const pdfInput = {
    practiceName: patient.tenant.name,
    generatedAt: new Date(),
    patient: {
      firstName: patient.firstName,
      lastName: patient.lastName,
      middleName: patient.middleName,
      dateOfBirth: patient.dateOfBirth,
      phone: patient.phone,
      email: patient.email,
    },
    anamnesis: anamnesisFromJson(patient.anamnesisJson),
    upcomingAppointments: upcoming.map((a) => ({
      startsAt: a.startsAt,
      label: appointmentLabel(a.procedure?.name, a.titleOverride),
    })),
    pastAppointmentSummaries: pastAppts.map((a) => ({
      startsAt: a.startsAt,
      label: appointmentLabel(a.procedure?.name, a.titleOverride),
    })),
    visitDates: patient.visits.map((v) => ({ visitAt: v.visitAt })),
  }

  const arrayBuffer = buildClinicPatientSummaryPdf(pdfInput)
  const buf = Buffer.from(arrayBuffer)

  const fname = `patient-summary-${safeFilenamePart(patient.lastName)}-${patient.id.slice(0, 8)}.pdf`

  return new NextResponse(buf, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fname}"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
