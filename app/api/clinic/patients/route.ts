import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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

  const patients = await prisma.clinicPatient.findMany({
    where: { tenantId: session.tenantId },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      middleName: true,
      dateOfBirth: true,
      phone: true,
      email: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ patients })
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
      createdAt: true,
    },
  })

  return NextResponse.json({ patient }, { status: 201 })
}
