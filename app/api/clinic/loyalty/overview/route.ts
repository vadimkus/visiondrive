import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildLoyaltyRows, normalizeLoyaltyLocale, summarizeLoyalty } from '@/lib/clinic/loyalty'
import { getClinicSession } from '@/lib/clinic/session'

function normalizedName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim().toLowerCase()
}

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const locale = normalizeLoyaltyLocale(new URL(request.url).searchParams.get('locale'))

  const patients = await prisma.clinicPatient.findMany({
    where: { tenantId: session.tenantId },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    take: 5000,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      referredByName: true,
      appointments: {
        select: { status: true },
        take: 200,
      },
      payments: {
        select: { amountCents: true, status: true, reference: true },
        take: 200,
      },
      packages: {
        select: { id: true },
        take: 50,
      },
    },
  })

  const patientIdByName = new Map(patients.map((patient) => [normalizedName(patient.firstName, patient.lastName), patient.id]))
  const referralCounts = new Map<string, number>()
  for (const patient of patients) {
    const referrer = String(patient.referredByName ?? '').trim().toLowerCase()
    const referrerId = patientIdByName.get(referrer)
    if (referrerId) {
      referralCounts.set(referrerId, (referralCounts.get(referrerId) ?? 0) + 1)
    }
  }

  const rows = buildLoyaltyRows({ patients, referralCounts, locale }).slice(0, 100)

  return NextResponse.json({
    locale,
    summary: summarizeLoyalty(rows),
    rows,
  })
}
