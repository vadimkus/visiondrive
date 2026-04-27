import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildClinicPaymentReceiptPdf } from '@/lib/clinic/payment-receipt-pdf'
import { getClinicSession } from '@/lib/clinic/session'

function safeFilePart(value: string) {
  return value.replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'receipt'
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; paymentId: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: patientId, paymentId } = await context.params
  const payment = await prisma.clinicPatientPayment.findFirst({
    where: { id: paymentId, patientId, tenantId: session.tenantId },
    include: {
      tenant: { select: { name: true } },
      patient: {
        select: {
          firstName: true,
          lastName: true,
          middleName: true,
          phone: true,
          email: true,
        },
      },
      appointment: {
        select: {
          startsAt: true,
          titleOverride: true,
          procedure: { select: { name: true, basePriceCents: true } },
        },
      },
      visit: {
        select: {
          appointment: {
            select: {
              startsAt: true,
              titleOverride: true,
              procedure: { select: { name: true, basePriceCents: true } },
            },
          },
        },
      },
    },
  })

  if (!payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
  }

  const appointment = payment.appointment ?? payment.visit?.appointment ?? null
  const pdf = buildClinicPaymentReceiptPdf({
    practiceName: payment.tenant.name,
    generatedAt: new Date(),
    receiptNo: payment.id,
    patient: payment.patient,
    payment: {
      amountCents: payment.amountCents,
      discountCents: payment.discountCents,
      feeCents: payment.feeCents,
      currency: payment.currency,
      method: payment.method,
      status: payment.status,
      reference: payment.reference,
      note: payment.note,
      paidAt: payment.paidAt,
    },
    appointment: appointment
      ? {
          startsAt: appointment.startsAt,
          label: appointment.procedure?.name ?? appointment.titleOverride ?? 'Service',
          basePriceCents: appointment.procedure?.basePriceCents ?? payment.amountCents,
        }
      : null,
  })

  const fileName = `${safeFilePart(payment.patient.lastName)}-${safeFilePart(payment.id)}-receipt.pdf`
  return new NextResponse(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
