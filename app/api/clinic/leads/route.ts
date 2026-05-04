import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'
import {
  cleanInstagramHandle,
  displayNameFromLeadInput,
  normalizeLeadSource,
  normalizeLeadStage,
} from '@/lib/clinic/instagram-growth'

function cleanText(value: unknown, max = 500) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed.slice(0, max) : null
}
function leadSelect() {
  return {
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
    convertedPatient: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
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
      orderBy: { occurredAt: 'desc' as const },
      take: 5,
      select: {
        id: true,
        type: true,
        direction: true,
        body: true,
        metadata: true,
        occurredAt: true,
        createdAt: true,
      },
    },
  }
}

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const stage = searchParams.get('stage')
  const q = cleanText(searchParams.get('q'), 120)?.toLowerCase() ?? null
  const source = searchParams.get('source')
  const procedureId = cleanText(searchParams.get('procedureId'), 120)

  const leads = await prisma.clinicLead.findMany({
    where: {
      tenantId: session.tenantId,
      ...(stage ? { stage: normalizeLeadStage(stage) } : {}),
      ...(source ? { source: normalizeLeadSource(source) } : {}),
      ...(procedureId ? { procedureId } : {}),
    },
    orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    take: 500,
    select: leadSelect(),
  })

  const filtered = q
    ? leads.filter((lead) =>
        [lead.displayName, lead.instagramHandle, lead.phone, lead.email, lead.campaign]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q))
      )
    : leads

  return NextResponse.json({ leads: filtered })
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

  const procedureId = cleanText(body.procedureId, 120)
  if (procedureId) {
    const procedure = await prisma.clinicProcedure.findFirst({
      where: { id: procedureId, tenantId: session.tenantId },
      select: { id: true },
    })
    if (!procedure) return NextResponse.json({ error: 'Service not found' }, { status: 404 })
  }

  const instagramHandle = cleanInstagramHandle(body.instagramHandle)
  const lead = await prisma.clinicLead.create({
    data: {
      tenantId: session.tenantId,
      source: normalizeLeadSource(body.source),
      stage: normalizeLeadStage(body.stage),
      displayName: displayNameFromLeadInput(body),
      instagramHandle,
      phone: cleanText(body.phone, 80),
      email: cleanText(body.email, 180),
      procedureId,
      campaign: cleanText(body.campaign, 120),
      notes: cleanText(body.notes, 2000),
      activities: cleanText(body.initialMessage, 2000)
        ? {
            create: {
              tenantId: session.tenantId,
              type: 'INSTAGRAM_DM',
              direction: 'INBOUND',
              body: cleanText(body.initialMessage, 2000),
              createdByUserId: session.userId,
            },
          }
        : undefined,
    },
    select: leadSelect(),
  })

  return NextResponse.json({ lead }, { status: 201 })
}
