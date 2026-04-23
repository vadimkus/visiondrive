import { NextRequest, NextResponse } from 'next/server'
import { ClinicMediaKind } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'

const MAX_BYTES = 8 * 1024 * 1024

function parseKind(v: string): ClinicMediaKind | null {
  const u = v.toUpperCase().trim()
  if (u === 'BEFORE' || u === 'AFTER' || u === 'OTHER') {
    return u as ClinicMediaKind
  }
  return null
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: patientId } = await context.params

  const patient = await prisma.clinicPatient.findFirst({
    where: { id: patientId, tenantId: session.tenantId },
    select: { id: true },
  })
  if (!patient) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Expected multipart form data' }, { status: 400 })
  }

  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file is required' }, { status: 400 })
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image uploads are allowed' }, { status: 400 })
  }

  const ab = await file.arrayBuffer()
  if (ab.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: 'Image too large (max 8MB)' }, { status: 413 })
  }

  const kindRaw = String(form.get('kind') ?? 'OTHER')
  const kind = parseKind(kindRaw) ?? ClinicMediaKind.OTHER

  const visitIdRaw = form.get('visitId')
  const visitId =
    visitIdRaw != null && String(visitIdRaw).trim() ? String(visitIdRaw).trim() : null

  if (visitId) {
    const visit = await prisma.clinicVisit.findFirst({
      where: { id: visitId, patientId, tenantId: session.tenantId },
      select: { id: true },
    })
    if (!visit) {
      return NextResponse.json({ error: 'Visit not found for this patient' }, { status: 400 })
    }
  }

  const captionRaw = form.get('caption')
  const caption =
    captionRaw != null && String(captionRaw).trim() ? String(captionRaw).trim() : null

  const media = await prisma.clinicPatientMedia.create({
    data: {
      tenantId: session.tenantId,
      patientId,
      visitId,
      kind,
      mimeType: file.type || 'image/jpeg',
      caption,
      data: Buffer.from(ab),
      createdByUserId: session.userId,
    },
    select: {
      id: true,
      kind: true,
      mimeType: true,
      caption: true,
      visitId: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ media }, { status: 201 })
}
