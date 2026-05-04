import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'
import {
  nextStageAfterActivity,
  normalizeLeadActivityDirection,
  normalizeLeadActivityType,
} from '@/lib/clinic/instagram-growth'

function cleanText(value: unknown, max = 2000) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed.slice(0, max) : null
}
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
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

  const lead = await prisma.clinicLead.findFirst({
    where: { id, tenantId: session.tenantId },
    select: { id: true, stage: true },
  })
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

  const type = normalizeLeadActivityType(body.type)
  const direction = normalizeLeadActivityDirection(body.direction)
  const bodyText = cleanText(body.body)
  const occurredAtRaw = cleanText(body.occurredAt, 80)
  const occurredAt = occurredAtRaw ? new Date(occurredAtRaw) : new Date()
  const safeOccurredAt = Number.isNaN(occurredAt.getTime()) ? new Date() : occurredAt
  const nextStage = nextStageAfterActivity(type, lead.stage)

  const result = await prisma.$transaction(async (tx) => {
    const activity = await tx.clinicLeadActivity.create({
      data: {
        tenantId: session.tenantId,
        leadId: lead.id,
        type,
        direction,
        body: bodyText,
        occurredAt: safeOccurredAt,
        metadata:
          body.metadata && typeof body.metadata === 'object' && !Array.isArray(body.metadata)
            ? (body.metadata as Prisma.InputJsonObject)
            : undefined,
        createdByUserId: session.userId,
      },
    })
    const updatedLead =
      nextStage !== lead.stage || ['INSTAGRAM_DM', 'WHATSAPP', 'BOOKING_LINK_SENT'].includes(type)
        ? await tx.clinicLead.update({
            where: { id: lead.id },
            data: {
              stage: nextStage,
              lastContactedAt: direction === 'OUTBOUND' ? safeOccurredAt : undefined,
            },
            select: { id: true, stage: true, lastContactedAt: true },
          })
        : lead
    return { activity, lead: updatedLead }
  })

  return NextResponse.json(result, { status: 201 })
}
