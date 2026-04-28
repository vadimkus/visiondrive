import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildPriceQuotePdf } from '@/lib/clinic/price-quote-pdf'
import { getClinicSession } from '@/lib/clinic/session'

function safeFilenamePart(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'quote'
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; quoteId: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, quoteId } = await context.params
  const quote = await prisma.clinicPriceQuote.findFirst({
    where: { id: quoteId, patientId: id, tenantId: session.tenantId },
    include: {
      patient: { select: { firstName: true, lastName: true, phone: true, email: true } },
      tenant: { select: { name: true } },
      lines: { orderBy: { sortOrder: 'asc' } },
    },
  })

  if (!quote) {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
  }

  const pdf = buildPriceQuotePdf({
    practiceName: quote.tenant.name,
    generatedAt: new Date(),
    patient: quote.patient,
    quote: {
      quoteNumber: quote.quoteNumber,
      title: quote.title,
      currency: quote.currency,
      subtotalCents: quote.subtotalCents,
      discountCents: quote.discountCents,
      totalCents: quote.totalCents,
      validUntil: quote.validUntil,
      note: quote.note,
      terms: quote.terms,
      lines: quote.lines.map((line) => ({
        description: line.description,
        quantity: line.quantity,
        unitPriceCents: line.unitPriceCents,
        totalCents: line.totalCents,
      })),
    },
  })

  const filename = `${safeFilenamePart(quote.quoteNumber)}-${safeFilenamePart(quote.patient.lastName)}.pdf`
  return new NextResponse(Buffer.from(pdf), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
