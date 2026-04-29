import { NextRequest, NextResponse } from 'next/server'
import { ClinicAppointmentEventType, ClinicAppointmentSource } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'
import {
  normalizeBufferMinutes,
  normalizeTravelBufferMinutes,
  writeAppointmentEvent,
} from '@/lib/clinic/appointments'
import {
  findSchedulingConflict,
  normalizeOverrideReason,
  overrideAllowed,
} from '@/lib/clinic/scheduling-guard'
import {
  bookingPolicyAppointmentData,
  bookingPolicyRequiresAcceptance,
  buildBookingPolicySnapshot,
  type BookingPolicyProcedure,
} from '@/lib/clinic/booking-policy'

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const fromRaw = searchParams.get('from')
  const toRaw = searchParams.get('to')

  const now = new Date()
  const from = fromRaw ? new Date(fromRaw) : new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const to = toRaw
    ? new Date(toRaw)
    : new Date(from.getTime() + 7 * 24 * 60 * 60 * 1000)

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return NextResponse.json({ error: 'Invalid from or to datetime' }, { status: 400 })
  }

  try {
    const appointments = await prisma.clinicAppointment.findMany({
      where: {
        tenantId: session.tenantId,
        startsAt: { gte: from, lte: to },
      },
      orderBy: { startsAt: 'asc' },
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true, homeAddress: true, area: true, accessNotes: true },
        },
        procedure: {
          select: {
            id: true,
            name: true,
            defaultDurationMin: true,
            bufferAfterMinutes: true,
            basePriceCents: true,
            currency: true,
            bookingPolicyType: true,
            depositAmountCents: true,
            depositPercent: true,
            cancellationWindowHours: true,
            lateCancelFeeCents: true,
            noShowFeeCents: true,
            bookingPolicyText: true,
          },
        },
        payments: {
          where: { reference: { startsWith: 'DEPOSIT:' } },
          select: {
            id: true,
            amountCents: true,
            currency: true,
            status: true,
            reference: true,
            paidAt: true,
            paymentRequestExpiresAt: true,
            paymentRequestSentAt: true,
          },
          orderBy: { paidAt: 'desc' },
        },
        visits: {
          select: { id: true, status: true, visitAt: true },
          orderBy: { visitAt: 'desc' },
          take: 1,
        },
      },
    })

    return NextResponse.json({
      appointments,
      range: { from: from.toISOString(), to: to.toISOString() },
    })
  } catch (e) {
    console.error('GET /api/clinic/appointments', e)
    const msg = e instanceof Error ? e.message : 'Database error'
    return NextResponse.json({ error: msg }, { status: 503 })
  }
}

export async function POST(request: NextRequest) {
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

  const patientId = String(body.patientId ?? '').trim()
  const procedureId = body.procedureId != null ? String(body.procedureId).trim() || null : null
  const startsAt = body.startsAt != null ? new Date(String(body.startsAt)) : null
  const endsAtRaw = body.endsAt != null ? new Date(String(body.endsAt)) : null
  const titleOverride = body.titleOverride != null ? String(body.titleOverride).trim() || null : null
  const internalNotes = body.internalNotes != null ? String(body.internalNotes).trim() || null : null
  const locationAddress =
    body.locationAddress != null ? String(body.locationAddress).trim() || null : null
  const locationArea = body.locationArea != null ? String(body.locationArea).trim() || null : null
  const locationNotes = body.locationNotes != null ? String(body.locationNotes).trim() || null : null
  const allowConflictOverride = body.allowConflictOverride === true
  const overrideReason = normalizeOverrideReason(body.overrideReason)
  const sourceRaw = String(body.source ?? ClinicAppointmentSource.MANUAL).trim().toUpperCase()
  const source = Object.values(ClinicAppointmentSource).includes(sourceRaw as ClinicAppointmentSource)
    ? (sourceRaw as ClinicAppointmentSource)
    : ClinicAppointmentSource.MANUAL

  if (!patientId || !startsAt || Number.isNaN(startsAt.getTime())) {
    return NextResponse.json({ error: 'patientId and valid startsAt are required' }, { status: 400 })
  }

  const patient = await prisma.clinicPatient.findFirst({
    where: { id: patientId, tenantId: session.tenantId },
  })
  if (!patient) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
  }

  let procedure: BookingPolicyProcedure & { defaultDurationMin: number; bufferAfterMinutes: number } | null = null
  if (procedureId) {
    procedure = await prisma.clinicProcedure.findFirst({
      where: { id: procedureId, tenantId: session.tenantId, active: true },
      select: {
        id: true,
        name: true,
        defaultDurationMin: true,
        bufferAfterMinutes: true,
        basePriceCents: true,
        currency: true,
        bookingPolicyType: true,
        depositAmountCents: true,
        depositPercent: true,
        cancellationWindowHours: true,
        lateCancelFeeCents: true,
        noShowFeeCents: true,
        bookingPolicyText: true,
      },
    })
    if (!procedure) {
      return NextResponse.json({ error: 'Procedure not found or inactive' }, { status: 404 })
    }
  }
  const bookingPolicyAccepted = body.bookingPolicyAccepted === true
  if (bookingPolicyRequiresAcceptance(procedure) && !bookingPolicyAccepted) {
    return NextResponse.json({ error: 'Booking policy acceptance is required' }, { status: 400 })
  }
  const bookingPolicyData = bookingPolicyAppointmentData(procedure, bookingPolicyAccepted)
  const bookingPolicyEventSnapshot = procedure ? buildBookingPolicySnapshot(procedure) : null

  let endsAt: Date | null = endsAtRaw && !Number.isNaN(endsAtRaw.getTime()) ? endsAtRaw : null
  if (!endsAt && procedure) {
    endsAt = new Date(startsAt.getTime() + procedure.defaultDurationMin * 60 * 1000)
  }
  if (endsAt && endsAt <= startsAt) {
    return NextResponse.json({ error: 'endsAt must be after startsAt' }, { status: 400 })
  }

  const bufferAfterMinutes = normalizeBufferMinutes(
    body.bufferAfterMinutes,
    procedure?.bufferAfterMinutes ?? 0
  )
  const travelBufferBeforeMinutes = normalizeTravelBufferMinutes(body.travelBufferBeforeMinutes, 0)
  const travelBufferAfterMinutes = normalizeTravelBufferMinutes(body.travelBufferAfterMinutes, 0)

  const appointment = await prisma.$transaction(async (tx) => {
    const conflict = await findSchedulingConflict(tx, {
      tenantId: session.tenantId,
      startsAt,
      endsAt,
      bufferAfterMinutes,
      travelBufferBeforeMinutes,
      travelBufferAfterMinutes,
      procedureId: procedure?.id ?? null,
    })
    if (!overrideAllowed({ conflict, allowConflictOverride, overrideReason })) {
      return { conflict }
    }

    const appointment = await tx.clinicAppointment.create({
      data: {
        tenantId: session.tenantId,
        patientId,
        procedureId: procedure?.id ?? null,
        startsAt,
        endsAt,
        source,
        bufferAfterMinutes,
        travelBufferBeforeMinutes,
        travelBufferAfterMinutes,
        locationAddress: locationAddress ?? patient.homeAddress ?? null,
        locationArea: locationArea ?? patient.area ?? null,
        locationNotes: locationNotes ?? patient.accessNotes ?? null,
        overrideReason: conflict ? overrideReason : null,
        titleOverride,
        internalNotes,
        ...bookingPolicyData,
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            homeAddress: true,
            area: true,
            accessNotes: true,
            category: true,
            tags: true,
          },
        },
        procedure: {
          select: {
            id: true,
            name: true,
            defaultDurationMin: true,
            bufferAfterMinutes: true,
            basePriceCents: true,
            currency: true,
            bookingPolicyType: true,
            depositAmountCents: true,
            depositPercent: true,
            cancellationWindowHours: true,
            lateCancelFeeCents: true,
            noShowFeeCents: true,
            bookingPolicyText: true,
          },
        },
        visits: { select: { id: true, status: true, visitAt: true }, orderBy: { visitAt: 'desc' }, take: 1 },
      },
    })

    await writeAppointmentEvent(tx, {
      tenantId: session.tenantId,
      appointmentId: appointment.id,
      type: ClinicAppointmentEventType.CREATED,
      message: 'Appointment created',
      after: {
        startsAt: startsAt.toISOString(),
        endsAt: endsAt?.toISOString() ?? null,
        bufferAfterMinutes,
        travelBufferBeforeMinutes,
        travelBufferAfterMinutes,
        locationAddress: locationAddress ?? patient.homeAddress ?? null,
        locationArea: locationArea ?? patient.area ?? null,
        source,
        overrideReason: conflict ? overrideReason : null,
        overrideConflictType: conflict?.type ?? null,
        bookingPolicy: bookingPolicyEventSnapshot,
      },
      createdByUserId: session.userId,
    })

    return { appointment }
  })

  if ('conflict' in appointment) {
    return NextResponse.json(
      { error: 'Appointment conflicts with an existing booking', conflict: appointment.conflict },
      { status: 409 }
    )
  }

  return NextResponse.json({ appointment: appointment.appointment }, { status: 201 })
}
