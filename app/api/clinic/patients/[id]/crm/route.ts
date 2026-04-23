import { NextRequest, NextResponse } from 'next/server'
import { ClinicCrmActivityType } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'

function parseCrmType(v: string): ClinicCrmActivityType | null {
  const u = v.toUpperCase().trim()
  const allowed: ClinicCrmActivityType[] = [
    'NOTE',
    'CALL',
    'EMAIL',
    'WHATSAPP',
    'FOLLOW_UP',
    'OTHER',
  ]
  return allowed.includes(u as ClinicCrmActivityType) ? (u as ClinicCrmActivityType) : null
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

  const text = String(body.body ?? '').trim()
  if (!text) {
    return NextResponse.json({ error: 'body is required' }, { status: 400 })
  }

  const type = parseCrmType(String(body.type ?? 'NOTE')) ?? ClinicCrmActivityType.NOTE

  const occurredRaw = body.occurredAt != null ? String(body.occurredAt) : ''
  const occurredAt = occurredRaw ? new Date(occurredRaw) : new Date()
  if (Number.isNaN(occurredAt.getTime())) {
    return NextResponse.json({ error: 'occurredAt must be a valid ISO datetime' }, { status: 400 })
  }

  const activity = await prisma.clinicCrmActivity.create({
    data: {
      tenantId: session.tenantId,
      patientId,
      type,
      body: text,
      occurredAt,
      createdByUserId: session.userId,
    },
    select: {
      id: true,
      type: true,
      body: true,
      occurredAt: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ activity }, { status: 201 })
}
