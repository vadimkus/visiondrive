import { NextRequest, NextResponse } from 'next/server'
import { ClinicAppointmentStatus, ClinicLeadStage, ClinicReminderKind } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'
import {
  activeLeadStages,
  buildLeadTasks,
  leadStageLabel,
  type GrowthLeadInput,
} from '@/lib/clinic/instagram-growth'
import { getPublicBookingSettings } from '@/lib/clinic/public-booking-settings'
import { membershipDataFromThresholds } from '@/lib/clinic/memberships'

function pct(numerator: number, denominator: number) {
  return denominator > 0 ? Number(((numerator / denominator) * 100).toFixed(1)) : 0
}
export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const rangeDays = Math.min(365, Math.max(7, Number(searchParams.get('days') || 30) || 30))
  const now = new Date()
  const since = new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000)

  const [tenant, settings, leads, procedures, rebookingReminders, packageCount] = await Promise.all([
    prisma.tenant.findUnique({
      where: { id: session.tenantId },
      select: { name: true, slug: true, settings: { select: { thresholds: true } } },
    }),
    getPublicBookingSettings(prisma, session.tenantId),
    prisma.clinicLead.findMany({
      where: { tenantId: session.tenantId },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      take: 500,
      select: {
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
        convertedPatient: { select: { id: true, firstName: true, lastName: true, phone: true } },
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
          orderBy: { occurredAt: 'desc' },
          take: 3,
          select: { id: true, type: true, direction: true, body: true, occurredAt: true },
        },
      },
    }),
    prisma.clinicProcedure.findMany({
      where: { tenantId: session.tenantId, active: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, basePriceCents: true, currency: true },
      take: 500,
    }),
    prisma.clinicReminderDelivery.count({
      where: {
        tenantId: session.tenantId,
        kind: ClinicReminderKind.REBOOKING_FOLLOW_UP,
        createdAt: { gte: since },
      },
    }),
    prisma.clinicPatientPackage.count({
      where: {
        tenantId: session.tenantId,
        purchasedAt: { gte: since },
      },
    }),
  ])

  const activeStages = activeLeadStages()
  const recentLeads = leads.filter((lead) => lead.createdAt >= since)
  const bookedLeads = leads.filter((lead) => lead.convertedAppointment)
  const completedLeads = leads.filter(
    (lead) =>
      lead.stage === ClinicLeadStage.COMPLETED ||
      lead.convertedAppointment?.status === ClinicAppointmentStatus.COMPLETED ||
      Boolean(lead.convertedAppointment?.completedAt)
  )
  const activeLeads = leads.filter((lead) => activeStages.includes(lead.stage))
  const stageSummary = Object.values(ClinicLeadStage).map((stage) => ({
    stage,
    label: leadStageLabel(stage),
    count: leads.filter((lead) => lead.stage === stage).length,
  }))

  const membershipData = membershipDataFromThresholds(tenant?.settings?.thresholds)
  const growthLeads: GrowthLeadInput[] = leads.map((lead) => ({
    ...lead,
    convertedAppointment: lead.convertedAppointment
      ? {
          ...lead.convertedAppointment,
          procedure: lead.convertedAppointment.procedure,
        }
      : null,
  }))

  return NextResponse.json({
    range: { days: rangeDays, since: since.toISOString(), now: now.toISOString() },
    booking: {
      enabled: settings.enabled,
      confirmationMode: settings.confirmationMode,
      bookingUrl: tenant ? `/book/${tenant.slug}` : null,
      practiceName: tenant?.name ?? null,
    },
    summary: {
      leadsCreated: recentLeads.length,
      activeLeads: activeLeads.length,
      bookedLeads: bookedLeads.length,
      completedLeads: completedLeads.length,
      bookingConversionRatePct: pct(bookedLeads.length, leads.length),
      rebookingFollowUps: rebookingReminders,
      packagesSold: packageCount,
      membershipPlans: membershipData.plans.filter((plan) => plan.active).length,
      activeMemberships: membershipData.subscriptions.filter((subscription) => subscription.status === 'ACTIVE').length,
    },
    stageSummary,
    tasks: buildLeadTasks(growthLeads, now).slice(0, 30),
    leads,
    procedures,
  })
}
