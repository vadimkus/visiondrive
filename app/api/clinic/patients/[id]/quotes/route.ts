import { NextRequest, NextResponse } from 'next/server'
import { ClinicPriceQuoteStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { normalizeQuoteLine } from '@/lib/clinic/price-quotes'
import { getClinicSession } from '@/lib/clinic/session'

function parseDateOnly(value: unknown) {
  if (value == null || String(value).trim() === '') return null
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value).trim())
  if (!match) return null
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12, 0, 0))
  return Number.isNaN(date.getTime()) ? null : date
}

async function nextQuoteNumber(tenantId: string) {
  const count = await prisma.clinicPriceQuote.count({ where: { tenantId } })
  return `Q-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`
}

const quoteInclude = {
  lines: { orderBy: { sortOrder: 'asc' }, include: { procedure: { select: { id: true, name: true } } } },
} as const

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const patient = await prisma.clinicPatient.findFirst({
    where: { id, tenantId: session.tenantId },
    select: { id: true },
  })
  if (!patient) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
  }

  const quotes = await prisma.clinicPriceQuote.findMany({
    where: { tenantId: session.tenantId, patientId: id },
    orderBy: { createdAt: 'desc' },
    include: quoteInclude,
  })

  return NextResponse.json({ quotes })
}

export async function POST(
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

  const patient = await prisma.clinicPatient.findFirst({
    where: { id, tenantId: session.tenantId },
    select: { id: true },
  })
  if (!patient) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
  }

  const rawLines = Array.isArray(body.lines) ? body.lines : []
  const lines = rawLines
    .map((line) => normalizeQuoteLine(line as Parameters<typeof normalizeQuoteLine>[0]))
    .filter((line) => line.description)
  if (lines.length === 0) {
    return NextResponse.json({ error: 'At least one quote line is required' }, { status: 400 })
  }

  const procedureIds = [...new Set(lines.map((line) => line.procedureId).filter(Boolean) as string[])]
  if (procedureIds.length) {
    const count = await prisma.clinicProcedure.count({
      where: { tenantId: session.tenantId, id: { in: procedureIds } },
    })
    if (count !== procedureIds.length) {
      return NextResponse.json({ error: 'One or more services are not available' }, { status: 400 })
    }
  }

  const currency = String(body.currency ?? 'AED').trim().toUpperCase().slice(0, 8) || 'AED'
  const subtotalCents = lines.reduce((sum, line) => sum + line.totalCents, 0)
  const discountCents = Math.min(
    subtotalCents,
    Math.max(0, Math.round(Number(body.discountCents ?? 0) || 0))
  )
  const totalCents = Math.max(0, subtotalCents - discountCents)
  const title = String(body.title ?? '').trim() || 'Treatment estimate'
  const validUntil = parseDateOnly(body.validUntil)
  const statusRaw = String(body.status ?? 'DRAFT').trim().toUpperCase()
  const status = Object.values(ClinicPriceQuoteStatus).includes(statusRaw as ClinicPriceQuoteStatus)
    ? (statusRaw as ClinicPriceQuoteStatus)
    : ClinicPriceQuoteStatus.DRAFT

  const quote = await prisma.clinicPriceQuote.create({
    data: {
      tenantId: session.tenantId,
      patientId: id,
      quoteNumber: await nextQuoteNumber(session.tenantId),
      title: title.slice(0, 160),
      status,
      currency,
      subtotalCents,
      discountCents,
      totalCents,
      validUntil,
      note: body.note != null ? String(body.note).trim() || null : null,
      terms: body.terms != null ? String(body.terms).trim() || null : null,
      sentAt: status === ClinicPriceQuoteStatus.SENT ? new Date() : null,
      acceptedAt: status === ClinicPriceQuoteStatus.ACCEPTED ? new Date() : null,
      createdByUserId: session.userId,
      lines: {
        create: lines.map((line, index) => ({
          tenantId: session.tenantId,
          procedureId: line.procedureId,
          description: line.description.slice(0, 240),
          quantity: line.quantity,
          unitPriceCents: line.unitPriceCents,
          totalCents: line.totalCents,
          sortOrder: index,
        })),
      },
    },
    include: quoteInclude,
  })

  return NextResponse.json({ quote }, { status: 201 })
}
