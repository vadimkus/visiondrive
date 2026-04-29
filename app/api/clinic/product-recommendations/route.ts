import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'
import { buildRetailRecommendations } from '@/lib/clinic/retail-recommendations'

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const procedureId = request.nextUrl.searchParams.get('procedureId')?.trim() || null
  const patientId = request.nextUrl.searchParams.get('patientId')?.trim() || null
  const since = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)

  if (procedureId) {
    const procedure = await prisma.clinicProcedure.findFirst({
      where: { id: procedureId, tenantId: session.tenantId },
      select: { id: true },
    })
    if (!procedure) {
      return NextResponse.json({ error: 'Procedure not found' }, { status: 404 })
    }
  }

  if (patientId) {
    const patient = await prisma.clinicPatient.findFirst({
      where: { id: patientId, tenantId: session.tenantId },
      select: { id: true },
    })
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }
  }

  const [items, recentSaleLines] = await Promise.all([
    prisma.clinicStockItem.findMany({
      where: { tenantId: session.tenantId, active: true },
      include: { procedure: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
    }),
    prisma.clinicProductSaleLine.findMany({
      where: {
        tenantId: session.tenantId,
        productSale: { soldAt: { gte: since } },
      },
      select: {
        stockItemId: true,
        quantity: true,
        unitPriceCents: true,
        productSale: { select: { patientId: true, soldAt: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 300,
    }),
  ])

  const recommendations = buildRetailRecommendations({
    items,
    recentSaleLines,
    procedureId,
    patientId,
    limit: 6,
  })

  return NextResponse.json({ recommendations })
}
