import { NextRequest, NextResponse } from 'next/server'
import { ClinicPaymentMethod, ClinicPaymentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { deriveGiftCardStatus, generateGiftCardCode, normalizeGiftCardAmountCents, normalizeGiftCardCode } from '@/lib/clinic/gift-cards'
import { calculateProcessorFeeForPayment, PAYMENT_FEE_METHODS } from '@/lib/clinic/payment-fees'
import { getClinicSession } from '@/lib/clinic/session'

function parseMethod(value: unknown): ClinicPaymentMethod {
  const method = String(value ?? 'OTHER').toUpperCase().trim()
  return PAYMENT_FEE_METHODS.includes(method as ClinicPaymentMethod)
    ? (method as ClinicPaymentMethod)
    : ClinicPaymentMethod.OTHER
}

function parsePaymentStatus(value: unknown): ClinicPaymentStatus {
  const status = String(value ?? 'PAID').toUpperCase().trim()
  return status === ClinicPaymentStatus.PENDING ? ClinicPaymentStatus.PENDING : ClinicPaymentStatus.PAID
}

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  await prisma.clinicGiftCard.updateMany({
    where: {
      tenantId: session.tenantId,
      status: 'ACTIVE',
      remainingBalanceCents: { gt: 0 },
      expiresAt: { lt: now },
    },
    data: { status: 'EXPIRED' },
  })

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()
  const cards = await prisma.clinicGiftCard.findMany({
    where: {
      tenantId: session.tenantId,
      ...(q
        ? {
            OR: [
              { code: { contains: normalizeGiftCardCode(q), mode: 'insensitive' } },
              { buyerName: { contains: q, mode: 'insensitive' } },
              { recipientName: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: {
      buyerPatient: { select: { id: true, firstName: true, lastName: true, phone: true } },
      redemptions: {
        orderBy: { redeemedAt: 'desc' },
        take: 8,
        include: {
          patient: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
    orderBy: [{ status: 'asc' }, { purchasedAt: 'desc' }],
    take: 80,
  })

  return NextResponse.json({ cards })
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

  const buyerName = String(body.buyerName ?? '').trim()
  if (!buyerName) {
    return NextResponse.json({ error: 'buyerName is required' }, { status: 400 })
  }

  const initialBalanceCents = normalizeGiftCardAmountCents(body.initialBalanceCents)
  if (initialBalanceCents <= 0) {
    return NextResponse.json({ error: 'initialBalanceCents must be a positive integer' }, { status: 400 })
  }

  const buyerPatientId =
    body.buyerPatientId != null && String(body.buyerPatientId).trim()
      ? String(body.buyerPatientId).trim()
      : null
  if (buyerPatientId) {
    const patient = await prisma.clinicPatient.findFirst({
      where: { id: buyerPatientId, tenantId: session.tenantId },
      select: { id: true },
    })
    if (!patient) {
      return NextResponse.json({ error: 'Buyer patient not found' }, { status: 400 })
    }
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

  const paymentMethod = parseMethod(body.paymentMethod)
  const paymentStatus = parsePaymentStatus(body.paymentStatus)
  const feeRule = await prisma.clinicPaymentFeeRule.findUnique({
    where: { tenantId_method: { tenantId: session.tenantId, method: paymentMethod } },
    select: { percentBps: true, fixedFeeCents: true, active: true },
  })
  const processorFeeCents = calculateProcessorFeeForPayment({
    amountCents: initialBalanceCents,
    status: paymentStatus,
    rule: feeRule,
  })

  let code = normalizeGiftCardCode(body.code)
  if (!code) {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const candidate = generateGiftCardCode()
      const exists = await prisma.clinicGiftCard.findUnique({
        where: { tenantId_code: { tenantId: session.tenantId, code: candidate } },
        select: { id: true },
      })
      if (!exists) {
        code = candidate
        break
      }
    }
  }
  if (!code) {
    return NextResponse.json({ error: 'Could not generate gift card code' }, { status: 500 })
  }

  const duplicate = await prisma.clinicGiftCard.findUnique({
    where: { tenantId_code: { tenantId: session.tenantId, code } },
    select: { id: true },
  })
  if (duplicate) {
    return NextResponse.json({ error: 'Gift card code already exists' }, { status: 409 })
  }

  const card = await prisma.clinicGiftCard.create({
    data: {
      tenantId: session.tenantId,
      code,
      buyerPatientId,
      buyerName,
      buyerPhone: body.buyerPhone != null ? String(body.buyerPhone).trim() || null : null,
      buyerEmail: body.buyerEmail != null ? String(body.buyerEmail).trim() || null : null,
      recipientName: body.recipientName != null ? String(body.recipientName).trim() || null : null,
      initialBalanceCents,
      remainingBalanceCents: initialBalanceCents,
      currency: body.currency != null ? String(body.currency).trim().toUpperCase().slice(0, 8) || 'AED' : 'AED',
      status: deriveGiftCardStatus({ paymentStatus, remainingBalanceCents: initialBalanceCents, expiresAt }),
      paymentMethod,
      paymentStatus,
      processorFeeCents,
      purchasedAt,
      expiresAt,
      note: body.note != null ? String(body.note).trim() || null : null,
      createdByUserId: session.userId,
    },
    include: {
      buyerPatient: { select: { id: true, firstName: true, lastName: true, phone: true } },
      redemptions: true,
    },
  })

  return NextResponse.json({ card }, { status: 201 })
}
