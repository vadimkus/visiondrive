import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { parseAnamnesisPatchBody } from '@/lib/clinic/anamnesis'
import { normalizePatientCategory, normalizePatientTags } from '@/lib/clinic/patient-tags'
import { getClinicSession } from '@/lib/clinic/session'

function parseDateOnly(isoDate: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim())
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2]) - 1
  const d = Number(m[3])
  const dt = new Date(Date.UTC(y, mo, d, 12, 0, 0))
  return Number.isNaN(dt.getTime()) ? null : dt
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const mediaSelect = {
    id: true,
    kind: true,
    mimeType: true,
    caption: true,
    visitId: true,
    createdAt: true,
  } as const

  const patient = await prisma.clinicPatient.findFirst({
    where: { id, tenantId: session.tenantId },
    include: {
      appointments: {
        orderBy: { startsAt: 'desc' },
        take: 40,
        select: {
          id: true,
          startsAt: true,
          endsAt: true,
          status: true,
          titleOverride: true,
          internalNotes: true,
          procedure: { select: { id: true, name: true } },
        },
      },
      visits: {
        orderBy: { visitAt: 'desc' },
        take: 40,
        include: {
          media: { orderBy: { createdAt: 'asc' }, select: { ...mediaSelect } },
        },
      },
      media: {
        orderBy: { createdAt: 'desc' },
        take: 60,
        select: { ...mediaSelect },
      },
      payments: {
        orderBy: { paidAt: 'desc' },
        take: 80,
        select: {
          id: true,
          amountCents: true,
          currency: true,
          method: true,
          status: true,
          reference: true,
          note: true,
          paidAt: true,
          visitId: true,
          createdAt: true,
        },
      },
      crmActivities: {
        orderBy: { occurredAt: 'desc' },
        take: 80,
        select: {
          id: true,
          type: true,
          body: true,
          occurredAt: true,
          createdAt: true,
        },
      },
    },
  })

  if (!patient) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ patient })
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

  const existing = await prisma.clinicPatient.findFirst({
    where: { id, tenantId: session.tenantId },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const data: {
    firstName?: string
    lastName?: string
    middleName?: string | null
    dateOfBirth?: Date
    phone?: string | null
    email?: string | null
    category?: string | null
    tags?: string[]
    internalNotes?: string | null
    anamnesisJson?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput
  } = {}

  if (body.firstName !== undefined) {
    const v = String(body.firstName).trim()
    if (!v) return NextResponse.json({ error: 'firstName cannot be empty' }, { status: 400 })
    data.firstName = v
  }
  if (body.lastName !== undefined) {
    const v = String(body.lastName).trim()
    if (!v) return NextResponse.json({ error: 'lastName cannot be empty' }, { status: 400 })
    data.lastName = v
  }
  if (body.middleName !== undefined) {
    data.middleName = body.middleName == null ? null : String(body.middleName).trim() || null
  }
  if (body.dateOfBirth !== undefined) {
    const d = parseDateOnly(String(body.dateOfBirth))
    if (!d) return NextResponse.json({ error: 'dateOfBirth must be YYYY-MM-DD' }, { status: 400 })
    data.dateOfBirth = d
  }
  if (body.phone !== undefined) {
    data.phone = body.phone == null ? null : String(body.phone).trim() || null
  }
  if (body.email !== undefined) {
    data.email = body.email == null ? null : String(body.email).trim() || null
  }
  if (body.category !== undefined) {
    data.category = normalizePatientCategory(body.category)
  }
  if (body.tags !== undefined) {
    data.tags = normalizePatientTags(body.tags)
  }
  if (body.internalNotes !== undefined) {
    data.internalNotes = body.internalNotes == null ? null : String(body.internalNotes).trim() || null
  }

  if (body.anamnesisJson !== undefined) {
    const parsed = parseAnamnesisPatchBody(body.anamnesisJson)
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }
    data.anamnesisJson = parsed.value === null ? Prisma.DbNull : parsed.value
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const patient = await prisma.clinicPatient.update({
    where: { id },
    data,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      middleName: true,
      dateOfBirth: true,
      phone: true,
      email: true,
      category: true,
      tags: true,
      internalNotes: true,
      anamnesisJson: true,
      updatedAt: true,
    },
  })

  return NextResponse.json({ patient })
}
