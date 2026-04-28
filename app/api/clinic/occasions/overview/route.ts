import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  buildBirthdayMessage,
  buildBirthdayOccasionRows,
  buildBirthdayWhatsappUrl,
  normalizeOccasionLocale,
  normalizeOccasionRange,
} from '@/lib/clinic/occasions'
import { getClinicSession } from '@/lib/clinic/session'

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const now = new Date()
  const days = normalizeOccasionRange(searchParams.get('range'))
  const locale = normalizeOccasionLocale(searchParams.get('locale'))

  const patients = await prisma.clinicPatient.findMany({
    where: { tenantId: session.tenantId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      dateOfBirth: true,
    },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    take: 5000,
  })

  const birthdays = buildBirthdayOccasionRows(patients, now, days).slice(0, 50)

  return NextResponse.json({
    range: {
      start: now.toISOString(),
      end: new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString(),
      days,
    },
    summary: {
      upcomingBirthdays: birthdays.length,
      withWhatsapp: birthdays.filter((row) => buildBirthdayWhatsappUrl(row, locale)).length,
      missingWhatsapp: birthdays.filter((row) => !buildBirthdayWhatsappUrl(row, locale)).length,
    },
    birthdays: birthdays.map((row) => {
      const message = buildBirthdayMessage(row, locale)
      return {
        ...row,
        dateOfBirth: row.dateOfBirth.toISOString(),
        nextBirthdayAt: row.nextBirthdayAt.toISOString(),
        birthdayMessage: message,
        whatsappUrl: buildBirthdayWhatsappUrl(row, locale),
        actionHref: `/clinic/patients/${row.patientId}`,
      }
    }),
  })
}
