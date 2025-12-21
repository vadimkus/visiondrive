import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { sql } from '@/lib/sql'
import { randomUUID } from 'crypto'

type UploadEvent = {
  time?: string
  timestamp?: string
  ts?: string
  devEui?: string
  deveui?: string
  deviceEui?: string
  type?: string
  sensorType?: string
  gatewaySerial?: string
  gateway?: string
  rawPayload?: string
  payload?: string
  decoded?: unknown
  rssi?: number
  snr?: number
  batteryPct?: number
  lat?: number
  lng?: number
  meta?: unknown
}

function parseIsoDate(input: unknown): Date | null {
  if (typeof input !== 'string') return null
  const d = new Date(input)
  return Number.isNaN(d.getTime()) ? null : d
}

function normalizeSensorType(input: unknown): 'PARKING' | 'WEATHER' | 'OTHER' {
  const t = String(input || '').trim().toUpperCase()
  if (t === 'PARKING') return 'PARKING'
  if (t === 'WEATHER') return 'WEATHER'
  return 'OTHER'
}

function parseCsv(text: string): Record<string, string>[] {
  // Minimal CSV parser: comma-separated, double-quote wrapping supported, first row is header.
  // Good enough for MVP; we can replace with a full CSV parser later if needed.
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
  if (lines.length === 0) return []

  const parseLine = (line: string) => {
    const out: string[] = []
    let cur = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
        continue
      }
      if (ch === ',' && !inQuotes) {
        out.push(cur)
        cur = ''
        continue
      }
      cur += ch
    }
    out.push(cur)
    return out.map((s) => s.trim())
  }

  const header = parseLine(lines[0])
  const rows: Record<string, string>[] = []
  for (const line of lines.slice(1)) {
    const cols = parseLine(line)
    const row: Record<string, string> = {}
    for (let i = 0; i < header.length; i++) row[header[i]] = cols[i] ?? ''
    rows.push(row)
  }
  return rows
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

    const contentType = request.headers.get('content-type') || ''

    let filename = 'upload'
    let source = 'manual-upload'
    let events: UploadEvent[] = []

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File | null
      source = String(formData.get('source') || source)
      if (!file) {
        return NextResponse.json({ success: false, error: 'file is required' }, { status: 400 })
      }
      filename = file.name || filename
      const text = await file.text()
      const inferredType = file.type || (filename.endsWith('.csv') ? 'text/csv' : 'application/json')
      if (inferredType.includes('csv') || filename.endsWith('.csv')) {
        const rows = parseCsv(text)
        events = rows as unknown as UploadEvent[]
      } else {
        const parsed = JSON.parse(text)
        events = Array.isArray(parsed) ? parsed : parsed?.events || []
      }
    } else {
      // JSON body: { filename?, source?, events: [...] } or raw array
      const body = await request.json()
      if (Array.isArray(body)) {
        events = body
      } else {
        filename = String(body?.filename || filename)
        source = String(body?.source || source)
        events = Array.isArray(body?.events) ? body.events : []
      }
    }

    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ success: false, error: 'No events provided' }, { status: 400 })
    }

    const fileId = randomUUID()
    const actorUserId = decoded.userId
    await sql/*sql*/`
      INSERT INTO ingest_files (id, "tenantId", "uploadedByUserId", filename, "contentType", source, status, "createdAt", "updatedAt")
      VALUES (${fileId}, ${tenantId}, ${actorUserId}, ${filename}, ${contentType}, ${source}, 'UPLOADED', now(), now())
    `

    let total = 0
    let valid = 0
    let invalid = 0
    let minTime: Date | null = null
    let maxTime: Date | null = null

    // Insert staged events in batches
    const batchSize = 500
    for (let offset = 0; offset < events.length; offset += batchSize) {
      const batch = events.slice(offset, offset + batchSize)
      for (let i = 0; i < batch.length; i++) {
        total++
        const rowIndex = offset + i
        const e = batch[i] || {}

        const ts =
          parseIsoDate(e.time) ||
          parseIsoDate(e.timestamp) ||
          parseIsoDate(e.ts) ||
          null
        const devEui = String(e.devEui || e.deveui || e.deviceEui || '').trim()

        if (!ts || !devEui) {
          invalid++
          const rawJson = sql.json(e as any)
          await sql/*sql*/`
            INSERT INTO ingest_dead_letters (id, "tenantId", "fileId", "rowIndex", reason, raw, "createdAt")
            VALUES (${randomUUID()}, ${tenantId}, ${fileId}, ${rowIndex}, ${!ts ? 'missing/invalid time' : 'missing devEui'}, ${rawJson as any}, now())
          `
          continue
        }

        if (!minTime || ts < minTime) minTime = ts
        if (!maxTime || ts > maxTime) maxTime = ts

        const sensorType = normalizeSensorType(e.type ?? e.sensorType)
        const gatewaySerial = (e.gatewaySerial || e.gateway || null) as any
        const rawPayload = (e.rawPayload || e.payload || null) as any
        const decodedJson = typeof e.decoded === 'undefined' ? null : (e.decoded as any)
        const metaJson = typeof e.meta === 'undefined' ? null : (e.meta as any)
        const decodedParam = decodedJson === null ? null : (sql.json(decodedJson) as any)
        const metaParam = metaJson === null ? null : (sql.json(metaJson) as any)

        await sql/*sql*/`
          INSERT INTO ingest_events (
            id,
            "tenantId",
            "fileId",
            "originalTime",
            "devEui",
            "sensorType",
            "gatewaySerial",
            "rawPayload",
            decoded,
            rssi,
            snr,
            "batteryPct",
            lat,
            lng,
            meta,
            "createdAt"
          )
          VALUES (
            ${randomUUID()},
            ${tenantId},
            ${fileId},
            ${ts},
            ${devEui},
            ${sensorType},
            ${gatewaySerial},
            ${rawPayload},
            ${decodedParam},
            ${typeof e.rssi === 'number' ? e.rssi : null},
            ${typeof e.snr === 'number' ? e.snr : null},
            ${typeof e.batteryPct === 'number' ? e.batteryPct : null},
            ${typeof e.lat === 'number' ? e.lat : null},
            ${typeof e.lng === 'number' ? e.lng : null},
            ${metaParam},
            now()
          )
        `
        valid++
      }
    }

    await sql/*sql*/`
      UPDATE ingest_files
      SET status = 'UPLOADED',
          "totalEvents" = ${total},
          "validEvents" = ${valid},
          "invalidEvents" = ${invalid},
          "minTime" = ${minTime},
          "maxTime" = ${maxTime},
          "updatedAt" = now()
      WHERE id = ${fileId}
    `

    return NextResponse.json({
      success: true,
      file: {
        id: fileId,
        filename,
        source,
        totalEvents: total,
        validEvents: valid,
        invalidEvents: invalid,
        minTime: minTime?.toISOString() || null,
        maxTime: maxTime?.toISOString() || null,
      },
    })
  } catch (error) {
    console.error('Replay upload error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}


