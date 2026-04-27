import { NextRequest, NextResponse } from 'next/server'
import { ClinicPaymentMethod, ClinicPaymentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'
import {
  normalizePackagePriceCents,
  normalizePackageSessions,
  packagePaymentReference,
} from '@/lib/clinic/patient-packages'

function parseMethod(v: string): ClinicPaymentMethod {
  const u = v.toUpperCase().trim()
  const allowed: ClinicPaymentMethod[] = ['CASH', 'CARD', 'TRANSFER', 'POS', 'OTHER']
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
  const priceCents = normalizePackagePriceCents(body.priceCents)
  const currency = body.currency != null ? String(body.currency).trim().toUpperCase() || 'AED' : 'AED'
  const note = body.note != null ? String(body.note).trim() || null : null
  const method = parseMethod(String(body.paymentMethod ?? 'CARD'))
  const paymentStatus = parsePayStatus(String(body.paymentStatus ?? 'PAID'))
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

    const payment =
      priceCents > 0
        ? await tx.clinicPatientPayment.create({
            data: {
              tenantId: session.tenantId,
              patientId,
              amountCents: priceCents,
              currency: currency.slice(0, 8),
              method,
              status: paymentStatus,
              reference: packagePaymentReference(patientPackage.id),
              note: note ? `Package: ${name}. ${note}` : `Package: ${name}`,
              paidAt: purchasedAt,
              createdByUserId: session.userId,
            },
          })
        : null

    return { package: patientPackage, payment }
  })

  return NextResponse.json(result, { status: 201 })
}
