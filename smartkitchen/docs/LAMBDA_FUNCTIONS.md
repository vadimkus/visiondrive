# Lambda Functions Reference

## VisionDrive Smart Kitchen - AWS Lambda Documentation

---

## Overview

All Smart Kitchen Lambda functions run in the **UAE region (me-central-1)** using **Node.js 20.x** runtime.

| Function | Runtime | Memory | Timeout | Purpose |
|----------|---------|--------|---------|---------|
| `smartkitchen-data-ingestion` | Node.js 20.x | 256 MB | 30s | Process sensor data |
| `smartkitchen-alerts` | Node.js 20.x | 256 MB | 30s | Temperature alerts |
| `smartkitchen-api` | Node.js 20.x | 256 MB | 30s | REST API handler |
| `smartkitchen-analytics` | Node.js 20.x | 512 MB | 5min | Analytics reports |

> **Note:** Runtime upgraded from Node.js 18.x to 20.x on January 13, 2026 (Node.js 18.x EOL).

---

## 1. Data Ingestion Lambda

**Name:** `smartkitchen-data-ingestion`

**Trigger:** AWS IoT Core Rules Engine

**Purpose:** Processes incoming sensor data from Dragino PS-NB-GE sensors, converts 4-20mA readings to temperature, and stores in DynamoDB.

### Input (from IoT Rule)

```json
{
  "deviceId": "sensor-001",
  "kitchenId": "kitchen-001",
  "raw_ma": 8.5,
  "battery": 3.52,
  "voltage": 12.1,
  "received_at": 1736678400000
}
```

### Processing

1. Convert 4-20mA to temperature using probe profile
2. Store reading in `VisionDrive-SensorReadings` table
3. Update device last seen timestamp in `VisionDrive-Devices`

### Environment Variables

```bash
SENSOR_READINGS_TABLE=VisionDrive-SensorReadings
DEVICES_TABLE=VisionDrive-Devices
```

### Temperature Conversion Profiles

| Probe Type | mA Range | Temperature Range |
|------------|----------|-------------------|
| `fridge` | 4-20 mA | 0°C to 10°C |
| `freezer` | 4-20 mA | -30°C to 0°C |
| `general` | 4-20 mA | -40°C to 85°C |
| `ambient` | 4-20 mA | 15°C to 35°C |

### Code Location

```
smartkitchen/infrastructure/lambda/data-ingestion/index.js
```

---

## 2. Alerts Lambda

**Name:** `smartkitchen-alerts`

**Trigger:** AWS IoT Core Rules Engine (threshold breach)

**Purpose:** Evaluates temperature against DM compliance thresholds and sends SNS notifications for violations.

### Input

```json
{
  "deviceId": "sensor-001",
  "kitchenId": "kitchen-001",
  "raw_ma": 15.5,
  "timestamp": "1736678400000"
}
```

### Alert Types

| Type | Condition | Severity |
|------|-----------|----------|
| `HIGH_TEMP` | Above max threshold | Critical |
| `LOW_TEMP` | Below min threshold | Critical |
| `DANGER_ZONE` | 5°C - 60°C | Danger |

### Processing

1. Get device thresholds from DynamoDB
2. Convert raw_ma to temperature
3. Check against min/max thresholds
4. Create alert in `VisionDrive-Alerts` table
5. Send SNS notification

### Environment Variables

```bash
DEVICES_TABLE=VisionDrive-Devices
ALERTS_TABLE=VisionDrive-Alerts
ALERT_TOPIC_ARN=arn:aws:sns:me-central-1:ACCOUNT:SmartKitchen-Alerts
```

### SNS Message Format

```
🔥 TEMPERATURE ALERT - VisionDrive Smart Kitchen

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ Alert Type: HIGH_TEMP

📍 Location: Walk-in Fridge
🏪 Kitchen: Main Kitchen
🔌 Device: sensor-001

🌡️ Current Temperature: 12.5°C
📏 Threshold: 8°C

⏰ Time: 12/01/2026, 2:30:00 PM (Dubai)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 ACTION REQUIRED: Temperature is TOO HIGH - check refrigeration!
```

### Code Location

```
smartkitchen/infrastructure/lambda/alerts/index.js
```

---

## 3. API Handler Lambda

**Name:** `smartkitchen-api`

**Trigger:** API Gateway

**Purpose:** Handles all REST API requests for the dashboard.

### Endpoints

```
POST   /auth/login          - User login (returns JWT)
POST   /auth/register       - Create user (requires adminKey)

GET    /kitchens            - List kitchens
GET    /kitchens/{id}       - Get kitchen details
POST   /kitchens            - Create kitchen

GET    /sensors             - List sensors
GET    /sensors/{id}        - Get sensor details
POST   /sensors             - Register sensor

GET    /sensors/{id}/current   - Get latest reading
GET    /sensors/{id}/readings  - Get readings history

GET    /alerts              - List alerts
PUT    /alerts/{id}/acknowledge - Acknowledge alert

GET    /analytics/daily     - Daily statistics
```

### Environment Variables

```bash
SENSOR_READINGS_TABLE=VisionDrive-SensorReadings
DEVICES_TABLE=VisionDrive-Devices
ALERTS_TABLE=VisionDrive-Alerts
JWT_SECRET=smartkitchen-uae-secret-2026
```

### Authentication

Uses JWT tokens with bcryptjs for password hashing.

```javascript
// Login response
{
  "success": true,
  "user": {
    "id": "user-123",
    "email": "admin@kitchen.ae",
    "name": "Kitchen Admin",
    "role": "ADMIN"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Code Location

```
smartkitchen/infrastructure/lambda/api/index.js
```

### Dependencies

```json
{
  "@aws-sdk/client-dynamodb": "^3.966.0",
  "@aws-sdk/util-dynamodb": "^3.966.0",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.0"
}
```

---

## 4. Analytics Lambda

**Name:** `smartkitchen-analytics`

**Trigger:** API Gateway / CloudWatch Events (scheduled)

**Purpose:** Generates daily/weekly analytics reports.

### Features

- Daily temperature statistics per sensor
- Hourly averages for kitchen
- Temperature trend analysis
- Compliance rate calculation

### Environment Variables

```bash
SENSOR_READINGS_TABLE=VisionDrive-SensorReadings
DEVICES_TABLE=VisionDrive-Devices
```

### Code Location

```
smartkitchen/infrastructure/lambda/analytics/index.js
```

---

## Deployment

### Update Function Code

```bash
# Package function
cd smartkitchen/infrastructure/lambda/data-ingestion
npm install --omit=dev
zip -r /tmp/data-ingestion.zip . -x "*.git*"

# Deploy
aws lambda update-function-code \
  --function-name smartkitchen-data-ingestion \
  --zip-file fileb:///tmp/data-ingestion.zip \
  --region me-central-1
```

### Update Runtime

```bash
aws lambda update-function-configuration \
  --function-name smartkitchen-data-ingestion \
  --runtime nodejs20.x \
  --region me-central-1
```

### Update Environment Variables

```bash
aws lambda update-function-configuration \
  --function-name smartkitchen-api \
  --environment "Variables={DEVICES_TABLE=VisionDrive-Devices,ALERTS_TABLE=VisionDrive-Alerts}" \
  --region me-central-1
```

---

## Monitoring

### CloudWatch Logs

```bash
# View logs
aws logs tail /aws/lambda/smartkitchen-api --follow --region me-central-1

# Search for errors
aws logs filter-log-events \
  --log-group-name /aws/lambda/smartkitchen-api \
  --filter-pattern "ERROR" \
  --region me-central-1
```

### CloudWatch Metrics

| Metric | Namespace | Description |
|--------|-----------|-------------|
| Invocations | AWS/Lambda | Function call count |
| Duration | AWS/Lambda | Execution time |
| Errors | AWS/Lambda | Error count |
| Throttles | AWS/Lambda | Throttled invocations |

### Create Alarm

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name "SmartKitchen-API-Errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --dimensions Name=FunctionName,Value=smartkitchen-api \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --alarm-actions arn:aws:sns:me-central-1:ACCOUNT:SmartKitchen-Alerts \
  --region me-central-1
```

---

## IAM Role

**Role Name:** `SmartKitchen-LambdaRole`

**Permissions:**
- `AWSLambdaBasicExecutionRole` - CloudWatch Logs
- `AmazonDynamoDBFullAccess` - DynamoDB operations
- `AmazonSNSFullAccess` - SNS notifications

---

## Troubleshooting

### Function Not Receiving Events

1. Check IoT Rule is enabled
2. Verify Lambda permission for IoT
3. Check CloudWatch Logs for errors

### Timeout Errors

1. Increase timeout in function configuration
2. Check DynamoDB capacity
3. Optimize database queries

### Permission Errors

1. Verify IAM role has required policies
2. Check resource ARNs are correct
3. Verify function can access DynamoDB tables

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-13 | 2.0 | Upgraded all functions to Node.js 20.x |
| 2026-01-12 | 1.0 | Initial deployment with Node.js 18.x |
