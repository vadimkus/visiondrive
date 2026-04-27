import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { parseAnamnesisPatchBody } from '@/lib/clinic/anamnesis'
import {
  buildClientBalanceChargesFromAppointments,
  buildClientBalanceSummary,
} from '@/lib/clinic/client-balance'
import { normalizePatientCategory, normalizePatientTags } from '@/lib/clinic/patient-tags'
import { getClinicSession } from '@/lib/clinic/session'

function parseDateOnly(isoDate: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim())
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2]) - 1
  const d = Number(m[3])
  const dt = new Date(Date.UTC(y, mo, d, 12, 0, 0))
  return Number.isNaN(dt.getTime()) ? null : dt
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
  const mediaSelect = {
    id: true,
    kind: true,
    mimeType: true,
    caption: true,
    visitId: true,
    createdAt: true,
  } as const

  const patient = await prisma.clinicPatient.findFirst({
    where: { id, tenantId: session.tenantId },
    include: {
      appointments: {
        orderBy: { startsAt: 'desc' },
        take: 40,
        select: {
          id: true,
          startsAt: true,
          endsAt: true,
          status: true,
          titleOverride: true,
          internalNotes: true,
          procedure: { select: { id: true, name: true, basePriceCents: true, currency: true } },
          visits: {
            select: {
              payments: {
                select: {
                  id: true,
                  amountCents: true,
                  discountCents: true,
                  feeCents: true,
                  processorFeeCents: true,
                  currency: true,
                  status: true,
                  reference: true,
                  paidAt: true,
                  correctionsAsOriginal: {
                    select: {
                      id: true,
                      type: true,
                      amountCents: true,
                      currency: true,
                      method: true,
                      reason: true,
                      note: true,
                      correctedAt: true,
                      adjustmentPaymentId: true,
                    },
                    orderBy: { correctedAt: 'desc' },
                  },
                },
              },
            },
          },
          payments: {
            select: {
              id: true,
              amountCents: true,
              discountCents: true,
              feeCents: true,
              processorFeeCents: true,
              currency: true,
              status: true,
              reference: true,
              paidAt: true,
              correctionsAsOriginal: {
                select: {
                  id: true,
                  type: true,
                  amountCents: true,
                  currency: true,
                  method: true,
                  reason: true,
                  note: true,
                  correctedAt: true,
                  adjustmentPaymentId: true,
                },
                orderBy: { correctedAt: 'desc' },
              },
            },
          },
        },
      },
      visits: {
        orderBy: { visitAt: 'desc' },
        take: 40,
        include: {
          treatmentPlan: { select: { id: true, title: true, status: true } },
          media: { orderBy: { createdAt: 'asc' }, select: { ...mediaSelect } },
          packageRedemptions: {
            orderBy: { redeemedAt: 'desc' },
            include: {
              patientPackage: {
                select: { id: true, name: true, totalSessions: true, remainingSessions: true },
              },
            },
          },
        },
      },
      treatmentPlans: {
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
        include: {
          procedure: { select: { id: true, name: true } },
          visits: {
            orderBy: { visitAt: 'desc' },
            select: {
              id: true,
              visitAt: true,
              status: true,
              procedureSummary: true,
              nextSteps: true,
              media: { select: { id: true, kind: true, caption: true, createdAt: true } },
            },
          },
        },
      },
      packages: {
        orderBy: [{ status: 'asc' }, { purchasedAt: 'desc' }],
        include: {
          procedure: { select: { id: true, name: true } },
          redemptions: {
            orderBy: { redeemedAt: 'desc' },
            include: {
              visit: { select: { id: true, visitAt: true } },
              appointment: { select: { id: true, startsAt: true } },
            },
          },
        },
      },
      consentRecords: {
        orderBy: { createdAt: 'desc' },
        take: 40,
        include: {
          procedure: { select: { id: true, name: true } },
          visit: { select: { id: true, visitAt: true } },
          appointment: { select: { id: true, startsAt: true } },
          template: { select: { id: true, title: true, active: true } },
        },
      },
      media: {
        orderBy: { createdAt: 'desc' },
        take: 60,
        select: { ...mediaSelect },
      },
      payments: {
        orderBy: { paidAt: 'desc' },
        take: 80,
        select: {
          id: true,
          amountCents: true,
          discountCents: true,
          feeCents: true,
          processorFeeCents: true,
          currency: true,
          method: true,
          status: true,
          reference: true,
          note: true,
          paidAt: true,
          visitId: true,
          appointmentId: true,
          createdAt: true,
          correctionsAsOriginal: {
            select: {
              id: true,
              type: true,
              amountCents: true,
              currency: true,
              method: true,
              reason: true,
              note: true,
              correctedAt: true,
              adjustmentPaymentId: true,
            },
            orderBy: { correctedAt: 'desc' },
          },
        },
      },
      productSales: {
        orderBy: { soldAt: 'desc' },
        take: 80,
        include: {
          payment: {
            select: { id: true, status: true, amountCents: true, processorFeeCents: true, method: true, paidAt: true },
          },
          visit: { select: { id: true, visitAt: true } },
          appointment: { select: { id: true, startsAt: true } },
          lines: {
            include: {
              stockItem: { select: { id: true, name: true, sku: true, unit: true } },
            },
          },
        },
      },
      portalLinks: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          tokenLastFour: true,
          expiresAt: true,
          revokedAt: true,
          lastAccessedAt: true,
          createdAt: true,
        },
      },
      portalRequests: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          type: true,
          status: true,
          message: true,
          preferredTime: true,
          createdAt: true,
          appointment: {
            select: {
              id: true,
              startsAt: true,
              titleOverride: true,
              procedure: { select: { name: true } },
            },
          },
        },
      },
      crmActivities: {
        orderBy: { occurredAt: 'desc' },
        take: 80,
        select: {
          id: true,
          type: true,
          body: true,
          occurredAt: true,
          createdAt: true,
        },
      },
    },
  })

  if (!patient) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const clientBalance = buildClientBalanceSummary({
    charges: buildClientBalanceChargesFromAppointments(patient.appointments),
    standalonePayments: patient.payments.filter(
      (payment) => payment.visitId === null && payment.appointmentId === null
    ),
  })

  return NextResponse.json({
    patient: {
      ...patient,
      clientBalance,
      appointments: patient.appointments.map(({ visits, ...appointment }) => appointment),
    },
  })
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

  const existing = await prisma.clinicPatient.findFirst({
    where: { id, tenantId: session.tenantId },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const data: {
    firstName?: string
    lastName?: string
    middleName?: string | null
    dateOfBirth?: Date
    phone?: string | null
    email?: string | null
    homeAddress?: string | null
    area?: string | null
    accessNotes?: string | null
    category?: string | null
    tags?: string[]
    internalNotes?: string | null
    anamnesisJson?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput
  } = {}

  if (body.firstName !== undefined) {
    const v = String(body.firstName).trim()
    if (!v) return NextResponse.json({ error: 'firstName cannot be empty' }, { status: 400 })
    data.firstName = v
  }
  if (body.lastName !== undefined) {
    const v = String(body.lastName).trim()
    if (!v) return NextResponse.json({ error: 'lastName cannot be empty' }, { status: 400 })
    data.lastName = v
  }
  if (body.middleName !== undefined) {
    data.middleName = body.middleName == null ? null : String(body.middleName).trim() || null
  }
  if (body.dateOfBirth !== undefined) {
    const d = parseDateOnly(String(body.dateOfBirth))
    if (!d) return NextResponse.json({ error: 'dateOfBirth must be YYYY-MM-DD' }, { status: 400 })
    data.dateOfBirth = d
  }
  if (body.phone !== undefined) {
    data.phone = body.phone == null ? null : String(body.phone).trim() || null
  }
  if (body.email !== undefined) {
    data.email = body.email == null ? null : String(body.email).trim() || null
  }
  if (body.homeAddress !== undefined) {
    data.homeAddress = body.homeAddress == null ? null : String(body.homeAddress).trim() || null
  }
  if (body.area !== undefined) {
    data.area = body.area == null ? null : String(body.area).trim() || null
  }
  if (body.accessNotes !== undefined) {
    data.accessNotes = body.accessNotes == null ? null : String(body.accessNotes).trim() || null
  }
  if (body.category !== undefined) {
    data.category = normalizePatientCategory(body.category)
  }
  if (body.tags !== undefined) {
    data.tags = normalizePatientTags(body.tags)
  }
  if (body.internalNotes !== undefined) {
    data.internalNotes = body.internalNotes == null ? null : String(body.internalNotes).trim() || null
  }

  if (body.anamnesisJson !== undefined) {
    const parsed = parseAnamnesisPatchBody(body.anamnesisJson)
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }
    data.anamnesisJson = parsed.value === null ? Prisma.DbNull : parsed.value
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const patient = await prisma.clinicPatient.update({
    where: { id },
    data,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      middleName: true,
      dateOfBirth: true,
      phone: true,
      email: true,
      homeAddress: true,
      area: true,
      accessNotes: true,
      category: true,
      tags: true,
      internalNotes: true,
      anamnesisJson: true,
      updatedAt: true,
    },
  })

  return NextResponse.json({ patient })
}
