import { NextRequest, NextResponse } from 'next/server'
import { ClinicVisitStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'

function parseVisitStatus(v: string): ClinicVisitStatus | null {
  const u = v.toUpperCase().trim()
  if (u === 'IN_PROGRESS' || u === 'COMPLETED' || u === 'CANCELLED') {
    return u as ClinicVisitStatus
  }
  return null
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

  const existing = await prisma.clinicVisit.findFirst({
    where: { id, tenantId: session.tenantId },
    select: { id: true },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const data: {
    visitAt?: Date
    status?: ClinicVisitStatus
    chiefComplaint?: string | null
    procedureSummary?: string | null
    staffNotes?: string | null
    nextSteps?: string | null
  } = {}

  if (body.visitAt !== undefined) {
    const d = new Date(String(body.visitAt))
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json({ error: 'visitAt must be a valid ISO datetime' }, { status: 400 })
    }
    data.visitAt = d
  }
  if (body.status !== undefined) {
    const s = parseVisitStatus(String(body.status))
    if (!s) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    data.status = s
  }
  if (body.chiefComplaint !== undefined) {
    data.chiefComplaint = body.chiefComplaint == null ? null : String(body.chiefComplaint).trim() || null
  }
  if (body.procedureSummary !== undefined) {
    data.procedureSummary =
      body.procedureSummary == null ? null : String(body.procedureSummary).trim() || null
  }
  if (body.staffNotes !== undefined) {
    data.staffNotes = body.staffNotes == null ? null : String(body.staffNotes).trim() || null
  }
  if (body.nextSteps !== undefined) {
    data.nextSteps = body.nextSteps == null ? null : String(body.nextSteps).trim() || null
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const visit = await prisma.clinicVisit.update({
    where: { id },
    data,
    select: {
      id: true,
      patientId: true,
      visitAt: true,
      status: true,
      chiefComplaint: true,
      procedureSummary: true,
      staffNotes: true,
      nextSteps: true,
      updatedAt: true,
    },
  })

  return NextResponse.json({ visit })
}
