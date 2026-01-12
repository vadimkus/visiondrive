# VisionDrive Parking - System Architecture

## Complete Technical Design for AWS-Based Parking System

---

## 1. Overview

This document describes the architecture for migrating VisionDrive's parking sensor system from TimescaleDB to AWS, with all data stored in the UAE region (me-central-1).

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Database** | DynamoDB | Parking is event-driven (arrive/leave), not continuous time-series |
| **IoT Platform** | AWS IoT Core | Native integration, device shadows, rules engine |
| **Compute** | Lambda | Serverless, pay-per-event, auto-scaling |
| **API** | API Gateway | RESTful API for frontend |
| **Region** | me-central-1 | UAE data residency requirement |

---

## 2. Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA FLOW DIAGRAM                                 │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────┐
  │  PSL01B     │
  │  Sensor     │
  │  ┌───────┐  │
  │  │Magneto│  │──── Detect vehicle presence
  │  │+Radar │  │
  │  └───────┘  │
  └──────┬──────┘
         │
         │ NB-IoT (du network)
         │ MQTTS Port 8883
         │ Username: swiott01
         │ Password: ********
         │
         ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │                        AWS IoT Core                                      │
  │                                                                          │
  │  ┌───────────────────────────────────────────────────────────────────┐  │
  │  │                    Custom Authorizer                               │  │
  │  │                 VisionDriveParkingAuthorizer                       │  │
  │  │                                                                    │  │
  │  │  → Validates username/password                                    │  │
  │  │  → Returns IAM policy (Allow: iot:Connect, iot:Publish)          │  │
  │  │  → Lambda: VisionDrive-Parking-CustomAuthorizer                  │  │
  │  └───────────────────────────────────────────────────────────────────┘  │
  │                                                                          │
  │  Topic: visiondrive/parking/{zoneId}/{bayId}/status                     │
  │                                                                          │
  │  Payload:                                                                │
  │  {                                                                       │
  │    "deviceId": "PSL01B-001",                                            │
  │    "status": "occupied",                                                 │
  │    "battery": 95,                                                        │
  │    "signal": -72,                                                        │
  │    "mode": "dual",                                                       │
  │    "ts": 1736678400000                                                  │
  │  }                                                                       │
  │                                                                          │
  │  ┌─────────────────────────────────────────────────────────────────┐    │
  │  │                     IoT Rules Engine                             │    │
  │  │                                                                  │    │
  │  │  Rule 1: ALL messages → Lambda (ProcessParkingEvent)            │    │
  │  │  Rule 2: status change → Lambda (UpdateBayState)                │    │
  │  │  Rule 3: battery < 20 → SNS (LowBatteryAlert)                   │    │
  │  │  Rule 4: offline > 1h → Lambda (SensorOfflineAlert)             │    │
  │  │                                                                  │    │
  │  └─────────────────────────────────────────────────────────────────┘    │
  │                                                                          │
  └───────────────────────────────┬──────────────────────────────────────────┘
                                  │
           ┌──────────────────────┼──────────────────────┐
           │                      │                      │
           ▼                      ▼                      ▼
    ┌─────────────┐        ┌─────────────┐        ┌─────────────┐
    │   Lambda    │        │   Lambda    │        │   Lambda    │
    │  Process    │        │  Update     │        │   Alerts    │
    │  Event      │        │  BayState   │        │             │
    └──────┬──────┘        └──────┬──────┘        └──────┬──────┘
           │                      │                      │
           │                      │                      │
           ▼                      ▼                      ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                       DynamoDB                               │
    │                                                              │
    │  ┌──────────────────┐    ┌──────────────────┐              │
    │  │ ParkingEvents    │    │ ParkingBays      │              │
    │  │ (Historical)     │    │ (Current State)  │              │
    │  │                  │    │                  │              │
    │  │ PK: BAY#z#b      │    │ PK: ZONE#z       │              │
    │  │ SK: EVENT#ts     │    │ SK: BAY#b        │              │
    │  │                  │    │                  │              │
    │  │ - eventType      │    │ - status         │              │
    │  │ - duration       │    │ - sensorId       │              │
    │  │ - timestamp      │    │ - lastChange     │              │
    │  └──────────────────┘    └──────────────────┘              │
    │                                                              │
    │  ┌──────────────────┐    ┌──────────────────┐              │
    │  │ ParkingZones     │    │ Sensors          │              │
    │  │ (Configuration)  │    │ (Device Registry)│              │
    │  └──────────────────┘    └──────────────────┘              │
    │                                                              │
    └──────────────────────────────┬───────────────────────────────┘
                                   │
                                   ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                      API Gateway                             │
    │                                                              │
    │  GET  /zones                    List parking zones           │
    │  GET  /zones/{id}               Get zone details             │
    │  GET  /zones/{id}/bays          Get bays in zone            │
    │  GET  /bays/{zoneId}/{bayId}    Get bay status              │
    │  GET  /events                   Query parking events         │
    │  GET  /analytics/occupancy      Occupancy statistics         │
    │  GET  /analytics/revenue        Revenue calculations         │
    │                                                              │
    └──────────────────────────────┬───────────────────────────────┘
                                   │
                                   ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                    VisionDrive Portal                        │
    │                       (Vercel)                               │
    │                                                              │
    │  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
    │  │    Map     │  │    Bays    │  │  Reports   │            │
    │  │  View      │  │   List     │  │  & Stats   │            │
    │  └────────────┘  └────────────┘  └────────────┘            │
    │                                                              │
    └─────────────────────────────────────────────────────────────┘
```

---

## 3. DynamoDB Schema Design

### 3.1 Single-Table Design Principles

Using DynamoDB single-table design with composite keys for efficient queries.

### 3.2 Table: VisionDrive-Parking

```
┌────────────────────────────────────────────────────────────────────────────┐
│                    PRIMARY TABLE: VisionDrive-Parking                       │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Access Patterns:                                                           │
│  1. Get zone by ID                                                          │
│  2. List all bays in a zone                                                │
│  3. Get bay current state                                                   │
│  4. Query events for a bay                                                  │
│  5. Query events across zone (time range)                                   │
│  6. Get sensor by ID                                                        │
│  7. List all sensors in a zone                                             │
│  8. Get tenant's zones                                                      │
│                                                                             │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Entity Types & Key Design:                                                 │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ZONE                                                                 │   │
│  │ PK: ZONE#{zoneId}                                                    │   │
│  │ SK: METADATA                                                         │   │
│  │                                                                      │   │
│  │ Attributes:                                                          │   │
│  │   zoneId: string                                                     │   │
│  │   name: string                                                       │   │
│  │   address: string                                                    │   │
│  │   city: string                                                       │   │
│  │   totalBays: number                                                  │   │
│  │   occupiedBays: number                                               │   │
│  │   location: { lat: number, lng: number }                            │   │
│  │   pricePerHour: number                                               │   │
│  │   operatingHours: { open: string, close: string }                   │   │
│  │   tenantId: string                                                   │   │
│  │   createdAt: string                                                  │   │
│  │   updatedAt: string                                                  │   │
│  │                                                                      │   │
│  │ GSI1PK: TENANT#{tenantId}                                           │   │
│  │ GSI1SK: ZONE#{zoneId}                                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ BAY (Current State)                                                  │   │
│  │ PK: ZONE#{zoneId}                                                    │   │
│  │ SK: BAY#{bayNumber}                                                  │   │
│  │                                                                      │   │
│  │ Attributes:                                                          │   │
│  │   bayNumber: number                                                  │   │
│  │   sensorId: string                                                   │   │
│  │   status: "occupied" | "vacant" | "unknown"                         │   │
│  │   lastChange: string (ISO8601)                                      │   │
│  │   occupiedSince: string | null                                      │   │
│  │   currentDuration: number (minutes)                                 │   │
│  │   batteryLevel: number                                               │   │
│  │   signalStrength: number                                            │   │
│  │   lastHeartbeat: string                                             │   │
│  │   location: { lat: number, lng: number }                            │   │
│  │   bayType: "standard" | "accessible" | "ev" | "reserved"           │   │
│  │                                                                      │   │
│  │ GSI2PK: SENSOR#{sensorId}                                           │   │
│  │ GSI2SK: BAY                                                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ EVENT (Historical)                                                   │   │
│  │ PK: ZONE#{zoneId}#BAY#{bayNumber}                                    │   │
│  │ SK: EVENT#{timestamp}                                                │   │
│  │                                                                      │   │
│  │ Attributes:                                                          │   │
│  │   eventType: "ARRIVE" | "LEAVE"                                     │   │
│  │   timestamp: string (ISO8601)                                       │   │
│  │   duration: number | null (minutes, for LEAVE events)              │   │
│  │   detectionMode: "geomagnetic" | "radar" | "dual"                  │   │
│  │   revenue: number | null (calculated for LEAVE)                    │   │
│  │                                                                      │   │
│  │ GSI1PK: ZONE#{zoneId}                                               │   │
│  │ GSI1SK: EVENT#{timestamp}                                           │   │
│  │                                                                      │   │
│  │ TTL: timestamp + 90 days (auto-archive)                             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ SENSOR                                                               │   │
│  │ PK: SENSOR#{sensorId}                                                │   │
│  │ SK: METADATA                                                         │   │
│  │                                                                      │   │
│  │ Attributes:                                                          │   │
│  │   sensorId: string                                                   │   │
│  │   model: string (e.g., "PSL01B")                                    │   │
│  │   firmwareVersion: string                                           │   │
│  │   installDate: string                                               │   │
│  │   zoneId: string                                                     │   │
│  │   bayNumber: number                                                  │   │
│  │   status: "active" | "inactive" | "maintenance"                     │   │
│  │   lastBattery: number                                                │   │
│  │   lastSignal: number                                                 │   │
│  │   lastSeen: string                                                   │   │
│  │                                                                      │   │
│  │ GSI1PK: ZONE#{zoneId}                                               │   │
│  │ GSI1SK: SENSOR#{sensorId}                                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  GLOBAL SECONDARY INDEXES:                                                  │
│                                                                             │
│  GSI1 (Zone queries + tenant zones + zone events)                          │
│    PK: GSI1PK                                                               │
│    SK: GSI1SK                                                               │
│    Projection: ALL                                                          │
│                                                                             │
│  GSI2 (Sensor lookups)                                                      │
│    PK: GSI2PK                                                               │
│    SK: GSI2SK                                                               │
│    Projection: KEYS_ONLY                                                    │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Lambda Functions

### 4.1 ProcessParkingEvent

Handles incoming sensor data and creates events.

```javascript
// Pseudocode
async function handler(event) {
  const { deviceId, status, battery, signal, mode, ts } = event
  
  // 1. Get sensor → bay mapping
  const sensor = await getSensor(deviceId)
  const { zoneId, bayNumber } = sensor
  
  // 2. Get current bay state
  const bay = await getBay(zoneId, bayNumber)
  
  // 3. Detect state change
  if (bay.status !== status) {
    // State changed!
    
    if (status === 'occupied') {
      // Vehicle arrived
      await createEvent(zoneId, bayNumber, 'ARRIVE', ts)
      await updateBay(zoneId, bayNumber, {
        status: 'occupied',
        occupiedSince: ts,
        lastChange: ts
      })
      await incrementZoneOccupancy(zoneId)
    } else {
      // Vehicle left
      const duration = calculateDuration(bay.occupiedSince, ts)
      const revenue = calculateRevenue(duration, zone.pricePerHour)
      
      await createEvent(zoneId, bayNumber, 'LEAVE', ts, { duration, revenue })
      await updateBay(zoneId, bayNumber, {
        status: 'vacant',
        occupiedSince: null,
        lastChange: ts
      })
      await decrementZoneOccupancy(zoneId)
    }
  }
  
  // 4. Update sensor health
  await updateSensorHealth(deviceId, battery, signal, ts)
}
```

### 4.2 API Handler

Handles REST API requests.

```javascript
// Routes
GET  /zones                     → listZones(tenantId)
GET  /zones/:id                 → getZone(zoneId)
GET  /zones/:id/bays            → listBays(zoneId)
GET  /zones/:id/bays/:bay       → getBay(zoneId, bayNumber)
GET  /zones/:id/events          → queryEvents(zoneId, timeRange)
GET  /zones/:id/analytics       → getZoneAnalytics(zoneId, period)
GET  /sensors/:id               → getSensor(sensorId)
POST /sensors                   → registerSensor(data)
PUT  /sensors/:id               → updateSensor(sensorId, data)
```

---

## 5. IoT Core Configuration

### 5.1 Topics

```
visiondrive/parking/{zoneId}/{bayId}/status    # Sensor status updates
visiondrive/parking/{zoneId}/{bayId}/health    # Heartbeat/health
visiondrive/parking/+/+/status                 # Wildcard for all
```

### 5.2 Rules

```sql
-- Rule 1: Process all status updates
SELECT 
  topic(3) as zoneId,
  topic(4) as bayId,
  *
FROM 'visiondrive/parking/+/+/status'

-- Rule 2: Low battery alert
SELECT * FROM 'visiondrive/parking/+/+/status'
WHERE battery < 20

-- Rule 3: Offline detection (no message in 1 hour)
-- Handled via Device Defender or scheduled Lambda
```

### 5.3 Device Shadow

```json
{
  "state": {
    "reported": {
      "status": "occupied",
      "battery": 95,
      "signal": -72,
      "mode": "dual",
      "lastUpdate": "2026-01-12T10:30:00Z"
    },
    "desired": {
      "reportInterval": 30,
      "detectionMode": "dual"
    }
  }
}
```

---

## 6. API Design

### 6.1 Endpoints

```yaml
Base URL: https://parking-api.visiondrive.ae/v1

# Zones
GET /zones
  Query: tenantId (optional)
  Response: { zones: Zone[], count: number }

GET /zones/{zoneId}
  Response: Zone

GET /zones/{zoneId}/bays
  Response: { bays: Bay[], summary: { total, occupied, vacant } }

GET /zones/{zoneId}/events
  Query: 
    - from: ISO8601 (default: 24h ago)
    - to: ISO8601 (default: now)
    - type: ARRIVE | LEAVE (optional)
    - limit: number (default: 100)
  Response: { events: Event[], nextToken?: string }

GET /zones/{zoneId}/analytics
  Query:
    - period: day | week | month
  Response: {
    occupancyRate: number,
    averageDuration: number,
    peakHours: { hour: number, occupancy: number }[],
    revenue: number
  }

# Bays
GET /bays/{zoneId}/{bayNumber}
  Response: Bay

# Sensors
GET /sensors
  Query: zoneId (optional)
  Response: { sensors: Sensor[] }

GET /sensors/{sensorId}
  Response: Sensor

POST /sensors
  Body: { sensorId, zoneId, bayNumber, model }
  Response: { sensorId }

# Real-time
WS /ws/zones/{zoneId}
  # WebSocket for real-time bay updates
```

### 6.2 Response Types

```typescript
interface Zone {
  zoneId: string
  name: string
  address: string
  city: string
  totalBays: number
  occupiedBays: number
  vacantBays: number
  occupancyRate: number
  location: { lat: number; lng: number }
  pricePerHour: number
  operatingHours: { open: string; close: string }
}

interface Bay {
  zoneId: string
  bayNumber: number
  sensorId: string
  status: 'occupied' | 'vacant' | 'unknown'
  lastChange: string
  occupiedSince: string | null
  currentDuration: number | null
  batteryLevel: number
  signalStrength: number
  bayType: 'standard' | 'accessible' | 'ev' | 'reserved'
  location: { lat: number; lng: number }
}

interface Event {
  zoneId: string
  bayNumber: number
  eventType: 'ARRIVE' | 'LEAVE'
  timestamp: string
  duration: number | null
  revenue: number | null
}

interface Sensor {
  sensorId: string
  model: string
  zoneId: string
  bayNumber: number
  status: 'active' | 'inactive' | 'maintenance'
  batteryLevel: number
  signalStrength: number
  lastSeen: string
  firmwareVersion: string
}
```

---

## 7. Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        SECURITY LAYERS                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  DEVICE LAYER                                                            │
│  ├── X.509 certificates per sensor                                      │
│  ├── TLS 1.2 for all IoT connections                                   │
│  └── Device provisioning via AWS IoT Fleet Provisioning                │
│                                                                          │
│  NETWORK LAYER                                                           │
│  ├── VPC endpoints for DynamoDB (private traffic)                      │
│  ├── IoT Core with private endpoints                                   │
│  └── API Gateway with WAF                                               │
│                                                                          │
│  APPLICATION LAYER                                                       │
│  ├── API Gateway with API keys + JWT authentication                    │
│  ├── IAM roles with least privilege                                    │
│  └── Lambda execution roles per function                               │
│                                                                          │
│  DATA LAYER                                                              │
│  ├── DynamoDB encryption at rest (AWS managed)                         │
│  ├── S3 archive with SSE-S3                                            │
│  └── CloudWatch logs encrypted                                         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Monitoring & Observability

### CloudWatch Metrics

```
Custom Namespace: VisionDrive/Parking

Metrics:
- BayStatusChange (Count by zone)
- OccupancyRate (Gauge by zone)
- AverageParkinagDuration (Average by zone)
- SensorBatteryLevel (Gauge by sensor)
- SensorOffline (Count)
- APILatency (Latency by endpoint)
- EventProcessingErrors (Count)
```

### Alarms

```yaml
Alarms:
  - SensorOffline:
      Metric: SensorOffline
      Threshold: > 0
      Period: 5 minutes
      Action: SNS → Email
      
  - LowBattery:
      Metric: SensorBatteryLevel
      Threshold: < 20
      Period: 1 hour
      Action: SNS → Email
      
  - HighErrorRate:
      Metric: EventProcessingErrors
      Threshold: > 10
      Period: 5 minutes
      Action: SNS → PagerDuty
```

---

## 9. Cost Estimation

| Service | Usage Estimate | Monthly Cost |
|---------|---------------|--------------|
| IoT Core | 1M messages/month | ~$15 |
| DynamoDB | On-demand, 10GB storage | ~$25 |
| Lambda | 1M invocations | ~$5 |
| API Gateway | 1M requests | ~$3 |
| CloudWatch | Logs + Metrics | ~$10 |
| S3 Archive | 50GB | ~$1 |
| **Total** | | **~$60/month** |

*For 500 parking bays with ~20 events/bay/day*

---

## 10. Comparison: Old vs New

| Aspect | TimescaleDB (Old) | AWS DynamoDB (New) |
|--------|-------------------|-------------------|
| **Data Model** | Time-series tables | Event-driven documents |
| **Hosting** | Managed/self-hosted | Fully managed |
| **Location** | External | UAE (me-central-1) |
| **Scaling** | Manual | Automatic |
| **Cost Model** | Fixed | Pay-per-request |
| **IoT Integration** | Custom | Native AWS IoT |
| **Latency** | Variable | Consistent <10ms |
| **Backup** | Manual | Automatic PITR |
