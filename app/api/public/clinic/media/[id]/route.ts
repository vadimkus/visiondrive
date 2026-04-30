import { get } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { TenantStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params

  const media = await prisma.clinicPatientMedia.findFirst({
    where: {
      id,
      marketingConsent: true,
      mimeType: { startsWith: 'image/' },
      tenant: { status: TenantStatus.ACTIVE },
    },
    select: {
      mimeType: true,
      data: true,
      blobPathname: true,
    },
  })

  if (!media) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (media.blobPathname) {
    const blob = await get(media.blobPathname, { access: 'private' })
    if (!blob || blob.statusCode !== 200 || !blob.stream) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return new NextResponse(blob.stream, {
      headers: {
        'Content-Type': blob.blob.contentType || media.mimeType,
        'Cache-Control': 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  }

  if (!media.data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return new NextResponse(Buffer.from(media.data), {
    headers: {
      'Content-Type': media.mimeType,
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
