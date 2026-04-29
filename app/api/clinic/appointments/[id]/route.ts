import { NextRequest, NextResponse } from 'next/server'
import {
  ClinicAppointmentEventType,
  ClinicAppointmentStatus,
  ClinicReminderKind,
  ClinicReminderStatus,
} from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'
import {
  ACTIVE_APPOINTMENT_STATUSES,
  normalizeBufferMinutes,
  normalizeTravelBufferMinutes,
  statusTimestampPatch,
  writeAppointmentEvent,
} from '@/lib/clinic/appointments'
import {
  findSchedulingConflict,
  normalizeOverrideReason,
  overrideAllowed,
} from '@/lib/clinic/scheduling-guard'
import {
  buildClientBalanceChargesFromAppointments,
  buildClientBalanceSummary,
} from '@/lib/clinic/client-balance'
import {
  bookingPolicyAppointmentData,
  bookingPolicyRequiresAcceptance,
  type BookingPolicyProcedure,
} from '@/lib/clinic/booking-policy'
import { shouldBlockConfirmation } from '@/lib/clinic/deposit-requests'

function parseStatus(v: string): ClinicAppointmentStatus | null {
  const u = v.toUpperCase().trim()
  const allowed: ClinicAppointmentStatus[] = [
    'SCHEDULED',
    'CONFIRMED',
    'ARRIVED',
    'CANCELLED',
    'COMPLETED',
    'NO_SHOW',
  ]
  return allowed.includes(u as ClinicAppointmentStatus) ? (u as ClinicAppointmentStatus) : null
}

const UPCOMING_APPOINTMENT_STATUSES = [
  ClinicAppointmentStatus.SCHEDULED,
  ClinicAppointmentStatus.CONFIRMED,
  ClinicAppointmentStatus.ARRIVED,
]

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params

  const appointment = await prisma.clinicAppointment.findFirst({
    where: { id, tenantId: session.tenantId },
    include: {
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          middleName: true,
          phone: true,
          email: true,
          homeAddress: true,
          area: true,
          accessNotes: true,
          category: true,
          tags: true,
          internalNotes: true,
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
      visits: {
        select: {
          id: true,
          visitAt: true,
          status: true,
          chiefComplaint: true,
          procedureSummary: true,
          nextSteps: true,
          aftercareTemplateId: true,
          aftercareTitleSnapshot: true,
          aftercareTextSnapshot: true,
          aftercareDocumentNameSnapshot: true,
          aftercareDocumentUrlSnapshot: true,
          aftercareSentAt: true,
          productSales: {
            include: {
              payment: {
                select: { id: true, status: true, amountCents: true, processorFeeCents: true, method: true, paidAt: true },
              },
              lines: {
                include: {
                  stockItem: { select: { id: true, name: true, sku: true, unit: true } },
                },
              },
            },
            orderBy: { soldAt: 'desc' },
          },
          payments: {
            select: {
              id: true,
              amountCents: true,
              discountCents: true,
              discountRuleId: true,
              discountName: true,
              discountReason: true,
              feeCents: true,
              processorFeeCents: true,
              currency: true,
              method: true,
              status: true,
              reference: true,
              note: true,
              paidAt: true,
              visitId: true,
              appointmentId: true,
              paymentRequestExpiresAt: true,
              paymentRequestSentAt: true,
              correctionsAsOriginal: {
                select: {
                  id: true,
                  type: true,
                  amountCents: true,
                  currency: true,
                  method: true,
                  reason: true,
                  note: true,
                  correctedAt: true,
                  adjustmentPaymentId: true,
                },
                orderBy: { correctedAt: 'desc' },
              },
            },
            orderBy: { paidAt: 'desc' },
          },
        },
        orderBy: { visitAt: 'desc' },
      },
      payments: {
        select: {
          id: true,
          amountCents: true,
          discountCents: true,
          discountRuleId: true,
          discountName: true,
          discountReason: true,
          feeCents: true,
          processorFeeCents: true,
          currency: true,
          method: true,
          status: true,
          reference: true,
          note: true,
          paidAt: true,
          visitId: true,
          appointmentId: true,
          paymentRequestExpiresAt: true,
          paymentRequestSentAt: true,
          correctionsAsOriginal: {
            select: {
              id: true,
              type: true,
              amountCents: true,
              currency: true,
              method: true,
              reason: true,
              note: true,
              correctedAt: true,
              adjustmentPaymentId: true,
            },
            orderBy: { correctedAt: 'desc' },
          },
        },
        orderBy: { paidAt: 'desc' },
      },
      events: {
        select: {
          id: true,
          type: true,
          message: true,
          before: true,
          after: true,
          createdAt: true,
          createdBy: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      reviews: {
        select: {
          id: true,
          status: true,
          rating: true,
          privateNote: true,
          publicComment: true,
          requestedAt: true,
          repliedAt: true,
          publishedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 3,
      },
    },
  })

  if (!appointment) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const [reminderDeliveries, nextAppointment, balanceAppointments, standalonePayments] =
    await Promise.all([
      prisma.clinicReminderDelivery.findMany({
        where: { appointmentId: id, tenantId: session.tenantId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.clinicAppointment.findFirst({
        where: {
          tenantId: session.tenantId,
          patientId: appointment.patientId,
          id: { not: id },
          startsAt: { gt: new Date() },
          status: { in: UPCOMING_APPOINTMENT_STATUSES },
        },
        select: {
          id: true,
          startsAt: true,
          procedure: { select: { name: true } },
          titleOverride: true,
        },
        orderBy: { startsAt: 'asc' },
      }),
      prisma.clinicAppointment.findMany({
        where: {
          tenantId: session.tenantId,
          patientId: appointment.patientId,
          status: {
            in: [ClinicAppointmentStatus.ARRIVED, ClinicAppointmentStatus.COMPLETED],
          },
        },
        select: {
          status: true,
          procedure: { select: { basePriceCents: true, currency: true } },
          visits: {
            select: {
              payments: {
                select: {
                  id: true,
                  amountCents: true,
                  discountCents: true,
                  discountRuleId: true,
                  discountName: true,
                  discountReason: true,
                  feeCents: true,
                  processorFeeCents: true,
                  currency: true,
                  status: true,
                  reference: true,
                  paidAt: true,
                },
              },
            },
          },
          payments: {
            select: {
              id: true,
              amountCents: true,
              discountCents: true,
              discountRuleId: true,
              discountName: true,
              discountReason: true,
              feeCents: true,
              processorFeeCents: true,
              currency: true,
              status: true,
              reference: true,
              paidAt: true,
            },
          },
        },
      }),
      prisma.clinicPatientPayment.findMany({
        where: {
          tenantId: session.tenantId,
          patientId: appointment.patientId,
          visitId: null,
          appointmentId: null,
        },
        select: {
          id: true,
          amountCents: true,
          discountCents: true,
          discountRuleId: true,
          discountName: true,
          discountReason: true,
          feeCents: true,
          processorFeeCents: true,
          currency: true,
          status: true,
          reference: true,
          paidAt: true,
        },
      }),
    ])

  const rebookingReminderScheduled = reminderDeliveries.some(
    (delivery) =>
      delivery.kind === ClinicReminderKind.REBOOKING_FOLLOW_UP &&
      delivery.status === ClinicReminderStatus.SCHEDULED
  )

  return NextResponse.json({
    appointment: {
      ...appointment,
      reminderDeliveries,
      followUpAutomation: {
        nextAppointment,
        rebookingReminderScheduled,
      },
      clientBalance: buildClientBalanceSummary({
        charges: buildClientBalanceChargesFromAppointments(balanceAppointments),
        standalonePayments,
        fallbackCurrency: appointment.procedure?.currency ?? 'AED',
      }),
    },
  })
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

  const existing = await prisma.clinicAppointment.findFirst({
    where: { id, tenantId: session.tenantId },
    include: {
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
    },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const data: {
    startsAt?: Date
    endsAt?: Date | null
    status?: ClinicAppointmentStatus
    bufferAfterMinutes?: number
    travelBufferBeforeMinutes?: number
    travelBufferAfterMinutes?: number
    locationAddress?: string | null
    locationArea?: string | null
    locationNotes?: string | null
    cancelReason?: string | null
    confirmedAt?: Date | null
    arrivedAt?: Date | null
    completedAt?: Date | null
    titleOverride?: string | null
    internalNotes?: string | null
    procedureId?: string | null
    overrideReason?: string | null
    bookingPolicyType?: ReturnType<typeof bookingPolicyAppointmentData>['bookingPolicyType']
    bookingPolicySnapshot?: ReturnType<typeof bookingPolicyAppointmentData>['bookingPolicySnapshot']
    bookingPolicyAcceptedAt?: Date | null
    paymentRequirementStatus?: ReturnType<typeof bookingPolicyAppointmentData>['paymentRequirementStatus']
    depositRequiredCents?: number
    cancellationWindowHours?: number
    lateCancelFeeCents?: number
    noShowFeeCents?: number
  } = {}

  const endsAtProvided = body.endsAt !== undefined
  const allowConflictOverride = body.allowConflictOverride === true
  const overrideReason = normalizeOverrideReason(body.overrideReason)

  if (body.startsAt !== undefined) {
    const d = new Date(String(body.startsAt))
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json({ error: 'startsAt must be a valid ISO datetime' }, { status: 400 })
    }
    data.startsAt = d
  }

  if (endsAtProvided) {
    if (body.endsAt === null) {
      data.endsAt = null
    } else {
      const d = new Date(String(body.endsAt))
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json({ error: 'endsAt must be a valid ISO datetime' }, { status: 400 })
      }
      data.endsAt = d
    }
  }

  if (body.status !== undefined) {
    const s = parseStatus(String(body.status))
    if (!s) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    data.status = s
    Object.assign(data, statusTimestampPatch(s))
  }

  if (body.bufferAfterMinutes !== undefined) {
    data.bufferAfterMinutes = normalizeBufferMinutes(body.bufferAfterMinutes, existing.bufferAfterMinutes)
  }
  if (body.travelBufferBeforeMinutes !== undefined) {
    data.travelBufferBeforeMinutes = normalizeTravelBufferMinutes(
      body.travelBufferBeforeMinutes,
      existing.travelBufferBeforeMinutes
    )
  }
  if (body.travelBufferAfterMinutes !== undefined) {
    data.travelBufferAfterMinutes = normalizeTravelBufferMinutes(
      body.travelBufferAfterMinutes,
      existing.travelBufferAfterMinutes
    )
  }
  if (body.locationAddress !== undefined) {
    data.locationAddress =
      body.locationAddress == null ? null : String(body.locationAddress).trim() || null
  }
  if (body.locationArea !== undefined) {
    data.locationArea = body.locationArea == null ? null : String(body.locationArea).trim() || null
  }
  if (body.locationNotes !== undefined) {
    data.locationNotes = body.locationNotes == null ? null : String(body.locationNotes).trim() || null
  }

  if (body.cancelReason !== undefined) {
    data.cancelReason = body.cancelReason == null ? null : String(body.cancelReason).trim() || null
  }

  if (body.titleOverride !== undefined) {
    data.titleOverride = body.titleOverride == null ? null : String(body.titleOverride).trim() || null
  }
  if (body.internalNotes !== undefined) {
    data.internalNotes =
      body.internalNotes == null ? null : String(body.internalNotes).trim() || null
  }
  if (body.overrideReason !== undefined) {
    data.overrideReason = overrideReason
  }

  if (body.procedureId !== undefined) {
    const pid = body.procedureId == null ? null : String(body.procedureId).trim() || null
    if (pid) {
      const proc = await prisma.clinicProcedure.findFirst({
        where: { id: pid, tenantId: session.tenantId, active: true },
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
      if (!proc) {
        return NextResponse.json({ error: 'Procedure not found or inactive' }, { status: 400 })
      }
      const bookingPolicyAccepted = body.bookingPolicyAccepted === true
      if (bookingPolicyRequiresAcceptance(proc) && !bookingPolicyAccepted) {
        return NextResponse.json({ error: 'Booking policy acceptance is required' }, { status: 400 })
      }
      data.procedureId = proc.id
      Object.assign(data, bookingPolicyAppointmentData(proc, bookingPolicyAccepted))
      if (body.bufferAfterMinutes === undefined) {
        data.bufferAfterMinutes = proc.bufferAfterMinutes
      }
    } else {
      data.procedureId = null
      Object.assign(data, bookingPolicyAppointmentData(null, false))
      if (body.bufferAfterMinutes === undefined) {
        data.bufferAfterMinutes = 0
      }
    }
  } else if (body.bookingPolicyAccepted !== undefined) {
    const proc = existing.procedure as (BookingPolicyProcedure & { defaultDurationMin: number }) | null
    if (bookingPolicyRequiresAcceptance(proc) && body.bookingPolicyAccepted !== true) {
      return NextResponse.json({ error: 'Booking policy acceptance is required' }, { status: 400 })
    }
    Object.assign(data, bookingPolicyAppointmentData(proc, body.bookingPolicyAccepted === true))
  }

  const shouldRecomputeEnd =
    !endsAtProvided &&
    (data.startsAt !== undefined || data.procedureId !== undefined) &&
    (data.procedureId !== undefined ? data.procedureId !== null : existing.procedureId !== null)

  if (shouldRecomputeEnd) {
    const procId =
      data.procedureId !== undefined ? data.procedureId : existing.procedureId
    const start = data.startsAt ?? existing.startsAt
    if (procId) {
      const proc = await prisma.clinicProcedure.findFirst({
        where: { id: procId, tenantId: session.tenantId },
        select: { defaultDurationMin: true },
      })
      if (proc) {
        data.endsAt = new Date(start.getTime() + proc.defaultDurationMin * 60 * 1000)
      }
    }
  }

  const nextStartsAt = data.startsAt ?? existing.startsAt
  const nextEndsAt = data.endsAt !== undefined ? data.endsAt : existing.endsAt
  const nextBufferAfterMinutes = data.bufferAfterMinutes ?? existing.bufferAfterMinutes
  const nextTravelBufferBeforeMinutes =
    data.travelBufferBeforeMinutes ?? existing.travelBufferBeforeMinutes
  const nextTravelBufferAfterMinutes =
    data.travelBufferAfterMinutes ?? existing.travelBufferAfterMinutes
  const nextProcedureId = data.procedureId !== undefined ? data.procedureId : existing.procedureId
  const nextPaymentRequirementStatus =
    data.paymentRequirementStatus ?? existing.paymentRequirementStatus
  const nextDepositRequiredCents = data.depositRequiredCents ?? existing.depositRequiredCents
  if (nextEndsAt && nextEndsAt <= nextStartsAt) {
    return NextResponse.json({ error: 'endsAt must be after startsAt' }, { status: 400 })
  }

  if (
    data.status &&
    shouldBlockConfirmation({
      nextStatus: data.status,
      paymentRequirementStatus: nextPaymentRequirementStatus,
      depositRequiredCents: nextDepositRequiredCents,
    })
  ) {
    return NextResponse.json({ error: 'Deposit must be paid before confirming this appointment' }, { status: 409 })
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const result = await prisma.$transaction(async (tx) => {
    const nextStatus = data.status ?? existing.status
    const scheduleRelevantChange =
      data.startsAt !== undefined ||
      data.endsAt !== undefined ||
      data.bufferAfterMinutes !== undefined ||
      data.travelBufferBeforeMinutes !== undefined ||
      data.travelBufferAfterMinutes !== undefined ||
      data.procedureId !== undefined ||
      (!ACTIVE_APPOINTMENT_STATUSES.includes(existing.status) &&
        ACTIVE_APPOINTMENT_STATUSES.includes(nextStatus))

    if (scheduleRelevantChange && ACTIVE_APPOINTMENT_STATUSES.includes(nextStatus)) {
      const conflict = await findSchedulingConflict(tx, {
        tenantId: session.tenantId,
        startsAt: nextStartsAt,
        endsAt: nextEndsAt,
        bufferAfterMinutes: nextBufferAfterMinutes,
        travelBufferBeforeMinutes: nextTravelBufferBeforeMinutes,
        travelBufferAfterMinutes: nextTravelBufferAfterMinutes,
        procedureId: nextProcedureId,
        excludeAppointmentId: id,
      })
      if (!overrideAllowed({ conflict, allowConflictOverride, overrideReason })) {
        return { conflict }
      }
      if (conflict) {
        data.overrideReason = overrideReason
      }
    }

    const appointment = await tx.clinicAppointment.update({
      where: { id },
      data,
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

    const rescheduled =
      data.startsAt !== undefined ||
      data.endsAt !== undefined ||
      data.bufferAfterMinutes !== undefined ||
      data.travelBufferBeforeMinutes !== undefined ||
      data.travelBufferAfterMinutes !== undefined ||
      data.procedureId !== undefined

    await writeAppointmentEvent(tx, {
      tenantId: session.tenantId,
      appointmentId: id,
      type:
        data.status !== undefined && data.status !== existing.status
          ? ClinicAppointmentEventType.STATUS_CHANGED
          : rescheduled
            ? ClinicAppointmentEventType.RESCHEDULED
            : ClinicAppointmentEventType.UPDATED,
      message:
        data.status !== undefined && data.status !== existing.status
          ? `Status changed to ${data.status}`
          : rescheduled
            ? 'Appointment schedule changed'
            : 'Appointment updated',
      before: {
        startsAt: existing.startsAt.toISOString(),
        endsAt: existing.endsAt?.toISOString() ?? null,
        status: existing.status,
        procedureId: existing.procedureId,
        bufferAfterMinutes: existing.bufferAfterMinutes,
        travelBufferBeforeMinutes: existing.travelBufferBeforeMinutes,
        travelBufferAfterMinutes: existing.travelBufferAfterMinutes,
        locationAddress: existing.locationAddress,
        locationArea: existing.locationArea,
        overrideReason: existing.overrideReason,
        bookingPolicyType: existing.bookingPolicyType,
        bookingPolicyAcceptedAt: existing.bookingPolicyAcceptedAt?.toISOString() ?? null,
        paymentRequirementStatus: existing.paymentRequirementStatus,
        depositRequiredCents: existing.depositRequiredCents,
      },
      after: {
        startsAt: appointment.startsAt.toISOString(),
        endsAt: appointment.endsAt?.toISOString() ?? null,
        status: appointment.status,
        procedureId: appointment.procedureId,
        bufferAfterMinutes: appointment.bufferAfterMinutes,
        travelBufferBeforeMinutes: appointment.travelBufferBeforeMinutes,
        travelBufferAfterMinutes: appointment.travelBufferAfterMinutes,
        locationAddress: appointment.locationAddress,
        locationArea: appointment.locationArea,
        overrideReason: appointment.overrideReason,
        bookingPolicyType: appointment.bookingPolicyType,
        bookingPolicyAcceptedAt: appointment.bookingPolicyAcceptedAt?.toISOString() ?? null,
        paymentRequirementStatus: appointment.paymentRequirementStatus,
        depositRequiredCents: appointment.depositRequiredCents,
      },
      createdByUserId: session.userId,
    })

    return { appointment }
  })

  if ('conflict' in result) {
    return NextResponse.json(
      { error: 'Appointment conflicts with an existing booking', conflict: result.conflict },
      { status: 409 }
    )
  }

  return NextResponse.json({ appointment: result.appointment })
}
