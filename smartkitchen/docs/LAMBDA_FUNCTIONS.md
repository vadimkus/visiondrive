# Lambda Functions Reference

## VisionDrive Smart Kitchen - AWS Lambda Functions

All Lambda functions run in the UAE region (me-central-1) on Node.js 22.x runtime.

---

## Functions Overview

| Function | Purpose | Trigger | Runtime |
|----------|---------|---------|---------|
| `smartkitchen-api` | REST API handler | API Gateway | Node.js 22.x |
| `smartkitchen-data-ingestion` | Process sensor data | IoT Rule | Node.js 22.x |
| `smartkitchen-alerts` | Alert processing | IoT Rule / DynamoDB Stream | Node.js 22.x |
| `smartkitchen-analytics` | Statistics & reports | CloudWatch Events | Node.js 22.x |

---

## 1. smartkitchen-api

### Overview

Main REST API handler for the Smart Kitchen portal. Handles all CRUD operations for kitchens, equipment, owners, sensors, and alerts.

### Configuration

```
Function Name:  smartkitchen-api
Runtime:        Node.js 22.x
Memory:         256 MB
Timeout:        30 seconds
Handler:        index.handler
```

### Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `DEVICES_TABLE` | VisionDrive-Devices | Main data table |
| `SENSOR_READINGS_TABLE` | VisionDrive-SensorReadings | Time-series data |
| `ALERTS_TABLE` | VisionDrive-Alerts | Alert records |
| `JWT_SECRET` | (configured) | JWT signing secret |

### API Routes

#### Authentication
```
POST /auth/login          → login()
POST /auth/register       → createUser()
```

#### Kitchens
```
GET    /kitchens                              → listKitchens()
POST   /kitchens                              → createKitchen()
GET    /kitchens/{id}                         → getKitchen()
PUT    /kitchens/{id}                         → updateKitchen()
DELETE /kitchens/{id}                         → deleteKitchen()
```

#### Equipment
```
GET    /kitchens/{id}/equipment               → listEquipment()
POST   /kitchens/{id}/equipment               → createEquipment()
PUT    /kitchens/{id}/equipment/{equipmentId} → updateEquipment()
DELETE /kitchens/{id}/equipment/{equipmentId} → deleteEquipment()
```

#### Owners
```
GET    /kitchens/{id}/owners                  → listOwners()
POST   /kitchens/{id}/owners                  → createOwner()
PUT    /kitchens/{id}/owners/{ownerId}        → updateOwner()
DELETE /kitchens/{id}/owners/{ownerId}        → deleteOwner()
```

#### Sensors (Legacy)
```
GET    /sensors                               → listSensors()
POST   /sensors                               → registerSensor()
GET    /sensors/{id}                          → getSensor()
GET    /sensors/{id}/current                  → getCurrentReading()
GET    /sensors/{id}/readings                 → getSensorReadings()
```

#### Alerts
```
GET    /alerts                                → listAlerts()
PUT    /alerts/{id}/acknowledge               → acknowledgeAlert()
```

#### Analytics
```
GET    /analytics/daily                       → getDailyStats()
```

### Source Code Location

```
smartkitchen/infrastructure/lambda/api/index.js
```

### Dependencies

```json
{
  "@aws-sdk/client-dynamodb": "^3.x",
  "@aws-sdk/util-dynamodb": "^3.x",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.0"
}
```

### Deployment

```bash
cd smartkitchen/infrastructure/lambda/api

# Install dependencies
npm install

# Create deployment package
zip -r function.zip index.js package.json node_modules/

# Deploy to AWS
aws lambda update-function-code \
  --function-name smartkitchen-api \
  --zip-file fileb://function.zip \
  --region me-central-1
```

---

## 2. smartkitchen-data-ingestion

### Overview

Processes incoming sensor data from AWS IoT Core, converts raw values to temperature, and stores in DynamoDB.

### Configuration

```
Function Name:  smartkitchen-data-ingestion
Runtime:        Node.js 22.x
Memory:         256 MB
Timeout:        30 seconds
Handler:        index.handler
```

### Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `SENSOR_READINGS_TABLE` | VisionDrive-SensorReadings | Time-series storage |
| `DEVICES_TABLE` | VisionDrive-Devices | Device metadata |

### Trigger

IoT Rule: `SmartKitchen_DataIngestion`

```sql
SELECT 
  topic(3) as deviceId, 
  topic(2) as kitchenId, 
  IDC_mA as raw_ma, 
  Battery as battery, 
  timestamp() as received_at 
FROM 'visiondrive/+/+/temperature'
```

### Processing Logic

1. Receive raw sensor data (4-20mA)
2. Convert mA to temperature: `temp = (mA - 4) / 16 * (maxTemp - minTemp) + minTemp`
3. Look up equipment by DevEUI to get kitchen context
4. Store reading in DynamoDB
5. Update equipment's `lastReading` and `lastReadingAt`

### Source Code Location

```
smartkitchen/infrastructure/lambda/data-ingestion/index.js
```

---

## 3. smartkitchen-alerts

### Overview

Processes temperature readings and generates alerts when thresholds are exceeded.

### Configuration

```
Function Name:  smartkitchen-alerts
Runtime:        Node.js 22.x
Memory:         256 MB
Timeout:        30 seconds
Handler:        index.handler
```

### Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `DEVICES_TABLE` | VisionDrive-Devices | Device thresholds |
| `ALERTS_TABLE` | VisionDrive-Alerts | Alert storage |
| `ALERT_TOPIC_ARN` | arn:aws:sns:... | SNS topic for notifications |

### Trigger

IoT Rule: `SmartKitchen_Alerts`

```sql
SELECT 
  topic(3) as deviceId, 
  topic(2) as kitchenId, 
  IDC_mA as raw_ma, 
  timestamp() as timestamp 
FROM 'visiondrive/+/+/temperature' 
WHERE IDC_mA > 15 OR IDC_mA < 5
```

### Alert Types

| Type | Trigger | Severity |
|------|---------|----------|
| `HIGH_TEMP` | Temperature > max threshold | Warning/Critical |
| `LOW_TEMP` | Temperature < min threshold | Warning |
| `DANGER_ZONE` | Temperature 5°C - 60°C | Critical |
| `SENSOR_OFFLINE` | No reading for 30 min | Warning |
| `LOW_BATTERY` | Battery < 20% | Info |

### Processing Logic

1. Receive sensor reading
2. Get equipment thresholds from DynamoDB
3. Compare temperature against thresholds
4. Create alert record in DynamoDB
5. Send SNS notification
6. (Optional) Send WhatsApp via Business API

### Source Code Location

```
smartkitchen/infrastructure/lambda/alerts/index.js
smartkitchen/infrastructure/lambda/alerts/whatsapp.js
```

---

## 4. smartkitchen-analytics

### Overview

Generates statistics and reports for temperature data.

### Configuration

```
Function Name:  smartkitchen-analytics
Runtime:        Node.js 22.x
Memory:         512 MB
Timeout:        5 minutes
Handler:        index.handler
```

### Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `SENSOR_READINGS_TABLE` | VisionDrive-SensorReadings | Time-series data |
| `DEVICES_TABLE` | VisionDrive-Devices | Device metadata |

### Trigger

CloudWatch Events rule: Daily at 00:00 UTC

### Processing Logic

1. Query all sensors
2. For each sensor, calculate:
   - Average temperature
   - Min/Max temperature
   - Compliance rate
   - Alert count
3. Update kitchen metadata with aggregated stats
4. Generate daily report (optional S3 export)

### Source Code Location

```
smartkitchen/infrastructure/lambda/analytics/index.js
```

---

## DynamoDB Access Patterns

### VisionDrive-Devices Table

| Pattern | Key Condition | Use Case |
|---------|---------------|----------|
| Get kitchen | PK = "KITCHEN#{id}", SK = "METADATA" | Kitchen details |
| List all kitchens | Scan with filter | Dashboard |
| Get equipment | PK = "KITCHEN#{id}", SK begins_with "EQUIPMENT#" | Equipment list |
| Get owners | PK = "KITCHEN#{id}", SK begins_with "OWNER#" | Owner list |
| Find by DevEUI | GSI1PK = "DEVEUI#{devEui}" | Sensor lookup |
| Get user | PK = "USER#{email}", SK = "PROFILE" | Authentication |

### VisionDrive-SensorReadings Table

| Pattern | Key Condition | Use Case |
|---------|---------------|----------|
| Latest reading | PK = deviceId, ScanIndexForward = false, Limit = 1 | Current temperature |
| Time range | PK = deviceId, SK > timestamp | History chart |

### VisionDrive-Alerts Table

| Pattern | Key Condition | Use Case |
|---------|---------------|----------|
| Active alerts | GSI1PK = "ALERT#ACTIVE" | Alert list |
| Kitchen alerts | PK = "KITCHEN#{id}" | Kitchen-specific alerts |

---

## IAM Permissions

All Lambda functions use the `SmartKitchen-LambdaRole` with these policies:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:me-central-1:*:table/VisionDrive-*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "sns:Publish"
      ],
      "Resource": [
        "arn:aws:sns:me-central-1:*:SmartKitchen-*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## Monitoring

### CloudWatch Log Groups

| Function | Log Group |
|----------|-----------|
| smartkitchen-api | /aws/lambda/smartkitchen-api |
| smartkitchen-data-ingestion | /aws/lambda/smartkitchen-data-ingestion |
| smartkitchen-alerts | /aws/lambda/smartkitchen-alerts |
| smartkitchen-analytics | /aws/lambda/smartkitchen-analytics |

### Key Metrics

| Metric | Description | Alarm Threshold |
|--------|-------------|-----------------|
| Invocations | Request count | N/A |
| Duration | Execution time | > 10s |
| Errors | Failed executions | > 1% |
| Throttles | Rate limit hits | > 0 |

---

## Troubleshooting

### Common Issues

**1. DynamoDB Timeout**
- Increase Lambda timeout
- Check for missing indexes

**2. JWT Token Expired**
- Check token expiration (7 days)
- Verify JWT_SECRET matches

**3. Missing Environment Variables**
- Check Lambda configuration
- Verify table names

**4. CORS Errors**
- All responses include CORS headers
- Check API Gateway configuration

### Debug Logging

Enable debug logging by setting:
```javascript
console.log('API Request:', JSON.stringify(event, null, 2));
```

Check CloudWatch Logs for details.

---

## Related Documentation

- [API_REFERENCE.md](API_REFERENCE.md) - REST API documentation
- [AWS_SETUP.md](AWS_SETUP.md) - AWS configuration
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
