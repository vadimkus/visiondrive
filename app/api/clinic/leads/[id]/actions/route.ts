import { NextRequest, NextResponse } from 'next/server'
import { ClinicLeadActivityType, ClinicLeadStage } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'
import {
  buildInstagramReply,
  buildLeadBookingUrl,
  normalizeLeadStage,
} from '@/lib/clinic/instagram-growth'
import { getPublicBookingSettings } from '@/lib/clinic/public-booking-settings'
import { practitionerIdentityFromThresholds } from '@/lib/clinic/practitioner-identity'

function cleanText(value: unknown, max = 2000) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed.slice(0, max) : null
}
function parseDate(value: unknown) {
  const text = cleanText(value, 80)
  if (!text) return null
  const parsed = new Date(text)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function splitName(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { firstName: 'Instagram', lastName: 'Lead' }
  if (parts.length === 1) return { firstName: parts[0], lastName: 'Lead' }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
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

  const action = cleanText(body.action, 80)
  const lead = await prisma.clinicLead.findFirst({
    where: { id, tenantId: session.tenantId },
    include: {
      procedure: { select: { id: true, name: true, basePriceCents: true, currency: true } },
      convertedPatient: { select: { id: true } },
      convertedAppointment: { select: { id: true } },
    },
  })
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

  if (action === 'prepare_booking_link') {
    const [tenant, settings] = await Promise.all([
      prisma.tenant.findFirst({
        where: { id: session.tenantId },
        select: { name: true, slug: true, settings: { select: { thresholds: true } } },
      }),
      getPublicBookingSettings(prisma, session.tenantId),
    ])
    if (!tenant) return NextResponse.json({ error: 'Practice not found' }, { status: 404 })
    const origin = new URL(request.url).origin
    const bookingUrl = buildLeadBookingUrl({
      baseUrl: `${origin}/book/${tenant.slug}`,
      trackingCode: lead.trackingCode,
      procedureId: lead.procedureId,
      campaign: lead.campaign || 'instagram_dm',
    })
    const identity = practitionerIdentityFromThresholds(tenant.settings?.thresholds, tenant.name)
    const message = buildInstagramReply({
      mode: body.mode === 'price' ? 'price' : 'booking',
      locale: body.locale === 'ru' ? 'ru' : 'en',
      leadName: lead.displayName,
      procedure: lead.procedure,
      bookingUrl,
      practitionerName: identity.messageSignature || identity.displayName || tenant.name,
    })

    const updated = await prisma.$transaction(async (tx) => {
      await tx.clinicLeadActivity.create({
        data: {
          tenantId: session.tenantId,
          leadId: lead.id,
          type: ClinicLeadActivityType.BOOKING_LINK_SENT,
          direction: 'OUTBOUND',
          body: message,
          metadata: { bookingUrl, publicBookingEnabled: settings.enabled },
          createdByUserId: session.userId,
        },
      })
      return tx.clinicLead.update({
        where: { id: lead.id },
        data: {
          stage: ClinicLeadStage.BOOKING_LINK_SENT,
          lastContactedAt: new Date(),
        },
        select: { id: true, stage: true, lastContactedAt: true },
      })
    })

    return NextResponse.json({ bookingUrl, message, lead: updated, publicBookingEnabled: settings.enabled })
  }

  if (action === 'mark_replied') {
    const message = cleanText(body.message) || 'Instagram reply sent'
    const updated = await prisma.$transaction(async (tx) => {
      await tx.clinicLeadActivity.create({
        data: {
          tenantId: session.tenantId,
          leadId: lead.id,
          type: ClinicLeadActivityType.INSTAGRAM_DM,
          direction: 'OUTBOUND',
          body: message,
          createdByUserId: session.userId,
        },
      })
      return tx.clinicLead.update({
        where: { id: lead.id },
        data: {
          stage: ClinicLeadStage.REPLIED,
          lastContactedAt: new Date(),
        },
        select: { id: true, stage: true, lastContactedAt: true },
      })
    })
    return NextResponse.json({ lead: updated })
  }

  if (action === 'mark_lost') {
    const reason = cleanText(body.reason) || 'Lead marked lost'
    const updated = await prisma.$transaction(async (tx) => {
      await tx.clinicLeadActivity.create({
        data: {
          tenantId: session.tenantId,
          leadId: lead.id,
          type: ClinicLeadActivityType.STATUS_CHANGE,
          direction: 'INTERNAL',
          body: reason,
          metadata: { before: lead.stage, after: ClinicLeadStage.LOST },
          createdByUserId: session.userId,
        },
      })
      return tx.clinicLead.update({
        where: { id: lead.id },
        data: {
          stage: ClinicLeadStage.LOST,
          lostAt: new Date(),
        },
        select: { id: true, stage: true, lostAt: true },
      })
    })
    return NextResponse.json({ lead: updated })
  }

  if (action === 'set_stage') {
    const stage = normalizeLeadStage(body.stage, lead.stage)
    const updated = await prisma.$transaction(async (tx) => {
      await tx.clinicLeadActivity.create({
        data: {
          tenantId: session.tenantId,
          leadId: lead.id,
          type: ClinicLeadActivityType.STATUS_CHANGE,
          direction: 'INTERNAL',
          body: cleanText(body.note) || `Lead stage changed to ${stage}`,
          metadata: { before: lead.stage, after: stage },
          createdByUserId: session.userId,
        },
      })
      return tx.clinicLead.update({
        where: { id: lead.id },
        data: {
          stage,
          lostAt: stage === ClinicLeadStage.LOST ? new Date() : null,
        },
        select: { id: true, stage: true, lostAt: true },
      })
    })
    return NextResponse.json({ lead: updated })
  }

  if (action === 'convert_to_patient') {
    if (lead.convertedPatient) {
      return NextResponse.json({ error: 'Lead already converted to a patient' }, { status: 409 })
    }
    const dateOfBirth = parseDate(body.dateOfBirth)
    const fallbackName = splitName(lead.displayName)
    const firstName = cleanText(body.firstName, 80) || fallbackName.firstName
    const lastName = cleanText(body.lastName, 80) || fallbackName.lastName
    const patient = await prisma.$transaction(async (tx) => {
      const created = await tx.clinicPatient.create({
        data: {
          tenantId: session.tenantId,
          firstName,
          lastName,
          dateOfBirth,
          phone: cleanText(body.phone, 80) ?? lead.phone,
          email: cleanText(body.email, 180) ?? lead.email,
          referredByName: 'Instagram',
          referralNote: `Converted from Instagram lead ${lead.instagramHandle ? `@${lead.instagramHandle}` : lead.displayName}`,
          internalNotes: lead.notes,
        },
      })
      await tx.clinicLead.update({
        where: { id: lead.id },
        data: {
          convertedPatientId: created.id,
          convertedAt: new Date(),
          stage: ClinicLeadStage.BOOKED,
        },
      })
      await tx.clinicLeadActivity.create({
        data: {
          tenantId: session.tenantId,
          leadId: lead.id,
          type: ClinicLeadActivityType.CONVERSION,
          direction: 'INTERNAL',
          body: `Converted to patient ${firstName} ${lastName}`,
          metadata: { patientId: created.id },
          createdByUserId: session.userId,
        },
      })
      return created
    })
    return NextResponse.json({ patient }, { status: 201 })
  }

  if (action === 'log_package_offer' || action === 'log_membership_offer') {
    const isMembership = action === 'log_membership_offer'
    const mode = isMembership ? 'membership' : 'package'
    const message =
      cleanText(body.message) ||
      buildInstagramReply({
        mode,
        locale: body.locale === 'ru' ? 'ru' : 'en',
        leadName: lead.displayName,
        procedure: lead.procedure,
      })
    const updated = await prisma.$transaction(async (tx) => {
      await tx.clinicLeadActivity.create({
        data: {
          tenantId: session.tenantId,
          leadId: lead.id,
          type: isMembership ? ClinicLeadActivityType.MEMBERSHIP_OFFER : ClinicLeadActivityType.PACKAGE_OFFER,
          direction: 'OUTBOUND',
          body: message,
          createdByUserId: session.userId,
        },
      })
      return tx.clinicLead.update({
        where: { id: lead.id },
        data: {
          stage: isMembership ? ClinicLeadStage.MEMBERSHIP_OPPORTUNITY : ClinicLeadStage.PACKAGE_OPPORTUNITY,
          lastContactedAt: new Date(),
        },
        select: { id: true, stage: true, lastContactedAt: true },
      })
    })
    return NextResponse.json({ message, lead: updated })
  }

  return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
}
