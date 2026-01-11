# TimescaleDB to AWS Migration Guide

## Overview

This document describes the migration from TimescaleDB (hosted on Timescale Cloud) to AWS DynamoDB in the UAE region.

---

## Migration Summary

| Aspect | Before | After |
|--------|--------|-------|
| Database | TimescaleDB | DynamoDB |
| Location | Timescale Cloud | AWS me-central-1 (UAE) |
| Model | Time-series | NoSQL (single-table) |
| Hosting | Managed | Serverless |
| Cost Model | Fixed | Pay-per-request |

---

## Source Database

### Connection Details

```
Host: qfkf9i76d6.qtst4mj1fo.tsdb.cloud.timescale.com
Port: 37979
Database: tsdb
User: tsdbadmin
SSL: Required
```

### Tables Migrated

| Table | Rows | Description |
|-------|------|-------------|
| tenants | 1 | Organizations |
| sites | 1 | Physical locations |
| zones | 36 | Parking zones |
| bays | 40 | Parking bays |
| sensors | 46 | IoT sensors |
| sensor_events | 192 | Event history |
| alerts | 40 | System alerts |

**Total: 356 records**

---

## Target Database

### DynamoDB Table

```
Table Name: VisionDrive-Parking
Region: me-central-1 (UAE)
ARN: arn:aws:dynamodb:me-central-1:307436091440:table/VisionDrive-Parking
```

### Schema Design

Single-table design with composite keys:

| Attribute | Type | Purpose |
|-----------|------|---------|
| PK | String | Partition key (entity prefix + ID) |
| SK | String | Sort key (entity type or timestamp) |
| GSI1PK | String | Secondary index for zone/tenant queries |
| GSI1SK | String | Secondary index sort key |
| GSI2PK | String | Secondary index for sensor lookups |
| GSI2SK | String | Secondary index sort key |

---

## Entity Mappings

### Tenant

**TimescaleDB:**
```sql
SELECT id, name, slug, status, "createdAt" FROM tenants;
```

**DynamoDB:**
```json
{
  "PK": "TENANT#77a38d1d-2c63-41e3-a6e5-1c7a06cb1716",
  "SK": "METADATA",
  "entityType": "TENANT",
  "tenantId": "77a38d1d-2c63-41e3-a6e5-1c7a06cb1716",
  "name": "VisionDrive",
  "slug": "visiondrive",
  "status": "ACTIVE"
}
```

### Zone

**TimescaleDB:**
```sql
SELECT id, "tenantId", "siteId", name, kind, tariff FROM zones;
```

**DynamoDB:**
```json
{
  "PK": "ZONE#zone-id",
  "SK": "METADATA",
  "GSI1PK": "TENANT#tenant-id",
  "GSI1SK": "ZONE#zone-id",
  "entityType": "ZONE",
  "zoneId": "zone-id",
  "name": "Zone A",
  "kind": "PAID",
  "pricePerHour": 10
}
```

### Bay

**TimescaleDB:**
```sql
SELECT id, "tenantId", "siteId", "zoneId", code, lat, lng FROM bays;
```

**DynamoDB:**
```json
{
  "PK": "ZONE#zone-id",
  "SK": "BAY#A-001",
  "GSI1PK": "SITE#site-id",
  "GSI1SK": "BAY#bay-id",
  "entityType": "BAY",
  "bayNumber": "A-001",
  "status": "vacant",
  "sensorId": "PSL01B-001"
}
```

### Sensor

**TimescaleDB:**
```sql
SELECT id, "tenantId", "siteId", "zoneId", "bayId", "devEui", type, status FROM sensors;
```

**DynamoDB:**
```json
{
  "PK": "SENSOR#sensor-id",
  "SK": "METADATA",
  "GSI1PK": "ZONE#zone-id",
  "GSI1SK": "SENSOR#sensor-id",
  "GSI2PK": "DEVEUI#deveui",
  "GSI2SK": "SENSOR",
  "entityType": "SENSOR",
  "sensorId": "sensor-id",
  "devEui": "A84041000181234",
  "status": "active"
}
```

### Event

**TimescaleDB:**
```sql
SELECT id, time, "tenantId", "sensorId", kind, decoded FROM sensor_events;
```

**DynamoDB:**
```json
{
  "PK": "SENSOR#sensor-id",
  "SK": "EVENT#2026-01-12T10:30:00Z",
  "GSI1PK": "TENANT#tenant-id",
  "GSI1SK": "EVENT#2026-01-12T10:30:00Z",
  "entityType": "EVENT",
  "eventType": "ARRIVE",
  "timestamp": "2026-01-12T10:30:00Z",
  "ttl": 1744502400
}
```

---

## Migration Scripts

### Location

```
/Users/vadimkus/VisionDrive/Parking/scripts/migration/
├── explore-schema.js    # Explore TimescaleDB schema
├── run-migration.js     # Full migration script
└── package.json         # Dependencies
```

### Running the Migration

```bash
cd /Users/vadimkus/VisionDrive/Parking/scripts/migration

# Install dependencies
npm install

# Run migration
NODE_TLS_REJECT_UNAUTHORIZED=0 \
AWS_PROFILE=visiondrive-parking \
TIMESCALE_URL="postgres://tsdbadmin:PASSWORD@host:port/tsdb" \
node run-migration.js
```

### Migration Output

```
╔════════════════════════════════════════════════════════════════════╗
║   VisionDrive Parking - TimescaleDB → DynamoDB Migration           ║
╚════════════════════════════════════════════════════════════════════╝

📦 Migrating tenants... ✅ 1 tenants
📦 Migrating sites... ✅ 1 sites
📦 Migrating zones... ✅ 36 zones
📦 Migrating bays... ✅ 40 bays
📦 Migrating sensors... ✅ 46 sensors
📦 Migrating sensor events... ✅ 192 events
📦 Migrating alerts... ✅ 40 alerts

╔════════════════════════════════════════════════════════════════════╗
║                      MIGRATION COMPLETE                            ║
╠════════════════════════════════════════════════════════════════════╣
║  Duration: 2.7s                                                    ║
║  Errors: 0                                                         ║
╚════════════════════════════════════════════════════════════════════╝
```

---

## Verification

### Count Records

```bash
aws dynamodb scan \
  --table-name VisionDrive-Parking \
  --select COUNT \
  --profile visiondrive-parking \
  --region me-central-1
```

Expected: `"Count": 356`

### Verify by Entity Type

```bash
# Count zones
aws dynamodb scan \
  --table-name VisionDrive-Parking \
  --filter-expression "entityType = :type" \
  --expression-attribute-values '{":type":{"S":"ZONE"}}' \
  --select COUNT \
  --profile visiondrive-parking \
  --region me-central-1
```

Expected: `"Count": 36`

### Test API

```bash
curl https://o2s68toqw0.execute-api.me-central-1.amazonaws.com/prod/zones | jq '.count'
```

Expected: `36`

---

## Post-Migration Steps

### 1. Update Application Config

Update environment variables to point to new API:

```env
NEXT_PUBLIC_PARKING_API_URL=https://o2s68toqw0.execute-api.me-central-1.amazonaws.com/prod
```

### 2. Update Sensor Configuration

Configure sensors to publish to AWS IoT Core instead of previous endpoint.

### 3. Decommission TimescaleDB

After successful verification:
1. Stop writes to TimescaleDB
2. Run final sync
3. Verify data consistency
4. Archive TimescaleDB
5. Terminate TimescaleDB service

---

## Rollback Plan

If migration fails:

1. Keep TimescaleDB running until verified
2. Restore from TimescaleDB backup if needed
3. Point application back to TimescaleDB

### TimescaleDB Backup

```bash
pg_dump "postgres://tsdbadmin:PASSWORD@host:port/tsdb" > backup.sql
```

---

## Data Consistency

### Checksums

Compare record counts between source and target:

| Entity | TimescaleDB | DynamoDB | Match |
|--------|-------------|----------|-------|
| Tenants | 1 | 1 | ✅ |
| Sites | 1 | 1 | ✅ |
| Zones | 36 | 36 | ✅ |
| Bays | 40 | 40 | ✅ |
| Sensors | 46 | 46 | ✅ |
| Events | 192 | 192 | ✅ |
| Alerts | 40 | 40 | ✅ |

---

## Performance Comparison

| Metric | TimescaleDB | DynamoDB |
|--------|-------------|----------|
| Read latency | 50-100ms | <10ms |
| Write latency | 30-50ms | <5ms |
| Scaling | Manual | Automatic |
| Cost model | Fixed | Pay-per-use |

---

## Support

For migration issues, check:
- Migration script logs
- CloudWatch logs
- DynamoDB metrics
