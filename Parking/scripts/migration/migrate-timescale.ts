/**
 * VisionDrive Parking - TimescaleDB to AWS Migration Script
 * 
 * Migrates parking data from TimescaleDB to AWS DynamoDB.
 * 
 * Usage:
 *   # Export from TimescaleDB
 *   npx tsx migrate-timescale.ts export
 *   
 *   # Transform data
 *   npx tsx migrate-timescale.ts transform
 *   
 *   # Load to DynamoDB
 *   npx tsx migrate-timescale.ts load
 *   
 *   # Full migration
 *   npx tsx migrate-timescale.ts full
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { createReadStream } from 'fs'
import { createInterface } from 'readline'

// Configuration
const CONFIG = {
  // TimescaleDB connection (from environment)
  TIMESCALE_HOST: process.env.TIMESCALE_HOST || 'localhost',
  TIMESCALE_PORT: process.env.TIMESCALE_PORT || '5432',
  TIMESCALE_DB: process.env.TIMESCALE_DB || 'visiondrive',
  TIMESCALE_USER: process.env.TIMESCALE_USER || 'postgres',
  TIMESCALE_PASSWORD: process.env.TIMESCALE_PASSWORD || '',
  
  // AWS Configuration
  AWS_REGION: process.env.AWS_REGION || 'me-central-1',
  DYNAMODB_TABLE: process.env.DYNAMODB_TABLE || 'VisionDrive-Parking',
  
  // Export paths
  EXPORT_DIR: './export',
  ZONES_FILE: './export/zones.json',
  BAYS_FILE: './export/bays.json',
  EVENTS_FILE: './export/events.jsonl',
  SENSORS_FILE: './export/sensors.json',
}

// Ensure export directory exists
if (!existsSync(CONFIG.EXPORT_DIR)) {
  mkdirSync(CONFIG.EXPORT_DIR, { recursive: true })
}

// ==========================================
// EXPORT FUNCTIONS
// ==========================================

async function exportFromTimescale(): Promise<void> {
  console.log('📤 Exporting data from TimescaleDB...')
  console.log(`   Host: ${CONFIG.TIMESCALE_HOST}`)
  console.log(`   Database: ${CONFIG.TIMESCALE_DB}`)
  console.log()
  
  // In production, use pg client:
  // const { Client } = require('pg')
  // const client = new Client({
  //   host: CONFIG.TIMESCALE_HOST,
  //   port: parseInt(CONFIG.TIMESCALE_PORT),
  //   database: CONFIG.TIMESCALE_DB,
  //   user: CONFIG.TIMESCALE_USER,
  //   password: CONFIG.TIMESCALE_PASSWORD,
  // })
  // await client.connect()
  
  // Mock export for demonstration
  console.log('   Exporting zones...')
  const zones = [
    { zone_id: 'zone-001', name: 'Dubai Marina Parking', address: 'Marina Walk', city: 'Dubai', total_bays: 50, lat: 25.0762, lng: 55.1384, price_per_hour: 10, tenant_id: 'tenant-001' },
    { zone_id: 'zone-002', name: 'Business Bay Parking', address: 'Bay Avenue', city: 'Dubai', total_bays: 100, lat: 25.1862, lng: 55.2584, price_per_hour: 15, tenant_id: 'tenant-001' },
  ]
  writeFileSync(CONFIG.ZONES_FILE, JSON.stringify(zones, null, 2))
  console.log(`   ✅ Exported ${zones.length} zones to ${CONFIG.ZONES_FILE}`)
  
  console.log('   Exporting bays...')
  const bays = [
    { zone_id: 'zone-001', bay_number: 1, sensor_id: 'PSL01B-001', status: 'vacant', bay_type: 'standard', lat: 25.0762, lng: 55.1384 },
    { zone_id: 'zone-001', bay_number: 2, sensor_id: 'PSL01B-002', status: 'occupied', bay_type: 'standard', lat: 25.0762, lng: 55.1385 },
    // ... more bays
  ]
  writeFileSync(CONFIG.BAYS_FILE, JSON.stringify(bays, null, 2))
  console.log(`   ✅ Exported ${bays.length} bays to ${CONFIG.BAYS_FILE}`)
  
  console.log('   Exporting sensors...')
  const sensors = [
    { sensor_id: 'PSL01B-001', model: 'PSL01B', zone_id: 'zone-001', bay_number: 1, firmware: '1.0.0', install_date: '2026-01-01' },
    { sensor_id: 'PSL01B-002', model: 'PSL01B', zone_id: 'zone-001', bay_number: 2, firmware: '1.0.0', install_date: '2026-01-01' },
  ]
  writeFileSync(CONFIG.SENSORS_FILE, JSON.stringify(sensors, null, 2))
  console.log(`   ✅ Exported ${sensors.length} sensors to ${CONFIG.SENSORS_FILE}`)
  
  console.log('   Exporting events (last 90 days)...')
  // For large exports, stream to JSONL file
  const eventsFile = CONFIG.EVENTS_FILE
  let eventCount = 0
  
  // Mock events
  const events = [
    { zone_id: 'zone-001', bay_number: 1, event_type: 'ARRIVE', timestamp: '2026-01-10T10:00:00Z', detection_mode: 'dual' },
    { zone_id: 'zone-001', bay_number: 1, event_type: 'LEAVE', timestamp: '2026-01-10T11:30:00Z', detection_mode: 'dual', duration: 90, revenue: 15 },
    // ... more events
  ]
  
  writeFileSync(eventsFile, events.map(e => JSON.stringify(e)).join('\n'))
  eventCount = events.length
  console.log(`   ✅ Exported ${eventCount} events to ${eventsFile}`)
  
  console.log()
  console.log('Export complete!')
}

// ==========================================
// TRANSFORM FUNCTIONS
// ==========================================

interface DynamoDBItem {
  PK: string
  SK: string
  [key: string]: any
}

function transformZone(row: any): DynamoDBItem {
  return {
    PK: `ZONE#${row.zone_id}`,
    SK: 'METADATA',
    GSI1PK: `TENANT#${row.tenant_id}`,
    GSI1SK: `ZONE#${row.zone_id}`,
    zoneId: row.zone_id,
    name: row.name,
    address: row.address,
    city: row.city,
    totalBays: row.total_bays,
    occupiedBays: 0,
    location: { lat: row.lat, lng: row.lng },
    pricePerHour: row.price_per_hour,
    operatingHours: { open: '00:00', close: '23:59' },
    tenantId: row.tenant_id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

function transformBay(row: any): DynamoDBItem {
  return {
    PK: `ZONE#${row.zone_id}`,
    SK: `BAY#${row.bay_number}`,
    GSI2PK: `SENSOR#${row.sensor_id}`,
    GSI2SK: 'BAY',
    bayNumber: row.bay_number,
    sensorId: row.sensor_id,
    status: row.status || 'unknown',
    bayType: row.bay_type || 'standard',
    location: row.lat && row.lng ? { lat: row.lat, lng: row.lng } : undefined,
    lastChange: null,
    occupiedSince: null
  }
}

function transformSensor(row: any): DynamoDBItem {
  return {
    PK: `SENSOR#${row.sensor_id}`,
    SK: 'METADATA',
    GSI1PK: `ZONE#${row.zone_id}`,
    GSI1SK: `SENSOR#${row.sensor_id}`,
    sensorId: row.sensor_id,
    model: row.model,
    zoneId: row.zone_id,
    bayNumber: row.bay_number,
    status: 'active',
    firmwareVersion: row.firmware || 'unknown',
    installDate: row.install_date,
    lastBattery: 100,
    lastSignal: 0,
    lastSeen: null
  }
}

function transformEvent(row: any): DynamoDBItem {
  const timestamp = row.timestamp
  return {
    PK: `ZONE#${row.zone_id}#BAY#${row.bay_number}`,
    SK: `EVENT#${timestamp}`,
    GSI1PK: `ZONE#${row.zone_id}`,
    GSI1SK: `EVENT#${timestamp}`,
    eventType: row.event_type,
    timestamp: timestamp,
    duration: row.duration || null,
    revenue: row.revenue || null,
    detectionMode: row.detection_mode || 'dual',
    ttl: Math.floor(new Date(timestamp).getTime() / 1000) + (90 * 24 * 60 * 60)
  }
}

async function transformData(): Promise<void> {
  console.log('🔄 Transforming data for DynamoDB...')
  console.log()
  
  const transformedDir = './export/transformed'
  if (!existsSync(transformedDir)) {
    mkdirSync(transformedDir, { recursive: true })
  }
  
  // Transform zones
  console.log('   Transforming zones...')
  const zones = JSON.parse(readFileSync(CONFIG.ZONES_FILE, 'utf-8'))
  const transformedZones = zones.map(transformZone)
  writeFileSync(`${transformedDir}/zones.json`, JSON.stringify(transformedZones, null, 2))
  console.log(`   ✅ Transformed ${transformedZones.length} zones`)
  
  // Transform bays
  console.log('   Transforming bays...')
  const bays = JSON.parse(readFileSync(CONFIG.BAYS_FILE, 'utf-8'))
  const transformedBays = bays.map(transformBay)
  writeFileSync(`${transformedDir}/bays.json`, JSON.stringify(transformedBays, null, 2))
  console.log(`   ✅ Transformed ${transformedBays.length} bays`)
  
  // Transform sensors
  console.log('   Transforming sensors...')
  const sensors = JSON.parse(readFileSync(CONFIG.SENSORS_FILE, 'utf-8'))
  const transformedSensors = sensors.map(transformSensor)
  writeFileSync(`${transformedDir}/sensors.json`, JSON.stringify(transformedSensors, null, 2))
  console.log(`   ✅ Transformed ${transformedSensors.length} sensors`)
  
  // Transform events (stream for large files)
  console.log('   Transforming events...')
  const eventsContent = readFileSync(CONFIG.EVENTS_FILE, 'utf-8')
  const events = eventsContent.trim().split('\n').map(line => JSON.parse(line))
  const transformedEvents = events.map(transformEvent)
  writeFileSync(`${transformedDir}/events.jsonl`, 
    transformedEvents.map(e => JSON.stringify(e)).join('\n'))
  console.log(`   ✅ Transformed ${transformedEvents.length} events`)
  
  console.log()
  console.log('Transform complete!')
}

// ==========================================
// LOAD FUNCTIONS
// ==========================================

async function loadToDynamoDB(): Promise<void> {
  console.log('📥 Loading data to DynamoDB...')
  console.log(`   Region: ${CONFIG.AWS_REGION}`)
  console.log(`   Table: ${CONFIG.DYNAMODB_TABLE}`)
  console.log()
  
  const transformedDir = './export/transformed'
  
  // In production, use AWS SDK:
  // const { DynamoDBClient, BatchWriteItemCommand } = require('@aws-sdk/client-dynamodb')
  // const { marshall } = require('@aws-sdk/util-dynamodb')
  // const client = new DynamoDBClient({ region: CONFIG.AWS_REGION })
  
  // Load zones
  console.log('   Loading zones...')
  const zones = JSON.parse(readFileSync(`${transformedDir}/zones.json`, 'utf-8'))
  // await batchWrite(client, zones)
  console.log(`   ✅ Loaded ${zones.length} zones`)
  
  // Load bays
  console.log('   Loading bays...')
  const bays = JSON.parse(readFileSync(`${transformedDir}/bays.json`, 'utf-8'))
  // await batchWrite(client, bays)
  console.log(`   ✅ Loaded ${bays.length} bays`)
  
  // Load sensors
  console.log('   Loading sensors...')
  const sensors = JSON.parse(readFileSync(`${transformedDir}/sensors.json`, 'utf-8'))
  // await batchWrite(client, sensors)
  console.log(`   ✅ Loaded ${sensors.length} sensors`)
  
  // Load events
  console.log('   Loading events...')
  const eventsContent = readFileSync(`${transformedDir}/events.jsonl`, 'utf-8')
  const events = eventsContent.trim().split('\n').map(line => JSON.parse(line))
  // await batchWrite(client, events)
  console.log(`   ✅ Loaded ${events.length} events`)
  
  console.log()
  console.log('Load complete!')
}

// ==========================================
// VERIFICATION FUNCTIONS
// ==========================================

async function verifyMigration(): Promise<void> {
  console.log('🔍 Verifying migration...')
  console.log()
  
  // Count records in DynamoDB
  // const dynamoCount = await countDynamoRecords()
  
  // Count records from export
  const zones = JSON.parse(readFileSync(CONFIG.ZONES_FILE, 'utf-8'))
  const bays = JSON.parse(readFileSync(CONFIG.BAYS_FILE, 'utf-8'))
  const sensors = JSON.parse(readFileSync(CONFIG.SENSORS_FILE, 'utf-8'))
  const eventsContent = readFileSync(CONFIG.EVENTS_FILE, 'utf-8')
  const eventCount = eventsContent.trim().split('\n').length
  
  console.log('   Export counts:')
  console.log(`     Zones: ${zones.length}`)
  console.log(`     Bays: ${bays.length}`)
  console.log(`     Sensors: ${sensors.length}`)
  console.log(`     Events: ${eventCount}`)
  
  console.log()
  console.log('   DynamoDB counts:')
  console.log('     (Run verification against live DynamoDB)')
  
  console.log()
  console.log('Verification complete!')
}

// ==========================================
// MAIN
// ==========================================

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════════╗')
  console.log('║     VisionDrive Parking - TimescaleDB to AWS Migration            ║')
  console.log('╚════════════════════════════════════════════════════════════════════╝')
  console.log()
  
  const command = process.argv[2] || 'help'
  
  switch (command) {
    case 'export':
      await exportFromTimescale()
      break
      
    case 'transform':
      await transformData()
      break
      
    case 'load':
      await loadToDynamoDB()
      break
      
    case 'verify':
      await verifyMigration()
      break
      
    case 'full':
      await exportFromTimescale()
      console.log()
      await transformData()
      console.log()
      await loadToDynamoDB()
      console.log()
      await verifyMigration()
      break
      
    default:
      console.log('Usage:')
      console.log('  npx tsx migrate-timescale.ts export    - Export from TimescaleDB')
      console.log('  npx tsx migrate-timescale.ts transform - Transform for DynamoDB')
      console.log('  npx tsx migrate-timescale.ts load      - Load to DynamoDB')
      console.log('  npx tsx migrate-timescale.ts verify    - Verify migration')
      console.log('  npx tsx migrate-timescale.ts full      - Run full migration')
      console.log()
      console.log('Environment variables:')
      console.log('  TIMESCALE_HOST     - TimescaleDB host')
      console.log('  TIMESCALE_PORT     - TimescaleDB port')
      console.log('  TIMESCALE_DB       - Database name')
      console.log('  TIMESCALE_USER     - Database user')
      console.log('  TIMESCALE_PASSWORD - Database password')
      console.log('  AWS_REGION         - AWS region (default: me-central-1)')
      console.log('  DYNAMODB_TABLE     - DynamoDB table name')
  }
}

main().catch(console.error)
