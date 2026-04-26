import { NextRequest, NextResponse } from 'next/server'
import { ClinicReminderChannel, ClinicReminderKind } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'
import { ensureDefaultReminderTemplates } from '@/lib/clinic/reminders'

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.$transaction((tx) => ensureDefaultReminderTemplates(tx, session.tenantId))
  const templates = await prisma.clinicReminderTemplate.findMany({
    where: { tenantId: session.tenantId },
    orderBy: [{ kind: 'asc' }, { channel: 'asc' }],
  })

  return NextResponse.json({ templates })
}

export async function PATCH(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { templates?: Array<Record<string, unknown>> }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!Array.isArray(body.templates)) {
    return NextResponse.json({ error: 'templates array is required' }, { status: 400 })
  }
  const inputTemplates = body.templates

  await prisma.$transaction(async (tx) => {
    for (const raw of inputTemplates.slice(0, 10)) {
      const kind = String(raw.kind || '').toUpperCase()
      const channel = String(raw.channel || ClinicReminderChannel.WHATSAPP).toUpperCase()
      const name = String(raw.name || '').trim().slice(0, 120)
      const templateBody = String(raw.body || '').trim().slice(0, 4000)
      const active = raw.active !== false
      if (
        !Object.values(ClinicReminderKind).includes(kind as ClinicReminderKind) ||
        !Object.values(ClinicReminderChannel).includes(channel as ClinicReminderChannel) ||
        !name ||
        !templateBody
      ) {
        continue
      }
      await tx.clinicReminderTemplate.upsert({
        where: {
          tenantId_kind_channel: {
            tenantId: session.tenantId,
            kind: kind as ClinicReminderKind,
            channel: channel as ClinicReminderChannel,
          },
        },
        create: {
          tenantId: session.tenantId,
          kind: kind as ClinicReminderKind,
          channel: channel as ClinicReminderChannel,
          name,
          body: templateBody,
          active,
        },
        update: { name, body: templateBody, active },
      })
    }
  })

  const templates = await prisma.clinicReminderTemplate.findMany({
    where: { tenantId: session.tenantId },
    orderBy: [{ kind: 'asc' }, { channel: 'asc' }],
  })
  return NextResponse.json({ templates })
}
