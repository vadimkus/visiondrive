import { NextRequest, NextResponse } from 'next/server'
import { ClinicCrmActivityType } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'
import {
  normalizePreferredDays,
  normalizeWaitlistPriority,
  normalizeWaitlistStatus,
  parseOptionalDate,
} from '@/lib/clinic/waitlist'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const existing = await prisma.clinicWaitlistEntry.findFirst({
    where: { id, tenantId: session.tenantId },
    include: { patient: { select: { id: true, firstName: true, lastName: true } } },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Waitlist entry not found' }, { status: 404 })
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const status = body.status != null ? normalizeWaitlistStatus(body.status) : undefined
  const latestAt = body.latestAt !== undefined ? parseOptionalDate(body.latestAt) : undefined
  const earliestAt = body.earliestAt !== undefined ? parseOptionalDate(body.earliestAt) : undefined
  const priority = body.priority !== undefined ? normalizeWaitlistPriority(body.priority) : undefined
  const preferredDays = body.preferredDays !== undefined ? normalizePreferredDays(body.preferredDays) : undefined
  const preferredTimeOfDay =
    body.preferredTimeOfDay !== undefined
      ? String(body.preferredTimeOfDay ?? '').trim().slice(0, 80) || null
      : undefined
  const note = body.note !== undefined ? String(body.note ?? '').trim() || null : undefined
  const bookedAppointmentId =
    body.bookedAppointmentId !== undefined
      ? String(body.bookedAppointmentId ?? '').trim() || null
      : undefined

  const nextEarliestAt = earliestAt === undefined ? existing.earliestAt : earliestAt
  const nextLatestAt = latestAt === undefined ? existing.latestAt : latestAt
  if (nextEarliestAt && nextLatestAt && nextLatestAt < nextEarliestAt) {
    return NextResponse.json({ error: 'latestAt must be after earliestAt' }, { status: 400 })
  }

  if (bookedAppointmentId) {
    const appointment = await prisma.clinicAppointment.findFirst({
      where: { id: bookedAppointmentId, tenantId: session.tenantId, patientId: existing.patientId },
      select: { id: true },
    })
    if (!appointment) {
      return NextResponse.json({ error: 'Booked appointment not found for this patient' }, { status: 404 })
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    const entry = await tx.clinicWaitlistEntry.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(status === 'CONTACTED' ? { lastContactedAt: new Date() } : {}),
        ...(status === 'BOOKED' ? { lastContactedAt: existing.lastContactedAt ?? new Date() } : {}),
        ...(earliestAt !== undefined ? { earliestAt } : {}),
        ...(latestAt !== undefined ? { latestAt } : {}),
        ...(priority !== undefined ? { priority } : {}),
        ...(preferredDays !== undefined ? { preferredDays } : {}),
        ...(preferredTimeOfDay !== undefined ? { preferredTimeOfDay } : {}),
        ...(note !== undefined ? { note } : {}),
        ...(bookedAppointmentId !== undefined ? { bookedAppointmentId } : {}),
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, phone: true, area: true, tags: true } },
        procedure: { select: { id: true, name: true, defaultDurationMin: true } },
        bookedAppointment: { select: { id: true, startsAt: true } },
      },
    })

    if (status === 'CONTACTED') {
      await tx.clinicCrmActivity.create({
        data: {
          tenantId: session.tenantId,
          patientId: existing.patientId,
          type: ClinicCrmActivityType.WHATSAPP,
          body: 'Cancellation-fill WhatsApp message prepared from smart waitlist.',
          occurredAt: new Date(),
          createdByUserId: session.userId,
        },
      })
    }
    if (status === 'BOOKED') {
      await tx.clinicCrmActivity.create({
        data: {
          tenantId: session.tenantId,
          patientId: existing.patientId,
          type: ClinicCrmActivityType.NOTE,
          body: 'Smart waitlist entry marked as booked.',
          occurredAt: new Date(),
          createdByUserId: session.userId,
        },
      })
    }
    return entry
  })

  return NextResponse.json({ entry: updated })
}
