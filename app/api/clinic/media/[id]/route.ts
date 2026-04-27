import { del, get } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params

  const row = await prisma.clinicPatientMedia.findFirst({
    where: { id, tenantId: session.tenantId },
    select: { mimeType: true, data: true, blobPathname: true },
  })

  if (!row) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (row.blobPathname) {
    const blob = await get(row.blobPathname, { access: 'private' })
    if (!blob || blob.statusCode !== 200 || !blob.stream) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const ct = blob.blob.contentType || row.mimeType
    return new NextResponse(blob.stream, {
      headers: {
        'Content-Type': ct,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  }

  if (!row.data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const buf = Buffer.from(row.data)

  return new NextResponse(buf, {
    headers: {
      'Content-Type': row.mimeType,
      'Cache-Control': 'private, max-age=86400',
    },
  })
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params

  const row = await prisma.clinicPatientMedia.findFirst({
    where: { id, tenantId: session.tenantId },
    select: { id: true, blobPathname: true },
  })

  if (!row) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.clinicPatientMedia.delete({
    where: { id: row.id },
  })

  if (row.blobPathname) {
    try {
      await del(row.blobPathname)
    } catch {
      // Blob cleanup is best-effort; tenant-scoped DB removal is the source of truth.
    }
  }

  return NextResponse.json({ deleted: true })
}
