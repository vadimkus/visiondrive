import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isClinicStockLow } from '@/lib/clinic/inventory'
import { getClinicSession } from '@/lib/clinic/session'
import { publicBookingSettingsFromThresholds } from '@/lib/clinic/public-booking-settings'

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tenantId = session.tenantId
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(startOfDay)
  endOfDay.setDate(endOfDay.getDate() + 1)

  try {
    const [tenant, procedures, patientCount, procedureCount, appointmentToday, appointmentUpcoming, stockItems] =
      await Promise.all([
        prisma.tenant.findFirst({
          where: { id: tenantId },
          select: { name: true, slug: true, settings: { select: { thresholds: true } } },
        }),
        prisma.clinicProcedure.findMany({
          where: { tenantId, active: true },
          select: { id: true, name: true },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
          take: 12,
        }),
        prisma.clinicPatient.count({ where: { tenantId } }),
        prisma.clinicProcedure.count({ where: { tenantId, active: true } }),
        prisma.clinicAppointment.count({
          where: {
            tenantId,
            startsAt: { gte: startOfDay, lt: endOfDay },
            status: { in: ['SCHEDULED', 'CONFIRMED', 'ARRIVED', 'COMPLETED'] },
          },
        }),
        prisma.clinicAppointment.count({
          where: {
            tenantId,
            startsAt: { gte: new Date() },
            status: { in: ['SCHEDULED', 'CONFIRMED'] },
          },
        }),
        prisma.clinicStockItem.findMany({
          where: { tenantId, active: true },
          select: { quantityOnHand: true, reorderPoint: true, active: true },
        }),
      ])

    const lowStockCount = stockItems.filter((i) => isClinicStockLow(i)).length
    const publicBooking = publicBookingSettingsFromThresholds(tenant?.settings?.thresholds)

    return NextResponse.json({
      patientCount,
      procedureCount,
      appointmentToday,
      appointmentUpcoming,
      lowStockCount,
      bookingUrl: tenant?.slug ? `/book/${tenant.slug}` : null,
      practiceName: tenant?.name ?? null,
      bookingProcedures: procedures,
      publicBookingEnabled: publicBooking.enabled,
      publicBookingConfirmationMode: publicBooking.confirmationMode,
    })
  } catch (e) {
    console.error('GET /api/clinic/stats', e)
    const msg = e instanceof Error ? e.message : 'Database error'
    return NextResponse.json({ error: msg }, { status: 503 })
  }
}
