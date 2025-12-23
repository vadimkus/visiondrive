// Import 2GIS parking data into VisionDrive database
// Run after fetching: npm run import:2gis
// Uses same SQL setup as seed.ts

const fs = require('fs')
const path = require('path')
const { randomUUID } = require('crypto')

// Import sql client same way as seed.ts
require('dotenv/config')
const { sql } = require('../lib/sql')

async function import2GISParking() {
  console.log('🚀 Importing 2GIS parking data...\n')

  // Read the fetched data
  const dataPath = path.join(__dirname, '..', 'data', '2gis-dubai-parking.json')
  
  if (!fs.existsSync(dataPath)) {
    console.error('❌ Error: 2GIS data file not found!')
    console.error('   Please run: npm run fetch:2gis first')
    process.exit(1)
  }

  const parkingData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
  console.log(`📊 Found ${parkingData.length} parking zones to import\n`)

  // Get default tenant
  const tenantRows = await sql/*sql*/`
    SELECT id FROM tenants WHERE slug = 'visiondrive' LIMIT 1
  `
  
  if (!tenantRows || tenantRows.length === 0) {
    console.error('❌ Error: Default tenant not found!')
    console.error('   Please run: npm run db:seed first')
    process.exit(1)
  }

  const tenantId = tenantRows[0].id

  // Get default site
  const siteRows = await sql/*sql*/`
    SELECT id FROM sites WHERE "tenantId" = ${tenantId} LIMIT 1
  `

  if (!siteRows || siteRows.length === 0) {
    console.error('❌ Error: No site found!')
    console.error('   Please run: npm run db:seed first')
    process.exit(1)
  }

  const siteId = siteRows[0].id

  let imported = 0
  let skipped = 0

  for (const zone of parkingData) {
    try {
      // Check if zone already exists (by name)
      const existing = await sql/*sql*/`
        SELECT id FROM zones
        WHERE "tenantId" = ${tenantId}
          AND name = ${zone.name}
        LIMIT 1
      `

      if (existing && existing.length > 0) {
        console.log(`⏭️  Skipping "${zone.name}" (already exists)`)
        skipped++
        continue
      }

      // Insert new zone
      const zoneId = randomUUID()
      await sql/*sql*/`
        INSERT INTO zones (
          id,
          "tenantId",
          "siteId",
          name,
          kind,
          geojson,
          tariff,
          "createdAt",
          "updatedAt"
        ) VALUES (
          ${zoneId},
          ${tenantId},
          ${siteId},
          ${zone.name},
          ${zone.kind},
          ${sql.json(zone.geojson)},
          ${zone.tariff ? sql.json(zone.tariff) : null},
          now(),
          now()
        )
      `

      console.log(`✅ Imported: ${zone.name} (${zone.kind})`)
      imported++

    } catch (error) {
      console.error(`❌ Error importing "${zone.name}":`, error.message)
    }
  }

  console.log(`\n✅ Import complete!`)
  console.log(`   Imported: ${imported} zones`)
  console.log(`   Skipped: ${skipped} zones (already exist)`)
  console.log(`   Total: ${parkingData.length} zones`)
}

// Run the import
import2GISParking()
  .then(() => {
    console.log('\n🎉 2GIS parking data imported successfully!')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Import failed:', error)
    process.exit(1)
  })

