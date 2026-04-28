import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { patientExportFilename, stripMediaBinary } from '@/lib/clinic/data-export'
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

  const patient = await prisma.clinicPatient.findFirst({
    where: { id, tenantId: session.tenantId },
    include: {
      tenant: { select: { id: true, name: true, slug: true } },
      appointments: {
        orderBy: { startsAt: 'desc' },
        include: {
          procedure: { select: { id: true, name: true, defaultDurationMin: true, basePriceCents: true, currency: true } },
          events: { orderBy: { createdAt: 'asc' } },
          intakeResponses: { orderBy: { createdAt: 'asc' } },
          payments: {
            orderBy: { paidAt: 'desc' },
            include: {
              correctionsAsOriginal: { orderBy: { correctedAt: 'desc' } },
              correctionAsAdjustment: true,
            },
          },
        },
      },
      visits: {
        orderBy: { visitAt: 'desc' },
        include: {
          treatmentPlan: { select: { id: true, title: true, status: true } },
          media: {
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              tenantId: true,
              patientId: true,
              visitId: true,
              kind: true,
              mimeType: true,
              caption: true,
              protocolJson: true,
              marketingConsent: true,
              marketingConsentAt: true,
              data: true,
              blobPathname: true,
              createdAt: true,
              createdByUserId: true,
            },
          },
          packageRedemptions: { orderBy: { redeemedAt: 'desc' } },
          giftCardRedemptions: {
            orderBy: { redeemedAt: 'desc' },
            include: { giftCard: true, payment: true },
          },
          consentRecords: { orderBy: { createdAt: 'desc' } },
          payments: {
            orderBy: { paidAt: 'desc' },
            include: {
              correctionsAsOriginal: { orderBy: { correctedAt: 'desc' } },
              correctionAsAdjustment: true,
            },
          },
          productSales: {
            orderBy: { soldAt: 'desc' },
            include: {
              lines: {
                include: { stockItem: { select: { id: true, name: true, sku: true, unit: true } } },
              },
              payment: true,
            },
          },
        },
      },
      media: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          tenantId: true,
          patientId: true,
          visitId: true,
          kind: true,
          mimeType: true,
          caption: true,
          protocolJson: true,
          marketingConsent: true,
          marketingConsentAt: true,
          data: true,
          blobPathname: true,
          createdAt: true,
          createdByUserId: true,
        },
      },
      payments: {
        orderBy: { paidAt: 'desc' },
        include: {
          correctionsAsOriginal: { orderBy: { correctedAt: 'desc' } },
          correctionAsAdjustment: true,
          productSale: true,
        },
      },
      paymentCorrections: { orderBy: { correctedAt: 'desc' } },
      productSales: {
        orderBy: { soldAt: 'desc' },
        include: {
          lines: {
            include: { stockItem: { select: { id: true, name: true, sku: true, unit: true } } },
          },
          payment: true,
        },
      },
      crmActivities: { orderBy: { occurredAt: 'desc' } },
      reviews: { orderBy: { createdAt: 'desc' } },
      packages: {
        orderBy: { purchasedAt: 'desc' },
        include: {
          procedure: { select: { id: true, name: true } },
          redemptions: { orderBy: { redeemedAt: 'desc' } },
        },
      },
      consentRecords: {
        orderBy: { createdAt: 'desc' },
        include: {
          procedure: { select: { id: true, name: true } },
          template: { select: { id: true, title: true, active: true } },
        },
      },
      treatmentPlans: {
        orderBy: { createdAt: 'desc' },
        include: {
          procedure: { select: { id: true, name: true } },
          visits: { orderBy: { visitAt: 'desc' } },
        },
      },
      portalLinks: { orderBy: { createdAt: 'desc' } },
      portalRequests: { orderBy: { createdAt: 'desc' } },
      intakeResponses: { orderBy: { createdAt: 'desc' } },
      giftCardRedemptions: {
        orderBy: { redeemedAt: 'desc' },
        include: { giftCard: true, payment: true },
      },
    },
  })

  if (!patient) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const generatedAt = new Date()
  const media = patient.media.map((item) => ({
    ...stripMediaBinary(item),
    downloadPath: `/api/clinic/media/${item.id}`,
  }))

  const exportData = {
    schema: 'visiondrive.practice-os.patient-export.v1',
    generatedAt: generatedAt.toISOString(),
    generatedByUserId: session.userId,
    tenant: patient.tenant,
    notes: [
      'Media binaries are not embedded in this JSON export.',
      'Use each media.downloadPath while authenticated to retrieve original private media before deletion.',
    ],
    patient: {
      ...patient,
      media,
      visits: patient.visits.map((visit) => ({
        ...visit,
        media: visit.media.map((item) => ({
          ...stripMediaBinary(item),
          downloadPath: `/api/clinic/media/${item.id}`,
        })),
      })),
    },
  }

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${patientExportFilename(patient, generatedAt)}"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
