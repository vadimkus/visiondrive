import { NextRequest, NextResponse } from 'next/server'
import { ClinicPaymentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { buildClinicPaymentReceiptPdf } from '@/lib/clinic/payment-receipt-pdf'
import { hashPatientPortalToken, isPatientPortalLinkActive } from '@/lib/clinic/patient-portal'

function safeFilePart(value: string) {
  return value.replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'receipt'
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string; paymentId: string }> }
) {
  const { token, paymentId } = await context.params
  const link = await prisma.clinicPatientPortalLink.findUnique({
    where: { tokenHash: hashPatientPortalToken(token) },
    include: { tenant: { select: { name: true } } },
  })
  if (!link || !isPatientPortalLinkActive(link)) {
    return NextResponse.json({ error: 'Portal link not found or expired' }, { status: 404 })
  }

  const payment = await prisma.clinicPatientPayment.findFirst({
    where: {
      id: paymentId,
      patientId: link.patientId,
      tenantId: link.tenantId,
      status: { in: [ClinicPaymentStatus.PAID, ClinicPaymentStatus.REFUNDED] },
    },
    include: {
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
    practiceName: link.tenant.name,
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
