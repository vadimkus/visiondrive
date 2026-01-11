# VisionDrive Parking - System Overview

## Project Summary

VisionDrive Parking is a smart parking management system that uses NB-IoT sensors to monitor parking bay occupancy in real-time. The system is designed for UAE-based deployments with all data stored in the AWS UAE region (me-central-1).

---

## Key Features

### 🚗 Real-Time Occupancy Monitoring
- Live parking bay status (occupied/vacant)
- Automatic vehicle detection using geomagnetic + radar sensors
- Instant status updates via NB-IoT

### 📊 Analytics & Insights
- Occupancy rate tracking by zone
- Peak hour analysis
- Revenue estimation
- Duration statistics

### 🔔 Smart Alerts
- Low battery warnings
- Sensor offline detection
- Occupancy threshold alerts
- Email/SMS notifications via SNS

### 🗺️ Zone Management
- Multi-zone support (36+ zones)
- Hierarchical organization (Tenant → Site → Zone → Bay)
- Custom pricing per zone
- Operating hours configuration

### 📱 Dashboard Portal
- Modern responsive UI
- Real-time data refresh
- Mobile-friendly design
- Role-based access

---

## Technology Stack

### Cloud Infrastructure (AWS - UAE Region)
| Service | Purpose |
|---------|---------|
| **DynamoDB** | Primary database (NoSQL) |
| **IoT Core** | Sensor connectivity |
| **Lambda** | Serverless compute |
| **API Gateway** | REST API |
| **SNS** | Alert notifications |
| **CloudWatch** | Monitoring & logs |

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework |
| **Tailwind CSS** | Styling |
| **TypeScript** | Type safety |
| **Vercel** | Hosting |

### Sensors
| Model | Protocol |
|-------|----------|
| **PSL01B-NBIoT** | NB-IoT (du network) |

---

## System Entities

### Tenant
Top-level organization. Can have multiple sites.
```json
{
  "tenantId": "77a38d1d-2c63-41e3-a6e5-1c7a06cb1716",
  "name": "VisionDrive",
  "slug": "visiondrive",
  "status": "ACTIVE"
}
```

### Site
Physical location containing parking zones.
```json
{
  "siteId": "32e19ed4-b3f4-4be0-863a-f8c4b73bb833",
  "name": "Dubai Media City",
  "address": "Dubai Media City, Dubai",
  "timezone": "Asia/Dubai",
  "location": { "lat": 25.0762, "lng": 55.1384 }
}
```

### Zone
Logical grouping of parking bays.
```json
{
  "zoneId": "d594a579-9979-4cbd-b555-9c1f6b68a9c1",
  "name": "Zone A - Visitor Parking",
  "kind": "PAID",
  "totalBays": 50,
  "occupiedBays": 23,
  "pricePerHour": 10,
  "operatingHours": { "open": "08:00", "close": "22:00" }
}
```

### Bay
Individual parking spot.
```json
{
  "bayNumber": "A-001",
  "sensorId": "PSL01B-001",
  "status": "occupied",
  "occupiedSince": "2026-01-12T10:30:00Z",
  "bayType": "standard"
}
```

### Sensor
IoT device installed in bay.
```json
{
  "sensorId": "PSL01B-001",
  "devEui": "A84041000181234",
  "model": "PSL01B",
  "status": "active",
  "batteryPct": 95,
  "lastSeen": "2026-01-12T10:30:00Z"
}
```

### Event
Parking activity record.
```json
{
  "eventType": "ARRIVE",
  "timestamp": "2026-01-12T10:30:00Z",
  "zoneId": "zone-001",
  "bayNumber": "A-001",
  "detectionMode": "dual"
}
```

---

## Data Flow

```
┌─────────────┐
│   Sensor    │  NB-IoT (du network)
│  PSL01B     │──────────────────────┐
└─────────────┘                      │
                                     ▼
                        ┌────────────────────┐
                        │    AWS IoT Core    │
                        │   (me-central-1)   │
                        └─────────┬──────────┘
                                  │
                        ┌─────────▼──────────┐
                        │    IoT Rules       │
                        │    Engine          │
                        └─────────┬──────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
    ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
    │     Lambda      │ │     Lambda      │ │      SNS        │
    │ Event Processor │ │  API Handler    │ │    Alerts       │
    └────────┬────────┘ └────────┬────────┘ └─────────────────┘
             │                   │
             └─────────┬─────────┘
                       ▼
             ┌─────────────────┐
             │    DynamoDB     │
             │ VisionDrive-    │
             │    Parking      │
             └────────┬────────┘
                      │
                      ▼
             ┌─────────────────┐
             │   API Gateway   │
             └────────┬────────┘
                      │
                      ▼
             ┌─────────────────┐
             │  Next.js App    │
             │   (Vercel)      │
             └─────────────────┘
```

---

## Cost Estimate

| Service | Monthly Usage | Cost (USD) |
|---------|--------------|------------|
| DynamoDB | 10GB storage, on-demand | ~$25 |
| IoT Core | 1M messages | ~$15 |
| Lambda | 1M invocations | ~$5 |
| API Gateway | 1M requests | ~$3 |
| CloudWatch | Logs + metrics | ~$10 |
| SNS | 1K notifications | ~$1 |
| **Total** | | **~$60/month** |

*For ~500 bays with ~20 events/bay/day*

---

## Support

For technical support, contact the VisionDrive team or refer to the troubleshooting guide.
