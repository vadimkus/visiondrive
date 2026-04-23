import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'

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

  const [patientCount, procedureCount, appointmentToday, appointmentUpcoming] = await Promise.all([
    prisma.clinicPatient.count({ where: { tenantId } }),
    prisma.clinicProcedure.count({ where: { tenantId, active: true } }),
    prisma.clinicAppointment.count({
      where: {
        tenantId,
        startsAt: { gte: startOfDay, lt: endOfDay },
        status: { not: 'CANCELLED' },
      },
    }),
    prisma.clinicAppointment.count({
      where: {
        tenantId,
        startsAt: { gte: new Date() },
        status: 'SCHEDULED',
      },
    }),
  ])

  return NextResponse.json({
    patientCount,
    procedureCount,
    appointmentToday,
    appointmentUpcoming,
  })
}
