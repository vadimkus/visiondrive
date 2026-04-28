import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildClinicNotificationItems } from '@/lib/clinic/notification-items'
import { sendPractitionerPushForItems } from '@/lib/clinic/practitioner-push'
import { getClinicSession } from '@/lib/clinic/session'

function authorizedTenantId(request: NextRequest) {
  const session = getClinicSession(request)
  if (session) return { tenantId: session.tenantId, allTenants: false }
  const secret = process.env.CRON_SECRET
  const header = request.headers.get('x-cron-secret') || request.nextUrl.searchParams.get('secret')
  if (secret && header === secret) return { tenantId: null, allTenants: true }
  return null
}

async function runForTenant(tenantId: string) {
  const items = await buildClinicNotificationItems(tenantId)
  const result = await sendPractitionerPushForItems(tenantId, items)
  return { tenantId, items: items.length, ...result }
}

export async function GET(request: NextRequest) {
  const auth = authorizedTenantId(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!auth.allTenants && auth.tenantId) {
    return NextResponse.json(await runForTenant(auth.tenantId))
  }

  const tenants = await prisma.tenant.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true },
    take: 100,
  })
  const results = []
  for (const tenant of tenants) {
    results.push(await runForTenant(tenant.id))
  }
  return NextResponse.json({ tenants: results.length, results })
}

export async function POST(request: NextRequest) {
  return GET(request)
}
