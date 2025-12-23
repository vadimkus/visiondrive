import 'dotenv/config'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'
import { sql } from '../lib/sql'
import { randomUUID } from 'crypto'
import { runAlertScan } from '../lib/alerts'

// Seeding uses the direct `sql` client to avoid Prisma runtime/adapter issues in serverless/dev.

async function main() {
  // Ensure a default tenant exists
  const tenantId = randomUUID()
  const tenantSlug = 'visiondrive'
  const tenantName = 'VisionDrive (Default)'
  const tenantRows = await sql/*sql*/`
    INSERT INTO tenants (id, name, slug, status, "createdAt", "updatedAt")
    VALUES (${tenantId}, ${tenantName}, ${tenantSlug}, 'ACTIVE', now(), now())
    ON CONFLICT (slug) DO UPDATE
      SET name = EXCLUDED.name,
          status = EXCLUDED.status,
          "updatedAt" = now()
    RETURNING id
  `
  const ensuredTenantId = tenantRows?.[0]?.id || tenantId

  // Ensure tenant settings exist (threshold defaults for portal)
  const defaultThresholds = {
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
  await sql/*sql*/`
    INSERT INTO tenant_settings ("tenantId", thresholds, "updatedAt")
    VALUES (${ensuredTenantId}, ${sql.json(defaultThresholds) as any}, now())
    ON CONFLICT ("tenantId") DO UPDATE
      SET thresholds = (EXCLUDED.thresholds::jsonb || COALESCE(tenant_settings.thresholds::jsonb, '{}'::jsonb))::json,
          "updatedAt" = now()
  `

  // Seed demo site/zone/bays/sensors so portal has real data immediately
  // (idempotent: will reuse existing demo entities where possible)
  const demoSiteName = 'Demo Site (Seed)'
  const demoZoneName = 'Zone A (Seed)'
  const demoDevEuiPrefix = 'A1B2C3D4%'
  // Realistic demo location: Dubai Media City / Knowledge Park area
  // (Used for map overlay + bay polygons until real surveyed polygons are uploaded)
  const demoSiteCenter = { lat: 25.1016, lng: 55.1622 }

  const siteRows = await sql/*sql*/`
    SELECT id
    FROM sites
    WHERE "tenantId" = ${ensuredTenantId} AND name = ${demoSiteName}
    LIMIT 1
  `
  const demoSiteId = siteRows?.[0]?.id || randomUUID()
  if (!siteRows?.[0]?.id) {
    await sql/*sql*/`
      INSERT INTO sites (id, "tenantId", name, address, timezone, "centerLat", "centerLng", "createdAt", "updatedAt")
      VALUES (${demoSiteId}, ${ensuredTenantId}, ${demoSiteName}, 'Dubai Media City / Knowledge Park (Demo)', 'Asia/Dubai', ${demoSiteCenter.lat}, ${demoSiteCenter.lng}, now(), now())
    `
  } else {
    // Keep the demo site location label up-to-date
    await sql/*sql*/`
      UPDATE sites
      SET address = 'Dubai Media City / Knowledge Park (Demo)',
          timezone = 'Asia/Dubai',
          "centerLat" = ${demoSiteCenter.lat},
          "centerLng" = ${demoSiteCenter.lng},
          "updatedAt" = now()
      WHERE id = ${demoSiteId}
    `
  }

  // Seed a dummy LoRaWAN gateway for the demo site so /portal/map can render it.
  // Requested demo model: RAK7289CV2
  const demoGatewaySerial = 'RAK7289CV2-DEMO-01'
  const demoGatewayId = randomUUID()
  await sql/*sql*/`
    INSERT INTO gateways (id, "tenantId", "siteId", name, serial, model, firmware, status, backhaul, "lastHeartbeat", lat, lng, meta, "createdAt", "updatedAt")
    VALUES (
      ${demoGatewayId},
      ${ensuredTenantId},
      ${demoSiteId},
      'RAK7289CV2 (Demo Gateway)',
      ${demoGatewaySerial},
      'RAK7289CV2',
      'v2.x-demo',
      'ACTIVE',
      'ETHERNET',
      now() - interval '2 minutes',
      ${demoSiteCenter.lat + 0.00035},
      ${demoSiteCenter.lng - 0.00025},
      ${sql.json({ demo: true, vendor: 'RAK', notes: 'Seeded dummy gateway for portal demo' }) as any},
      now(),
      now()
    )
    ON CONFLICT (serial) DO UPDATE
      SET "tenantId" = EXCLUDED."tenantId",
          "siteId" = EXCLUDED."siteId",
          name = EXCLUDED.name,
          model = EXCLUDED.model,
          firmware = EXCLUDED.firmware,
          status = EXCLUDED.status,
          backhaul = EXCLUDED.backhaul,
          "lastHeartbeat" = EXCLUDED."lastHeartbeat",
          lat = EXCLUDED.lat,
          lng = EXCLUDED.lng,
          meta = EXCLUDED.meta,
          "updatedAt" = now()
  `

  const zoneRows = await sql/*sql*/`
    SELECT id
    FROM zones
    WHERE "tenantId" = ${ensuredTenantId} AND "siteId" = ${demoSiteId} AND name = ${demoZoneName}
    LIMIT 1
  `
  const demoZoneId = zoneRows?.[0]?.id || randomUUID()
  if (!zoneRows?.[0]?.id) {
    await sql/*sql*/`
      INSERT INTO zones (id, "tenantId", "siteId", name, kind, "createdAt", "updatedAt")
      VALUES (${demoZoneId}, ${ensuredTenantId}, ${demoSiteId}, ${demoZoneName}, 'FREE', now(), now())
    `
  }

  // Add a demo zone polygon (simple rectangle around the demo bays area)
  const zonePoly = {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [demoSiteCenter.lng - 0.0035, demoSiteCenter.lat - 0.0018],
          [demoSiteCenter.lng + 0.0035, demoSiteCenter.lat - 0.0018],
          [demoSiteCenter.lng + 0.0035, demoSiteCenter.lat + 0.0018],
          [demoSiteCenter.lng - 0.0035, demoSiteCenter.lat + 0.0018],
          [demoSiteCenter.lng - 0.0035, demoSiteCenter.lat - 0.0018],
        ],
      ],
    },
    properties: { name: demoZoneName },
  }
  await sql/*sql*/`
    UPDATE zones
    SET geojson = ${sql.json(zonePoly) as any},
        "updatedAt" = now()
    WHERE id = ${demoZoneId}
  `

  // Add multiple Dubai parking zones with realistic locations
  const dubaiZones = [
    {
      name: 'Dubai Mall Parking Zone',
      kind: 'PAID',
      center: { lat: 25.1980, lng: 55.2794 },
      tariff: { rateAedPerHour: 20, hours: '10:00-22:00', maxDailyAed: 100 }
    },
    {
      name: 'Dubai Marina Walk Zone',
      kind: 'PAID',
      center: { lat: 25.0805, lng: 55.1383 },
      tariff: { rateAedPerHour: 15, hours: '08:00-23:00', maxDailyAed: 80 }
    },
    {
      name: 'Jumeirah Beach Residence',
      kind: 'PAID',
      center: { lat: 25.0747, lng: 55.1346 },
      tariff: { rateAedPerHour: 12, hours: '09:00-21:00', maxDailyAed: 60 }
    },
    {
      name: 'Business Bay Metro Zone',
      kind: 'PAID',
      center: { lat: 25.1875, lng: 55.2655 },
      tariff: { rateAedPerHour: 8, hours: '07:00-20:00', maxDailyAed: 40 }
    },
    {
      name: 'Downtown Dubai Zone',
      kind: 'PAID',
      center: { lat: 25.1972, lng: 55.2744 },
      tariff: { rateAedPerHour: 18, hours: '08:00-midnight', maxDailyAed: 90 }
    },
    {
      name: 'DIFC Financial District',
      kind: 'PAID',
      center: { lat: 25.2138, lng: 55.2817 },
      tariff: { rateAedPerHour: 25, hours: '07:00-22:00', maxDailyAed: 120 }
    },
    {
      name: 'City Walk Shopping Zone',
      kind: 'PAID',
      center: { lat: 25.2142, lng: 55.2604 },
      tariff: { rateAedPerHour: 10, hours: '10:00-23:00', maxDailyAed: 50 }
    },
    {
      name: 'Dubai Media City',
      kind: 'PAID',
      center: { lat: 25.0989, lng: 55.1643 },
      tariff: { rateAedPerHour: 7, hours: '08:00-19:00', maxDailyAed: 35 }
    },
    {
      name: 'Jumeirah Lakes Towers',
      kind: 'PAID',
      center: { lat: 25.0693, lng: 55.1439 },
      tariff: { rateAedPerHour: 6, hours: '08:00-20:00', maxDailyAed: 30 }
    },
    {
      name: 'Al Barsha Residential',
      kind: 'PRIVATE',
      center: { lat: 25.1118, lng: 55.1985 },
      tariff: { rateAedPerHour: 3, hours: '00:00-24:00', maxDailyAed: 15 }
    },
    {
      name: 'Dubai Internet City',
      kind: 'PAID',
      center: { lat: 25.0943, lng: 55.1620 },
      tariff: { rateAedPerHour: 8, hours: '08:00-19:00', maxDailyAed: 40 }
    },
    {
      name: 'The Palm Jumeirah',
      kind: 'PAID',
      center: { lat: 25.1124, lng: 55.1390 },
      tariff: { rateAedPerHour: 20, hours: '10:00-midnight', maxDailyAed: 100 }
    },
    {
      name: 'Dubai Design District',
      kind: 'PAID',
      center: { lat: 25.1949, lng: 55.2900 },
      tariff: { rateAedPerHour: 10, hours: '09:00-21:00', maxDailyAed: 50 }
    },
    {
      name: 'Dubai Festival City',
      kind: 'FREE',
      center: { lat: 25.2219, lng: 55.3548 },
      tariff: null
    },
    {
      name: 'Dubai Sports City',
      kind: 'FREE',
      center: { lat: 25.0395, lng: 55.2109 },
      tariff: null
    }
  ]

  for (const zone of dubaiZones) {
    const zoneId = randomUUID()
    const existingZone = await sql/*sql*/`
      SELECT id FROM zones
      WHERE "tenantId" = ${ensuredTenantId} AND name = ${zone.name}
      LIMIT 1
    `
    
    if (existingZone?.[0]?.id) continue

    // Create zone polygon (rectangular area around the center)
    const size = 0.005 // ~500m radius
    const zoneGeojson = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [zone.center.lng - size, zone.center.lat - size],
            [zone.center.lng + size, zone.center.lat - size],
            [zone.center.lng + size, zone.center.lat + size],
            [zone.center.lng - size, zone.center.lat + size],
            [zone.center.lng - size, zone.center.lat - size],
          ],
        ],
      },
      properties: { name: zone.name },
    }

    await sql/*sql*/`
      INSERT INTO zones (id, "tenantId", "siteId", name, kind, geojson, tariff, "createdAt", "updatedAt")
      VALUES (
        ${zoneId},
        ${ensuredTenantId},
        ${demoSiteId},
        ${zone.name},
        ${zone.kind},
        ${sql.json(zoneGeojson) as any},
        ${zone.tariff ? (sql.json(zone.tariff) as any) : null},
        now(),
        now()
      )
    `
  }

  // Create 40 demo bays (A01..A40) if missing
  const bayCount = 40
  // Place demo bays in a tight grid near the demo site center (Dubai Marina)
  const baseLat = demoSiteCenter.lat - 0.0007
  const baseLng = demoSiteCenter.lng - 0.0011
  for (let i = 1; i <= bayCount; i++) {
    const code = `A${String(i).padStart(2, '0')}`
    const existingBay = await sql/*sql*/`
      SELECT id
      FROM bays
      WHERE "tenantId" = ${ensuredTenantId} AND "siteId" = ${demoSiteId} AND code = ${code}
      LIMIT 1
    `
    if (existingBay?.[0]?.id) continue

    const bayId = randomUUID()
    const col = (i - 1) % 10
    const row = Math.floor((i - 1) / 10)
    const lat = baseLat + col * 0.00012
    const lng = baseLng + row * 0.00012
    const d = 0.00003
    const bayPoly = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [lng - d, lat - d],
            [lng + d, lat - d],
            [lng + d, lat + d],
            [lng - d, lat + d],
            [lng - d, lat - d],
          ],
        ],
      },
      properties: { code },
    }
    await sql/*sql*/`
      INSERT INTO bays (id, "tenantId", "siteId", "zoneId", code, lat, lng, geojson, "createdAt", "updatedAt")
      VALUES (${bayId}, ${ensuredTenantId}, ${demoSiteId}, ${demoZoneId}, ${code}, ${lat}, ${lng}, ${sql.json(bayPoly) as any}, now(), now())
    `
  }

  // Ensure existing demo bays also have lat/lng/geojson (for older DBs)
  const existingBays = await sql/*sql*/`
    SELECT id, code
    FROM bays
    WHERE "tenantId" = ${ensuredTenantId} AND "siteId" = ${demoSiteId} AND "zoneId" = ${demoZoneId}
    ORDER BY code ASC
    LIMIT 40
  `
  for (let idx = 0; idx < (existingBays?.length || 0); idx++) {
    const b = existingBays[idx]
    const col = idx % 10
    const row = Math.floor(idx / 10)
    const lat = baseLat + col * 0.00012
    const lng = baseLng + row * 0.00012
    const d = 0.00003
    const bayPoly = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [lng - d, lat - d],
            [lng + d, lat - d],
            [lng + d, lat + d],
            [lng - d, lat + d],
            [lng - d, lat - d],
          ],
        ],
      },
      properties: { code: b.code },
    }
    // IMPORTANT: force-update demo geometry every seed run so overlays never drift
    await sql/*sql*/`
      UPDATE bays
      SET lat = ${lat},
          lng = ${lng},
          geojson = ${sql.json(bayPoly) as any},
          "updatedAt" = now()
      WHERE id = ${b.id}
    `
  }

  // Reset demo events (keep sensors so calibration edits to sensors.lat/lng are preserved).
  // NOTE: we target only sensors with the demo DevEUI prefix.
  await sql/*sql*/`
    DELETE FROM sensor_events
    WHERE "tenantId" = ${ensuredTenantId}
      AND "sensorId" IN (
        SELECT id FROM sensors WHERE "tenantId" = ${ensuredTenantId} AND "devEui" LIKE ${demoDevEuiPrefix}
      )
  `

  // Bind sensors to all 40 bays and insert events so portal shows realistic distribution:
  // 34 OCCUPIED, 5 FREE, 1 OFFLINE
  const bayRows = await sql/*sql*/`
    SELECT id, code, lat, lng
    FROM bays
    WHERE "tenantId" = ${ensuredTenantId} AND "siteId" = ${demoSiteId} AND "zoneId" = ${demoZoneId}
    ORDER BY code ASC
    LIMIT 40
  `

  for (let i = 0; i < (bayRows?.length || 0); i++) {
    const bay = bayRows[i]
    const devEui = `A1B2C3D40000${String(i + 1).padStart(4, '0')}` // hex-ish, stable
    const sensorId = randomUUID()
    const batteryPct = 60 + ((i * 7) % 40) // 60..99
    const isOccupied = i < 34
    const isFree = i >= 34 && i < 39
    const isOffline = i >= 39
    const occupied = isOccupied ? true : false
    const lastSeen = isOffline
      ? new Date(Date.now() - 2 * 60 * 60_000) // 2 hours ago => OFFLINE by default thresholds
      : new Date(Date.now() - ((i % 5) + 1) * 60_000) // fresh within last 1-5 minutes (not stale)

    // Initialize sensor lat/lng from the bay position (ONLY if lat/lng are currently NULL).
    // This makes the calibration map reliably show all 40 sensors, while preserving any manual calibration edits.
    const seedLat = typeof (bay as any).lat === 'number' ? (bay as any).lat : null
    const seedLng = typeof (bay as any).lng === 'number' ? (bay as any).lng : null

    const sensorInsert = await sql/*sql*/`
      INSERT INTO sensors (id, "tenantId", "siteId", "zoneId", "bayId", "devEui", type, status, "installDate", "lastSeen", "batteryPct", lat, lng, "createdAt", "updatedAt")
      VALUES (
        ${sensorId},
        ${ensuredTenantId},
        ${demoSiteId},
        ${demoZoneId},
        ${bay.id},
        ${devEui},
        'PARKING',
        'ACTIVE',
        now() - interval '30 days',
        ${lastSeen},
        ${batteryPct},
        ${seedLat},
        ${seedLng},
        now(),
        now()
      )
      ON CONFLICT ("devEui") DO UPDATE
        SET "tenantId" = EXCLUDED."tenantId",
            "siteId" = EXCLUDED."siteId",
            "zoneId" = EXCLUDED."zoneId",
            "bayId" = EXCLUDED."bayId",
            type = EXCLUDED.type,
            status = EXCLUDED.status,
            "lastSeen" = EXCLUDED."lastSeen",
            "batteryPct" = EXCLUDED."batteryPct",
            -- Preserve manual calibration when it's close to the bay, but fix obviously broken/stacked coords.
            -- If a sensor is >~100m away from its bay seed position, snap it back to the bay coordinate.
            lat = CASE
              WHEN sensors.lat IS NULL THEN EXCLUDED.lat
              WHEN EXCLUDED.lat IS NULL THEN sensors.lat
              WHEN abs(sensors.lat - EXCLUDED.lat) > 0.001 THEN EXCLUDED.lat
              ELSE sensors.lat
            END,
            lng = CASE
              WHEN sensors.lng IS NULL THEN EXCLUDED.lng
              WHEN EXCLUDED.lng IS NULL THEN sensors.lng
              WHEN abs(sensors.lng - EXCLUDED.lng) > 0.001 THEN EXCLUDED.lng
              ELSE sensors.lng
            END,
            "updatedAt" = now()
      RETURNING id
    `
    const ensuredSensorId = sensorInsert?.[0]?.id

    // Create an event for FREE/OCCUPIED; for OFFLINE sensors we keep an old event (still marks OFFLINE)
    const eventId = randomUUID()
    await sql/*sql*/`
        INSERT INTO sensor_events (
          id,
          time,
          "createdAt",
          "tenantId",
          "siteId",
          "sensorId",
          kind,
          decoded,
          "batteryPct"
        )
        VALUES (
          ${eventId},
          ${lastSeen},
          now(),
          ${ensuredTenantId},
          ${demoSiteId},
          ${ensuredSensorId},
          'UPLINK',
          ${sql.json({ occupied }) as any},
          ${batteryPct}
        )
        ON CONFLICT DO NOTHING
      `
  }

  // If demo sensor coordinates are "stacked" (common after previous calibration bugs),
  // force-reset demo sensors to their bay positions so the calibration map shows 40 distinct dots.
  // We ONLY do this when we detect an obviously broken state (very low distinct coords),
  // to preserve manual calibration edits during normal development.
  try {
    const stats = await sql/*sql*/`
      SELECT
        count(*)::int AS total,
        count(*) FILTER (WHERE s.lat IS NULL OR s.lng IS NULL)::int AS null_coords,
        count(DISTINCT concat(COALESCE(s.lat, 0)::text, ',', COALESCE(s.lng, 0)::text))::int AS distinct_coords
      FROM sensors s
      WHERE s."tenantId" = ${ensuredTenantId}
        AND s."bayId" IS NOT NULL
        AND s."devEui" LIKE ${demoDevEuiPrefix}
    `
    const total = stats?.[0]?.total ?? 0
    const distinct = stats?.[0]?.distinct_coords ?? 0
    const nullCoords = stats?.[0]?.null_coords ?? 0

    // Heuristic: if we have 40 installed demo sensors but <= 5 distinct coordinate pairs,
    // something is wrong (they're all stacked). Reset them from bay positions.
    if (total >= 35 && distinct <= 5) {
      await sql/*sql*/`
        UPDATE sensors s
        SET lat = b.lat,
            lng = b.lng,
            "updatedAt" = now()
        FROM bays b
        WHERE b.id = s."bayId"
          AND s."tenantId" = ${ensuredTenantId}
          AND s."bayId" IS NOT NULL
          AND s."devEui" LIKE ${demoDevEuiPrefix}
      `
      console.log(
        `🧭 Reset demo sensor coordinates from bays (detected stacked coords: total=${total}, distinct=${distinct}, null=${nullCoords})`
      )
    }
  } catch (e) {
    console.warn('⚠️  Demo sensor coordinate sanity check skipped/failed:', e)
  }

  console.log('✅ Seeded demo site/zone/bays/sensors for portal')

  // Seed demo WEATHER stations (multi-location) + events for Weather Dashboard
  // (These are independent from bays; they are pinned to locations.)
  const demoWeatherStations = [
    { name: 'Weather Station — Dubai Marina', lat: demoSiteCenter.lat + 0.0022, lng: demoSiteCenter.lng + 0.0031, devEui: 'WTHR0001DEMO0001' },
    { name: 'Weather Station — Downtown', lat: 25.1972, lng: 55.2744, devEui: 'WTHR0002DEMO0002' },
    { name: 'Weather Station — JBR', lat: 25.0819, lng: 55.1376, devEui: 'WTHR0003DEMO0003' },
  ]

  for (const w of demoWeatherStations) {
    const existing = await sql/*sql*/`
      SELECT id FROM sensors
      WHERE "tenantId" = ${ensuredTenantId} AND "devEui" = ${w.devEui}
      LIMIT 1
    `
    const sensorId = existing?.[0]?.id || randomUUID()
    await sql/*sql*/`
      INSERT INTO sensors (id, "tenantId", "siteId", "devEui", type, model, status, "installDate", "lastSeen", "batteryPct", lat, lng, meta, "createdAt", "updatedAt")
      VALUES (
        ${sensorId},
        ${ensuredTenantId},
        ${demoSiteId},
        ${w.devEui},
        'WEATHER',
        'VD-ENV-01',
        'ACTIVE',
        now() - interval '60 days',
        now() - interval '2 minutes',
        82,
        ${w.lat},
        ${w.lng},
        ${sql.json({ name: w.name, demo: true }) as any},
        now(),
        now()
      )
      ON CONFLICT ("devEui") DO UPDATE
        SET "siteId" = EXCLUDED."siteId",
            type = EXCLUDED.type,
            model = EXCLUDED.model,
            status = EXCLUDED.status,
            lat = EXCLUDED.lat,
            lng = EXCLUDED.lng,
            meta = EXCLUDED.meta,
            "lastSeen" = EXCLUDED."lastSeen",
            "batteryPct" = EXCLUDED."batteryPct",
            "updatedAt" = now()
    `

    // Seed a small 24h timeline (~48 points) for charts.
    await sql/*sql*/`
      DELETE FROM sensor_events
      WHERE "tenantId" = ${ensuredTenantId}
        AND "sensorId" = ${sensorId}
        AND time >= now() - interval '24 hours'
    `
    for (let i = 48; i >= 0; i--) {
      const t = new Date(Date.now() - i * 30 * 60_000)
      const baseTemp = 24 + (Math.sin(i / 6) * 3)
      const humidity = 45 + (Math.cos(i / 8) * 12)
      const wind = 3 + (Math.sin(i / 5) * 1.5)
      const gust = wind + 1.5
      const pm25 = 18 + (Math.max(0, Math.sin(i / 10)) * 25)
      const aqi = Math.round(40 + (pm25 * 1.8))
      const rain = i % 41 === 0
      const decoded = {
        temperatureC: Number(baseTemp.toFixed(1)),
        humidityPct: Number(humidity.toFixed(1)),
        windMps: Number(wind.toFixed(1)),
        gustMps: Number(gust.toFixed(1)),
        pm25: Number(pm25.toFixed(1)),
        pm10: Number((pm25 * 1.6).toFixed(1)),
        aqi,
        rain,
      }
      await sql/*sql*/`
        INSERT INTO sensor_events (id, time, "createdAt", "tenantId", "siteId", "sensorId", kind, decoded, "batteryPct", meta)
        VALUES (
          ${randomUUID()},
          ${t},
          now(),
          ${ensuredTenantId},
          ${demoSiteId},
          ${sensorId},
          'UPLINK',
          ${sql.json(decoded) as any},
          82,
          ${sql.json({ demo: true }) as any}
        )
      `
    }
  }

  console.log('✅ Seeded demo WEATHER stations + events')

  // Phase 11.4: generate initial Hardware Health + Alerts
  try {
    const result = await runAlertScan({ tenantId: ensuredTenantId, actorUserId: null })
    console.log(
      `✅ Alerts scan complete: ${result.created} created, ${result.updated} updated, ${result.resolved} resolved (checked ${result.checkedSensors} sensors)`
    )
  } catch (e) {
    console.warn('⚠️  Alerts scan skipped/failed:', e)
  }

  // Create admin user
  const adminPassword = await bcrypt.hash('admin5', 10)
  const adminId = randomUUID()
  
  await sql/*sql*/`
    INSERT INTO users (id, email, "passwordHash", name, role, status, "createdAt", "updatedAt")
    VALUES (${adminId}, 'admin', ${adminPassword}, 'Administrator', 'MASTER_ADMIN', 'ACTIVE', now(), now())
    ON CONFLICT (email) DO UPDATE
      SET "passwordHash" = EXCLUDED."passwordHash",
          name = EXCLUDED.name,
          role = EXCLUDED.role,
          status = EXCLUDED.status,
          "updatedAt" = now()
  `

  // Attach admin to default tenant (membership + defaultTenantId)
  await sql/*sql*/`
    UPDATE users
    SET "defaultTenantId" = ${ensuredTenantId}, "updatedAt" = now()
    WHERE email = 'admin' AND ("defaultTenantId" IS NULL OR "defaultTenantId" = '')
  `

  const membershipId = randomUUID()
  await sql/*sql*/`
    INSERT INTO tenant_memberships (id, "tenantId", "userId", role, status, "createdAt", "updatedAt")
    SELECT ${membershipId}, ${ensuredTenantId}, u.id, 'MASTER_ADMIN', 'ACTIVE', now(), now()
    FROM users u
    WHERE u.email = 'admin'
    ON CONFLICT ("tenantId", "userId") DO UPDATE
      SET role = EXCLUDED.role,
          status = EXCLUDED.status,
          "updatedAt" = now()
  `

  console.log('✅ Ensured admin user exists: admin')
  console.log('✅ Ensured default tenant exists:', tenantSlug)
  console.log('✅ Ensured tenant settings exist')

  // Convert sensor_events into a Timescale hypertable (if Timescale functions are available).
  // This is safe to run multiple times.
  try {
    await sql/*sql*/`SELECT create_hypertable('sensor_events', 'time', if_not_exists => TRUE)`
    // Helpful indexes for time-series queries (if not already present)
    await sql/*sql*/`CREATE INDEX IF NOT EXISTS sensor_events_tenant_time_idx ON sensor_events ("tenantId", time)`
    await sql/*sql*/`CREATE INDEX IF NOT EXISTS sensor_events_sensor_time_idx ON sensor_events ("sensorId", time)`
    await sql/*sql*/`CREATE INDEX IF NOT EXISTS sensor_events_gateway_time_idx ON sensor_events ("gatewayId", time)`
    console.log('✅ Ensured sensor_events hypertable + indexes')
  } catch (e) {
    console.warn('⚠️  Skipped hypertable setup (Timescale function unavailable or permissions):', e)
  }

  // ---------------------------------------------------------------------------
  // Finance demo seed (Master Admin): expenses so /portal/admin/finance shows data immediately
  // ---------------------------------------------------------------------------
  try {
    // Remove previous demo expenses for the demo tenant to keep seed deterministic
    await sql/*sql*/`
      DELETE FROM expenses
      WHERE "tenantId" = ${ensuredTenantId}
        AND (description ILIKE 'DEMO:%' OR vendor ILIKE 'DEMO:%')
    `

    const now = new Date()
    const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 3600 * 1000)
    const demoExpenses = [
      { category: 'CLOUD', vendor: 'DEMO: Vercel', description: 'DEMO: Hosting (portal)', amountCents: 12900, occurredAt: daysAgo(2) },
      { category: 'CLOUD', vendor: 'DEMO: TigerData (Timescale)', description: 'DEMO: DB + pooling', amountCents: 15900, occurredAt: daysAgo(3) },
      { category: 'HARDWARE', vendor: 'DEMO: Sensor supplier', description: 'DEMO: Parking sensors (batch)', amountCents: 450000, occurredAt: daysAgo(10) },
      { category: 'OPS', vendor: 'DEMO: Field ops', description: 'DEMO: Installation & calibration labor', amountCents: 95000, occurredAt: daysAgo(8) },
      { category: 'SOFTWARE', vendor: 'DEMO: Mapbox', description: 'DEMO: Tiles & usage (estimate)', amountCents: 2500, occurredAt: daysAgo(5) },
    ]

    for (const e of demoExpenses) {
      await sql/*sql*/`
        INSERT INTO expenses (
          id,
          "tenantId",
          category,
          vendor,
          description,
          "amountCents",
          currency,
          "occurredAt",
          "createdByUserId",
          "createdAt",
          "updatedAt"
        )
        VALUES (
          ${randomUUID()},
          ${ensuredTenantId},
          ${e.category}::"ExpenseCategory",
          ${e.vendor},
          ${e.description},
          ${e.amountCents},
          'AED',
          ${e.occurredAt},
          (SELECT id FROM users WHERE email = 'admin' LIMIT 1),
          now(),
          now()
        )
      `
    }
    console.log('✅ Seeded demo expenses (finance)')
  } catch (e) {
    console.warn('⚠️ Finance demo seed skipped:', (e as any)?.message || e)
  }

  // Upload logo to database if it exists (prefer jpg, fallback to png)
  const logoCandidates = [
    { path: path.join(process.cwd(), 'public', 'images', 'logo', 'logo.jpg'), mimeType: 'image/jpeg' },
    { path: path.join(process.cwd(), 'public', 'images', 'logo', 'logo.png'), mimeType: 'image/png' },
  ]

  const logoFile = logoCandidates.find(({ path }) => fs.existsSync(path))

  if (logoFile) {
    try {
      const logoBuffer = fs.readFileSync(logoFile.path)
      const base64Data = logoBuffer.toString('base64')
      const dataUrl = `data:${logoFile.mimeType};base64,${base64Data}`
      const logoId = randomUUID()

      const res = await sql/*sql*/`
        INSERT INTO images (id, type, name, "mimeType", data, alt, "createdAt", "updatedAt")
        VALUES (${logoId}, 'LOGO', 'logo', ${logoFile.mimeType}, ${dataUrl}, 'Vision Drive Logo', now(), now())
        ON CONFLICT (type, name) DO UPDATE
          SET "mimeType" = EXCLUDED."mimeType",
              data = EXCLUDED.data,
              alt = EXCLUDED.alt,
              "updatedAt" = now()
        RETURNING id
      `
      console.log('✅ Uploaded logo to database:', res?.[0]?.id || '(updated)')
    } catch (error) {
      console.error('Failed to upload logo:', error)
    }
  } else {
    console.log('⚠️  Logo file not found at any of:', logoCandidates.map(({ path }) => path).join(', '))
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await sql.end({ timeout: 5 }).catch(() => {})
  })

