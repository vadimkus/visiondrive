import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { sql } from '@/lib/sql'
import { randomUUID } from 'crypto'

function parseSpeed(input: unknown): number {
  const n = Number(input)
  if (!Number.isFinite(n) || n <= 0) return 1
  return Math.min(1000, Math.max(0.1, n))
}

export async function POST(request: NextRequest) {
  try {
    const token =
      request.cookies.get('authToken')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '')

    const decoded = verifyToken(token || '')
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = decoded.tenantId || null
    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'No tenant selected' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const fileId = String(body?.fileId || '')
    if (!fileId) {
      return NextResponse.json({ success: false, error: 'fileId is required' }, { status: 400 })
    }

    const speed = parseSpeed(body?.speed)
    const batchSize = Math.min(1000, Math.max(50, Number(body?.batchSize) || 250))
    const jobId = String(body?.jobId || '') || randomUUID()

    // Ensure a job exists (idempotent if user retries with same jobId)
    await sql/*sql*/`
      INSERT INTO replay_jobs (id, "tenantId", "fileId", status, speed, processed, "createdAt", "updatedAt")
      VALUES (${jobId}, ${tenantId}, ${fileId}, 'CREATED', ${speed}, 0, now(), now())
      ON CONFLICT (id) DO NOTHING
    `

    // Mark running
    await sql/*sql*/`
      UPDATE replay_jobs
      SET status = 'RUNNING',
          "startedAt" = COALESCE("startedAt", now()),
          speed = ${speed},
          "updatedAt" = now()
      WHERE id = ${jobId} AND "tenantId" = ${tenantId}
    `
    await sql/*sql*/`
      UPDATE ingest_files
      SET status = 'REPLAYING', "updatedAt" = now()
      WHERE id = ${fileId} AND "tenantId" = ${tenantId}
    `

    // Get cursor and then fetch next batch of staged events
    const jobRows = await sql/*sql*/`
      SELECT "cursorSeq", processed
      FROM replay_jobs
      WHERE id = ${jobId} AND "tenantId" = ${tenantId}
      LIMIT 1
    `
    const cursorSeq = jobRows?.[0]?.cursorSeq ?? null

    const rows = await sql/*sql*/`
      SELECT seq, "originalTime", "devEui", "sensorType", "gatewaySerial", "rawPayload", decoded, rssi, snr, "batteryPct"
      FROM ingest_events
      WHERE "tenantId" = ${tenantId}
        AND "fileId" = ${fileId}
        AND (${cursorSeq}::bigint IS NULL OR seq > ${cursorSeq})
      ORDER BY seq ASC
      LIMIT ${batchSize}
    `

    if (!rows || rows.length === 0) {
      await sql/*sql*/`
        UPDATE replay_jobs
        SET status = 'DONE', "finishedAt" = now(), "updatedAt" = now()
        WHERE id = ${jobId} AND "tenantId" = ${tenantId}
      `
      await sql/*sql*/`
        UPDATE ingest_files
        SET status = 'DONE', "updatedAt" = now()
        WHERE id = ${fileId} AND "tenantId" = ${tenantId}
      `
      return NextResponse.json({ success: true, job: { id: jobId, status: 'DONE', processed: jobRows?.[0]?.processed || 0 } })
    }

    // Ensure sensors exist for devEUI, and insert into sensor_events.
    // We keep it simple: auto-create sensors if missing (unbound) under tenant.
    let processed = 0
    let lastSeq: bigint | null = null

    for (const e of rows) {
      lastSeq = e.seq
      // upsert sensor by devEui
      const sensorId = randomUUID()
      const sensorRows = await sql/*sql*/`
        INSERT INTO sensors (id, "tenantId", "devEui", type, status, "createdAt", "updatedAt")
        VALUES (${sensorId}, ${tenantId}, ${e.devEui}, ${e.sensorType}, 'ACTIVE', now(), now())
        ON CONFLICT ("devEui") DO UPDATE
          SET "updatedAt" = now()
        RETURNING id
      `
      const ensuredSensorId = sensorRows?.[0]?.id

      // gateway is optional; if we have a gatewaySerial, auto-create gateway if missing
      let gatewayId: string | null = null
      if (e.gatewaySerial) {
        const gwId = randomUUID()
        const gwRows = await sql/*sql*/`
          INSERT INTO gateways (id, "tenantId", name, serial, status, "createdAt", "updatedAt")
          VALUES (${gwId}, ${tenantId}, ${String(e.gatewaySerial)}, ${String(e.gatewaySerial)}, 'ACTIVE', now(), now())
          ON CONFLICT (serial) DO UPDATE
            SET "updatedAt" = now()
          RETURNING id
        `
        gatewayId = gwRows?.[0]?.id || null
      }

      const eventId = randomUUID()
      const decodedParam = typeof e.decoded === 'undefined' || e.decoded === null ? null : (sql.json(e.decoded) as any)
      await sql/*sql*/`
        INSERT INTO sensor_events (
          id,
          time,
          "createdAt",
          "tenantId",
          "sensorId",
          "gatewayId",
          kind,
          decoded,
          "rawPayload",
          rssi,
          snr,
          "batteryPct"
        )
        VALUES (
          ${eventId},
          ${e.originalTime},
          now(),
          ${tenantId},
          ${ensuredSensorId},
          ${gatewayId},
          'UPLINK',
          ${decodedParam},
          ${e.rawPayload as any},
          ${e.rssi ?? null},
          ${e.snr ?? null},
          ${e.batteryPct ?? null}
        )
        ON CONFLICT DO NOTHING
      `

      // Update sensor lastSeen + optional battery
      await sql/*sql*/`
        UPDATE sensors
        SET "lastSeen" = GREATEST(COALESCE("lastSeen", ${e.originalTime}), ${e.originalTime}),
            "batteryPct" = COALESCE(${e.batteryPct ?? null}, "batteryPct"),
            "updatedAt" = now()
        WHERE id = ${ensuredSensorId}
      `

      processed++
    }

    // Update cursor + counts
    await sql/*sql*/`
      UPDATE replay_jobs
      SET "cursorSeq" = ${lastSeq as any},
          processed = processed + ${processed},
          "updatedAt" = now()
      WHERE id = ${jobId} AND "tenantId" = ${tenantId}
    `

    // We don't actually "time-warp" in serverless; speed is stored for future realtime fanout.
    // The portal can call this endpoint repeatedly to advance the replay.
    const updated = await sql/*sql*/`
      SELECT id, status, processed, "cursorSeq", speed
      FROM replay_jobs
      WHERE id = ${jobId} AND "tenantId" = ${tenantId}
      LIMIT 1
    `

    return NextResponse.json({ success: true, job: updated?.[0] })
  } catch (error) {
    console.error('Replay run error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}


