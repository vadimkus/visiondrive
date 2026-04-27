import { NextRequest, NextResponse } from 'next/server'
import { ClinicCrmActivityType, ClinicReviewStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'
import {
  normalizeReviewRating,
  normalizeReviewStatus,
  reviewStatusPatch,
} from '@/lib/clinic/reviews'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>

  const existing = await prisma.clinicPatientReview.findFirst({
    where: { id, tenantId: session.tenantId },
    include: { patient: { select: { id: true, firstName: true, lastName: true } } },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 })
  }

  const nextStatus =
    body.status !== undefined
      ? normalizeReviewStatus(body.status, existing.status)
      : existing.status
  const now = new Date()
  const timestampPatch = reviewStatusPatch(nextStatus, now)

  const data = {
    status: nextStatus,
    rating:
      body.rating !== undefined ? normalizeReviewRating(body.rating) : existing.rating,
    privateNote:
      body.privateNote !== undefined
        ? String(body.privateNote || '').trim() || null
        : existing.privateNote,
    publicComment:
      body.publicComment !== undefined
        ? String(body.publicComment || '').trim() || null
        : existing.publicComment,
    repliedAt:
      timestampPatch.repliedAt === undefined
        ? existing.repliedAt
        : existing.repliedAt ?? timestampPatch.repliedAt,
    publishedAt:
      timestampPatch.publishedAt === undefined
        ? existing.publishedAt
        : existing.publishedAt ?? timestampPatch.publishedAt,
  }

  const review = await prisma.$transaction(async (tx) => {
    const updated = await tx.clinicPatientReview.update({
      where: { id },
      data,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
        appointment: {
          select: {
            id: true,
            startsAt: true,
            procedure: { select: { name: true } },
            titleOverride: true,
          },
        },
        reminderDelivery: {
          select: { id: true, status: true, whatsappUrl: true, error: true },
        },
      },
    })

    if (nextStatus === ClinicReviewStatus.REPLIED && existing.status !== ClinicReviewStatus.REPLIED) {
      await tx.clinicCrmActivity.create({
        data: {
          tenantId: session.tenantId,
          patientId: existing.patientId,
          type: ClinicCrmActivityType.NOTE,
          body: `Review reply recorded${data.rating ? ` (${data.rating}/5)` : ''}.`,
          occurredAt: now,
          createdByUserId: session.userId,
        },
      })
    }

    return updated
  })

  return NextResponse.json({ review })
}
