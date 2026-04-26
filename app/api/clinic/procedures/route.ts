import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const procedures = await prisma.clinicProcedure.findMany({
    where: { tenantId: session.tenantId },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  })

  return NextResponse.json({ procedures })
}

export async function POST(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const name = String(body.name ?? '').trim()
  if (!name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const defaultDurationMin =
    body.defaultDurationMin != null ? Number(body.defaultDurationMin) : 60
  const bufferAfterMinutes =
    body.bufferAfterMinutes != null ? Number(body.bufferAfterMinutes) : 0
  const basePriceCents = body.basePriceCents != null ? Number(body.basePriceCents) : 0
  const currency = body.currency != null ? String(body.currency).trim().toUpperCase() || 'AED' : 'AED'
  const active = body.active !== false
  const sortOrder = body.sortOrder != null ? Number(body.sortOrder) : 0

  if (!Number.isFinite(defaultDurationMin) || defaultDurationMin < 5 || defaultDurationMin > 24 * 60) {
    return NextResponse.json({ error: 'defaultDurationMin must be between 5 and 1440' }, { status: 400 })
  }
  if (!Number.isFinite(bufferAfterMinutes) || bufferAfterMinutes < 0 || bufferAfterMinutes > 60) {
    return NextResponse.json({ error: 'bufferAfterMinutes must be between 0 and 60' }, { status: 400 })
  }
  if (!Number.isFinite(basePriceCents) || basePriceCents < 0) {
    return NextResponse.json({ error: 'basePriceCents must be a non-negative number' }, { status: 400 })
  }

  const procedure = await prisma.clinicProcedure.create({
    data: {
      tenantId: session.tenantId,
      name,
      defaultDurationMin: Math.round(defaultDurationMin),
      bufferAfterMinutes: Math.round(bufferAfterMinutes),
      basePriceCents: Math.round(basePriceCents),
      currency: currency.slice(0, 8),
      active,
      sortOrder: Math.round(sortOrder),
    },
  })

  return NextResponse.json({ procedure }, { status: 201 })
}
