import { NextRequest, NextResponse } from 'next/server'
import { ClinicCrmActivityType } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'
import { whatsappUrl } from '@/lib/clinic/reminders'
import {
  WAITLIST_ACTIVE_STATUSES,
  buildWaitlistFillMessage,
  normalizePreferredDays,
  normalizeWaitlistPriority,
  normalizeWaitlistStatus,
  parseOptionalDate,
  waitlistMatchScore,
} from '@/lib/clinic/waitlist'

const LIST_LIMIT = 200

function slotFromParams(request: NextRequest) {
  const slotStartRaw = request.nextUrl.searchParams.get('slotStart')
  if (!slotStartRaw) return null
  const startsAt = new Date(slotStartRaw)
  if (Number.isNaN(startsAt.getTime())) return null
  const procedureId = request.nextUrl.searchParams.get('procedureId')?.trim() || null
  return { startsAt, procedureId }
}

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const statusParam = request.nextUrl.searchParams.get('status')?.trim().toUpperCase()
  const slot = slotFromParams(request)
  const statuses =
    statusParam === 'ALL'
      ? undefined
      : statusParam === 'BOOKED' || statusParam === 'CLOSED'
        ? [normalizeWaitlistStatus(statusParam)]
        : WAITLIST_ACTIVE_STATUSES

  const entries = await prisma.clinicWaitlistEntry.findMany({
    where: {
      tenantId: session.tenantId,
      ...(statuses ? { status: { in: statuses } } : {}),
    },
    include: {
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          area: true,
          tags: true,
        },
      },
      procedure: {
        select: {
          id: true,
          name: true,
          defaultDurationMin: true,
        },
      },
      bookedAppointment: {
        select: {
          id: true,
          startsAt: true,
        },
      },
    },
    orderBy: [{ status: 'asc' }, { priority: 'asc' }, { createdAt: 'asc' }],
    take: LIST_LIMIT,
  })

  const rows = entries
    .map((entry) => {
      const serviceName = entry.procedure?.name || 'appointment'
      const matchScore = waitlistMatchScore(
        {
          procedureId: entry.procedureId,
          priority: entry.priority,
          earliestAt: entry.earliestAt,
          latestAt: entry.latestAt,
          createdAt: entry.createdAt,
        },
        slot
      )
      const whatsappMessage = slot
        ? buildWaitlistFillMessage({
            firstName: entry.patient.firstName,
            service: serviceName,
            startsAt: slot.startsAt,
          })
        : null

      return {
        ...entry,
        matchScore,
        whatsappMessage,
        whatsappUrl: whatsappMessage ? whatsappUrl(entry.patient.phone, whatsappMessage) : null,
      }
    })
    .sort((a, b) => {
      if (slot && b.matchScore !== a.matchScore) return b.matchScore - a.matchScore
      if (a.priority !== b.priority) return a.priority - b.priority
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })

  return NextResponse.json({
    entries: rows,
    slot: slot ? { startsAt: slot.startsAt.toISOString(), procedureId: slot.procedureId } : null,
    totals: {
      open: entries.filter((entry) => entry.status === 'OPEN').length,
      contacted: entries.filter((entry) => entry.status === 'CONTACTED').length,
      active: entries.filter((entry) => WAITLIST_ACTIVE_STATUSES.includes(entry.status)).length,
    },
  })
}

export async function POST(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const patientId = String(body.patientId ?? '').trim()
  const procedureId = body.procedureId != null ? String(body.procedureId).trim() || null : null
  const earliestAt = parseOptionalDate(body.earliestAt)
  const latestAt = parseOptionalDate(body.latestAt)
  const priority = normalizeWaitlistPriority(body.priority)
  const preferredDays = normalizePreferredDays(body.preferredDays)
  const preferredTimeOfDay =
    body.preferredTimeOfDay != null ? String(body.preferredTimeOfDay).trim().slice(0, 80) || null : null
  const note = body.note != null ? String(body.note).trim() || null : null

  if (!patientId) {
    return NextResponse.json({ error: 'patientId is required' }, { status: 400 })
  }
  if (earliestAt && latestAt && latestAt < earliestAt) {
    return NextResponse.json({ error: 'latestAt must be after earliestAt' }, { status: 400 })
  }

  const patient = await prisma.clinicPatient.findFirst({
    where: { id: patientId, tenantId: session.tenantId },
    select: { id: true, firstName: true, lastName: true },
  })
  if (!patient) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
  }

  if (procedureId) {
    const procedure = await prisma.clinicProcedure.findFirst({
      where: { id: procedureId, tenantId: session.tenantId, active: true },
      select: { id: true },
    })
    if (!procedure) {
      return NextResponse.json({ error: 'Procedure not found or inactive' }, { status: 404 })
    }
  }

  const entry = await prisma.$transaction(async (tx) => {
    const created = await tx.clinicWaitlistEntry.create({
      data: {
        tenantId: session.tenantId,
        patientId,
        procedureId,
        earliestAt,
        latestAt,
        priority,
        preferredDays,
        preferredTimeOfDay,
        note,
        createdByUserId: session.userId,
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, phone: true, area: true, tags: true } },
        procedure: { select: { id: true, name: true, defaultDurationMin: true } },
        bookedAppointment: { select: { id: true, startsAt: true } },
      },
    })
    await tx.clinicCrmActivity.create({
      data: {
        tenantId: session.tenantId,
        patientId,
        type: ClinicCrmActivityType.NOTE,
        body: 'Added to smart waitlist for cancellation fill.',
        occurredAt: new Date(),
        createdByUserId: session.userId,
      },
    })
    return created
  })

  return NextResponse.json({ entry }, { status: 201 })
}
