import { NextRequest, NextResponse } from 'next/server'
import { ClinicReminderStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')?.trim().toUpperCase()
  const statusFilter = Object.values(ClinicReminderStatus).includes(status as ClinicReminderStatus)
    ? (status as ClinicReminderStatus)
    : null
  const deliveries = await prisma.clinicReminderDelivery.findMany({
    where: {
      tenantId: session.tenantId,
      ...(statusFilter ? { status: statusFilter } : {}),
    },
    orderBy: { scheduledFor: 'desc' },
    take: 50,
  })

  return NextResponse.json({ deliveries })
}
