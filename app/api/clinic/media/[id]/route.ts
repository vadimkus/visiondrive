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
    select: { mimeType: true, data: true },
  })

  if (!row) {
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
