/**
 * VisionDrive Parking - Full Migration Script
 * Migrates from TimescaleDB to AWS DynamoDB (UAE region)
 */

const { Client } = require('pg');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, BatchWriteCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const fs = require('fs');

// Configuration
const CONFIG = {
  TIMESCALE_URL: process.env.TIMESCALE_URL,
  AWS_REGION: 'me-central-1',
  DYNAMODB_TABLE: 'VisionDrive-Parking',
  BATCH_SIZE: 25, // DynamoDB batch write limit
};

// Initialize clients
const pgClient = new Client({
  connectionString: CONFIG.TIMESCALE_URL,
  ssl: { rejectUnauthorized: false }
});

const dynamoClient = new DynamoDBClient({ region: CONFIG.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Stats
const stats = {
  tenants: 0,
  sites: 0,
  zones: 0,
  bays: 0,
  sensors: 0,
  events: 0,
  alerts: 0,
  errors: []
};

// ============================================
// TRANSFORM FUNCTIONS
// ============================================

function transformTenant(row) {
  return {
    PK: `TENANT#${row.id}`,
    SK: 'METADATA',
    entityType: 'TENANT',
    tenantId: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status,
    createdAt: row.createdAt?.toISOString?.() || row.createdAt,
    updatedAt: row.updatedAt?.toISOString?.() || row.updatedAt
  };
}

function transformSite(row) {
  return {
    PK: `TENANT#${row.tenantId}`,
    SK: `SITE#${row.id}`,
    GSI1PK: `SITE#${row.id}`,
    GSI1SK: 'METADATA',
    entityType: 'SITE',
    siteId: row.id,
    tenantId: row.tenantId,
    name: row.name,
    address: row.address,
    timezone: row.timezone || 'Asia/Dubai',
    location: row.centerLat && row.centerLng ? {
      lat: row.centerLat,
      lng: row.centerLng
    } : null,
    geojson: row.geojson,
    createdAt: row.createdAt?.toISOString?.() || row.createdAt,
    updatedAt: row.updatedAt?.toISOString?.() || row.updatedAt
  };
}

function transformZone(row) {
  // Parse tariff if it exists
  let pricePerHour = 10; // default
  if (row.tariff?.hours) {
    pricePerHour = row.tariff.hours;
  }
  
  return {
    PK: `ZONE#${row.id}`,
    SK: 'METADATA',
    GSI1PK: `TENANT#${row.tenantId}`,
    GSI1SK: `ZONE#${row.id}`,
    entityType: 'ZONE',
    zoneId: row.id,
    tenantId: row.tenantId,
    siteId: row.siteId,
    name: row.name,
    kind: row.kind,
    pricePerHour: pricePerHour,
    tariff: row.tariff,
    geojson: row.geojson,
    totalBays: 0, // Will be updated after bays
    occupiedBays: 0,
    operatingHours: { open: '00:00', close: '23:59' },
    createdAt: row.createdAt?.toISOString?.() || row.createdAt,
    updatedAt: row.updatedAt?.toISOString?.() || row.updatedAt
  };
}

function transformBay(row) {
  return {
    PK: `ZONE#${row.zoneId}`,
    SK: `BAY#${row.code || row.id}`,
    GSI1PK: `SITE#${row.siteId}`,
    GSI1SK: `BAY#${row.id}`,
    entityType: 'BAY',
    bayId: row.id,
    bayNumber: row.code || row.id,
    tenantId: row.tenantId,
    siteId: row.siteId,
    zoneId: row.zoneId,
    status: 'unknown',
    lastChange: null,
    occupiedSince: null,
    location: row.lat && row.lng ? {
      lat: row.lat,
      lng: row.lng
    } : null,
    geojson: row.geojson,
    attributes: row.attributes,
    bayType: row.attributes?.type || 'standard',
    createdAt: row.createdAt?.toISOString?.() || row.createdAt,
    updatedAt: row.updatedAt?.toISOString?.() || row.updatedAt
  };
}

function transformSensor(row) {
  return {
    PK: `SENSOR#${row.id}`,
    SK: 'METADATA',
    GSI1PK: row.zoneId ? `ZONE#${row.zoneId}` : `TENANT#${row.tenantId}`,
    GSI1SK: `SENSOR#${row.id}`,
    GSI2PK: `DEVEUI#${row.devEui}`,
    GSI2SK: 'SENSOR',
    entityType: 'SENSOR',
    sensorId: row.id,
    tenantId: row.tenantId,
    siteId: row.siteId,
    zoneId: row.zoneId,
    bayId: row.bayId,
    devEui: row.devEui,
    type: row.type,
    model: row.model || 'PSL01B',
    firmware: row.firmware,
    status: row.status,
    installDate: row.installDate?.toISOString?.() || row.installDate,
    lastSeen: row.lastSeen?.toISOString?.() || row.lastSeen,
    batteryPct: row.batteryPct,
    location: row.lat && row.lng ? {
      lat: row.lat,
      lng: row.lng
    } : null,
    meta: row.meta,
    createdAt: row.createdAt?.toISOString?.() || row.createdAt,
    updatedAt: row.updatedAt?.toISOString?.() || row.updatedAt
  };
}

function transformSensorEvent(row) {
  const timestamp = row.time?.toISOString?.() || row.time;
  
  // Determine event type from decoded data
  let eventType = 'STATUS';
  if (row.decoded?.occupied !== undefined) {
    eventType = row.decoded.occupied ? 'ARRIVE' : 'LEAVE';
  }
  
  return {
    PK: `SENSOR#${row.sensorId}`,
    SK: `EVENT#${timestamp}`,
    GSI1PK: `TENANT#${row.tenantId}`,
    GSI1SK: `EVENT#${timestamp}`,
    entityType: 'EVENT',
    eventId: row.id,
    sensorId: row.sensorId,
    tenantId: row.tenantId,
    siteId: row.siteId,
    gatewayId: row.gatewayId,
    eventType: eventType,
    kind: row.kind,
    timestamp: timestamp,
    decoded: row.decoded,
    rawPayload: row.rawPayload,
    rssi: row.rssi,
    snr: row.snr,
    batteryPct: row.batteryPct,
    meta: row.meta,
    // TTL: auto-expire after 90 days
    ttl: Math.floor(new Date(timestamp).getTime() / 1000) + (90 * 24 * 60 * 60),
    createdAt: row.createdAt?.toISOString?.() || row.createdAt
  };
}

function transformAlert(row) {
  return {
    PK: `TENANT#${row.tenantId}`,
    SK: `ALERT#${row.id}`,
    GSI1PK: row.sensorId ? `SENSOR#${row.sensorId}` : `ZONE#${row.zoneId}`,
    GSI1SK: `ALERT#${row.openedAt?.toISOString?.() || row.openedAt}`,
    entityType: 'ALERT',
    alertId: row.id,
    tenantId: row.tenantId,
    siteId: row.siteId,
    zoneId: row.zoneId,
    sensorId: row.sensorId,
    gatewayId: row.gatewayId,
    type: row.type,
    severity: row.severity,
    status: row.status,
    title: row.title,
    message: row.message,
    meta: row.meta,
    openedAt: row.openedAt?.toISOString?.() || row.openedAt,
    firstDetectedAt: row.firstDetectedAt?.toISOString?.() || row.firstDetectedAt,
    lastDetectedAt: row.lastDetectedAt?.toISOString?.() || row.lastDetectedAt,
    acknowledgedAt: row.acknowledgedAt?.toISOString?.() || row.acknowledgedAt,
    acknowledgedByUserId: row.acknowledgedByUserId,
    resolvedAt: row.resolvedAt?.toISOString?.() || row.resolvedAt,
    createdAt: row.createdAt?.toISOString?.() || row.createdAt,
    updatedAt: row.updatedAt?.toISOString?.() || row.updatedAt
  };
}

// ============================================
// BATCH WRITE TO DYNAMODB
// ============================================

async function batchWrite(items) {
  // Split into batches of 25
  for (let i = 0; i < items.length; i += CONFIG.BATCH_SIZE) {
    const batch = items.slice(i, i + CONFIG.BATCH_SIZE);
    
    const params = {
      RequestItems: {
        [CONFIG.DYNAMODB_TABLE]: batch.map(item => ({
          PutRequest: { Item: item }
        }))
      }
    };
    
    try {
      await docClient.send(new BatchWriteCommand(params));
      process.stdout.write('.');
    } catch (err) {
      console.error(`\n❌ Batch write error:`, err.message);
      stats.errors.push({ batch: i, error: err.message });
    }
  }
}

// ============================================
// MIGRATION FUNCTIONS
// ============================================

async function migrateTenants() {
  console.log('\n📦 Migrating tenants...');
  const result = await pgClient.query('SELECT * FROM tenants');
  const items = result.rows.map(transformTenant);
  await batchWrite(items);
  stats.tenants = items.length;
  console.log(` ✅ ${items.length} tenants`);
  return items;
}

async function migrateSites() {
  console.log('\n📦 Migrating sites...');
  const result = await pgClient.query('SELECT * FROM sites');
  const items = result.rows.map(transformSite);
  await batchWrite(items);
  stats.sites = items.length;
  console.log(` ✅ ${items.length} sites`);
  return items;
}

async function migrateZones() {
  console.log('\n📦 Migrating zones...');
  const result = await pgClient.query('SELECT * FROM zones');
  const items = result.rows.map(transformZone);
  await batchWrite(items);
  stats.zones = items.length;
  console.log(` ✅ ${items.length} zones`);
  return items;
}

async function migrateBays() {
  console.log('\n📦 Migrating bays...');
  const result = await pgClient.query('SELECT * FROM bays');
  const items = result.rows.map(transformBay);
  await batchWrite(items);
  stats.bays = items.length;
  console.log(` ✅ ${items.length} bays`);
  return items;
}

async function migrateSensors() {
  console.log('\n📦 Migrating sensors...');
  const result = await pgClient.query('SELECT * FROM sensors');
  const items = result.rows.map(transformSensor);
  await batchWrite(items);
  stats.sensors = items.length;
  console.log(` ✅ ${items.length} sensors`);
  return items;
}

async function migrateSensorEvents() {
  console.log('\n📦 Migrating sensor events...');
  const result = await pgClient.query('SELECT * FROM sensor_events ORDER BY time');
  const items = result.rows.map(transformSensorEvent);
  await batchWrite(items);
  stats.events = items.length;
  console.log(` ✅ ${items.length} events`);
  return items;
}

async function migrateAlerts() {
  console.log('\n📦 Migrating alerts...');
  const result = await pgClient.query('SELECT * FROM alerts');
  const items = result.rows.map(transformAlert);
  await batchWrite(items);
  stats.alerts = items.length;
  console.log(` ✅ ${items.length} alerts`);
  return items;
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║   VisionDrive Parking - TimescaleDB → DynamoDB Migration           ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');
  console.log();
  console.log(`Source: TimescaleDB`);
  console.log(`Target: DynamoDB (${CONFIG.AWS_REGION}) → ${CONFIG.DYNAMODB_TABLE}`);
  console.log();

  if (!CONFIG.TIMESCALE_URL) {
    console.error('❌ Error: TIMESCALE_URL environment variable not set');
    process.exit(1);
  }

  try {
    // Connect to TimescaleDB
    console.log('🔌 Connecting to TimescaleDB...');
    await pgClient.connect();
    console.log('✅ Connected to TimescaleDB\n');

    // Run migrations in order
    const startTime = Date.now();
    
    await migrateTenants();
    await migrateSites();
    await migrateZones();
    await migrateBays();
    await migrateSensors();
    await migrateSensorEvents();
    await migrateAlerts();

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    // Summary
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════════════╗');
    console.log('║                      MIGRATION COMPLETE                            ║');
    console.log('╠════════════════════════════════════════════════════════════════════╣');
    console.log(`║  Tenants:       ${String(stats.tenants).padStart(6)}                                      ║`);
    console.log(`║  Sites:         ${String(stats.sites).padStart(6)}                                      ║`);
    console.log(`║  Zones:         ${String(stats.zones).padStart(6)}                                      ║`);
    console.log(`║  Bays:          ${String(stats.bays).padStart(6)}                                      ║`);
    console.log(`║  Sensors:       ${String(stats.sensors).padStart(6)}                                      ║`);
    console.log(`║  Events:        ${String(stats.events).padStart(6)}                                      ║`);
    console.log(`║  Alerts:        ${String(stats.alerts).padStart(6)}                                      ║`);
    console.log('╠════════════════════════════════════════════════════════════════════╣');
    console.log(`║  Duration:      ${String(duration + 's').padStart(6)}                                      ║`);
    console.log(`║  Errors:        ${String(stats.errors.length).padStart(6)}                                      ║`);
    console.log('╚════════════════════════════════════════════════════════════════════╝');

    if (stats.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      stats.errors.forEach((e, i) => {
        console.log(`   ${i + 1}. Batch ${e.batch}: ${e.error}`);
      });
    }

  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await pgClient.end();
  }
}

main();
