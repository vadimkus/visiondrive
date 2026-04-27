import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'
import {
  DEFAULT_CONTRAINDICATIONS,
  normalizeConsentBody,
  normalizeContraindications,
} from '@/lib/clinic/consents'

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const includeInactive = request.nextUrl.searchParams.get('includeInactive') === '1'
  const templates = await prisma.clinicConsentTemplate.findMany({
    where: { tenantId: session.tenantId, ...(includeInactive ? {} : { active: true }) },
    include: { procedure: { select: { id: true, name: true } } },
    orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
  })

  return NextResponse.json({ templates })
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

  const title = String(body.title ?? '').trim()
  const templateBody = normalizeConsentBody(body.body)
  if (!title || !templateBody) {
    return NextResponse.json({ error: 'title and body are required' }, { status: 400 })
  }

  const procedureId =
    body.procedureId != null && String(body.procedureId).trim()
      ? String(body.procedureId).trim()
      : null
  if (procedureId) {
    const procedure = await prisma.clinicProcedure.findFirst({
      where: { id: procedureId, tenantId: session.tenantId, active: true },
      select: { id: true },
    })
    if (!procedure) {
      return NextResponse.json({ error: 'Procedure not found' }, { status: 400 })
    }
  }

  const contraindications = normalizeContraindications(
    body.contraindications ?? DEFAULT_CONTRAINDICATIONS
  )
  const aftercareText =
    body.aftercareText != null ? normalizeConsentBody(body.aftercareText) || null : null
  const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Math.round(Number(body.sortOrder)) : 0

  const template = await prisma.clinicConsentTemplate.create({
    data: {
      tenantId: session.tenantId,
      procedureId,
      title: title.slice(0, 240),
      body: templateBody,
      contraindications,
      aftercareText,
      active: body.active !== false,
      sortOrder,
      createdByUserId: session.userId,
    },
    include: { procedure: { select: { id: true, name: true } } },
  })

  return NextResponse.json({ template }, { status: 201 })
}
