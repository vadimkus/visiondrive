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
      // Minimal generation for weather daily summary: store CSV in meta (email integration can be added later).
      if (s.kind === 'WEATHER_DAILY_SUMMARY') {
        const stations = await sql/*sql*/`
          SELECT s.id, s."devEui", s.lat, s.lng
          FROM sensors s
          WHERE s."tenantId" = ${s.tenantId}
            AND s.type = 'WEATHER'
          ORDER BY s."devEui" ASC
          LIMIT 500
        `

        const rows: Array<any> = []
        for (const st of stations || []) {
          const r = await sql/*sql*/`
            SELECT
              AVG(NULLIF((decoded->>'temperatureC')::double precision, NULL)) AS "avgTempC",
              AVG(NULLIF((decoded->>'humidityPct')::double precision, NULL)) AS "avgHumidityPct",
              AVG(NULLIF((decoded->>'pm25')::double precision, NULL)) AS "avgPm25",
              AVG(NULLIF((decoded->>'aqi')::double precision, NULL)) AS "avgAqi",
              MAX(NULLIF((decoded->>'windMps')::double precision, NULL)) AS "maxWindMps"
            FROM sensor_events
            WHERE "tenantId" = ${s.tenantId}
              AND "sensorId" = ${st.id}
              AND time >= now() - interval '24 hours'
              AND decoded IS NOT NULL
          `
          rows.push({
            stationId: st.id,
            devEui: st.devEui,
            avgTempC: r?.[0]?.avgTempC ?? null,
            avgHumidityPct: r?.[0]?.avgHumidityPct ?? null,
            avgPm25: r?.[0]?.avgPm25 ?? null,
            avgAqi: r?.[0]?.avgAqi ?? null,
            maxWindMps: r?.[0]?.maxWindMps ?? null,
          })
        }

        const header = ['stationId', 'devEui', 'avgTempC', 'avgHumidityPct', 'avgPm25', 'avgAqi', 'maxWindMps']
        const csv =
          header.join(',') +
          '\n' +
          rows
            .map((r) =>
              header
                .map((k) => {
                  const v = (r as any)[k]
                  const s = v === null || typeof v === 'undefined' ? '' : String(v)
                  if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replaceAll('"', '""')}"`
                  return s
                })
                .join(',')
            )
            .join('\n')

        await sql/*sql*/`
          UPDATE report_deliveries
          SET status = 'SUCCEEDED',
              "finishedAt" = now(),
              meta = ${sql.json({ kind: 'WEATHER_DAILY_SUMMARY', window: '24h', csv }) as any}
          WHERE id = ${deliveryId}
        `
      } else {
        // Placeholder: real generation + email send will come later.
        await sql/*sql*/`
          UPDATE report_deliveries
          SET status = 'SUCCEEDED',
              "finishedAt" = now(),
              meta = ${sql.json({ note: 'Generated (placeholder). Add email integration to deliver.' }) as any}
          WHERE id = ${deliveryId}
        `
      }

      await sql/*sql*/`
        UPDATE report_subscriptions
        SET "lastRunAt" = now(),
            "nextRunAt" = CASE
              WHEN cadence = 'DAILY' THEN now() + interval '1 day'
              WHEN cadence = 'WEEKLY' THEN now() + interval '7 days'
              WHEN cadence = 'MONTHLY' THEN now() + interval '30 days'
              ELSE now() + interval '7 days'
            END,
            "updatedAt" = now()
        WHERE id = ${s.id}
      `
    } catch (e: unknown) {
      await sql/*sql*/`
        UPDATE report_deliveries
        SET status = 'FAILED',
            "finishedAt" = now(),
            error = ${String(e instanceof Error ? e.message : 'Unknown error')}
        WHERE id = ${deliveryId}
      `
    }
  }

  return NextResponse.json({ success: true, processed })
}


