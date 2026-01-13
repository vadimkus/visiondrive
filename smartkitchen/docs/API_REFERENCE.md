# Smart Kitchen API Reference

## VisionDrive Smart Kitchen - REST API Documentation

Complete API reference for the Smart Kitchen backend running on AWS Lambda in UAE region (me-central-1).

---

## Base URL

```
https://w7gfk5cka2.execute-api.me-central-1.amazonaws.com/prod
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## Endpoints Overview

| Resource | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| **Auth** | POST | `/auth/login` | User login |
| **Auth** | POST | `/auth/register` | Create user (admin only) |
| **Kitchens** | GET | `/kitchens` | List all kitchens |
| **Kitchens** | POST | `/kitchens` | Create kitchen |
| **Kitchens** | GET | `/kitchens/{id}` | Get kitchen details |
| **Kitchens** | PUT | `/kitchens/{id}` | Update kitchen |
| **Kitchens** | DELETE | `/kitchens/{id}` | Delete kitchen |
| **Equipment** | GET | `/kitchens/{id}/equipment` | List equipment |
| **Equipment** | POST | `/kitchens/{id}/equipment` | Add equipment |
| **Equipment** | PUT | `/kitchens/{id}/equipment/{equipmentId}` | Update equipment |
| **Equipment** | DELETE | `/kitchens/{id}/equipment/{equipmentId}` | Delete equipment |
| **Owners** | GET | `/kitchens/{id}/owners` | List owners |
| **Owners** | POST | `/kitchens/{id}/owners` | Add owner |
| **Owners** | PUT | `/kitchens/{id}/owners/{ownerId}` | Update owner |
| **Owners** | DELETE | `/kitchens/{id}/owners/{ownerId}` | Delete owner |
| **Sensors** | GET | `/sensors` | List all sensors |
| **Sensors** | POST | `/sensors` | Register sensor |
| **Sensors** | GET | `/sensors/{id}` | Get sensor details |
| **Sensors** | GET | `/sensors/{id}/current` | Get latest reading |
| **Sensors** | GET | `/sensors/{id}/readings` | Get reading history |
| **Alerts** | GET | `/alerts` | List active alerts |
| **Alerts** | PUT | `/alerts/{id}/acknowledge` | Acknowledge alert |
| **Analytics** | GET | `/analytics/daily` | Get daily statistics |

---

## Authentication

### POST /auth/login

Login and receive JWT token.

**Request:**
```json
{
  "email": "admin@kitchen.ae",
  "password": "Kitchen@2026"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "user-123",
    "email": "admin@kitchen.ae",
    "name": "Admin",
    "role": "ADMIN",
    "kitchenId": null
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error (401):**
```json
{
  "error": "Invalid email or password"
}
```

### POST /auth/register

Create a new user (requires admin key).

**Request:**
```json
{
  "email": "chef@restaurant.ae",
  "password": "SecurePass123",
  "name": "Chef Mohammed",
  "role": "CUSTOMER_ADMIN",
  "kitchenId": "kitchen-123",
  "adminKey": "VisionDrive2026!"
}
```

**Response (201):**
```json
{
  "success": true,
  "userId": "user-456",
  "message": "User created successfully"
}
```

---

## Kitchens

### GET /kitchens

List all kitchens.

**Response (200):**
```json
{
  "success": true,
  "kitchens": [
    {
      "id": "kitchen-123",
      "name": "Main Kitchen",
      "address": "Dubai Marina",
      "emirate": "Dubai",
      "tradeLicense": "DED-123456",
      "dmPermitNumber": "DM-2024-78901",
      "contactName": "Ahmed Hassan",
      "contactPhone": "+971-50-123-4567",
      "contactEmail": "ahmed@restaurant.ae",
      "sensorCount": 5,
      "ownerCount": 2,
      "activeAlerts": 0,
      "avgTemperature": 4.2,
      "status": "normal",
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

### POST /kitchens

Create a new kitchen.

**Request:**
```json
{
  "name": "Marina Restaurant Kitchen",
  "address": "Marina Walk, Building 5",
  "emirate": "Dubai",
  "tradeLicense": "DED-123456",
  "dmPermitNumber": "DM-2024-78901",
  "contactName": "Ahmed Hassan",
  "contactPhone": "+971-50-123-4567",
  "contactEmail": "ahmed@restaurant.ae"
}
```

**Response (201):**
```json
{
  "success": true,
  "kitchen": {
    "id": "kitchen-1705123456789",
    "name": "Marina Restaurant Kitchen"
  },
  "message": "Kitchen created successfully"
}
```

### GET /kitchens/{id}

Get kitchen details with equipment and owners.

**Response (200):**
```json
{
  "success": true,
  "kitchen": {
    "id": "kitchen-123",
    "name": "Main Kitchen",
    "address": "Dubai Marina",
    "emirate": "Dubai",
    "tradeLicense": "DED-123456",
    "dmPermitNumber": "DM-2024-78901",
    "contactName": "Ahmed Hassan",
    "contactPhone": "+971-50-123-4567",
    "contactEmail": "ahmed@restaurant.ae",
    "lat": 25.0657,
    "lng": 55.1413,
    "status": "normal",
    "sensorCount": 5,
    "ownerCount": 2,
    "activeAlerts": 0,
    "avgTemperature": 4.2,
    "minTemperature": 3.1,
    "maxTemperature": 5.8,
    "equipment": [...],
    "owners": [...],
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "2026-01-13T12:00:00Z"
  }
}
```

### PUT /kitchens/{id}

Update kitchen details.

**Request:**
```json
{
  "name": "Main Kitchen Updated",
  "contactPhone": "+971-50-999-8888"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Kitchen updated successfully"
}
```

### DELETE /kitchens/{id}

Delete kitchen and all associated equipment/owners.

**Response (200):**
```json
{
  "success": true,
  "message": "Kitchen deleted successfully"
}
```

---

## Equipment

### GET /kitchens/{id}/equipment

List all equipment for a kitchen.

**Response (200):**
```json
{
  "success": true,
  "equipment": [
    {
      "id": "equip-456",
      "kitchenId": "kitchen-123",
      "name": "Walk-in Fridge",
      "type": "FRIDGE",
      "serialNumber": "WIF-2024-001",
      "brand": "True",
      "model": "T-49HC",
      "sensorDevEui": "A84041B421864A12",
      "sensorImei": "352656100123456",
      "minTemp": 0,
      "maxTemp": 5,
      "isFreezer": false,
      "location": "Back storage area",
      "status": "ACTIVE",
      "lastReading": 4.2,
      "lastReadingAt": "2026-01-13T15:30:00Z",
      "batteryLevel": 85.5,
      "signalStrength": -75,
      "installDate": "2026-01-01T00:00:00Z",
      "lastMaintenanceAt": null,
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

### POST /kitchens/{id}/equipment

Add new equipment.

**Request:**
```json
{
  "name": "Walk-in Fridge",
  "type": "FRIDGE",
  "serialNumber": "WIF-2024-001",
  "brand": "True",
  "model": "T-49HC",
  "sensorDevEui": "A84041B421864A12",
  "sensorImei": "352656100123456",
  "minTemp": 0,
  "maxTemp": 5,
  "location": "Back storage area"
}
```

**Equipment Types:**
- `FRIDGE` - Refrigerator (0-5°C)
- `FREEZER` - Freezer (-25 to -15°C)
- `DISPLAY_FRIDGE` - Display fridge (0-5°C)
- `COLD_ROOM` - Walk-in cold room (0-5°C)
- `BLAST_CHILLER` - Blast chiller (-10 to 3°C)
- `OTHER` - Custom thresholds

**Response (201):**
```json
{
  "success": true,
  "equipment": {
    "id": "equip-1705123456789",
    "name": "Walk-in Fridge",
    "type": "FRIDGE",
    "serialNumber": "WIF-2024-001"
  },
  "message": "Equipment added successfully"
}
```

**Error (400) - Duplicate Serial:**
```json
{
  "success": false,
  "error": "Serial number already exists"
}
```

**Error (400) - Duplicate DevEUI:**
```json
{
  "success": false,
  "error": "Sensor DevEUI already registered"
}
```

### PUT /kitchens/{id}/equipment/{equipmentId}

Update equipment details.

**Request:**
```json
{
  "name": "Walk-in Fridge #1",
  "minTemp": -2,
  "maxTemp": 4,
  "status": "MAINTENANCE"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Equipment updated successfully"
}
```

### DELETE /kitchens/{id}/equipment/{equipmentId}

Delete equipment.

**Response (200):**
```json
{
  "success": true,
  "message": "Equipment deleted successfully"
}
```

---

## Owners

### GET /kitchens/{id}/owners

List all owners for a kitchen.

**Response (200):**
```json
{
  "success": true,
  "owners": [
    {
      "id": "owner-789",
      "kitchenId": "kitchen-123",
      "name": "Sara Ali",
      "email": "sara@restaurant.ae",
      "phone": "+971-50-234-5678",
      "emiratesId": "784-1990-1234567-1",
      "isPrimary": true,
      "canManage": true,
      "canViewReports": true,
      "notifyEmail": true,
      "notifyWhatsApp": true,
      "notifyOnAlert": true,
      "notifyDailyReport": false,
      "hasPortalAccess": false,
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

### POST /kitchens/{id}/owners

Add a new owner.

**Request:**
```json
{
  "name": "Sara Ali",
  "email": "sara@restaurant.ae",
  "phone": "+971-50-234-5678",
  "emiratesId": "784-1990-1234567-1",
  "isPrimary": false,
  "canManage": true,
  "canViewReports": true,
  "notifyEmail": true,
  "notifyWhatsApp": true,
  "notifyOnAlert": true,
  "notifyDailyReport": false
}
```

**Response (201):**
```json
{
  "success": true,
  "owner": {
    "id": "owner-1705123456789",
    "name": "Sara Ali",
    "email": "sara@restaurant.ae",
    "isPrimary": false,
    "hasPortalAccess": false
  },
  "message": "Owner added successfully"
}
```

**Error (400) - Duplicate Email:**
```json
{
  "success": false,
  "error": "Owner with this email already exists for this kitchen"
}
```

### PUT /kitchens/{id}/owners/{ownerId}

Update owner details.

**Request:**
```json
{
  "isPrimary": true,
  "canManage": true,
  "notifyWhatsApp": false
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Owner updated successfully"
}
```

### DELETE /kitchens/{id}/owners/{ownerId}

Remove an owner.

**Response (200):**
```json
{
  "success": true,
  "message": "Owner removed successfully"
}
```

**Error (400) - Last Owner:**
```json
{
  "success": false,
  "error": "Cannot delete the last owner. Add another owner first."
}
```

---

## Sensors (Legacy)

These endpoints maintain backward compatibility with the original sensor-based API.

### GET /sensors

List all sensors.

### GET /sensors/{id}

Get sensor details.

### POST /sensors

Register a new sensor.

### GET /sensors/{id}/current

Get latest reading for a sensor.

### GET /sensors/{id}/readings

Get reading history.

**Query Parameters:**
- `hours` (optional, default: 24) - Number of hours of history

---

## Alerts

### GET /alerts

List active alerts.

**Response (200):**
```json
{
  "alerts": [
    {
      "PK": "KITCHEN#kitchen-123",
      "SK": "ALERT#2026-01-13T10:30:00Z",
      "deviceId": "sensor-001",
      "alertType": "HIGH_TEMP",
      "temperature": 9.2,
      "threshold": 8,
      "acknowledged": false
    }
  ],
  "count": 1
}
```

### PUT /alerts/{id}/acknowledge

Acknowledge an alert.

**Path Parameter:**
- `id` - Format: `kitchenId:timestamp` (e.g., `kitchen-123:2026-01-13T10:30:00Z`)

**Response (200):**
```json
{
  "message": "Alert acknowledged"
}
```

---

## Analytics

### GET /analytics/daily

Get daily statistics for all sensors.

**Response (200):**
```json
{
  "stats": [
    {
      "deviceId": "sensor-001",
      "kitchenId": "kitchen-123",
      "avgTemp": 4.2,
      "maxTemp": 5.8,
      "minTemp": 3.1,
      "readingCount": 288
    }
  ],
  "count": 1
}
```

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "success": false,
  "error": "Name and address are required"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid email or password"
}
```

### 403 Forbidden
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Kitchen not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Error details..."
}
```

---

## CORS Headers

All responses include these headers:

```
Content-Type: application/json
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS
```

---

## Rate Limits

| Endpoint | Rate Limit |
|----------|------------|
| All endpoints | 10,000 requests/second (API Gateway default) |

---

## SDK Examples

### JavaScript/TypeScript

```typescript
const API_URL = 'https://w7gfk5cka2.execute-api.me-central-1.amazonaws.com/prod'

// List kitchens
const response = await fetch(`${API_URL}/kitchens`)
const data = await response.json()

// Create kitchen
const response = await fetch(`${API_URL}/kitchens`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'New Kitchen',
    address: 'Dubai Marina',
    emirate: 'Dubai'
  })
})
```

### cURL

```bash
# List kitchens
curl https://w7gfk5cka2.execute-api.me-central-1.amazonaws.com/prod/kitchens

# Create kitchen
curl -X POST https://w7gfk5cka2.execute-api.me-central-1.amazonaws.com/prod/kitchens \
  -H "Content-Type: application/json" \
  -d '{"name":"New Kitchen","address":"Dubai Marina","emirate":"Dubai"}'
```

---

## Related Documentation

- [KITCHEN_MANAGEMENT.md](KITCHEN_MANAGEMENT.md) - Kitchen, Equipment, Owners guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [AWS_SETUP.md](AWS_SETUP.md) - AWS configuration
