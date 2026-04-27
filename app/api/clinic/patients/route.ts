import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  buildClientBalanceChargesFromAppointments,
  buildClientBalanceSummary,
} from '@/lib/clinic/client-balance'
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

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const q = request.nextUrl.searchParams.get('q')?.trim() ?? ''
  const category = normalizePatientCategory(request.nextUrl.searchParams.get('category'))
  const tags = normalizePatientTags(request.nextUrl.searchParams.get('tag'))

  const where: {
    tenantId: string
    OR?: Array<Record<string, unknown>>
    category?: string
    tags?: { hasEvery: string[] }
  } = { tenantId: session.tenantId }
  if (category) where.category = category
  if (tags.length > 0) where.tags = { hasEvery: tags }

  if (q.length > 0) {
    const parts = q.split(/\s+/).filter(Boolean)
    const orClause: Array<Record<string, unknown>> = [
      { firstName: { contains: q, mode: 'insensitive' } },
      { lastName: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q } },
      { email: { contains: q, mode: 'insensitive' } },
    ]
    if (parts.length >= 2) {
      orClause.push({
        AND: [
          { firstName: { contains: parts[0], mode: 'insensitive' } },
          { lastName: { contains: parts[parts.length - 1], mode: 'insensitive' } },
        ],
      })
    }
    where.OR = orClause
  }

  const patients = await prisma.clinicPatient.findMany({
    where,
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    take: q ? 50 : 500,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      middleName: true,
      dateOfBirth: true,
      phone: true,
      email: true,
      homeAddress: true,
      area: true,
      accessNotes: true,
      category: true,
      tags: true,
      createdAt: true,
      appointments: {
        select: {
          status: true,
          procedure: { select: { basePriceCents: true, currency: true } },
          visits: {
            select: {
              payments: {
                select: {
                  amountCents: true,
                  currency: true,
                  status: true,
                  reference: true,
                  paidAt: true,
                },
              },
            },
          },
        },
      },
      payments: {
        where: { visitId: null },
        select: {
          amountCents: true,
          currency: true,
          status: true,
          reference: true,
          paidAt: true,
        },
      },
    },
  })

  return NextResponse.json({
    patients: patients.map(({ appointments, payments, ...patient }) => ({
      ...patient,
      clientBalance: buildClientBalanceSummary({
        charges: buildClientBalanceChargesFromAppointments(appointments),
        standalonePayments: payments,
      }),
    })),
  })
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

  const firstName = String(body.firstName ?? '').trim()
  const lastName = String(body.lastName ?? '').trim()
  const middleName = body.middleName != null ? String(body.middleName).trim() || null : null
  const dateOfBirthRaw = String(body.dateOfBirth ?? '')
  const phone = body.phone != null ? String(body.phone).trim() || null : null
  const email = body.email != null ? String(body.email).trim() || null : null
  const homeAddress = body.homeAddress != null ? String(body.homeAddress).trim() || null : null
  const area = body.area != null ? String(body.area).trim() || null : null
  const accessNotes = body.accessNotes != null ? String(body.accessNotes).trim() || null : null
  const category = normalizePatientCategory(body.category)
  const tags = normalizePatientTags(body.tags)
  const internalNotes =
    body.internalNotes != null ? String(body.internalNotes).trim() || null : null

  if (!firstName || !lastName) {
    return NextResponse.json({ error: 'firstName and lastName are required' }, { status: 400 })
  }

  const dateOfBirth = parseDateOnly(dateOfBirthRaw)
  if (!dateOfBirth) {
    return NextResponse.json({ error: 'dateOfBirth must be YYYY-MM-DD' }, { status: 400 })
  }

  const patient = await prisma.clinicPatient.create({
    data: {
      tenantId: session.tenantId,
      firstName,
      lastName,
      middleName,
      dateOfBirth,
      phone,
      email,
      homeAddress,
      area,
      accessNotes,
      category,
      tags,
      internalNotes,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      middleName: true,
      dateOfBirth: true,
      phone: true,
      email: true,
      homeAddress: true,
      area: true,
      accessNotes: true,
      category: true,
      tags: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ patient }, { status: 201 })
}
