import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const stockTake = await prisma.clinicStockCountSession.findFirst({
    where: { id, tenantId: session.tenantId },
    include: {
      lines: {
        orderBy: [{ stockItem: { name: 'asc' } }],
        include: {
          stockItem: {
            select: {
              id: true,
              name: true,
              sku: true,
              unit: true,
              quantityOnHand: true,
              active: true,
            },
          },
        },
      },
    },
  })

  if (!stockTake) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ stockTake })
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const stockTake = await prisma.clinicStockCountSession.findFirst({
    where: { id, tenantId: session.tenantId },
    select: { id: true, status: true },
  })

  if (!stockTake) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (stockTake.status !== 'DRAFT') {
    return NextResponse.json({ error: 'Only draft stock counts can be edited' }, { status: 400 })
  }

  const data: { title?: string; note?: string | null; status?: 'CANCELLED' } = {}
  if (body.title !== undefined) {
    const title = String(body.title).trim()
    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    data.title = title
  }
  if (body.note !== undefined) {
    data.note = body.note != null ? String(body.note).trim() || null : null
  }
  if (body.status !== undefined) {
    if (String(body.status).toUpperCase() !== 'CANCELLED') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    data.status = 'CANCELLED'
  }

  const updated = await prisma.clinicStockCountSession.update({
    where: { id },
    data,
  })

  return NextResponse.json({ stockTake: updated })
}
