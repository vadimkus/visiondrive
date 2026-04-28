import { NextRequest, NextResponse } from 'next/server'
import { ClinicPriceQuoteStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string; quoteId: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, quoteId } = await context.params
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const statusRaw = String(body.status ?? '').trim().toUpperCase()
  if (!Object.values(ClinicPriceQuoteStatus).includes(statusRaw as ClinicPriceQuoteStatus)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }
  const status = statusRaw as ClinicPriceQuoteStatus

  const existing = await prisma.clinicPriceQuote.findFirst({
    where: { id: quoteId, patientId: id, tenantId: session.tenantId },
    select: { id: true },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
  }

  const quote = await prisma.clinicPriceQuote.update({
    where: { id: quoteId },
    data: {
      status,
      sentAt: status === ClinicPriceQuoteStatus.SENT ? new Date() : undefined,
      acceptedAt: status === ClinicPriceQuoteStatus.ACCEPTED ? new Date() : undefined,
    },
    include: {
      lines: { orderBy: { sortOrder: 'asc' }, include: { procedure: { select: { id: true, name: true } } } },
    },
  })

  return NextResponse.json({ quote })
}
