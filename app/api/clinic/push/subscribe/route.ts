import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'

type SubscribeBody = {
  endpoint?: string
  keys?: { p256dh?: string; auth?: string }
}

export async function POST(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: SubscribeBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const endpoint = String(body.endpoint ?? '').trim()
  const p256dh = String(body.keys?.p256dh ?? '').trim()
  const auth = String(body.keys?.auth ?? '').trim()
  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: 'endpoint and keys.p256dh, keys.auth are required' }, { status: 400 })
  }

  await prisma.clinicWebPushSubscription.upsert({
    where: { endpoint },
    create: {
      userId: session.userId,
      tenantId: session.tenantId,
      endpoint,
      p256dh,
      auth,
    },
    update: {
      userId: session.userId,
      tenantId: session.tenantId,
      p256dh,
      auth,
    },
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { endpoint?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const endpoint = String(body.endpoint ?? '').trim()
  if (!endpoint) {
    return NextResponse.json({ error: 'endpoint is required' }, { status: 400 })
  }

  await prisma.clinicWebPushSubscription.deleteMany({
    where: { endpoint, userId: session.userId, tenantId: session.tenantId },
  })

  return NextResponse.json({ ok: true })
}
