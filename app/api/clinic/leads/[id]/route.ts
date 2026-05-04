import { NextRequest, NextResponse } from 'next/server'
import { ClinicLeadStage } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'
import {
  cleanInstagramHandle,
  displayNameFromLeadInput,
  normalizeLeadSource,
  normalizeLeadStage,
} from '@/lib/clinic/instagram-growth'

function cleanText(value: unknown, max = 500) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed.slice(0, max) : null
}
const selectLead = {
  id: true,
  source: true,
  stage: true,
  displayName: true,
  instagramHandle: true,
  phone: true,
  email: true,
  campaign: true,
  trackingCode: true,
  notes: true,
  lastContactedAt: true,
  convertedAt: true,
  lostAt: true,
  createdAt: true,
  updatedAt: true,
  procedure: { select: { id: true, name: true, basePriceCents: true, currency: true } },
  convertedPatient: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
  convertedAppointment: {
    select: {
      id: true,
      startsAt: true,
      status: true,
      completedAt: true,
      procedure: { select: { id: true, name: true } },
    },
  },
  activities: {
    orderBy: { occurredAt: 'desc' as const },
    take: 50,
    select: {
      id: true,
      type: true,
      direction: true,
      body: true,
      metadata: true,
      occurredAt: true,
      createdAt: true,
    },
  },
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const lead = await prisma.clinicLead.findFirst({
    where: { id, tenantId: session.tenantId },
    select: selectLead,
  })
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  return NextResponse.json({ lead })
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
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

  const existing = await prisma.clinicLead.findFirst({
    where: { id, tenantId: session.tenantId },
    select: { id: true, stage: true },
  })
  if (!existing) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

  const procedureId = body.procedureId === null ? null : cleanText(body.procedureId, 120)
  if (procedureId) {
    const procedure = await prisma.clinicProcedure.findFirst({
      where: { id: procedureId, tenantId: session.tenantId },
      select: { id: true },
    })
    if (!procedure) return NextResponse.json({ error: 'Service not found' }, { status: 404 })
  }

  const nextStage = body.stage != null ? normalizeLeadStage(body.stage, existing.stage) : existing.stage
  const stageChanged = nextStage !== existing.stage
  const lead = await prisma.$transaction(async (tx) => {
    const updated = await tx.clinicLead.update({
      where: { id },
      data: {
        ...(body.source != null ? { source: normalizeLeadSource(body.source) } : {}),
        ...(body.stage != null
          ? {
              stage: nextStage,
              lostAt: nextStage === ClinicLeadStage.LOST ? new Date() : null,
            }
          : {}),
        ...(body.displayName != null || body.instagramHandle != null || body.phone != null || body.email != null
          ? {
              displayName: displayNameFromLeadInput({
                displayName: body.displayName,
                instagramHandle: body.instagramHandle,
                phone: body.phone,
                email: body.email,
              }),
            }
          : {}),
        ...(body.instagramHandle !== undefined ? { instagramHandle: cleanInstagramHandle(body.instagramHandle) } : {}),
        ...(body.phone !== undefined ? { phone: cleanText(body.phone, 80) } : {}),
        ...(body.email !== undefined ? { email: cleanText(body.email, 180) } : {}),
        ...(body.procedureId !== undefined ? { procedureId } : {}),
        ...(body.campaign !== undefined ? { campaign: cleanText(body.campaign, 120) } : {}),
        ...(body.notes !== undefined ? { notes: cleanText(body.notes, 2000) } : {}),
      },
      select: selectLead,
    })

    if (stageChanged) {
      await tx.clinicLeadActivity.create({
        data: {
          tenantId: session.tenantId,
          leadId: id,
          type: 'STATUS_CHANGE',
          direction: 'INTERNAL',
          body: `Lead stage changed to ${nextStage}`,
          metadata: { before: existing.stage, after: nextStage },
          createdByUserId: session.userId,
        },
      })
    }
    return updated
  })

  return NextResponse.json({ lead })
}
