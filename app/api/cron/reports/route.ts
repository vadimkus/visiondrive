import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/sql'
import { randomUUID } from 'crypto'

// Cron-ready endpoint (Vercel Cron / external scheduler)
// - Protected by CRON_SECRET
// - Logs deliveries to report_deliveries
// - Does NOT send email yet (email integration can be added later)
export async function GET(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret') || new URL(request.url).searchParams.get('secret') || ''
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  // Select due subscriptions (very simple: nextRunAt <= now; if null, treat as due)
  const subs = await sql/*sql*/`
    SELECT id, "tenantId", kind, cadence
    FROM report_subscriptions
    WHERE enabled = true
      AND ("nextRunAt" IS NULL OR "nextRunAt" <= now())
    ORDER BY "nextRunAt" NULLS FIRST, "createdAt" ASC
    LIMIT 50
  `

  let processed = 0
  for (const s of subs || []) {
    processed++
    const deliveryId = randomUUID()
    await sql/*sql*/`
      INSERT INTO report_deliveries (id, "tenantId", "subscriptionId", status, "scheduledAt")
      VALUES (${deliveryId}, ${s.tenantId}, ${s.id}, 'RUNNING', now())
    `

    try {
      // Placeholder: real generation + email send will come later.
      await sql/*sql*/`
        UPDATE report_deliveries
        SET status = 'SUCCEEDED',
            "finishedAt" = now(),
            meta = ${sql.json({ note: 'Generated (placeholder). Add email integration to deliver.' }) as any}
        WHERE id = ${deliveryId}
      `
      // naive nextRunAt scheduling
      await sql/*sql*/`
        UPDATE report_subscriptions
        SET "lastRunAt" = now(),
            "nextRunAt" = CASE
              WHEN cadence = 'WEEKLY' THEN now() + interval '7 days'
              WHEN cadence = 'MONTHLY' THEN now() + interval '30 days'
              ELSE now() + interval '7 days'
            END,
            "updatedAt" = now()
        WHERE id = ${s.id}
      `
    } catch (e: any) {
      await sql/*sql*/`
        UPDATE report_deliveries
        SET status = 'FAILED',
            "finishedAt" = now(),
            error = ${String(e?.message || e)}
        WHERE id = ${deliveryId}
      `
    }
  }

  return NextResponse.json({ success: true, processed })
}


