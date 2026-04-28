import { ClinicPaymentStatus, ClinicVisitStatus } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { anamnesisFromJson } from '@/lib/clinic/anamnesis'
import { buildPatientSafeExportPdf } from '@/lib/clinic/patient-safe-export-pdf'
import { getClinicSession } from '@/lib/clinic/session'
import { prisma } from '@/lib/prisma'

function safeFilenamePart(value: string) {
  return value.replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'patient'
}

function appointmentLabel(
  appointment:
    | {
        titleOverride: string | null
        procedure: { name: string } | null
      }
    | null
    | undefined,
  fallback = 'Treatment'
) {
  return appointment?.procedure?.name ?? appointment?.titleOverride ?? fallback
}

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
    select: {
      id: true,
      firstName: true,
      lastName: true,
      middleName: true,
      dateOfBirth: true,
      phone: true,
      email: true,
      anamnesisJson: true,
      tenant: { select: { name: true } },
      visits: {
        where: { status: ClinicVisitStatus.COMPLETED },
        orderBy: { visitAt: 'desc' },
        take: 40,
        select: {
          visitAt: true,
          procedureSummary: true,
          nextSteps: true,
          aftercareTitleSnapshot: true,
          aftercareTextSnapshot: true,
          aftercareDocumentNameSnapshot: true,
          aftercareDocumentUrlSnapshot: true,
          appointment: {
            select: {
              titleOverride: true,
              procedure: { select: { name: true } },
            },
          },
          treatmentPlan: { select: { title: true } },
        },
      },
      payments: {
        where: { status: { in: [ClinicPaymentStatus.PAID, ClinicPaymentStatus.REFUNDED] } },
        orderBy: { paidAt: 'desc' },
        take: 60,
        select: {
          amountCents: true,
          currency: true,
          method: true,
          status: true,
          reference: true,
          paidAt: true,
          appointment: {
            select: {
              titleOverride: true,
              procedure: { select: { name: true } },
            },
          },
          visit: {
            select: {
              appointment: {
                select: {
                  titleOverride: true,
                  procedure: { select: { name: true } },
                },
              },
            },
          },
          productSale: { select: { id: true } },
          giftCardRedemption: { select: { id: true } },
        },
      },
      consentRecords: {
        where: { accepted: true },
        orderBy: { acceptedAt: 'desc' },
        take: 40,
        select: {
          templateTitleSnapshot: true,
          templateBodySnapshot: true,
          contraindicationsSnapshot: true,
          checkedItems: true,
          patientNameSnapshot: true,
          signatureText: true,
          acceptedAt: true,
          aftercareAcknowledged: true,
          procedure: { select: { name: true } },
        },
      },
    },
  })

  if (!patient) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const pdf = buildPatientSafeExportPdf({
    practiceName: patient.tenant.name,
    generatedAt: new Date(),
    patient: {
      firstName: patient.firstName,
      lastName: patient.lastName,
      middleName: patient.middleName,
      dateOfBirth: patient.dateOfBirth,
      phone: patient.phone,
      email: patient.email,
    },
    anamnesis: anamnesisFromJson(patient.anamnesisJson),
    visits: patient.visits.map((visit) => ({
      visitAt: visit.visitAt,
      label: appointmentLabel(
        visit.appointment,
        visit.treatmentPlan?.title ?? 'Treatment'
      ),
      procedureSummary: visit.procedureSummary,
      nextSteps: visit.nextSteps,
      aftercareTitle: visit.aftercareTitleSnapshot,
      aftercareText: visit.aftercareTextSnapshot,
      aftercareDocumentName: visit.aftercareDocumentNameSnapshot,
      aftercareDocumentUrl: visit.aftercareDocumentUrlSnapshot,
    })),
    payments: patient.payments.map((payment) => {
      const appointment = payment.appointment ?? payment.visit?.appointment ?? null
      return {
        paidAt: payment.paidAt,
        label: appointment
          ? appointmentLabel(appointment, 'Payment')
          : payment.productSale
            ? 'Product sale'
            : payment.giftCardRedemption
              ? 'Gift card redemption'
              : 'Payment',
        amountCents: payment.amountCents,
        currency: payment.currency,
        method: payment.method,
        status: payment.status,
        reference: payment.reference,
      }
    }),
    consents: patient.consentRecords.map((consent) => ({
      title: consent.templateTitleSnapshot,
      body: consent.templateBodySnapshot,
      procedureName: consent.procedure?.name ?? null,
      contraindications: consent.contraindicationsSnapshot,
      checkedItems: consent.checkedItems,
      patientName: consent.patientNameSnapshot,
      signatureText: consent.signatureText,
      acceptedAt: consent.acceptedAt,
      aftercareAcknowledged: consent.aftercareAcknowledged,
    })),
  })

  const fileName = `patient-safe-export-${safeFilenamePart(patient.lastName)}-${patient.id.slice(0, 8)}.pdf`
  return new NextResponse(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
