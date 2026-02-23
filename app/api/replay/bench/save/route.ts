import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { sql } from '@/lib/sql'
import { decodePayload } from '@/lib/decoders'
import { randomUUID } from 'crypto'

function parseIsoDate(input: unknown): Date | null {
  if (typeof input !== 'string') return null
  const d = new Date(input)
  return Number.isNaN(d.getTime()) ? null : d
}

export async function POST(request: NextRequest) {
  try {
    const token =
      request.cookies.get('authToken')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '')

    const decodedToken = verifyToken(token || '')
    if (!decodedToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = decodedToken.tenantId || null
    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'No tenant selected' }, { status: 400 })
    }

    const body = await request.json()
    const devEui = String(body?.devEui || '').trim()
    const rawPayload = String(body?.rawPayload || '').trim()
    const sensorType = String(body?.sensorType || 'OTHER').toUpperCase()
    const time =
      parseIsoDate(body?.time) ||
      (typeof body?.time === 'number' ? new Date(body.time) : null) ||
      new Date()

    if (!devEui) {
      return NextResponse.json({ success: false, error: 'devEui is required' }, { status: 400 })
    }
    if (!rawPayload) {
      return NextResponse.json({ success: false, error: 'rawPayload is required' }, { status: 400 })
    }

    const normalizedType =
      sensorType === 'TEMPERATURE' || sensorType === 'PARKING' ? 'TEMPERATURE' : sensorType === 'WEATHER' ? 'WEATHER' : 'OTHER'

    const preview = decodePayload({ sensorType: normalizedType, rawPayload })

    // Ensure sensor exists
    const sensorId = randomUUID()
    const sensorRows = await sql/*sql*/`
      INSERT INTO sensors (id, "tenantId", "devEui", type, status, "createdAt", "updatedAt")
      VALUES (${sensorId}, ${tenantId}, ${devEui}, ${normalizedType}, 'ACTIVE', now(), now())
      ON CONFLICT ("devEui") DO UPDATE
        SET type = EXCLUDED.type,
            "updatedAt" = now()
      RETURNING id
    `
    const ensuredSensorId = sensorRows?.[0]?.id

    const eventId = randomUUID()
    await sql/*sql*/`
      INSERT INTO sensor_events (
        id,
        time,
        "createdAt",
        "tenantId",
        "sensorId",
        kind,
        decoded,
        "rawPayload"
      )
      VALUES (
        ${eventId},
        ${time},
        now(),
        ${tenantId},
        ${ensuredSensorId},
        'UPLINK',
        ${sql.json(preview.decoded as any) as any},
        ${rawPayload}
      )
    `

    await sql/*sql*/`
      UPDATE sensors
      SET "lastSeen" = GREATEST(COALESCE("lastSeen", ${time}), ${time}),
          "updatedAt" = now()
      WHERE id = ${ensuredSensorId}
    `

    return NextResponse.json({
      success: true,
      saved: {
        sensorId: ensuredSensorId,
        eventId,
        time: time.toISOString(),
        sensorType: normalizedType,
        decoded: preview.decoded,
        warnings: preview.warnings,
      },
    })
  } catch (error) {
    console.error('Decoder save error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}


