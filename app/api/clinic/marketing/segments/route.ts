import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  buildMarketingSegmentRows,
  MARKETING_SEGMENTS,
  normalizeMarketingDays,
  normalizeMarketingLocale,
  normalizeMarketingSegment,
} from '@/lib/clinic/marketing-automation'
import { getClinicSession } from '@/lib/clinic/session'

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const segment = normalizeMarketingSegment(searchParams.get('segment'))
  const locale = normalizeMarketingLocale(searchParams.get('locale'))
  const days = normalizeMarketingDays(segment, searchParams.get('days'))
  const tag = searchParams.get('tag')?.trim() || null
  const procedureId = searchParams.get('procedureId')?.trim() || null

  const [patients, procedures] = await Promise.all([
    prisma.clinicPatient.findMany({
      where: { tenantId: session.tenantId },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      take: 5000,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        tags: true,
        dateOfBirth: true,
        appointments: {
          orderBy: { startsAt: 'desc' },
          take: 50,
          select: {
            startsAt: true,
            status: true,
            titleOverride: true,
            procedure: { select: { id: true, name: true } },
          },
        },
        packages: {
          orderBy: [{ status: 'asc' }, { purchasedAt: 'desc' }],
          take: 20,
          select: {
            name: true,
            status: true,
            remainingSessions: true,
            procedure: { select: { id: true, name: true } },
          },
        },
      },
    }),
    prisma.clinicProcedure.findMany({
      where: { tenantId: session.tenantId, active: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
      take: 500,
    }),
  ])

  const rows = buildMarketingSegmentRows(patients, {
    segment,
    locale,
    days,
    tag,
    procedureId,
  }).slice(0, 100)
  const availableTags = Array.from(new Set(patients.flatMap((patient) => patient.tags))).sort((a, b) =>
    a.localeCompare(b)
  )

  return NextResponse.json({
    segment,
    locale,
    days,
    tag,
    procedureId,
    segments: MARKETING_SEGMENTS,
    availableTags,
    procedures,
    summary: {
      matchingPatients: rows.length,
      withWhatsapp: rows.filter((row) => row.whatsappUrl).length,
      missingWhatsapp: rows.filter((row) => !row.whatsappUrl).length,
    },
    rows,
  })
}
