import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/sql'
import { requirePortalSession } from '@/lib/portal/session'

function num(v: any): number | null {
  if (v === null || typeof v === 'undefined') return null
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : null
}

function bool(v: any): boolean | null {
  if (typeof v === 'boolean') return v
  if (v === 'true') return true
  if (v === 'false') return false
  return null
}

export async function GET(request: NextRequest) {
  try {
    const session = await requirePortalSession(request)
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || '').trim().toLowerCase()

    const settingsRows = await sql/*sql*/`
      SELECT thresholds
      FROM tenant_settings
      WHERE "tenantId" = ${session.tenantId}
      LIMIT 1
    `
    const thresholds = settingsRows?.[0]?.thresholds || {}
    const offlineMinutes = Number(thresholds.offlineMinutes || 60)

    const rows = await sql/*sql*/`
      SELECT
        s.id,
        s."devEui",
        s.model,
        s.status,
        s.lat,
        s.lng,
        s."batteryPct",
        si.name AS "siteName",
        z.name AS "zoneName",
        e.time AS "eventTime",
        e.decoded AS "decoded"
      FROM sensors s
      LEFT JOIN sites si ON si.id = s."siteId"
      LEFT JOIN zones z ON z.id = s."zoneId"
      LEFT JOIN LATERAL (
        SELECT time, decoded
        FROM sensor_events
        WHERE "tenantId" = ${session.tenantId} AND "sensorId" = s.id
        ORDER BY time DESC
        LIMIT 1
      ) e ON true
      WHERE s."tenantId" = ${session.tenantId}
        AND s.type = 'WEATHER'
      ORDER BY s."devEui" ASC
      LIMIT 500
    `

    const items = (rows || [])
      .map((r: any) => {
        const decoded = r.decoded && typeof r.decoded === 'object' ? r.decoded : null
        const eventTime = r.eventTime ? new Date(r.eventTime) : null
        const lastSeen = eventTime ? eventTime.toISOString() : null
        const ageMin = eventTime ? Math.floor((Date.now() - eventTime.getTime()) / 60000) : null
        const online = typeof ageMin === 'number' ? ageMin <= offlineMinutes : false

        const temperatureC = num(decoded?.temperatureC ?? decoded?.tempC)
        const humidityPct = num(decoded?.humidityPct)
        const windMps = num(decoded?.windMps ?? decoded?.windSpeedMps)
        const gustMps = num(decoded?.gustMps ?? decoded?.windGustMps)
        const pm25 = num(decoded?.pm25)
        const pm10 = num(decoded?.pm10)
        const aqi = num(decoded?.aqi)
        const rain = bool(decoded?.rain)

        const name = (decoded?.name && String(decoded.name).trim()) || (r.model ? `${r.model}` : null) || 'Weather Station'

        // Simple threshold-based derived alerts (not persisted yet)
        const derivedAlerts: Array<{ type: string; severity: 'INFO' | 'WARNING' | 'CRITICAL'; message: string }> = []
        if (!online) derivedAlerts.push({ type: 'SENSOR_OFFLINE', severity: 'CRITICAL', message: 'Station offline' })
        if (typeof aqi === 'number' && aqi >= 150) derivedAlerts.push({ type: 'AQI_HIGH', severity: 'WARNING', message: `AQI high (${aqi})` })
        if (typeof pm25 === 'number' && pm25 >= 55) derivedAlerts.push({ type: 'PM25_HIGH', severity: 'WARNING', message: `PM2.5 high (${pm25})` })
        if (typeof windMps === 'number' && windMps >= 12) derivedAlerts.push({ type: 'WIND_HIGH', severity: 'WARNING', message: `Wind high (${windMps} m/s)` })
        if (rain === true) derivedAlerts.push({ type: 'RAIN_DETECTED', severity: 'INFO', message: 'Rain detected' })

        return {
          id: r.id,
          devEui: r.devEui,
          name,
          siteName: r.siteName || null,
          zoneName: r.zoneName || null,
          lat: typeof r.lat === 'number' ? r.lat : null,
          lng: typeof r.lng === 'number' ? r.lng : null,
          lastSeen,
          ageMinutes: typeof ageMin === 'number' && Number.isFinite(ageMin) ? ageMin : null,
          online,
          batteryPct: typeof r.batteryPct === 'number' ? r.batteryPct : null,
          metrics: { temperatureC, humidityPct, windMps, gustMps, pm25, pm10, aqi, rain },
          derivedAlerts,
        }
      })
      .filter((x: any) => {
        if (!q) return true
        const hay = `${x.devEui} ${x.name || ''} ${x.siteName || ''} ${x.zoneName || ''}`.toLowerCase()
        return hay.includes(q)
      })

    const kpis = (() => {
      const total = items.length
      const onlineCount = items.filter((s: any) => s.online).length
      const offlineCount = total - onlineCount
      const avgTemp =
        items.reduce((sum: number, s: any) => sum + (typeof s.metrics.temperatureC === 'number' ? s.metrics.temperatureC : 0), 0) /
        Math.max(1, items.filter((s: any) => typeof s.metrics.temperatureC === 'number').length)
      const avgAqi =
        items.reduce((sum: number, s: any) => sum + (typeof s.metrics.aqi === 'number' ? s.metrics.aqi : 0), 0) /
        Math.max(1, items.filter((s: any) => typeof s.metrics.aqi === 'number').length)
      const openDerivedAlerts = items.reduce((n: number, s: any) => n + (s.derivedAlerts?.length || 0), 0)
      return {
        total,
        online: onlineCount,
        offline: offlineCount,
        avgTempC: Number.isFinite(avgTemp) ? Number(avgTemp.toFixed(1)) : null,
        avgAqi: Number.isFinite(avgAqi) ? Math.round(avgAqi) : null,
        derivedAlerts: openDerivedAlerts,
      }
    })()

    return NextResponse.json({ success: true, kpis, items })
  } catch (e: any) {
    const msg = e?.message || 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}



