# AWS Infrastructure Setup

## Overview

The VisionDrive Parking system runs entirely on AWS in the UAE region (me-central-1) for data residency compliance.

---

## AWS Account Details

| Property | Value |
|----------|-------|
| Account ID | 307436091440 |
| Region | me-central-1 (UAE) |
| Profile | visiondrive-parking |

---

## Services Deployed

### 1. DynamoDB

**Table Name:** `VisionDrive-Parking`

**ARN:** 
```
arn:aws:dynamodb:me-central-1:307436091440:table/VisionDrive-Parking
```

**Schema:**
| Attribute | Type | Description |
|-----------|------|-------------|
| PK | String (Partition Key) | Entity prefix + ID |
| SK | String (Sort Key) | Entity type or timestamp |
| GSI1PK | String | Global Secondary Index 1 PK |
| GSI1SK | String | Global Secondary Index 1 SK |
| GSI2PK | String | Global Secondary Index 2 PK |
| GSI2SK | String | Global Secondary Index 2 SK |

**Indexes:**
- GSI1: Zone/tenant queries
- GSI2: Sensor lookups

**Billing Mode:** On-demand (pay per request)

---

### 2. Lambda Functions

#### Event Processor
- **Name:** `VisionDrive-Parking-EventProcessor`
- **Runtime:** Node.js 20.x
- **Memory:** 256 MB
- **Timeout:** 30 seconds
- **Trigger:** IoT Core Rules

**Purpose:** Processes incoming sensor data, updates bay status, creates events, updates zone occupancy.

**Environment Variables:**
```bash
TABLE_NAME=VisionDrive-Parking
ALERT_TOPIC_ARN=arn:aws:sns:me-central-1:307436091440:VisionDrive-Parking-Alerts
```

#### API Handler
- **Name:** `VisionDrive-Parking-ApiHandler`
- **Runtime:** Node.js 20.x
- **Memory:** 256 MB
- **Timeout:** 30 seconds
- **Trigger:** API Gateway

**Purpose:** Handles REST API requests from the frontend.

**Environment Variables:**
```bash
TABLE_NAME=VisionDrive-Parking
```

---

### 3. API Gateway

**API Name:** `VisionDrive-Parking-API`

**API ID:** `o2s68toqw0`

**Endpoint:**
```
https://o2s68toqw0.execute-api.me-central-1.amazonaws.com/prod
```

**Configuration:**
- Type: REST API
- Stage: prod
- Integration: Lambda Proxy
- CORS: Enabled (all origins)

---

### 4. AWS IoT Core

**Endpoint:**
```
a15wlpv31y3kre-ats.iot.me-central-1.amazonaws.com
```

**Topics:**
| Topic | Purpose |
|-------|---------|
| `visiondrive/parking/{zoneId}/{bayId}/status` | Sensor status updates |
| `visiondrive/parking/{zoneId}/{bayId}/health` | Heartbeat messages |

**Rules:**

1. **VisionDriveParkingStatusRule**
   - SQL: `SELECT * FROM 'visiondrive/parking/+/+/status'`
   - Action: Invoke EventProcessor Lambda

2. **VisionDriveParkingBatteryAlert**
   - SQL: `SELECT *, 'LOW_BATTERY' as alertType FROM 'visiondrive/parking/+/+/status' WHERE battery < 20`
   - Action: Invoke EventProcessor Lambda (triggers SNS alert)

---

### 5. SNS (Simple Notification Service)

**Topic Name:** `VisionDrive-Parking-Alerts`

**ARN:**
```
arn:aws:sns:me-central-1:307436091440:VisionDrive-Parking-Alerts
```

**Purpose:** Sends alert notifications for:
- Low battery sensors
- Offline sensors
- System errors

**To subscribe for email alerts:**
```bash
aws sns subscribe \
  --topic-arn arn:aws:sns:me-central-1:307436091440:VisionDrive-Parking-Alerts \
  --protocol email \
  --notification-endpoint your-email@example.com \
  --profile visiondrive-parking \
  --region me-central-1
```

---

### 6. IAM Role

**Role Name:** `VisionDrive-Parking-Lambda-Role`

**ARN:**
```
arn:aws:iam::307436091440:role/VisionDrive-Parking-Lambda-Role
```

**Permissions:**
- DynamoDB: Full access to VisionDrive-Parking table
- CloudWatch Logs: Create and write logs
- SNS: Publish to parking alerts topic

---

## AWS CLI Configuration

### Set Up Profile

```bash
aws configure set aws_access_key_id YOUR_ACCESS_KEY --profile visiondrive-parking
aws configure set aws_secret_access_key YOUR_SECRET_KEY --profile visiondrive-parking
aws configure set region me-central-1 --profile visiondrive-parking
aws configure set output json --profile visiondrive-parking
```

### Verify Access

```bash
# Check identity
aws sts get-caller-identity --profile visiondrive-parking

# List DynamoDB tables
aws dynamodb list-tables --profile visiondrive-parking --region me-central-1

# Check IoT endpoint
aws iot describe-endpoint --endpoint-type iot:Data-ATS --profile visiondrive-parking --region me-central-1
```

---

## Deployment Script

The deployment script is located at:
```
/Users/vadimkus/VisionDrive/Parking/scripts/deploy/deploy-all.sh
```

**To redeploy:**
```bash
cd /Users/vadimkus/VisionDrive/Parking/scripts/deploy
chmod +x deploy-all.sh
./deploy-all.sh
```

---

## CloudWatch Logs

Lambda logs are available at:
- Event Processor: `/aws/lambda/VisionDrive-Parking-EventProcessor`
- API Handler: `/aws/lambda/VisionDrive-Parking-ApiHandler`

**View logs:**
```bash
aws logs tail /aws/lambda/VisionDrive-Parking-ApiHandler \
  --follow \
  --profile visiondrive-parking \
  --region me-central-1
```

---

## Cost Monitoring

Enable cost allocation tags to track parking system costs:

1. Go to **Billing** → **Cost allocation tags**
2. Activate these tags:
   - `Project: VisionDrive`
   - `Application: Parking`
   - `Environment: production`

---

## Backup & Recovery

### DynamoDB Point-in-Time Recovery

Enable PITR for disaster recovery:
```bash
aws dynamodb update-continuous-backups \
  --table-name VisionDrive-Parking \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true \
  --profile visiondrive-parking \
  --region me-central-1
```

### Export to S3

For long-term storage, export to S3:
```bash
aws dynamodb export-table-to-point-in-time \
  --table-arn arn:aws:dynamodb:me-central-1:307436091440:table/VisionDrive-Parking \
  --s3-bucket your-backup-bucket \
  --s3-prefix parking-backup/ \
  --profile visiondrive-parking \
  --region me-central-1
```
