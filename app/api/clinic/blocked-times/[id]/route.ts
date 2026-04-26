import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const deleted = await prisma.clinicBlockedTime.deleteMany({
    where: { id, tenantId: session.tenantId },
  })

  if (deleted.count === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
