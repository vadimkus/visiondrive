import { NextRequest, NextResponse } from 'next/server'
import { ClinicAppointmentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  buildReferralSourceSummary,
  normalizeReferralRange,
  referralPatientName,
  referralRangeStart,
} from '@/lib/clinic/referrals'
import { getClinicSession } from '@/lib/clinic/session'

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const now = new Date()
  const range = normalizeReferralRange(searchParams.get('range'))
  const start = referralRangeStart(range, now)

  const patients = await prisma.clinicPatient.findMany({
    where: {
      tenantId: session.tenantId,
      referredByName: { not: null },
      ...(start ? { createdAt: { gte: start, lte: now } } : {}),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      createdAt: true,
      referredByName: true,
      referralNote: true,
      appointments: {
        where: { status: ClinicAppointmentStatus.COMPLETED },
        select: { id: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 1000,
  })

  const reportPatients = patients.map((patient) => ({
    id: patient.id,
    firstName: patient.firstName,
    lastName: patient.lastName,
    phone: patient.phone,
    email: patient.email,
    createdAt: patient.createdAt,
    referredByName: patient.referredByName,
    referralNote: patient.referralNote,
    completedAppointments: patient.appointments.length,
  }))
  const sources = buildReferralSourceSummary(reportPatients)

  return NextResponse.json({
    range: {
      start: start?.toISOString() ?? null,
      end: now.toISOString(),
      range,
    },
    summary: {
      referredPatients: reportPatients.length,
      referralSources: sources.length,
      completedAppointments: reportPatients.reduce((sum, patient) => sum + patient.completedAppointments, 0),
    },
    sources,
    recentPatients: reportPatients.slice(0, 25).map((patient) => ({
      patientId: patient.id,
      patientName: referralPatientName(patient),
      phone: patient.phone,
      email: patient.email,
      createdAt: patient.createdAt.toISOString(),
      referredByName: patient.referredByName,
      referralNote: patient.referralNote,
      completedAppointments: patient.completedAppointments,
      actionHref: `/clinic/patients/${patient.id}`,
    })),
  })
}
