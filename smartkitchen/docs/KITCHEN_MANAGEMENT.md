# Kitchen Management Guide

## VisionDrive Smart Kitchen - Admin Portal

This guide covers how to manage kitchens, equipment, and owners in the Smart Kitchen portal.

---

## Table of Contents

1. [Kitchens](#1-kitchens)
2. [Equipment](#2-equipment)
3. [Owners](#3-owners)
4. [DynamoDB Schema](#4-dynamodb-schema)
5. [API Examples](#5-api-examples)

---

## 1. Kitchens

### 1.1 Overview

Kitchens represent physical kitchen locations (restaurants, hotels, cloud kitchens, etc.) that you want to monitor for temperature compliance.

### 1.2 Kitchen Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | ✅ | Kitchen name (e.g., "Main Kitchen") |
| `address` | String | ✅ | Physical address |
| `emirate` | Enum | ✅ | Dubai, Abu Dhabi, Sharjah, Ajman, Fujairah, Ras Al Khaimah, Umm Al Quwain |
| `tradeLicense` | String | - | Trade license number |
| `dmPermitNumber` | String | - | Dubai Municipality food permit number |
| `contactName` | String | - | Manager/contact person name |
| `contactPhone` | String | - | Contact phone (+971-XX-XXX-XXXX) |
| `contactEmail` | String | - | Contact email |
| `lat` | Float | - | Latitude (for map) |
| `lng` | Float | - | Longitude (for map) |

### 1.3 Kitchen Status

| Status | Description | Trigger |
|--------|-------------|---------|
| 🟢 **Normal** | All equipment within safe range | No active alerts |
| 🟡 **Warning** | Some equipment out of range | 1-2 active alerts |
| 🔴 **Critical** | Multiple violations | 3+ active alerts |

### 1.4 Creating a Kitchen

**Portal:** Go to `/portal/smart-kitchen/kitchens` → Click "Add Kitchen"

**API:**
```bash
curl -X POST https://w7gfk5cka2.execute-api.me-central-1.amazonaws.com/prod/kitchens \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Marina Restaurant Kitchen",
    "address": "Marina Walk, Building 5, Ground Floor",
    "emirate": "Dubai",
    "tradeLicense": "DED-123456",
    "dmPermitNumber": "DM-2024-78901",
    "contactName": "Ahmed Hassan",
    "contactPhone": "+971-50-123-4567",
    "contactEmail": "ahmed@restaurant.ae"
  }'
```

**Response:**
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

---

## 2. Equipment

### 2.1 Overview

Equipment represents refrigeration units (fridges, freezers, cold rooms) that need temperature monitoring. Each piece of equipment can have a Dragino PS-NB-GE sensor attached.

### 2.2 Equipment Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | ✅ | Equipment name (e.g., "Walk-in Fridge 1") |
| `type` | Enum | ✅ | FRIDGE, FREEZER, DISPLAY_FRIDGE, COLD_ROOM, BLAST_CHILLER, OTHER |
| `serialNumber` | String | - | Equipment serial number |
| `brand` | String | - | Equipment brand |
| `model` | String | - | Equipment model |
| `sensorDevEui` | String | - | Dragino sensor DevEUI (16-char hex) |
| `sensorImei` | String | - | Sensor IMEI (for NB-IoT) |
| `minTemp` | Float | ✅ | Minimum safe temperature (°C) |
| `maxTemp` | Float | ✅ | Maximum safe temperature (°C) |
| `location` | String | - | Location within kitchen (e.g., "Back storage area") |

### 2.3 Equipment Types & Thresholds

| Type | Default Min | Default Max | DM Requirement |
|------|-------------|-------------|----------------|
| FRIDGE | 0°C | 5°C | 0°C to 5°C |
| FREEZER | -25°C | -15°C | ≤ -18°C |
| DISPLAY_FRIDGE | 0°C | 5°C | 0°C to 5°C |
| COLD_ROOM | 0°C | 5°C | 0°C to 5°C |
| BLAST_CHILLER | -10°C | 3°C | -10°C to 3°C |
| OTHER | 0°C | 5°C | User-defined |

### 2.4 Equipment Status

| Status | Description |
|--------|-------------|
| 🟢 **ACTIVE** | Working normally |
| 🟡 **MAINTENANCE** | Under maintenance |
| 🔴 **FAULT** | Equipment fault detected |
| ⚫ **INACTIVE** | Disabled/removed |

### 2.5 Adding Equipment

**Portal:** Go to Kitchen Detail → Equipment Tab → "Add Equipment"

**API:**
```bash
curl -X POST https://w7gfk5cka2.execute-api.me-central-1.amazonaws.com/prod/kitchens/{kitchenId}/equipment \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Walk-in Fridge",
    "type": "FRIDGE",
    "serialNumber": "WIF-2024-001",
    "brand": "True",
    "model": "T-49HC",
    "sensorDevEui": "A84041B421864A12",
    "location": "Back storage area",
    "minTemp": 0,
    "maxTemp": 5
  }'
```

**Response:**
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

### 2.6 Sensor Registration

When you add the `sensorDevEui`, the system will:

1. **Validate uniqueness** - No duplicate DevEUIs allowed
2. **Create IoT Thing** - Register in AWS IoT Core (automatically by IoT rules)
3. **Link readings** - Temperature readings from this DevEUI will update the equipment's `lastReading`

---

## 3. Owners

### 3.1 Overview

Owners are people who can access the kitchen portal and receive notifications. Each kitchen can have multiple owners with different permission levels.

### 3.2 Owner Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | ✅ | Full name |
| `email` | String | ✅ | Email address (unique per kitchen) |
| `phone` | String | - | Phone number |
| `emiratesId` | String | - | Emirates ID (784-XXXX-XXXXXXX-X) |
| `isPrimary` | Boolean | - | Primary owner flag |
| `canManage` | Boolean | - | Can add/edit equipment |
| `canViewReports` | Boolean | - | Can view reports |
| `notifyEmail` | Boolean | - | Receive email notifications |
| `notifyWhatsApp` | Boolean | - | Receive WhatsApp alerts |
| `notifyOnAlert` | Boolean | - | Receive temperature alerts |
| `notifyDailyReport` | Boolean | - | Receive daily summary |

### 3.3 Owner Roles

| Role | Primary | Can Manage | Can View Reports |
|------|---------|------------|------------------|
| **Primary Owner** | ✅ | ✅ | ✅ |
| **Manager** | ❌ | ✅ | ✅ |
| **Analyst** | ❌ | ❌ | ✅ |
| **Viewer** | ❌ | ❌ | ❌ |

### 3.4 Adding an Owner

**Portal:** Go to Kitchen Detail → Owners Tab → "Add Owner"

**API:**
```bash
curl -X POST https://w7gfk5cka2.execute-api.me-central-1.amazonaws.com/prod/kitchens/{kitchenId}/owners \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sara Ali",
    "email": "sara@restaurant.ae",
    "phone": "+971-50-234-5678",
    "isPrimary": false,
    "canManage": true,
    "canViewReports": true,
    "notifyEmail": true,
    "notifyWhatsApp": true,
    "notifyOnAlert": true,
    "notifyDailyReport": false
  }'
```

**Response:**
```json
{
  "success": true,
  "owner": {
    "id": "owner-1705123456789",
    "name": "Sara Ali",
    "email": "sara@restaurant.ae",
    "isPrimary": false
  },
  "message": "Owner added successfully"
}
```

### 3.5 Primary Owner Rules

1. First owner added is automatically primary
2. Only one primary owner per kitchen
3. Setting a new owner as primary removes primary from others
4. Cannot delete the last owner

---

## 4. DynamoDB Schema

### 4.1 Table: VisionDrive-Devices

All data stored in single table with composite keys.

#### Kitchen Record
```json
{
  "PK": "KITCHEN#kitchen-123",
  "SK": "METADATA",
  "GSI1PK": "KITCHENS",
  "GSI1SK": "kitchen-123",
  "kitchenId": "kitchen-123",
  "name": "Main Kitchen",
  "address": "Dubai Marina",
  "emirate": "Dubai",
  "tradeLicense": "DED-123456",
  "dmPermitNumber": "DM-2024-78901",
  "contactName": "Ahmed Hassan",
  "contactPhone": "+971-50-123-4567",
  "equipmentCount": 5,
  "ownerCount": 2,
  "status": "ACTIVE",
  "createdAt": "2026-01-13T12:00:00Z"
}
```

#### Equipment Record
```json
{
  "PK": "KITCHEN#kitchen-123",
  "SK": "EQUIPMENT#equip-456",
  "GSI1PK": "DEVEUI#A84041B421864A12",
  "GSI1SK": "2026-01-13T12:00:00Z",
  "equipmentId": "equip-456",
  "kitchenId": "kitchen-123",
  "name": "Walk-in Fridge",
  "type": "FRIDGE",
  "serialNumber": "WIF-2024-001",
  "sensorDevEui": "A84041B421864A12",
  "minTemp": 0,
  "maxTemp": 5,
  "lastReading": 4.2,
  "lastReadingAt": "2026-01-13T15:30:00Z",
  "status": "ACTIVE"
}
```

#### Owner Record
```json
{
  "PK": "KITCHEN#kitchen-123",
  "SK": "OWNER#owner-789",
  "GSI1PK": "EMAIL#sara@restaurant.ae",
  "GSI1SK": "kitchen-123",
  "ownerId": "owner-789",
  "kitchenId": "kitchen-123",
  "name": "Sara Ali",
  "email": "sara@restaurant.ae",
  "phone": "+971-50-234-5678",
  "isPrimary": false,
  "canManage": true,
  "notifyEmail": true,
  "notifyWhatsApp": true
}
```

### 4.2 Access Patterns

| Pattern | Key Condition |
|---------|---------------|
| Get kitchen | PK = "KITCHEN#{id}", SK = "METADATA" |
| List all kitchens | GSI1PK = "KITCHENS" |
| Get kitchen equipment | PK = "KITCHEN#{id}", SK begins_with "EQUIPMENT#" |
| Get kitchen owners | PK = "KITCHEN#{id}", SK begins_with "OWNER#" |
| Find by DevEUI | GSI1PK = "DEVEUI#{devEui}" |
| Find by email | GSI1PK = "EMAIL#{email}" |

---

## 5. API Examples

### 5.1 List All Kitchens

```bash
curl https://w7gfk5cka2.execute-api.me-central-1.amazonaws.com/prod/kitchens
```

### 5.2 Get Kitchen with Equipment and Owners

```bash
curl https://w7gfk5cka2.execute-api.me-central-1.amazonaws.com/prod/kitchens/kitchen-123
```

**Response:**
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
    "status": "normal",
    "sensorCount": 5,
    "ownerCount": 2,
    "activeAlerts": 0,
    "avgTemperature": 4.2,
    "minTemperature": 3.1,
    "maxTemperature": 5.8,
    "equipment": [
      {
        "id": "equip-456",
        "name": "Walk-in Fridge",
        "type": "FRIDGE",
        "serialNumber": "WIF-2024-001",
        "sensorDevEui": "A84041B421864A12",
        "minTemp": 0,
        "maxTemp": 5,
        "lastReading": 4.2,
        "lastReadingAt": "2026-01-13T15:30:00Z",
        "status": "ACTIVE"
      }
    ],
    "owners": [
      {
        "id": "owner-789",
        "name": "Sara Ali",
        "email": "sara@restaurant.ae",
        "isPrimary": false,
        "canManage": true
      }
    ]
  }
}
```

### 5.3 Update Equipment

```bash
curl -X PUT https://w7gfk5cka2.execute-api.me-central-1.amazonaws.com/prod/kitchens/kitchen-123/equipment/equip-456 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Walk-in Fridge #1",
    "minTemp": -2,
    "maxTemp": 4
  }'
```

### 5.4 Delete Owner

```bash
curl -X DELETE https://w7gfk5cka2.execute-api.me-central-1.amazonaws.com/prod/kitchens/kitchen-123/owners/owner-789
```

---

## Troubleshooting

### Serial Number Already Exists
- Serial numbers must be unique across all kitchens
- Check for typos or duplicate entries

### Sensor DevEUI Already Registered
- Each sensor can only be registered to one equipment
- Remove the DevEUI from existing equipment first

### Cannot Delete Last Owner
- A kitchen must have at least one owner
- Add another owner before deleting

### Temperature Not Updating
- Check sensor DevEUI is correctly registered
- Verify sensor is online and transmitting
- Check AWS IoT Core connection

---

## Related Documentation

- [SENSOR_CONFIG.md](SENSOR_CONFIG.md) - Configure Dragino sensors
- [API_REFERENCE.md](API_REFERENCE.md) - Full API documentation
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
