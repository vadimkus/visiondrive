import { NextRequest, NextResponse } from 'next/server'
import {
  ClinicAppointmentEventType,
  ClinicAppointmentSource,
  ClinicAppointmentStatus,
  ClinicReminderChannel,
  ClinicReminderKind,
  ClinicReminderStatus,
  TenantStatus,
} from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { generateAvailabilitySlots, defaultAvailabilityRules } from '@/lib/clinic/availability'
import { normalizeBufferMinutes, writeAppointmentEvent } from '@/lib/clinic/appointments'
import { findSchedulingConflict } from '@/lib/clinic/scheduling-guard'
import {
  intakeResponsesNote,
  normalizeIntakeResponses,
  parseIntakeAnswerInputs,
  type IntakeQuestionLike,
  type NormalizedIntakeAnswer,
} from '@/lib/clinic/intake-fields'
import {
  normalizePublicBookingInput,
  publicBookingNote,
  validatePublicBookingInput,
} from '@/lib/clinic/public-booking'
import {
  getReminderTemplate,
  reminderScheduledFor,
  renderReminderTemplate,
} from '@/lib/clinic/reminders'
import { getPublicBookingSettings } from '@/lib/clinic/public-booking-settings'
import {
  bookingPolicyAppointmentData,
  bookingPolicyRequiresAcceptance,
  buildBookingPolicySnapshot,
} from '@/lib/clinic/booking-policy'

const ACTIVE_PUBLIC_STATUSES = [
  ClinicAppointmentStatus.SCHEDULED,
  ClinicAppointmentStatus.CONFIRMED,
  ClinicAppointmentStatus.ARRIVED,
  ClinicAppointmentStatus.COMPLETED,
]

async function getTenant(slug: string) {
  return prisma.tenant.findFirst({
    where: { slug, status: TenantStatus.ACTIVE },
    select: { id: true, name: true, slug: true },
  })
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params
  const tenant = await getTenant(slug)
  if (!tenant) {
    return NextResponse.json({ error: 'Booking link not found' }, { status: 404 })
  }
  const bookingSettings = await getPublicBookingSettings(prisma, tenant.id)
  if (!bookingSettings.enabled) {
    return NextResponse.json({ error: 'Booking link not found' }, { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  const procedureId = searchParams.get('procedureId')
  const now = new Date()
  const fromRaw = searchParams.get('from')
  const toRaw = searchParams.get('to')
  const from = fromRaw ? new Date(fromRaw) : now
  const to = toRaw ? new Date(toRaw) : new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to <= from) {
    return NextResponse.json({ error: 'Invalid from or to datetime' }, { status: 400 })
  }

  const procedures = await prisma.clinicProcedure.findMany({
    where: { tenantId: tenant.id, active: true },
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
      intakeQuestions: {
        where: { active: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        select: {
          id: true,
          prompt: true,
          helpText: true,
          type: true,
          required: true,
          sortOrder: true,
        },
      },
    },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  })

  let slots: ReturnType<typeof generateAvailabilitySlots> = []
  const procedure = procedures.find((p) => p.id === procedureId) ?? null
  if (procedure) {
    const [rulesRaw, appointments, blockedTimes] = await Promise.all([
      prisma.clinicAvailabilityRule.findMany({
        where: { tenantId: tenant.id },
        orderBy: [{ dayOfWeek: 'asc' }, { startMinutes: 'asc' }],
      }),
      prisma.clinicAppointment.findMany({
        where: {
          tenantId: tenant.id,
          status: { in: [...ACTIVE_PUBLIC_STATUSES] },
          startsAt: { lt: to },
        },
        select: {
          startsAt: true,
          endsAt: true,
          bufferAfterMinutes: true,
          procedure: { select: { defaultDurationMin: true } },
        },
        orderBy: { startsAt: 'asc' },
        take: 500,
      }),
      prisma.clinicBlockedTime.findMany({
        where: {
          tenantId: tenant.id,
          startsAt: { lt: to },
          endsAt: { gt: from },
        },
        select: { startsAt: true, endsAt: true },
        orderBy: { startsAt: 'asc' },
        take: 500,
      }),
    ])

    slots = generateAvailabilitySlots({
      from,
      to,
      rules: rulesRaw.length > 0 ? rulesRaw : defaultAvailabilityRules(),
      appointments,
      blockedTimes,
      durationMinutes: procedure.defaultDurationMin,
      bufferAfterMinutes: normalizeBufferMinutes(procedure.bufferAfterMinutes),
      procedureId: procedure.id,
      now,
    }).slice(0, 80)
  }

  return NextResponse.json({
    tenant,
    settings: { confirmationMode: bookingSettings.confirmationMode },
    procedures,
    slots,
    range: { from: from.toISOString(), to: to.toISOString() },
  })
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params
  const tenant = await getTenant(slug)
  if (!tenant) {
    return NextResponse.json({ error: 'Booking link not found' }, { status: 404 })
  }
  const bookingSettings = await getPublicBookingSettings(prisma, tenant.id)
  if (!bookingSettings.enabled) {
    return NextResponse.json({ error: 'Booking link not found' }, { status: 404 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const procedureId = String(body.procedureId ?? '').trim()
  const startsAt = body.startsAt != null ? new Date(String(body.startsAt)) : null
  const client = normalizePublicBookingInput(body)
  const validationError = validatePublicBookingInput(client)
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 })
  if (!procedureId || !startsAt || Number.isNaN(startsAt.getTime())) {
    return NextResponse.json({ error: 'procedureId and valid startsAt are required' }, { status: 400 })
  }

  const procedure = await prisma.clinicProcedure.findFirst({
    where: { id: procedureId, tenantId: tenant.id, active: true },
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
      intakeQuestions: {
        where: { active: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        select: {
          id: true,
          prompt: true,
          helpText: true,
          type: true,
          required: true,
        },
      },
    },
  })
  if (!procedure) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 })
  }
  const bookingPolicyAccepted = body.bookingPolicyAccepted === true
  if (bookingPolicyRequiresAcceptance(procedure) && !bookingPolicyAccepted) {
    return NextResponse.json({ error: 'Booking policy acceptance is required' }, { status: 400 })
  }
  const bookingPolicyData = bookingPolicyAppointmentData(procedure, bookingPolicyAccepted)
  const bookingPolicyEventSnapshot = buildBookingPolicySnapshot(procedure)

  const endsAt = new Date(startsAt.getTime() + procedure.defaultDurationMin * 60 * 1000)
  const bufferAfterMinutes = normalizeBufferMinutes(procedure.bufferAfterMinutes)
  const intake = normalizeIntakeResponses(
    procedure.intakeQuestions as IntakeQuestionLike[],
    parseIntakeAnswerInputs(body.intakeAnswers)
  )
  if (intake.missingRequired.length > 0) {
    return NextResponse.json(
      { error: 'Required intake questions are missing', missingQuestionIds: intake.missingRequired.map((q) => q.id) },
      { status: 400 }
    )
  }
  const intakeNote = intakeResponsesNote(intake.responses)

  const result = await prisma.$transaction(async (tx) => {
    const conflict = await findSchedulingConflict(tx, {
      tenantId: tenant.id,
      startsAt,
      endsAt,
      bufferAfterMinutes,
      procedureId: procedure.id,
    })
    if (conflict) return { conflict }

    const patient =
      (await tx.clinicPatient.findFirst({
        where: {
          tenantId: tenant.id,
          OR: [
            ...(client.email ? [{ email: { equals: client.email, mode: 'insensitive' as const } }] : []),
            ...(client.phone ? [{ phone: client.phone }] : []),
          ],
        },
      })) ??
      (await tx.clinicPatient.create({
        data: {
          tenantId: tenant.id,
          firstName: client.firstName,
          lastName: client.lastName,
          dateOfBirth: client.dateOfBirth,
          phone: client.phone || null,
          email: client.email,
        },
      }))

    const appointment = await tx.clinicAppointment.create({
      data: {
        tenantId: tenant.id,
        patientId: patient.id,
        procedureId: procedure.id,
        startsAt,
        endsAt,
        status:
          bookingSettings.confirmationMode === 'INSTANT'
            ? ClinicAppointmentStatus.CONFIRMED
            : ClinicAppointmentStatus.SCHEDULED,
        confirmedAt: bookingSettings.confirmationMode === 'INSTANT' ? new Date() : null,
        source: ClinicAppointmentSource.ONLINE,
        bufferAfterMinutes,
        internalNotes: [publicBookingNote(client), intakeNote].filter(Boolean).join('\n\n'),
        ...bookingPolicyData,
      },
      include: {
        patient: { select: { firstName: true, lastName: true, phone: true } },
        procedure: { select: { name: true } },
      },
    })

    if (intake.responses.length > 0) {
      await tx.clinicIntakeResponse.createMany({
        data: intake.responses.map((response: NormalizedIntakeAnswer) => ({
          tenantId: tenant.id,
          patientId: patient.id,
          appointmentId: appointment.id,
          procedureId: procedure.id,
          questionId: response.questionId,
          promptSnapshot: response.promptSnapshot,
          typeSnapshot: response.typeSnapshot,
          answerText: response.answerText,
        })),
      })
    }

    await writeAppointmentEvent(tx, {
      tenantId: tenant.id,
      appointmentId: appointment.id,
      type: ClinicAppointmentEventType.CREATED,
      message: 'Online booking created',
      after: {
        source: ClinicAppointmentSource.ONLINE,
        confirmationMode: bookingSettings.confirmationMode,
        consentAccepted: client.consentAccepted,
        notes: client.notes,
        bookingPolicyAccepted,
        bookingPolicy: bookingPolicyEventSnapshot,
        intakeAnswers: intake.responses.map((response) => ({
          questionId: response.questionId,
          prompt: response.promptSnapshot,
          answer: response.answerText,
        })),
      },
      createdByUserId: null,
    })

    const template = await getReminderTemplate(tx, tenant.id, ClinicReminderKind.APPOINTMENT_REMINDER)
    if (template) {
      const reminderBody = renderReminderTemplate(template.body, appointment)
      await tx.clinicReminderDelivery.create({
        data: {
          tenantId: tenant.id,
          appointmentId: appointment.id,
          patientId: patient.id,
          kind: ClinicReminderKind.APPOINTMENT_REMINDER,
          channel: ClinicReminderChannel.WHATSAPP,
          status: ClinicReminderStatus.SCHEDULED,
          scheduledFor: reminderScheduledFor(startsAt),
          body: reminderBody,
        },
      })
    }

    return { appointment, publicPatientName: `${client.firstName} ${client.lastName}` }
  })

  if ('conflict' in result) {
    return NextResponse.json(
      { error: 'This slot is no longer available', conflict: result.conflict },
      { status: 409 }
    )
  }

  return NextResponse.json(
    {
      appointment: {
        id: result.appointment.id,
        startsAt: result.appointment.startsAt,
        endsAt: result.appointment.endsAt,
        status: result.appointment.status,
        confirmationMode: bookingSettings.confirmationMode,
        service: result.appointment.procedure?.name,
        patientName: result.publicPatientName,
      },
    },
    { status: 201 }
  )
}
