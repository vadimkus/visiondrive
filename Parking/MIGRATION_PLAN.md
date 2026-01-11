# TimescaleDB to AWS Migration Plan

## VisionDrive Parking - Data Migration Guide

---

## 1. Migration Overview

### Current State (TimescaleDB)
- Parking bay sensor data stored in TimescaleDB
- Time-series hypertables for events
- PostgreSQL-based queries

### Target State (AWS DynamoDB)
- Event-driven data model in DynamoDB
- AWS IoT Core for sensor connectivity
- Lambda + API Gateway for backend
- All data in UAE region (me-central-1)

### Migration Strategy: Dual-Write with Backfill

```
Phase 1: Setup AWS Infrastructure
Phase 2: Configure Sensors for Dual-Write
Phase 3: Backfill Historical Data
Phase 4: Verify & Validate
Phase 5: Cutover to AWS Only
Phase 6: Decommission TimescaleDB
```

---

## 2. Pre-Migration Checklist

### 2.1 AWS Account Preparation

- [ ] AWS account with me-central-1 enabled
- [ ] IAM admin user with MFA
- [ ] Budget alerts configured ($100, $200, $500)
- [ ] AWS CLI configured locally

### 2.2 Current System Audit

- [ ] Document current TimescaleDB schema
- [ ] Count total records to migrate
- [ ] Identify active sensor count
- [ ] List all API consumers
- [ ] Document query patterns

### 2.3 Data Export Preparation

```bash
# Connect to TimescaleDB and get statistics
psql -h your-timescale-host -U user -d visiondrive

# Count events
SELECT COUNT(*) FROM parking_events;

# Get date range
SELECT MIN(timestamp), MAX(timestamp) FROM parking_events;

# Count unique sensors
SELECT COUNT(DISTINCT sensor_id) FROM parking_events;

# Count by zone
SELECT zone_id, COUNT(*) FROM parking_events GROUP BY zone_id;
```

---

## 3. Phase 1: Setup AWS Infrastructure

### 3.1 Deploy CDK Stacks

```bash
cd Parking/infrastructure/cdk

# Install dependencies
npm install

# Bootstrap CDK in UAE region
cdk bootstrap aws://YOUR_ACCOUNT_ID/me-central-1

# Deploy all stacks
cdk deploy --all

# Note the outputs:
# - DynamoDB table names
# - IoT Core endpoint
# - API Gateway URL
```

### 3.2 Verify Infrastructure

```bash
# Check DynamoDB tables
aws dynamodb list-tables --region me-central-1

# Check IoT Core endpoint
aws iot describe-endpoint --endpoint-type iot:Data-ATS --region me-central-1

# Check API Gateway
aws apigateway get-rest-apis --region me-central-1
```

---

## 4. Phase 2: Dual-Write Configuration

### 4.1 Update Sensor Configuration

Option A: **Server-Side Dual Write**
```
Sensor → TimescaleDB Server → (writes to both)
                            ├── TimescaleDB
                            └── AWS IoT Core
```

Option B: **Sensor Direct to AWS**
```
Sensor → AWS IoT Core → Lambda → DynamoDB
                             └── (mirror to TimescaleDB via Lambda)
```

**Recommended: Option B** - Sensors send directly to AWS

### 4.2 Sensor Reconfiguration

For each PSL01B sensor:

```bash
# Connect via sensor configuration tool

# Update MQTT endpoint
AT+SERVADDR=xxxxxx-ats.iot.me-central-1.amazonaws.com,8883

# Update topic
AT+PUBTOPIC=visiondrive/parking/{zoneId}/{bayId}/status

# Enable TLS
AT+TLSMOD=1

# Verify
AT+CFG
```

### 4.3 Lambda Dual-Write (Temporary)

```javascript
// Lambda function that writes to both systems during migration
async function handler(event) {
  const parkingEvent = parseEvent(event)
  
  // Write to new DynamoDB
  await writeToDynamoDB(parkingEvent)
  
  // Mirror to old TimescaleDB (temporary)
  if (process.env.DUAL_WRITE_ENABLED === 'true') {
    await writeToTimescaleDB(parkingEvent)
  }
}
```

---

## 5. Phase 3: Backfill Historical Data

### 5.1 Export from TimescaleDB

```sql
-- Export zones
\copy (
  SELECT zone_id, name, address, city, total_bays, 
         ST_X(location::geometry) as lng,
         ST_Y(location::geometry) as lat,
         price_per_hour, operating_hours, tenant_id, created_at
  FROM parking_zones
) TO '/tmp/zones.csv' WITH CSV HEADER;

-- Export bays (current state)
\copy (
  SELECT zone_id, bay_number, sensor_id, status, 
         last_change, occupied_since, bay_type,
         ST_X(location::geometry) as lng,
         ST_Y(location::geometry) as lat
  FROM parking_bays
) TO '/tmp/bays.csv' WITH CSV HEADER;

-- Export events (may be large - do in batches)
\copy (
  SELECT zone_id, bay_number, event_type, timestamp, 
         duration_minutes, revenue, detection_mode
  FROM parking_events
  WHERE timestamp > NOW() - INTERVAL '90 days'
  ORDER BY timestamp
) TO '/tmp/events.csv' WITH CSV HEADER;

-- Export sensors
\copy (
  SELECT sensor_id, model, firmware_version, install_date,
         zone_id, bay_number, status, last_battery, last_signal
  FROM parking_sensors
) TO '/tmp/sensors.csv' WITH CSV HEADER;
```

### 5.2 Transform Data

```javascript
// scripts/migration/transform-data.ts

import { parse } from 'csv-parse'
import { createWriteStream } from 'fs'

// Transform zones
function transformZone(row) {
  return {
    PK: `ZONE#${row.zone_id}`,
    SK: 'METADATA',
    GSI1PK: `TENANT#${row.tenant_id}`,
    GSI1SK: `ZONE#${row.zone_id}`,
    zoneId: row.zone_id,
    name: row.name,
    address: row.address,
    city: row.city,
    totalBays: parseInt(row.total_bays),
    occupiedBays: 0, // Will be recalculated
    location: { lat: parseFloat(row.lat), lng: parseFloat(row.lng) },
    pricePerHour: parseFloat(row.price_per_hour),
    operatingHours: JSON.parse(row.operating_hours),
    tenantId: row.tenant_id,
    createdAt: row.created_at
  }
}

// Transform events
function transformEvent(row) {
  return {
    PK: `ZONE#${row.zone_id}#BAY#${row.bay_number}`,
    SK: `EVENT#${row.timestamp}`,
    GSI1PK: `ZONE#${row.zone_id}`,
    GSI1SK: `EVENT#${row.timestamp}`,
    eventType: row.event_type,
    timestamp: row.timestamp,
    duration: row.duration_minutes ? parseInt(row.duration_minutes) : null,
    revenue: row.revenue ? parseFloat(row.revenue) : null,
    detectionMode: row.detection_mode,
    // TTL: 90 days from now
    ttl: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60)
  }
}
```

### 5.3 Load into DynamoDB

```javascript
// scripts/migration/load-dynamodb.ts

import { DynamoDBClient, BatchWriteItemCommand } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'

const client = new DynamoDBClient({ region: 'me-central-1' })
const TABLE_NAME = 'VisionDrive-Parking'

async function batchWrite(items) {
  // DynamoDB batch write max 25 items
  const batches = chunk(items, 25)
  
  for (const batch of batches) {
    const command = new BatchWriteItemCommand({
      RequestItems: {
        [TABLE_NAME]: batch.map(item => ({
          PutRequest: {
            Item: marshall(item)
          }
        }))
      }
    })
    
    await client.send(command)
    
    // Rate limiting - avoid throttling
    await sleep(100)
  }
}

// Run migration
async function migrate() {
  console.log('Loading zones...')
  const zones = await loadCSV('/tmp/zones.csv')
  await batchWrite(zones.map(transformZone))
  
  console.log('Loading bays...')
  const bays = await loadCSV('/tmp/bays.csv')
  await batchWrite(bays.map(transformBay))
  
  console.log('Loading sensors...')
  const sensors = await loadCSV('/tmp/sensors.csv')
  await batchWrite(sensors.map(transformSensor))
  
  console.log('Loading events (this may take a while)...')
  // Stream large files
  await streamLoadEvents('/tmp/events.csv')
  
  console.log('Migration complete!')
}
```

### 5.4 Verify Data Load

```bash
# Count items in DynamoDB
aws dynamodb scan \
  --table-name VisionDrive-Parking \
  --select COUNT \
  --region me-central-1

# Sample some records
aws dynamodb scan \
  --table-name VisionDrive-Parking \
  --limit 10 \
  --region me-central-1
```

---

## 6. Phase 4: Verify & Validate

### 6.1 Data Integrity Checks

```javascript
// scripts/migration/verify.ts

async function verifyMigration() {
  // Count comparison
  const timescaleCount = await countTimescaleEvents()
  const dynamoCount = await countDynamoEvents()
  
  console.log(`TimescaleDB: ${timescaleCount}`)
  console.log(`DynamoDB:    ${dynamoCount}`)
  console.log(`Difference:  ${Math.abs(timescaleCount - dynamoCount)}`)
  
  // Sample comparison
  const sampleEvents = await getSampleFromTimescale(100)
  for (const event of sampleEvents) {
    const dynamoEvent = await getDynamoEvent(event.zone_id, event.bay_number, event.timestamp)
    if (!dynamoEvent) {
      console.error(`Missing event: ${event.zone_id}/${event.bay_number}/${event.timestamp}`)
    }
  }
  
  console.log('Verification complete!')
}
```

### 6.2 API Comparison

```bash
# Test old API
curl https://old-api.visiondrive.ae/zones/zone-001/bays > old-response.json

# Test new API
curl https://parking-api.visiondrive.ae/v1/zones/zone-001/bays > new-response.json

# Compare
diff old-response.json new-response.json
```

### 6.3 Real-time Testing

1. Trigger a bay status change
2. Verify event appears in both systems
3. Check latency difference
4. Verify dashboard updates

---

## 7. Phase 5: Cutover to AWS Only

### 7.1 Update Frontend

```typescript
// Update API client in VisionDrive portal
// lib/parking/api-client.ts

const API_URL = process.env.PARKING_API_URL || 'https://parking-api.visiondrive.ae/v1'

// All existing API calls now go to AWS
```

### 7.2 Disable Dual-Write

```bash
# Update Lambda environment variable
aws lambda update-function-configuration \
  --function-name parking-event-processor \
  --environment "Variables={DUAL_WRITE_ENABLED=false}" \
  --region me-central-1
```

### 7.3 Monitor for 48 Hours

- Watch CloudWatch for errors
- Compare with historical baselines
- Check all dashboards function
- Verify sensor connectivity

---

## 8. Phase 6: Decommission TimescaleDB

### 8.1 Final Backup

```bash
# Full database backup
pg_dump -h timescale-host -U user -d visiondrive > visiondrive_final_backup.sql

# Compress
gzip visiondrive_final_backup.sql

# Upload to S3 archive
aws s3 cp visiondrive_final_backup.sql.gz \
  s3://visiondrive-archives/timescale/visiondrive_final_backup.sql.gz \
  --region me-central-1
```

### 8.2 Update Documentation

- [ ] Update all runbooks
- [ ] Update architecture diagrams
- [ ] Update API documentation
- [ ] Notify all stakeholders

### 8.3 Shutdown TimescaleDB

```bash
# After 30 days with no issues:

# 1. Stop all connections
# 2. Final backup verification
# 3. Terminate TimescaleDB instance
# 4. Update DNS records
# 5. Close monitoring for old system
```

---

## 9. Rollback Plan

If issues occur during migration:

### Immediate Rollback (< 24 hours)
1. Re-enable dual-write to TimescaleDB
2. Switch frontend back to old API
3. Investigate issues

### Partial Rollback
1. Keep DynamoDB as secondary
2. Continue feeding data
3. Fix issues
4. Retry cutover

### Full Rollback
1. Re-export from DynamoDB to TimescaleDB
2. Reconfigure sensors for old endpoint
3. Restore old API
4. Root cause analysis

---

## 10. Migration Timeline

| Week | Phase | Activities |
|------|-------|------------|
| 1 | Preparation | Audit, planning, AWS setup |
| 2 | Infrastructure | Deploy CDK, configure IoT |
| 3 | Dual-Write | Reconfigure sensors, enable dual-write |
| 4 | Backfill | Export, transform, load historical data |
| 5 | Validation | Data integrity, API comparison, testing |
| 6 | Cutover | Switch to AWS, monitor |
| 7-8 | Stabilization | Monitor, fix issues |
| 9+ | Decommission | Backup and shutdown TimescaleDB |

---

## 11. Contacts

| Role | Contact | Responsibility |
|------|---------|----------------|
| Project Lead | TBD | Overall migration |
| DevOps | TBD | Infrastructure |
| Backend | TBD | Lambda, API |
| Frontend | TBD | Portal updates |
| SWI IoT | jimmy@swiott.com | Sensor config |
