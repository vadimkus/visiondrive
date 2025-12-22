import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/sql'
import { requirePortalSession, assertRole } from '@/lib/portal/session'
import { randomUUID } from 'crypto'
import { writeAuditLog } from '@/lib/audit'

const DEFAULT_THRESHOLD_JSON = {
  offlineMinutes: 60,
  lowBatteryPct: 20,
  staleEventMinutes: 15,
  poorRssiThreshold: -115,
  poorSnrThreshold: 0,
  signalLookbackHours: 24,
  signalMinSamples: 3,
  flappingWindowMinutes: 30,
  flappingMaxChanges: 6,
  deadLettersWindowHours: 24,
  deadLettersCritical: 50,
  deadLettersWarning: 10,
  slaHoursCritical: 4,
  slaHoursWarning: 24,
  slaHoursInfo: 72,
}

export async function GET(request: NextRequest) {
  try {
    const session = await requirePortalSession(request)
    assertRole(session, ['MASTER_ADMIN'])

    const rows = await sql/*sql*/`
      SELECT
        t.id,
        t.name,
        t.slug,
        t.status,
        t."createdAt",
        (SELECT COUNT(*)::int FROM sites si WHERE si."tenantId" = t.id) AS "sitesCount",
        (SELECT COUNT(*)::int FROM sensors s WHERE s."tenantId" = t.id AND s."bayId" IS NOT NULL) AS "installedSensors",
        (SELECT COUNT(*)::int FROM sensors s WHERE s."tenantId" = t.id AND s."bayId" IS NOT NULL AND s."lastSeen" > now() - interval '60 minutes') AS "onlineSensors",
        (SELECT COUNT(*)::int FROM sensors s WHERE s."tenantId" = t.id AND s."bayId" IS NOT NULL AND (s."lastSeen" IS NULL OR s."lastSeen" <= now() - interval '60 minutes')) AS "offlineSensors",
        (SELECT COUNT(*)::int FROM alerts a
          LEFT JOIN sensors s ON s.id = a."sensorId"
          WHERE a."tenantId" = t.id
            AND a.status IN ('OPEN','ACKNOWLEDGED')
        ) AS "openAlerts",
        (SELECT COUNT(*)::int FROM alerts a
          WHERE a."tenantId" = t.id
            AND a.status IN ('OPEN','ACKNOWLEDGED')
            AND a.severity = 'CRITICAL'
        ) AS "criticalAlerts",
        (SELECT MAX(time) FROM sensor_events e WHERE e."tenantId" = t.id) AS "lastEventTime"
      FROM tenants t
      ORDER BY t."createdAt" DESC
      LIMIT 500
    `

    return NextResponse.json({
      success: true,
      tenants: (rows || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        status: r.status,
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
        sitesCount: r.sitesCount || 0,
        installedSensors: r.installedSensors || 0,
        onlineSensors: r.onlineSensors || 0,
        offlineSensors: r.offlineSensors || 0,
        openAlerts: r.openAlerts || 0,
        criticalAlerts: r.criticalAlerts || 0,
        lastEventTime: r.lastEventTime ? new Date(r.lastEventTime).toISOString() : null,
      })),
    })
  } catch (e: any) {
    const msg = e?.message || 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : msg === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requirePortalSession(request)
    assertRole(session, ['MASTER_ADMIN'])

    const body = await request.json().catch(() => ({}))
    const name = String(body?.name || '').trim()
    const slug = String(body?.slug || '').trim().toLowerCase()

    if (!name || !slug) {
      return NextResponse.json({ success: false, error: 'name and slug are required' }, { status: 400 })
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ success: false, error: 'slug must be lowercase letters/numbers/dashes' }, { status: 400 })
    }

    const id = randomUUID()
    const rows = await sql/*sql*/`
      INSERT INTO tenants (id, name, slug, status, "createdAt", "updatedAt")
      VALUES (${id}, ${name}, ${slug}, 'ACTIVE', now(), now())
      ON CONFLICT (slug) DO NOTHING
      RETURNING id
    `
    const createdId = rows?.[0]?.id
    if (!createdId) return NextResponse.json({ success: false, error: 'Tenant slug already exists' }, { status: 409 })

    await sql/*sql*/`
      INSERT INTO tenant_settings ("tenantId", thresholds, "updatedAt")
      VALUES (${createdId}, ${sql.json(DEFAULT_THRESHOLD_JSON) as any}, now())
      ON CONFLICT ("tenantId") DO NOTHING
    `

    await writeAuditLog({
      request,
      session,
      tenantId: createdId,
      action: 'TENANT_CREATE',
      entityType: 'Tenant',
      entityId: createdId,
      before: null,
      after: { id: createdId, name, slug, status: 'ACTIVE' },
    })

    return NextResponse.json({ success: true, tenant: { id: createdId, name, slug, status: 'ACTIVE' } })
  } catch (e: any) {
    const msg = e?.message || 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : msg === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}


