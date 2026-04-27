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

function parseDateOnly(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined
  if (value == null || String(value).trim() === '') return null
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? undefined : date
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string; planId: string }> }
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

  const { id: patientId, planId } = await context.params
  const existing = await prisma.clinicTreatmentPlan.findFirst({
    where: { id: planId, patientId, tenantId: session.tenantId },
    select: { id: true, status: true },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Treatment plan not found' }, { status: 404 })
  }

  const data: Prisma.ClinicTreatmentPlanUpdateInput = {}

  if (body.title !== undefined) {
    const title = String(body.title ?? '').trim()
    if (!title) return NextResponse.json({ error: 'title cannot be empty' }, { status: 400 })
    data.title = title.slice(0, 240)
  }
  if (body.procedureId !== undefined) {
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
      data.procedure = { connect: { id: procedureId } }
    } else {
      data.procedure = { disconnect: true }
    }
  }
  if (body.expectedSessions !== undefined) {
    data.expectedSessions = normalizeTreatmentPlanSessions(body.expectedSessions, 4)
  }
  if (body.cadenceDays !== undefined) {
    data.cadenceDays = normalizeTreatmentPlanCadenceDays(body.cadenceDays, 14)
  }
  if (body.status !== undefined) {
    data.status = normalizeTreatmentPlanStatus(body.status, existing.status)
  }
  if (body.targetStartAt !== undefined) {
    const parsed = parseDateOnly(body.targetStartAt)
    if (parsed === undefined) {
      return NextResponse.json({ error: 'targetStartAt must be a valid date' }, { status: 400 })
    }
    data.targetStartAt = parsed
  }
  if (body.targetEndAt !== undefined) {
    const parsed = parseDateOnly(body.targetEndAt)
    if (parsed === undefined) {
      return NextResponse.json({ error: 'targetEndAt must be a valid date' }, { status: 400 })
    }
    data.targetEndAt = parsed
  }
  if (body.goals !== undefined) {
    data.goals = body.goals == null ? null : String(body.goals).trim().slice(0, 6000) || null
  }
  if (body.nextSteps !== undefined) {
    data.nextSteps =
      body.nextSteps == null ? null : String(body.nextSteps).trim().slice(0, 4000) || null
  }
  if (body.outcomeNotes !== undefined) {
    data.outcomeNotes =
      body.outcomeNotes == null ? null : String(body.outcomeNotes).trim().slice(0, 4000) || null
  }
  if (body.photoMilestones !== undefined) {
    const milestones = normalizePhotoMilestones(body.photoMilestones)
    data.photoMilestones = milestones.length
      ? (milestones as unknown as Prisma.InputJsonValue)
      : Prisma.DbNull
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const plan = await prisma.clinicTreatmentPlan.update({
    where: { id: planId },
    data,
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

  return NextResponse.json({ plan })
}
