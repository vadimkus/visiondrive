import { NextRequest, NextResponse } from 'next/server'
import { ClinicAppointmentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'

const ACTIVE_STATUSES = [
  ClinicAppointmentStatus.SCHEDULED,
  ClinicAppointmentStatus.CONFIRMED,
  ClinicAppointmentStatus.ARRIVED,
  ClinicAppointmentStatus.COMPLETED,
]

function normalizeArea(value: string | null | undefined) {
  const trimmed = String(value ?? '').trim()
  return trimmed || null
}

function rangeDays(value: string | null) {
  if (value === '90d') return 90
  return 30
}

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const days = rangeDays(searchParams.get('range'))
  const now = new Date()
  const to = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
  const completedFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

  const [patients, upcomingAppointments, completedAppointments] = await Promise.all([
    prisma.clinicPatient.findMany({
      where: { tenantId: session.tenantId },
      select: { id: true, firstName: true, lastName: true, area: true, homeAddress: true },
      orderBy: [{ area: 'asc' }, { lastName: 'asc' }, { firstName: 'asc' }],
      take: 5000,
    }),
    prisma.clinicAppointment.findMany({
      where: {
        tenantId: session.tenantId,
        status: { in: ACTIVE_STATUSES },
        startsAt: { gte: now, lt: to },
      },
      select: {
        id: true,
        startsAt: true,
        locationArea: true,
        patient: { select: { id: true, firstName: true, lastName: true, area: true } },
        procedure: { select: { name: true } },
        titleOverride: true,
      },
      orderBy: { startsAt: 'asc' },
      take: 500,
    }),
    prisma.clinicAppointment.findMany({
      where: {
        tenantId: session.tenantId,
        status: ClinicAppointmentStatus.COMPLETED,
        startsAt: { gte: completedFrom, lt: now },
      },
      select: {
        id: true,
        startsAt: true,
        locationArea: true,
        patient: { select: { id: true, area: true } },
      },
      orderBy: { startsAt: 'desc' },
      take: 1000,
    }),
  ])

  const areas = new Map<
    string,
    {
      area: string
      patientCount: number
      upcomingAppointments: number
      completedLast90: number
      nextVisitAt: string | null
      nextVisitPatient: string | null
      nextVisitService: string | null
      patientIds: Set<string>
    }
  >()

  const ensureArea = (area: string) => {
    const existing = areas.get(area)
    if (existing) return existing
    const created = {
      area,
      patientCount: 0,
      upcomingAppointments: 0,
      completedLast90: 0,
      nextVisitAt: null,
      nextVisitPatient: null,
      nextVisitService: null,
      patientIds: new Set<string>(),
    }
    areas.set(area, created)
    return created
  }

  let unassignedPatients = 0
  for (const patient of patients) {
    const area = normalizeArea(patient.area)
    if (!area) {
      unassignedPatients += 1
      continue
    }
    const row = ensureArea(area)
    if (!row.patientIds.has(patient.id)) {
      row.patientIds.add(patient.id)
      row.patientCount += 1
    }
  }

  for (const appointment of upcomingAppointments) {
    const area = normalizeArea(appointment.locationArea) ?? normalizeArea(appointment.patient.area)
    if (!area) continue
    const row = ensureArea(area)
    row.upcomingAppointments += 1
    if (!row.nextVisitAt) {
      row.nextVisitAt = appointment.startsAt.toISOString()
      row.nextVisitPatient = `${appointment.patient.firstName} ${appointment.patient.lastName}`.trim()
      row.nextVisitService = appointment.procedure?.name || appointment.titleOverride || null
    }
  }

  for (const appointment of completedAppointments) {
    const area = normalizeArea(appointment.locationArea) ?? normalizeArea(appointment.patient.area)
    if (!area) continue
    ensureArea(area).completedLast90 += 1
  }

  const rows = Array.from(areas.values())
    .map((row) => ({
      area: row.area,
      patientCount: row.patientCount,
      upcomingAppointments: row.upcomingAppointments,
      completedLast90: row.completedLast90,
      nextVisitAt: row.nextVisitAt,
      nextVisitPatient: row.nextVisitPatient,
      nextVisitService: row.nextVisitService,
    }))
    .sort((a, b) => {
      if (b.upcomingAppointments !== a.upcomingAppointments) {
        return b.upcomingAppointments - a.upcomingAppointments
      }
      if (b.patientCount !== a.patientCount) return b.patientCount - a.patientCount
      return a.area.localeCompare(b.area)
    })

  return NextResponse.json({
    range: { days, from: now.toISOString(), to: to.toISOString() },
    totals: {
      areas: rows.length,
      assignedPatients: patients.length - unassignedPatients,
      unassignedPatients,
      upcomingAppointments: upcomingAppointments.length,
      completedLast90: completedAppointments.length,
    },
    areas: rows,
  })
}
