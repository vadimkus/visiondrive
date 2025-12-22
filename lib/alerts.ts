import { sql } from './sql'
import { randomUUID } from 'crypto'

export type AlertThresholds = {
  offlineMinutes: number
  lowBatteryPct: number
  staleEventMinutes: number

  // Signal thresholds
  poorRssiThreshold: number // e.g. -115
  poorSnrThreshold: number // e.g. 0
  signalLookbackHours: number // e.g. 24
  signalMinSamples: number // e.g. 3

  // Flapping thresholds
  flappingWindowMinutes: number // e.g. 30
  flappingMaxChanges: number // e.g. 6

  // Decode/ingest errors
  deadLettersWindowHours: number // e.g. 24
  deadLettersCritical: number // e.g. 50
  deadLettersWarning: number // e.g. 10

  // SLA
  slaHoursCritical: number // e.g. 4
  slaHoursWarning: number // e.g. 24
  slaHoursInfo: number // e.g. 72
}

const DEFAULT_THRESHOLDS: AlertThresholds = {
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

function num(v: any, fallback: number) {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

export async function getAlertThresholds(tenantId: string): Promise<AlertThresholds> {
  const rows = await sql/*sql*/`
    SELECT thresholds
    FROM tenant_settings
    WHERE "tenantId" = ${tenantId}
    LIMIT 1
  `
  const t = rows?.[0]?.thresholds || {}

  return {
    offlineMinutes: num(t.offlineMinutes, DEFAULT_THRESHOLDS.offlineMinutes),
    lowBatteryPct: num(t.lowBatteryPct, DEFAULT_THRESHOLDS.lowBatteryPct),
    staleEventMinutes: num(t.staleEventMinutes, DEFAULT_THRESHOLDS.staleEventMinutes),

    poorRssiThreshold: num(t.poorRssiThreshold, DEFAULT_THRESHOLDS.poorRssiThreshold),
    poorSnrThreshold: num(t.poorSnrThreshold, DEFAULT_THRESHOLDS.poorSnrThreshold),
    signalLookbackHours: num(t.signalLookbackHours, DEFAULT_THRESHOLDS.signalLookbackHours),
    signalMinSamples: num(t.signalMinSamples, DEFAULT_THRESHOLDS.signalMinSamples),

    flappingWindowMinutes: num(t.flappingWindowMinutes, DEFAULT_THRESHOLDS.flappingWindowMinutes),
    flappingMaxChanges: num(t.flappingMaxChanges, DEFAULT_THRESHOLDS.flappingMaxChanges),

    deadLettersWindowHours: num(t.deadLettersWindowHours, DEFAULT_THRESHOLDS.deadLettersWindowHours),
    deadLettersCritical: num(t.deadLettersCritical, DEFAULT_THRESHOLDS.deadLettersCritical),
    deadLettersWarning: num(t.deadLettersWarning, DEFAULT_THRESHOLDS.deadLettersWarning),

    slaHoursCritical: num(t.slaHoursCritical, DEFAULT_THRESHOLDS.slaHoursCritical),
    slaHoursWarning: num(t.slaHoursWarning, DEFAULT_THRESHOLDS.slaHoursWarning),
    slaHoursInfo: num(t.slaHoursInfo, DEFAULT_THRESHOLDS.slaHoursInfo),
  }
}

export type HealthMetrics = {
  daysInUse: number | null
  lastSeen: Date | null
  ageMinutes: number | null

  // signal
  lastRssi: number | null
  lastSnr: number | null
  avgRssi24h: number | null
  avgSnr24h: number | null
  signalSamples24h: number

  // battery
  batteryPct: number | null
  batteryDrainPerDay7d: number | null

  // flapping
  flapChanges: number
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export function computeHealthScore(t: AlertThresholds, m: HealthMetrics) {
  let score = 100

  // Freshness / offline risk
  if (m.ageMinutes === null) score -= 60
  else if (m.ageMinutes > t.offlineMinutes) score -= 60
  else if (m.ageMinutes > 60) score -= 35
  else if (m.ageMinutes > 15) score -= 20

  // Battery
  if (typeof m.batteryPct === 'number') {
    if (m.batteryPct <= 10) score -= 30
    else if (m.batteryPct <= 20) score -= 15
  }

  // Battery drain
  if (typeof m.batteryDrainPerDay7d === 'number') {
    if (m.batteryDrainPerDay7d >= 5) score -= 25
    else if (m.batteryDrainPerDay7d >= 3) score -= 15
    else if (m.batteryDrainPerDay7d >= 2) score -= 8
  }

  // Signal quality (only if we have enough samples)
  if (m.signalSamples24h >= t.signalMinSamples) {
    if ((typeof m.avgRssi24h === 'number' && m.avgRssi24h <= t.poorRssiThreshold) || (typeof m.avgSnr24h === 'number' && m.avgSnr24h <= t.poorSnrThreshold)) {
      score -= 15
    }
  }

  // Flapping
  if (m.flapChanges >= t.flappingMaxChanges) score -= 20
  else if (m.flapChanges >= Math.floor(t.flappingMaxChanges / 2)) score -= 10

  return clamp(score, 0, 100)
}

function slaDueAtExpr(t: AlertThresholds, severity: 'INFO' | 'WARNING' | 'CRITICAL') {
  const hours = severity === 'CRITICAL' ? t.slaHoursCritical : severity === 'WARNING' ? t.slaHoursWarning : t.slaHoursInfo
  return sql/*sql*/`now() + (${hours} || ' hours')::interval`
}

async function insertAlertEvent(params: {
  tenantId: string
  alertId: string
  actorUserId?: string | null
  action: string
  note?: string | null
  meta?: any
}) {
  const { tenantId, alertId, actorUserId, action, note, meta } = params
  await sql/*sql*/`
    INSERT INTO alert_events (id, "tenantId", "alertId", "actorUserId", action, note, meta, "createdAt")
    VALUES (
      ${randomUUID()},
      ${tenantId},
      ${alertId},
      ${actorUserId ?? null},
      ${action},
      ${note ?? null},
      ${typeof meta === 'undefined' ? null : (sql.json(meta) as any)},
      now()
    )
  `
}

async function openOrUpdateAlert(params: {
  thresholds: AlertThresholds
  tenantId: string
  siteId?: string | null
  zoneId?: string | null
  sensorId?: string | null
  gatewayId?: string | null
  type: 'SENSOR_OFFLINE' | 'LOW_BATTERY' | 'POOR_SIGNAL' | 'FLAPPING' | 'DECODE_ERRORS'
  severity: 'INFO' | 'WARNING' | 'CRITICAL'
  title: string
  message?: string | null
  meta?: any
  actorUserId?: string | null
}) {
  const { thresholds, tenantId, siteId, zoneId, sensorId, gatewayId, type, severity, title, message, meta, actorUserId } = params

  const existing = await sql/*sql*/`
    SELECT id, status, severity
    FROM alerts
    WHERE "tenantId" = ${tenantId}
      AND type = ${type}
      AND ("sensorId" IS NOT DISTINCT FROM ${sensorId ?? null})
      AND status IN ('OPEN', 'ACKNOWLEDGED')
    ORDER BY "updatedAt" DESC
    LIMIT 1
  `
  const row = existing?.[0] || null

  if (!row) {
    const id = randomUUID()
    await sql/*sql*/`
      INSERT INTO alerts (
        id,
        "tenantId",
        "siteId",
        "zoneId",
        "sensorId",
        "gatewayId",
        type,
        severity,
        status,
        title,
        message,
        meta,
        "openedAt",
        "firstDetectedAt",
        "lastDetectedAt",
        "slaDueAt",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${id},
        ${tenantId},
        ${siteId ?? null},
        ${zoneId ?? null},
        ${sensorId ?? null},
        ${gatewayId ?? null},
        ${type},
        ${severity},
        'OPEN',
        ${title},
        ${message ?? null},
        ${typeof meta === 'undefined' ? null : (sql.json(meta) as any)},
        now(),
        now(),
        now(),
        ${slaDueAtExpr(thresholds, severity) as any},
        now(),
        now()
      )
    `
    await insertAlertEvent({ tenantId, alertId: id, actorUserId, action: 'OPEN', note: null, meta: { type, severity } })
    return { id, created: true }
  }

  await sql/*sql*/`
    UPDATE alerts
    SET "lastDetectedAt" = now(),
        "updatedAt" = now(),
        severity = ${severity},
        title = ${title},
        message = ${message ?? null},
        meta = ${typeof meta === 'undefined' ? null : (sql.json(meta) as any)}
    WHERE id = ${row.id} AND "tenantId" = ${tenantId}
  `
  await insertAlertEvent({ tenantId, alertId: row.id, actorUserId, action: 'UPDATE', note: null, meta: { type, severity } })
  return { id: row.id, created: false }
}

async function autoResolveAlert(params: {
  tenantId: string
  type: string
  sensorId?: string | null
  actorUserId?: string | null
  note?: string | null
}) {
  const { tenantId, type, sensorId, actorUserId, note } = params
  const rows = await sql/*sql*/`
    SELECT id
    FROM alerts
    WHERE "tenantId" = ${tenantId}
      AND type = ${type}
      AND ("sensorId" IS NOT DISTINCT FROM ${sensorId ?? null})
      AND status IN ('OPEN', 'ACKNOWLEDGED')
    ORDER BY "updatedAt" DESC
    LIMIT 1
  `
  const a = rows?.[0] || null
  if (!a) return false

  await sql/*sql*/`
    UPDATE alerts
    SET status = 'RESOLVED',
        "resolvedAt" = now(),
        "updatedAt" = now()
    WHERE id = ${a.id} AND "tenantId" = ${tenantId}
  `
  await insertAlertEvent({ tenantId, alertId: a.id, actorUserId, action: 'AUTO_RESOLVE', note: note ?? null })
  return true
}

export type AlertScanResult = {
  created: number
  updated: number
  resolved: number
  checkedSensors: number
  thresholds: AlertThresholds
}

export async function runAlertScan(params: {
  tenantId: string
  zoneId?: string | null
  actorUserId?: string | null
}): Promise<AlertScanResult> {
  const { tenantId, zoneId, actorUserId } = params
  const t = await getAlertThresholds(tenantId)

  const sensors = await sql/*sql*/`
    SELECT
      s.id,
      s."devEui",
      s."siteId",
      s."zoneId",
      s."bayId",
      s."installDate",
      s."lastSeen",
      s."batteryPct",
      le.time AS "lastEventTime",
      le.rssi AS "lastRssi",
      le.snr AS "lastSnr",
      ss."avgRssi" AS "avgRssi24h",
      ss."avgSnr" AS "avgSnr24h",
      COALESCE(ss.samples, 0) AS "signalSamples24h",
      bs."minBattery" AS "minBattery7d",
      bs."maxBattery" AS "maxBattery7d",
      bs."minTime" AS "minBatteryTime7d",
      bs."maxTime" AS "maxBatteryTime7d",
      COALESCE(fs.changes, 0) AS "flapChanges"
    FROM sensors s
    LEFT JOIN LATERAL (
      SELECT time, rssi, snr
      FROM sensor_events
      WHERE "tenantId" = ${tenantId} AND "sensorId" = s.id
      ORDER BY time DESC
      LIMIT 1
    ) le ON true
    LEFT JOIN LATERAL (
      SELECT
        AVG(rssi)::float AS "avgRssi",
        AVG(snr)::float AS "avgSnr",
        COUNT(*)::int AS samples
      FROM sensor_events
      WHERE "tenantId" = ${tenantId}
        AND "sensorId" = s.id
        AND time > now() - (${t.signalLookbackHours} || ' hours')::interval
        AND (rssi IS NOT NULL OR snr IS NOT NULL)
    ) ss ON true
    LEFT JOIN LATERAL (
      SELECT
        MIN("batteryPct")::float AS "minBattery",
        MAX("batteryPct")::float AS "maxBattery",
        MIN(time) AS "minTime",
        MAX(time) AS "maxTime"
      FROM sensor_events
      WHERE "tenantId" = ${tenantId}
        AND "sensorId" = s.id
        AND time > now() - interval '7 days'
        AND "batteryPct" IS NOT NULL
    ) bs ON true
    LEFT JOIN LATERAL (
      WITH occ AS (
        SELECT
          time,
          CASE
            WHEN decoded ? 'occupied' THEN (decoded->>'occupied')::boolean
            ELSE NULL
          END AS occ
        FROM sensor_events
        WHERE "tenantId" = ${tenantId}
          AND "sensorId" = s.id
          AND time > now() - (${t.flappingWindowMinutes} || ' minutes')::interval
          AND decoded IS NOT NULL
        ORDER BY time ASC
      )
      SELECT COUNT(*)::int AS changes
      FROM (
        SELECT occ, LAG(occ) OVER (ORDER BY time) AS prev
        FROM occ
        WHERE occ IS NOT NULL
      ) x
      WHERE prev IS NOT NULL AND occ IS DISTINCT FROM prev
    ) fs ON true
    WHERE s."tenantId" = ${tenantId}
      AND s."bayId" IS NOT NULL
      AND (${zoneId ?? null}::text IS NULL OR s."zoneId" = ${zoneId ?? null})
    ORDER BY s."devEui" ASC
  `

  let created = 0
  let updated = 0
  let resolved = 0

  for (const s of sensors || []) {
    const lastSeen = s.lastSeen ? new Date(s.lastSeen) : null
    const ageMinutes = lastSeen ? Math.floor((Date.now() - lastSeen.getTime()) / 60000) : null
    const installDate = s.installDate ? new Date(s.installDate) : null
    const daysInUse = installDate ? Math.floor((Date.now() - installDate.getTime()) / 86400000) : null

    let batteryDrainPerDay7d: number | null = null
    if (
      typeof s.minBattery7d === 'number' &&
      typeof s.maxBattery7d === 'number' &&
      s.minBatteryTime7d &&
      s.maxBatteryTime7d
    ) {
      const minT = new Date(s.minBatteryTime7d)
      const maxT = new Date(s.maxBatteryTime7d)
      const days = Math.max(1, (maxT.getTime() - minT.getTime()) / 86400000)
      const drop = Math.max(0, Number(s.maxBattery7d) - Number(s.minBattery7d))
      batteryDrainPerDay7d = drop / days
    }

    const metrics: HealthMetrics = {
      daysInUse,
      lastSeen,
      ageMinutes,
      lastRssi: typeof s.lastRssi === 'number' ? s.lastRssi : null,
      lastSnr: typeof s.lastSnr === 'number' ? s.lastSnr : null,
      avgRssi24h: typeof s.avgRssi24h === 'number' ? s.avgRssi24h : null,
      avgSnr24h: typeof s.avgSnr24h === 'number' ? s.avgSnr24h : null,
      signalSamples24h: Number(s.signalSamples24h || 0),
      batteryPct: typeof s.batteryPct === 'number' ? s.batteryPct : null,
      batteryDrainPerDay7d,
      flapChanges: Number(s.flapChanges || 0),
    }

    // Offline
    const isOffline = metrics.ageMinutes === null || metrics.ageMinutes > t.offlineMinutes
    if (isOffline) {
      const res = await openOrUpdateAlert({
        thresholds: t,
        tenantId,
        siteId: s.siteId ?? null,
        zoneId: s.zoneId ?? null,
        sensorId: s.id,
        type: 'SENSOR_OFFLINE',
        severity: 'CRITICAL',
        title: `Sensor offline (${s.devEui})`,
        message: metrics.ageMinutes === null ? 'No lastSeen timestamp recorded.' : `No heartbeat/event for ${metrics.ageMinutes} minutes.`,
        meta: { devEui: s.devEui, ageMinutes: metrics.ageMinutes, daysInUse: metrics.daysInUse },
        actorUserId,
      })
      if (res.created) created++
      else updated++
    } else {
      if (await autoResolveAlert({ tenantId, type: 'SENSOR_OFFLINE', sensorId: s.id, actorUserId, note: 'Sensor is back online.' })) resolved++
    }

    // Low battery
    const isLowBattery = typeof metrics.batteryPct === 'number' && metrics.batteryPct <= t.lowBatteryPct
    if (isLowBattery) {
      const res = await openOrUpdateAlert({
        thresholds: t,
        tenantId,
        siteId: s.siteId ?? null,
        zoneId: s.zoneId ?? null,
        sensorId: s.id,
        type: 'LOW_BATTERY',
        severity: metrics.batteryPct !== null && metrics.batteryPct <= 10 ? 'CRITICAL' : 'WARNING',
        title: `Low battery (${s.devEui})`,
        message: `Battery at ${Math.round(metrics.batteryPct as number)}%.`,
        meta: { devEui: s.devEui, batteryPct: metrics.batteryPct, batteryDrainPerDay7d: metrics.batteryDrainPerDay7d },
        actorUserId,
      })
      if (res.created) created++
      else updated++
    } else {
      if (await autoResolveAlert({ tenantId, type: 'LOW_BATTERY', sensorId: s.id, actorUserId, note: 'Battery recovered above threshold.' })) resolved++
    }

    // Poor signal (only if enough samples)
    const hasSignal = metrics.signalSamples24h >= t.signalMinSamples
    const poorSignal =
      hasSignal &&
      ((typeof metrics.avgRssi24h === 'number' && metrics.avgRssi24h <= t.poorRssiThreshold) ||
        (typeof metrics.avgSnr24h === 'number' && metrics.avgSnr24h <= t.poorSnrThreshold))
    if (poorSignal) {
      const res = await openOrUpdateAlert({
        thresholds: t,
        tenantId,
        siteId: s.siteId ?? null,
        zoneId: s.zoneId ?? null,
        sensorId: s.id,
        type: 'POOR_SIGNAL',
        severity: 'WARNING',
        title: `Poor signal (${s.devEui})`,
        message: `avg RSSI ${metrics.avgRssi24h?.toFixed(1) ?? '—'} / avg SNR ${metrics.avgSnr24h?.toFixed(1) ?? '—'} (last ${t.signalLookbackHours}h).`,
        meta: {
          devEui: s.devEui,
          avgRssi24h: metrics.avgRssi24h,
          avgSnr24h: metrics.avgSnr24h,
          samples: metrics.signalSamples24h,
          thresholds: { poorRssiThreshold: t.poorRssiThreshold, poorSnrThreshold: t.poorSnrThreshold },
        },
        actorUserId,
      })
      if (res.created) created++
      else updated++
    } else {
      if (await autoResolveAlert({ tenantId, type: 'POOR_SIGNAL', sensorId: s.id, actorUserId, note: 'Signal recovered above threshold.' })) resolved++
    }

    // Flapping
    const isFlapping = metrics.flapChanges >= t.flappingMaxChanges
    if (isFlapping) {
      const res = await openOrUpdateAlert({
        thresholds: t,
        tenantId,
        siteId: s.siteId ?? null,
        zoneId: s.zoneId ?? null,
        sensorId: s.id,
        type: 'FLAPPING',
        severity: 'WARNING',
        title: `Flapping sensor (${s.devEui})`,
        message: `${metrics.flapChanges} occupancy state changes in last ${t.flappingWindowMinutes} minutes.`,
        meta: { devEui: s.devEui, flapChanges: metrics.flapChanges, windowMinutes: t.flappingWindowMinutes, maxChanges: t.flappingMaxChanges },
        actorUserId,
      })
      if (res.created) created++
      else updated++
    } else {
      if (await autoResolveAlert({ tenantId, type: 'FLAPPING', sensorId: s.id, actorUserId, note: 'Flapping no longer detected.' })) resolved++
    }
  }

  // Tenant-level decode/ingest errors (dead letters)
  const dl = await sql/*sql*/`
    SELECT COUNT(*)::int AS count
    FROM ingest_dead_letters
    WHERE "tenantId" = ${tenantId}
      AND "createdAt" > now() - (${t.deadLettersWindowHours} || ' hours')::interval
  `
  const deadLetters = dl?.[0]?.count || 0
  if (deadLetters >= t.deadLettersWarning) {
    const severity: 'WARNING' | 'CRITICAL' = deadLetters >= t.deadLettersCritical ? 'CRITICAL' : 'WARNING'
    const res = await openOrUpdateAlert({
      thresholds: t,
      tenantId,
      sensorId: null,
      type: 'DECODE_ERRORS',
      severity,
      title: `Decode/ingestion errors spike`,
      message: `${deadLetters} dead-letter rows in last ${t.deadLettersWindowHours} hours.`,
      meta: { deadLetters, windowHours: t.deadLettersWindowHours },
      actorUserId,
    })
    if (res.created) created++
    else updated++
  } else {
    if (await autoResolveAlert({ tenantId, type: 'DECODE_ERRORS', sensorId: null, actorUserId, note: 'Dead-letter rate back to normal.' })) resolved++
  }

  return { created, updated, resolved, checkedSensors: sensors?.length || 0, thresholds: t }
}


