import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  normalizeAftercareBody,
  normalizeAftercareDocumentName,
  normalizeAftercareDocumentUrl,
  normalizeAftercareTitle,
} from '@/lib/clinic/aftercare'
import { getClinicSession } from '@/lib/clinic/session'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const existing = await prisma.clinicAftercareTemplate.findFirst({
    where: { id, tenantId: session.tenantId },
    select: { id: true },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const data: {
    title?: string
    messageBody?: string
    documentName?: string | null
    documentUrl?: string | null
    active?: boolean
    sortOrder?: number
  } = {}

  if (body.title !== undefined) {
    const title = normalizeAftercareTitle(body.title)
    if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 })
    data.title = title
  }
  if (body.messageBody !== undefined) data.messageBody = normalizeAftercareBody(body.messageBody)
  if (body.documentName !== undefined) {
    data.documentName = normalizeAftercareDocumentName(body.documentName) || null
  }
  if (body.documentUrl !== undefined) {
    data.documentUrl = normalizeAftercareDocumentUrl(body.documentUrl) || null
  }
  if (body.active !== undefined) data.active = body.active === true
  if (body.sortOrder !== undefined && Number.isFinite(Number(body.sortOrder))) {
    data.sortOrder = Math.round(Number(body.sortOrder))
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const template = await prisma.clinicAftercareTemplate.update({
    where: { id },
    data,
    include: { procedure: { select: { id: true, name: true } } },
  })

  return NextResponse.json({ template })
}
