import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  normalizePhotoMilestones,
  normalizeTreatmentPlanCadenceDays,
  normalizeTreatmentPlanSessions,
  normalizeTreatmentPlanStatus,
} from '@/lib/clinic/treatment-plans'
import { getClinicSession } from '@/lib/clinic/session'

function parseDateOnly(value: unknown): Date | null {
  if (value == null || String(value).trim() === '') return null
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? null : date
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

  const plans = await prisma.clinicTreatmentPlan.findMany({
    where: { tenantId: session.tenantId, patientId },
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
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json({ plans })
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

  const { id: patientId } = await context.params
  const patient = await prisma.clinicPatient.findFirst({
    where: { id: patientId, tenantId: session.tenantId },
    select: { id: true },
  })
  if (!patient) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
  }

  const title = String(body.title ?? '').trim()
  if (!title) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 })
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

  const targetStartAt = parseDateOnly(body.targetStartAt)
  const targetEndAt = parseDateOnly(body.targetEndAt)
  const photoMilestones = normalizePhotoMilestones(body.photoMilestones)

  const plan = await prisma.clinicTreatmentPlan.create({
    data: {
      tenantId: session.tenantId,
      patientId,
      procedureId,
      title: title.slice(0, 240),
      expectedSessions: normalizeTreatmentPlanSessions(body.expectedSessions, 4),
      cadenceDays: normalizeTreatmentPlanCadenceDays(body.cadenceDays, 14),
      status: normalizeTreatmentPlanStatus(body.status),
      targetStartAt,
      targetEndAt,
      goals: body.goals != null ? String(body.goals).trim().slice(0, 6000) || null : null,
      nextSteps: body.nextSteps != null ? String(body.nextSteps).trim().slice(0, 4000) || null : null,
      outcomeNotes:
        body.outcomeNotes != null ? String(body.outcomeNotes).trim().slice(0, 4000) || null : null,
      photoMilestones: photoMilestones.length
        ? (photoMilestones as unknown as Prisma.InputJsonValue)
        : Prisma.DbNull,
      createdByUserId: session.userId,
    },
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
  })

  return NextResponse.json({ plan }, { status: 201 })
}
