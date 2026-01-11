# VisionDrive Parking - API Reference

## Base URL

```
https://o2s68toqw0.execute-api.me-central-1.amazonaws.com/prod
```

---

## Authentication

Currently using API Gateway public endpoints. For production, add:
- API Key authentication
- JWT tokens
- IAM authentication

---

## Response Format

All responses are JSON with the following structure:

**Success:**
```json
{
  "zones": [...],
  "count": 36
}
```

**Error:**
```json
{
  "error": "Zone not found",
  "message": "Additional details"
}
```

---

## Endpoints

### Zones

#### List All Zones

```http
GET /zones
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| tenantId | string | Filter by tenant (optional) |

**Response:**
```json
{
  "zones": [
    {
      "zoneId": "31978409-833d-44bd-a90e-d3e27e7fd5a6",
      "name": "Jumeirah Lakes Towers",
      "address": null,
      "city": null,
      "totalBays": 0,
      "occupiedBays": 0,
      "vacantBays": 0,
      "occupancyRate": 0,
      "location": null,
      "pricePerHour": "08:00-20:00",
      "operatingHours": {
        "open": "00:00",
        "close": "23:59"
      }
    }
  ],
  "count": 36
}
```

**Example:**
```bash
curl https://o2s68toqw0.execute-api.me-central-1.amazonaws.com/prod/zones
```

---

#### Get Zone Details

```http
GET /zones/{zoneId}
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| zoneId | string | Zone UUID |

**Response:**
```json
{
  "zoneId": "31978409-833d-44bd-a90e-d3e27e7fd5a6",
  "name": "Jumeirah Lakes Towers",
  "address": null,
  "city": null,
  "totalBays": 50,
  "occupiedBays": 23,
  "vacantBays": 27,
  "occupancyRate": 46,
  "location": { "lat": 25.0762, "lng": 55.1384 },
  "pricePerHour": 10,
  "operatingHours": { "open": "08:00", "close": "22:00" },
  "tenantId": "77a38d1d-2c63-41e3-a6e5-1c7a06cb1716",
  "createdAt": "2025-12-23T08:52:41.791Z"
}
```

**Example:**
```bash
curl https://o2s68toqw0.execute-api.me-central-1.amazonaws.com/prod/zones/31978409-833d-44bd-a90e-d3e27e7fd5a6
```

---

#### Create Zone

```http
POST /zones
```

**Request Body:**
```json
{
  "name": "New Parking Zone",
  "address": "123 Main Street",
  "city": "Dubai",
  "totalBays": 100,
  "pricePerHour": 15,
  "location": { "lat": 25.0762, "lng": 55.1384 },
  "operatingHours": { "open": "06:00", "close": "23:00" },
  "tenantId": "77a38d1d-2c63-41e3-a6e5-1c7a06cb1716"
}
```

**Response:**
```json
{
  "zoneId": "new-zone-uuid",
  "message": "Zone created successfully"
}
```

---

### Bays

#### List Bays in Zone

```http
GET /zones/{zoneId}/bays
```

**Response:**
```json
{
  "bays": [
    {
      "zoneId": "zone-001",
      "bayNumber": "A-001",
      "sensorId": "PSL01B-001",
      "status": "occupied",
      "lastChange": "2026-01-12T10:30:00Z",
      "occupiedSince": "2026-01-12T10:30:00Z",
      "currentDuration": 45,
      "batteryLevel": 95,
      "signalStrength": -72,
      "bayType": "standard",
      "location": { "lat": 25.0762, "lng": 55.1384 }
    }
  ],
  "summary": {
    "total": 50,
    "occupied": 23,
    "vacant": 25,
    "unknown": 2
  }
}
```

---

#### Get Bay Details

```http
GET /zones/{zoneId}/bays/{bayNumber}
```

**Response:**
```json
{
  "zoneId": "zone-001",
  "bayNumber": "A-001",
  "sensorId": "PSL01B-001",
  "status": "occupied",
  "lastChange": "2026-01-12T10:30:00Z",
  "occupiedSince": "2026-01-12T10:30:00Z",
  "currentDuration": 45,
  "batteryLevel": 95,
  "signalStrength": -72,
  "bayType": "standard",
  "location": { "lat": 25.0762, "lng": 55.1384 },
  "lastHeartbeat": "2026-01-12T10:45:00Z"
}
```

---

### Sensors

#### List All Sensors

```http
GET /sensors
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| zoneId | string | Filter by zone (optional) |

**Response:**
```json
{
  "sensors": [
    {
      "sensorId": "3511bb01-97b8-4ded-9c66-f1b213f89755",
      "model": "PSL01B",
      "zoneId": "zone-001",
      "bayNumber": "A-001",
      "status": "active",
      "batteryLevel": 95,
      "signalStrength": -72,
      "lastSeen": "2026-01-12T10:30:00Z",
      "firmwareVersion": "1.0.0",
      "installDate": "2025-12-01T00:00:00Z"
    }
  ],
  "count": 46
}
```

---

#### Register Sensor

```http
POST /sensors
```

**Request Body:**
```json
{
  "sensorId": "PSL01B-NEW",
  "zoneId": "zone-001",
  "bayNumber": "A-051",
  "model": "PSL01B",
  "firmwareVersion": "1.0.0"
}
```

**Response:**
```json
{
  "sensorId": "PSL01B-NEW",
  "message": "Sensor registered successfully"
}
```

---

### Events

#### Query Events

```http
GET /events
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| zoneId | string | Filter by zone (optional) |
| from | ISO8601 | Start time (optional) |
| to | ISO8601 | End time (optional) |
| eventType | string | ARRIVE or LEAVE (optional) |
| limit | number | Max results (default: 100) |

**Response:**
```json
{
  "events": [
    {
      "zoneId": "zone-001",
      "bayNumber": "A-001",
      "eventType": "ARRIVE",
      "timestamp": "2026-01-12T10:30:00Z",
      "duration": null,
      "revenue": null,
      "detectionMode": "dual"
    },
    {
      "zoneId": "zone-001",
      "bayNumber": "A-002",
      "eventType": "LEAVE",
      "timestamp": "2026-01-12T10:15:00Z",
      "duration": 45,
      "revenue": 7.50,
      "detectionMode": "dual"
    }
  ],
  "count": 2
}
```

---

#### Get Zone Events

```http
GET /zones/{zoneId}/events
```

Same query parameters and response as `/events`.

---

### Analytics

#### Get Occupancy Analytics

```http
GET /analytics/occupancy
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| zoneId | string | Filter by zone (optional) |
| period | string | day, week, or month |

**Response:**
```json
{
  "period": "day",
  "totalBays": 500,
  "occupiedBays": 234,
  "vacantBays": 266,
  "occupancyRate": 47,
  "zones": [
    {
      "zoneId": "zone-001",
      "name": "Zone A",
      "occupancyRate": 65
    }
  ]
}
```

---

## IoT Message Format

### Sensor Status Message

**Topic:** `visiondrive/parking/{zoneId}/{bayId}/status`

**Payload:**
```json
{
  "deviceId": "PSL01B-001",
  "status": "occupied",
  "battery": 95,
  "signal": -72,
  "mode": "dual",
  "ts": 1736678400000
}
```

| Field | Type | Description |
|-------|------|-------------|
| deviceId | string | Sensor ID |
| status | string | "occupied" or "vacant" |
| battery | number | Battery percentage (0-100) |
| signal | number | Signal strength in dBm |
| mode | string | Detection mode: "geomagnetic", "radar", or "dual" |
| ts | number | Unix timestamp (milliseconds) |

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid parameters |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

---

## Rate Limits

Currently no rate limits. For production:
- 1000 requests/minute per IP
- 10000 requests/hour per API key

---

## Examples

### cURL

```bash
# List zones
curl -s https://o2s68toqw0.execute-api.me-central-1.amazonaws.com/prod/zones | jq

# Get zone bays
curl -s https://o2s68toqw0.execute-api.me-central-1.amazonaws.com/prod/zones/ZONE_ID/bays | jq

# Query recent events
curl -s "https://o2s68toqw0.execute-api.me-central-1.amazonaws.com/prod/events?limit=10" | jq
```

### JavaScript/TypeScript

```typescript
const API_URL = 'https://o2s68toqw0.execute-api.me-central-1.amazonaws.com/prod';

// List zones
const response = await fetch(`${API_URL}/zones`);
const data = await response.json();
console.log(data.zones);

// Get zone details
const zone = await fetch(`${API_URL}/zones/${zoneId}`).then(r => r.json());

// Query events
const events = await fetch(`${API_URL}/events?limit=50&eventType=ARRIVE`)
  .then(r => r.json());
```

### Python

```python
import requests

API_URL = 'https://o2s68toqw0.execute-api.me-central-1.amazonaws.com/prod'

# List zones
response = requests.get(f'{API_URL}/zones')
zones = response.json()['zones']

# Get sensors
sensors = requests.get(f'{API_URL}/sensors').json()['sensors']
```
