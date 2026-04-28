import { NextRequest, NextResponse } from 'next/server'
import { ClinicPaymentMethod, ClinicPaymentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'
import { calculateProcessorFeeForPayment, PAYMENT_FEE_METHODS } from '@/lib/clinic/payment-fees'
import { normalizeDiscountReason, validateDiscountApplication } from '@/lib/clinic/discount-rules'
import {
  normalizePackagePriceCents,
  normalizePackageSessions,
  packagePaymentReference,
} from '@/lib/clinic/patient-packages'

function parseMethod(v: string): ClinicPaymentMethod {
  const u = v.toUpperCase().trim()
  const allowed = PAYMENT_FEE_METHODS
  return allowed.includes(u as ClinicPaymentMethod) ? (u as ClinicPaymentMethod) : ClinicPaymentMethod.OTHER
}

function parsePayStatus(v: string): ClinicPaymentStatus {
  const u = v.toUpperCase().trim()
  const allowed: ClinicPaymentStatus[] = ['PAID', 'PENDING', 'REFUNDED', 'VOID']
  return allowed.includes(u as ClinicPaymentStatus) ? (u as ClinicPaymentStatus) : ClinicPaymentStatus.PAID
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: patientId } = await context.params
  const patient = await prisma.clinicPatient.findFirst({
    where: { id: patientId, tenantId: session.tenantId },
    select: { id: true },
  })
  if (!patient) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
  }

  const packages = await prisma.clinicPatientPackage.findMany({
    where: { patientId, tenantId: session.tenantId },
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
    orderBy: [{ status: 'asc' }, { purchasedAt: 'desc' }],
  })

  return NextResponse.json({ packages })
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: patientId } = await context.params
  const patient = await prisma.clinicPatient.findFirst({
    where: { id: patientId, tenantId: session.tenantId },
    select: { id: true },
  })
  if (!patient) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
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

  const procedureId =
    body.procedureId != null && String(body.procedureId).trim()
      ? String(body.procedureId).trim()
      : null
  if (procedureId) {
    const procedure = await prisma.clinicProcedure.findFirst({
      where: { id: procedureId, tenantId: session.tenantId, active: true },
      select: { id: true },
    })
    if (!procedure) {
      return NextResponse.json({ error: 'Procedure not found' }, { status: 400 })
    }
  }

  const totalSessions = normalizePackageSessions(body.totalSessions, 5)
  const listPriceCents = normalizePackagePriceCents(body.priceCents)
  const discountCents = normalizePackagePriceCents(body.discountCents)
  const discountReason = normalizeDiscountReason(body.discountReason)
  const discountError = validateDiscountApplication({ discountCents, discountReason })
  if (discountError) {
    return NextResponse.json({ error: discountError }, { status: 400 })
  }
  const priceCents = Math.max(0, listPriceCents - discountCents)
  const currency = body.currency != null ? String(body.currency).trim().toUpperCase() || 'AED' : 'AED'
  const note = body.note != null ? String(body.note).trim() || null : null
  const method = parseMethod(String(body.paymentMethod ?? 'CARD'))
  const paymentStatus = parsePayStatus(String(body.paymentStatus ?? 'PAID'))
  const discountRuleId =
    body.discountRuleId != null && String(body.discountRuleId).trim()
      ? String(body.discountRuleId).trim()
      : null
  const discountRule = discountRuleId
    ? await prisma.clinicDiscountRule.findFirst({
        where: { id: discountRuleId, tenantId: session.tenantId, active: true },
        select: { id: true, name: true },
      })
    : null
  if (discountRuleId && !discountRule) {
    return NextResponse.json({ error: 'Discount rule not found' }, { status: 400 })
  }
  const purchasedAtRaw = body.purchasedAt != null ? String(body.purchasedAt) : ''
  const purchasedAt = purchasedAtRaw ? new Date(purchasedAtRaw) : new Date()
  if (Number.isNaN(purchasedAt.getTime())) {
    return NextResponse.json({ error: 'purchasedAt must be a valid ISO datetime' }, { status: 400 })
  }

  const expiresAtRaw = body.expiresAt != null ? String(body.expiresAt).trim() : ''
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null
  if (expiresAt && Number.isNaN(expiresAt.getTime())) {
    return NextResponse.json({ error: 'expiresAt must be a valid ISO datetime' }, { status: 400 })
  }

  const result = await prisma.$transaction(async (tx) => {
    const patientPackage = await tx.clinicPatientPackage.create({
      data: {
        tenantId: session.tenantId,
        patientId,
        procedureId,
        name,
        totalSessions,
        remainingSessions: totalSessions,
        listPriceCents,
        discountCents,
        discountRuleId: discountRule?.id ?? null,
        discountName: discountCents > 0 ? discountRule?.name ?? null : null,
        discountReason: discountCents > 0 ? discountReason : null,
        priceCents,
        currency: currency.slice(0, 8),
        purchasedAt,
        expiresAt,
        note,
        createdByUserId: session.userId,
      },
      include: {
        procedure: { select: { id: true, name: true } },
        redemptions: true,
      },
    })

    let payment = null
    if (priceCents > 0) {
      const feeRule = await tx.clinicPaymentFeeRule.findUnique({
        where: { tenantId_method: { tenantId: session.tenantId, method } },
        select: { percentBps: true, fixedFeeCents: true, active: true },
      })
      payment = await tx.clinicPatientPayment.create({
            data: {
              tenantId: session.tenantId,
              patientId,
              amountCents: priceCents,
              discountCents,
              discountRuleId: discountRule?.id ?? null,
              discountName: discountCents > 0 ? discountRule?.name ?? null : null,
              discountReason: discountCents > 0 ? discountReason : null,
              processorFeeCents: calculateProcessorFeeForPayment({
                amountCents: priceCents,
                status: paymentStatus,
                rule: feeRule,
              }),
              currency: currency.slice(0, 8),
              method,
              status: paymentStatus,
              reference: packagePaymentReference(patientPackage.id),
              note: [
                `Package: ${name}`,
                discountCents > 0 ? `Discount: ${(discountCents / 100).toFixed(2)} ${currency}` : null,
                note,
              ].filter(Boolean).join('. '),
              paidAt: purchasedAt,
              createdByUserId: session.userId,
            },
          })
    }

    return { package: patientPackage, payment }
  })

  return NextResponse.json(result, { status: 201 })
}
