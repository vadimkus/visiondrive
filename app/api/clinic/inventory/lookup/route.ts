import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isClinicStockLow } from '@/lib/clinic/inventory'
import { getClinicSession } from '@/lib/clinic/session'

/** Resolve a stock item by barcode, SKU, or exact name (for scanners). */
export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const q = request.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (q.length < 1) {
    return NextResponse.json({ error: 'q is required' }, { status: 400 })
  }

  const tenantId = session.tenantId

  const item = await prisma.clinicStockItem.findFirst({
    where: {
      tenantId,
      active: true,
      OR: [{ barcode: q }, { sku: q }, { name: { equals: q, mode: 'insensitive' } }],
    },
    include: { procedure: { select: { id: true, name: true } } },
  })

  if (!item) {
    return NextResponse.json({ item: null }, { status: 200 })
  }

  return NextResponse.json({
    item: { ...item, lowStock: isClinicStockLow(item) },
  })
}
