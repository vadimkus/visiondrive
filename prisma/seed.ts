import 'dotenv/config'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'
import { sql } from '../lib/sql'
import { randomUUID } from 'crypto'

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
  }
  await sql/*sql*/`
    INSERT INTO tenant_settings ("tenantId", thresholds, "updatedAt")
    VALUES (${ensuredTenantId}, ${sql.json(defaultThresholds) as any}, now())
    ON CONFLICT ("tenantId") DO UPDATE
      SET thresholds = EXCLUDED.thresholds,
          "updatedAt" = now()
  `

  // Seed demo site/zone/bays/sensors so portal has real data immediately
  // (idempotent: will reuse existing demo entities where possible)
  const demoSiteName = 'Demo Site (Seed)'
  const demoZoneName = 'Zone A (Seed)'
  const demoDevEuiPrefix = 'A1B2C3D4%'
  const demoSiteCenter = { lat: 25.0770, lng: 55.1400 }

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
      VALUES (${demoSiteId}, ${ensuredTenantId}, ${demoSiteName}, 'Dubai Marina, UAE (Demo)', 'Asia/Dubai', ${demoSiteCenter.lat}, ${demoSiteCenter.lng}, now(), now())
    `
  } else {
    // Keep the demo site location label up-to-date
    await sql/*sql*/`
      UPDATE sites
      SET address = 'Dubai Marina, UAE (Demo)',
          timezone = 'Asia/Dubai',
          "centerLat" = ${demoSiteCenter.lat},
          "centerLng" = ${demoSiteCenter.lng},
          "updatedAt" = now()
      WHERE id = ${demoSiteId}
    `
  }

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
          [demoSiteCenter.lng - 0.004, demoSiteCenter.lat - 0.002],
          [demoSiteCenter.lng + 0.004, demoSiteCenter.lat - 0.002],
          [demoSiteCenter.lng + 0.004, demoSiteCenter.lat + 0.002],
          [demoSiteCenter.lng - 0.004, demoSiteCenter.lat + 0.002],
          [demoSiteCenter.lng - 0.004, demoSiteCenter.lat - 0.002],
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

  // Create 40 demo bays (A01..A40) if missing
  const bayCount = 40
  // Place demo bays in a tight grid near the demo site center (Dubai Marina)
  const baseLat = demoSiteCenter.lat - 0.0008
  const baseLng = demoSiteCenter.lng - 0.0012
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
    await sql/*sql*/`
      UPDATE bays
      SET lat = COALESCE(lat, ${lat}),
          lng = COALESCE(lng, ${lng}),
          geojson = COALESCE(geojson, ${sql.json(bayPoly) as any}),
          "updatedAt" = now()
      WHERE id = ${b.id}
    `
  }

  // Reset demo sensors/events (so the distribution stays deterministic across multiple seed runs)
  // NOTE: we target only sensors with the demo DevEUI prefix.
  await sql/*sql*/`
    DELETE FROM sensor_events
    WHERE "tenantId" = ${ensuredTenantId}
      AND "sensorId" IN (
        SELECT id FROM sensors WHERE "tenantId" = ${ensuredTenantId} AND "devEui" LIKE ${demoDevEuiPrefix}
      )
  `
  await sql/*sql*/`
    DELETE FROM sensors
    WHERE "tenantId" = ${ensuredTenantId} AND "devEui" LIKE ${demoDevEuiPrefix}
  `

  // Bind sensors to all 40 bays and insert events so portal shows realistic distribution:
  // 30 FREE, 7 OCCUPIED, 3 OFFLINE (no recent events)
  const bayRows = await sql/*sql*/`
    SELECT id, code
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
    const isFree = i < 30
    const isOccupied = i >= 30 && i < 37
    const isOffline = i >= 37
    const occupied = isOccupied ? true : false
    const lastSeen = isOffline
      ? new Date(Date.now() - 2 * 60 * 60_000) // 2 hours ago => OFFLINE by default thresholds
      : new Date(Date.now() - ((i % 5) + 1) * 60_000) // fresh within last 1-5 minutes (not stale)

    const sensorInsert = await sql/*sql*/`
      INSERT INTO sensors (id, "tenantId", "siteId", "zoneId", "bayId", "devEui", type, status, "installDate", "lastSeen", "batteryPct", "createdAt", "updatedAt")
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

  console.log('✅ Seeded demo site/zone/bays/sensors for portal')

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

