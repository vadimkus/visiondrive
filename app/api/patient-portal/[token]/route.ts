import { NextRequest, NextResponse } from 'next/server'
import {
  ClinicAppointmentEventType,
  ClinicAppointmentStatus,
  ClinicCrmActivityType,
  ClinicPaymentStatus,
} from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { writeAppointmentEvent } from '@/lib/clinic/appointments'
import {
  hashPatientPortalToken,
  isPatientPortalLinkActive,
  normalizePatientPortalMessage,
  normalizePatientPortalRequestType,
  patientPortalRequestLabel,
} from '@/lib/clinic/patient-portal'

async function getActivePortalLink(token: string) {
  const link = await prisma.clinicPatientPortalLink.findUnique({
    where: { tokenHash: hashPatientPortalToken(token) },
    include: { tenant: { select: { name: true } } },
  })
  if (!link || !isPatientPortalLinkActive(link)) return null
  return link
}

function appointmentLabel(appointment: {
  procedure: { name: string } | null
  titleOverride: string | null
}) {
  return appointment.procedure?.name ?? appointment.titleOverride ?? 'Appointment'
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params
  const link = await getActivePortalLink(token)
  if (!link) {
    return NextResponse.json({ error: 'Portal link not found or expired' }, { status: 404 })
  }

  const now = new Date()
  const patient = await prisma.clinicPatient.findFirst({
    where: { id: link.patientId, tenantId: link.tenantId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      appointments: {
        where: {
          startsAt: { gte: new Date(now.getTime() - 60 * 60 * 1000) },
          status: {
            in: [
              ClinicAppointmentStatus.SCHEDULED,
              ClinicAppointmentStatus.CONFIRMED,
              ClinicAppointmentStatus.ARRIVED,
            ],
          },
        },
        orderBy: { startsAt: 'asc' },
        take: 8,
        select: {
          id: true,
          startsAt: true,
          endsAt: true,
          status: true,
          titleOverride: true,
          locationAddress: true,
          locationArea: true,
          locationNotes: true,
          procedure: { select: { name: true, defaultDurationMin: true } },
        },
      },
      visits: {
        where: { status: 'COMPLETED' },
        orderBy: { visitAt: 'desc' },
        take: 5,
        select: {
          id: true,
          visitAt: true,
          procedureSummary: true,
          nextSteps: true,
          treatmentPlan: { select: { title: true } },
          appointment: {
            select: {
              titleOverride: true,
              procedure: { select: { name: true } },
            },
          },
        },
      },
      packages: {
        orderBy: [{ status: 'asc' }, { purchasedAt: 'desc' }],
        take: 10,
        select: {
          id: true,
          name: true,
          totalSessions: true,
          remainingSessions: true,
          status: true,
          purchasedAt: true,
          expiresAt: true,
          procedure: { select: { name: true } },
        },
      },
      payments: {
        where: { status: { in: [ClinicPaymentStatus.PAID, ClinicPaymentStatus.REFUNDED] } },
        orderBy: { paidAt: 'desc' },
        take: 12,
        select: {
          id: true,
          amountCents: true,
          currency: true,
          method: true,
          status: true,
          reference: true,
          paidAt: true,
          appointment: {
            select: {
              startsAt: true,
              titleOverride: true,
              procedure: { select: { name: true } },
            },
          },
          visit: {
            select: {
              visitAt: true,
              appointment: {
                select: {
                  startsAt: true,
                  titleOverride: true,
                  procedure: { select: { name: true } },
                },
              },
            },
          },
        },
      },
      treatmentPlans: {
        where: { status: { in: ['ACTIVE', 'PAUSED'] } },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          expectedSessions: true,
          cadenceDays: true,
          targetEndAt: true,
          goals: true,
          nextSteps: true,
          procedure: { select: { name: true } },
          visits: { where: { status: 'COMPLETED' }, select: { id: true } },
        },
      },
      consentRecords: {
        where: { accepted: true },
        orderBy: { acceptedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          templateTitleSnapshot: true,
          aftercareAcknowledged: true,
          acceptedAt: true,
          procedure: { select: { name: true } },
        },
      },
    },
  })

  if (!patient) {
    return NextResponse.json({ error: 'Portal link not found or expired' }, { status: 404 })
  }

  await prisma.clinicPatientPortalLink.update({
    where: { id: link.id },
    data: { lastAccessedAt: now },
  })

  return NextResponse.json({
    practice: { name: link.tenant.name },
    patient: {
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      phone: patient.phone,
      email: patient.email,
    },
    appointments: patient.appointments.map((appointment) => ({
      ...appointment,
      label: appointmentLabel(appointment),
    })),
    aftercare: patient.visits
      .filter((visit) => visit.nextSteps?.trim() || visit.procedureSummary?.trim())
      .map((visit) => ({
        id: visit.id,
        visitAt: visit.visitAt,
        label: appointmentLabel(visit.appointment ?? { procedure: null, titleOverride: visit.treatmentPlan?.title ?? null }),
        procedureSummary: visit.procedureSummary,
        nextSteps: visit.nextSteps,
        treatmentPlanTitle: visit.treatmentPlan?.title ?? null,
      })),
    packages: patient.packages,
    payments: patient.payments.map((payment) => {
      const appointment = payment.appointment ?? payment.visit?.appointment ?? null
      return {
        id: payment.id,
        amountCents: payment.amountCents,
        currency: payment.currency,
        method: payment.method,
        status: payment.status,
        reference: payment.reference,
        paidAt: payment.paidAt,
        label: appointment ? appointmentLabel(appointment) : 'Payment',
        receiptHref: `/api/patient-portal/${token}/payments/${payment.id}/receipt`,
      }
    }),
    treatmentPlans: patient.treatmentPlans.map((plan) => ({
      ...plan,
      completedSessions: plan.visits.length,
      visits: undefined,
    })),
    consents: patient.consentRecords,
  })
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params
  const link = await getActivePortalLink(token)
  if (!link) {
    return NextResponse.json({ error: 'Portal link not found or expired' }, { status: 404 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const type = normalizePatientPortalRequestType(body.type)
  const message = normalizePatientPortalMessage(body.message)
  const preferredTime = normalizePatientPortalMessage(body.preferredTime)
  const appointmentId = String(body.appointmentId ?? '').trim() || null
  if (!message && !preferredTime) {
    return NextResponse.json({ error: 'Message or preferred time is required' }, { status: 400 })
  }

  const appointment = appointmentId
    ? await prisma.clinicAppointment.findFirst({
        where: {
          id: appointmentId,
          tenantId: link.tenantId,
          patientId: link.patientId,
        },
        select: {
          id: true,
          startsAt: true,
          titleOverride: true,
          procedure: { select: { name: true } },
        },
      })
    : null
  if (appointmentId && !appointment) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
  }

  const label = patientPortalRequestLabel(type)
  const crmBody = [
    `${label} from patient portal.`,
    appointment ? `Appointment: ${appointmentLabel(appointment)} on ${appointment.startsAt.toISOString()}.` : null,
    preferredTime ? `Preferred time: ${preferredTime}.` : null,
    message ? `Message: ${message}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const created = await prisma.$transaction(async (tx) => {
    const requestRow = await tx.clinicPatientPortalRequest.create({
      data: {
        tenantId: link.tenantId,
        patientId: link.patientId,
        appointmentId: appointment?.id,
        portalLinkId: link.id,
        type,
        message: message || preferredTime,
        preferredTime: preferredTime || null,
      },
      select: { id: true, type: true, status: true, createdAt: true },
    })

    await tx.clinicCrmActivity.create({
      data: {
        tenantId: link.tenantId,
        patientId: link.patientId,
        type: ClinicCrmActivityType.OTHER,
        body: crmBody,
        occurredAt: new Date(),
      },
    })

    if (appointment) {
      await writeAppointmentEvent(tx, {
        tenantId: link.tenantId,
        appointmentId: appointment.id,
        type: ClinicAppointmentEventType.UPDATED,
        message: crmBody,
        after: {
          source: 'PATIENT_PORTAL',
          requestId: requestRow.id,
          type,
        },
        createdByUserId: null,
      })
    }

    return requestRow
  })

  return NextResponse.json({ request: created }, { status: 201 })
}
