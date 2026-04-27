import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  createPatientPortalToken,
  hashPatientPortalToken,
  patientPortalExpiresAt,
  patientPortalTokenLastFour,
} from '@/lib/clinic/patient-portal'
import { getClinicSession } from '@/lib/clinic/session'

function publicPortalUrl(request: NextRequest, token: string) {
  return `${request.nextUrl.origin}/patient-portal/${token}`
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

  const links = await prisma.clinicPatientPortalLink.findMany({
    where: { tenantId: session.tenantId, patientId },
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
  })

  return NextResponse.json({ links })
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

  let expiryDays = 90
  try {
    const body = await request.json()
    const parsed = Number(body.expiryDays)
    if (Number.isFinite(parsed)) expiryDays = parsed
  } catch {
    // Default expiry is fine when the client sends no body.
  }

  const token = createPatientPortalToken()
  const link = await prisma.$transaction(async (tx) => {
    await tx.clinicPatientPortalLink.updateMany({
      where: {
        tenantId: session.tenantId,
        patientId,
        revokedAt: null,
        expiresAt: { gte: new Date() },
      },
      data: { revokedAt: new Date() },
    })

    return tx.clinicPatientPortalLink.create({
      data: {
        tenantId: session.tenantId,
        patientId,
        tokenHash: hashPatientPortalToken(token),
        tokenLastFour: patientPortalTokenLastFour(token),
        expiresAt: patientPortalExpiresAt(expiryDays),
        createdByUserId: session.userId,
      },
      select: {
        id: true,
        tokenLastFour: true,
        expiresAt: true,
        revokedAt: true,
        lastAccessedAt: true,
        createdAt: true,
      },
    })
  })

  return NextResponse.json({
    link,
    url: publicPortalUrl(request, token),
  }, { status: 201 })
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: patientId } = await context.params
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const linkId = String(body.linkId ?? '').trim()
  if (!linkId) {
    return NextResponse.json({ error: 'linkId is required' }, { status: 400 })
  }

  const updated = await prisma.clinicPatientPortalLink.updateMany({
    where: {
      id: linkId,
      patientId,
      tenantId: session.tenantId,
      revokedAt: null,
    },
    data: { revokedAt: new Date() },
  })

  if (updated.count !== 1) {
    return NextResponse.json({ error: 'Portal link not found' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
