import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  normalizeAftercareBody,
  normalizeAftercareDocumentName,
  normalizeAftercareDocumentUrl,
  normalizeAftercareTitle,
} from '@/lib/clinic/aftercare'
import { getClinicSession } from '@/lib/clinic/session'

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const includeInactive = request.nextUrl.searchParams.get('includeInactive') === '1'
  const procedureId = request.nextUrl.searchParams.get('procedureId')?.trim()
  const templates = await prisma.clinicAftercareTemplate.findMany({
    where: {
      tenantId: session.tenantId,
      ...(includeInactive ? {} : { active: true }),
      ...(procedureId ? { OR: [{ procedureId }, { procedureId: null }] } : {}),
    },
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

  const title = normalizeAftercareTitle(body.title)
  const messageBody = normalizeAftercareBody(body.messageBody)
  const documentName = normalizeAftercareDocumentName(body.documentName) || null
  const documentUrl = normalizeAftercareDocumentUrl(body.documentUrl) || null
  if (!title || (!messageBody && !documentUrl)) {
    return NextResponse.json(
      { error: 'title and either messageBody or documentUrl are required' },
      { status: 400 }
    )
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

  const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Math.round(Number(body.sortOrder)) : 0
  const template = await prisma.clinicAftercareTemplate.create({
    data: {
      tenantId: session.tenantId,
      procedureId,
      title,
      messageBody,
      documentName,
      documentUrl,
      active: body.active !== false,
      sortOrder,
      createdByUserId: session.userId,
    },
    include: { procedure: { select: { id: true, name: true } } },
  })

  return NextResponse.json({ template }, { status: 201 })
}
