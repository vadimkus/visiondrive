# AWS Setup Guide

## Complete AWS Configuration for VisionDrive Smart Kitchen

---

## 1. AWS Account Prerequisites

### 1.1 Enable UAE Region

1. Log into AWS Console
2. Go to **Account Settings**
3. Under **AWS Regions**, enable **Middle East (UAE) - me-central-1**

### 1.2 Required IAM Permissions

Create an IAM user/role with these policies:
- `AWSIoTFullAccess`
- `AmazonTimestreamFullAccess`
- `AmazonDynamoDBFullAccess`
- `AWSLambda_FullAccess`
- `AmazonAPIGatewayAdministrator`
- `AmazonS3FullAccess`
- `CloudWatchFullAccess`

---

## 2. AWS IoT Core Setup

### 2.1 Get IoT Endpoint

```bash
aws iot describe-endpoint \
  --endpoint-type iot:Data-ATS \
  --region me-central-1

# Save this endpoint - you'll need it for sensor configuration
# Example: a1b2c3d4e5f6g7-ats.iot.me-central-1.amazonaws.com
```

### 2.2 Create Thing Type

```bash
aws iot create-thing-type \
  --thing-type-name TemperatureSensor \
  --thing-type-properties "thingTypeDescription=Dragino PS-NB-GE temperature sensor" \
  --region me-central-1
```

### 2.3 Create IoT Policy

```bash
cat > visiondrive-sensor-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowConnect",
      "Effect": "Allow",
      "Action": "iot:Connect",
      "Resource": "arn:aws:iot:me-central-1:*:client/visiondrive-*"
    },
    {
      "Sid": "AllowPublish",
      "Effect": "Allow",
      "Action": "iot:Publish",
      "Resource": [
        "arn:aws:iot:me-central-1:*:topic/visiondrive/*"
      ]
    },
    {
      "Sid": "AllowSubscribe",
      "Effect": "Allow",
      "Action": "iot:Subscribe",
      "Resource": [
        "arn:aws:iot:me-central-1:*:topicfilter/visiondrive/*/commands"
      ]
    },
    {
      "Sid": "AllowReceive",
      "Effect": "Allow",
      "Action": "iot:Receive",
      "Resource": [
        "arn:aws:iot:me-central-1:*:topic/visiondrive/*/commands"
      ]
    }
  ]
}
EOF

aws iot create-policy \
  --policy-name VisionDrive-SensorPolicy \
  --policy-document file://visiondrive-sensor-policy.json \
  --region me-central-1
```

### 2.4 Register a Thing (Sensor)

```bash
# Create the thing
aws iot create-thing \
  --thing-name visiondrive-sensor-001 \
  --thing-type-name TemperatureSensor \
  --attribute-payload "attributes={kitchen=kitchen-001,location=walk-in-fridge}" \
  --region me-central-1

# Create keys and certificate
aws iot create-keys-and-certificate \
  --set-as-active \
  --certificate-pem-outfile certs/sensor-001.crt \
  --public-key-outfile certs/sensor-001.public.key \
  --private-key-outfile certs/sensor-001.private.key \
  --region me-central-1 \
  --output json > certs/sensor-001-cert-info.json

# Get certificate ARN
CERT_ARN=$(cat certs/sensor-001-cert-info.json | jq -r '.certificateArn')

# Attach policy to certificate
aws iot attach-policy \
  --policy-name VisionDrive-SensorPolicy \
  --target $CERT_ARN \
  --region me-central-1

# Attach certificate to thing
aws iot attach-thing-principal \
  --thing-name visiondrive-sensor-001 \
  --principal $CERT_ARN \
  --region me-central-1

echo "Sensor registered with certificate ARN: $CERT_ARN"
```

### 2.5 Download AWS Root CA

```bash
# Download Amazon Root CA (needed for TLS)
curl -o certs/AmazonRootCA1.pem \
  https://www.amazontrust.com/repository/AmazonRootCA1.pem
```

---

## 3. Amazon Timestream Setup

### 3.1 Create Database

```bash
aws timestream-write create-database \
  --database-name visiondrive_smartkitchen \
  --kms-key-id alias/aws/timestream \
  --region me-central-1
```

### 3.2 Create Table

```bash
aws timestream-write create-table \
  --database-name visiondrive_smartkitchen \
  --table-name sensor_readings \
  --retention-properties '{
    "MemoryStoreRetentionPeriodInHours": 24,
    "MagneticStoreRetentionPeriodInDays": 365
  }' \
  --magnetic-store-write-properties '{
    "EnableMagneticStoreWrites": true
  }' \
  --region me-central-1
```

### 3.3 Sample Queries

```sql
-- Get latest reading for all sensors
SELECT device_id, kitchen_id, time, measure_value::double as value
FROM "visiondrive_smartkitchen"."sensor_readings"
WHERE measure_name = 'temperature'
  AND time > ago(1h)
ORDER BY time DESC

-- Get average temperature by kitchen (last 24h)
SELECT 
  kitchen_id,
  AVG(measure_value::double) as avg_temp,
  MAX(measure_value::double) as max_temp,
  MIN(measure_value::double) as min_temp
FROM "visiondrive_smartkitchen"."sensor_readings"
WHERE measure_name = 'temperature'
  AND time > ago(24h)
GROUP BY kitchen_id

-- Get hourly averages for a specific sensor
SELECT 
  bin(time, 1h) as hour,
  AVG(measure_value::double) as avg_temp
FROM "visiondrive_smartkitchen"."sensor_readings"
WHERE device_id = 'sensor-001'
  AND measure_name = 'temperature'
  AND time > ago(7d)
GROUP BY bin(time, 1h)
ORDER BY hour
```

---

## 4. DynamoDB Setup

### 4.1 Create Devices Table

```bash
aws dynamodb create-table \
  --table-name VisionDrive-Devices \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region me-central-1
```

### 4.2 Create Alerts Table

```bash
aws dynamodb create-table \
  --table-name VisionDrive-Alerts \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
    AttributeName=GSI1PK,AttributeType=S \
    AttributeName=GSI1SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --global-secondary-indexes \
    'IndexName=GSI1,KeySchema=[{AttributeName=GSI1PK,KeyType=HASH},{AttributeName=GSI1SK,KeyType=RANGE}],Projection={ProjectionType=ALL}' \
  --billing-mode PAY_PER_REQUEST \
  --region me-central-1
```

### 4.3 Sample Device Record

```bash
aws dynamodb put-item \
  --table-name VisionDrive-Devices \
  --item '{
    "PK": {"S": "DEVICE#sensor-001"},
    "SK": {"S": "METADATA"},
    "kitchenId": {"S": "kitchen-001"},
    "location": {"S": "Walk-in Fridge"},
    "installDate": {"S": "2026-01-11"},
    "probeModel": {"S": "PT100"},
    "alertThresholds": {"M": {"min": {"N": "0"}, "max": {"N": "8"}}},
    "transmissionInterval": {"N": "300"},
    "status": {"S": "active"}
  }' \
  --region me-central-1
```

---

## 5. Lambda Functions

### 5.1 Create IAM Role for Lambda

```bash
cat > lambda-trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

aws iam create-role \
  --role-name SmartKitchen-LambdaRole \
  --assume-role-policy-document file://lambda-trust-policy.json

# Attach policies
aws iam attach-role-policy \
  --role-name SmartKitchen-LambdaRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

aws iam attach-role-policy \
  --role-name SmartKitchen-LambdaRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonTimestreamFullAccess

aws iam attach-role-policy \
  --role-name SmartKitchen-LambdaRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

aws iam attach-role-policy \
  --role-name SmartKitchen-LambdaRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonSNSFullAccess
```

### 5.2 Data Ingestion Lambda

See `lambda/data-ingestion/index.js` in the infrastructure folder.

### 5.3 Alert Lambda

```javascript
// lambda/alerts/index.js

const { DynamoDBClient, PutItemCommand, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

const dynamodb = new DynamoDBClient({ region: "me-central-1" });
const sns = new SNSClient({ region: "me-central-1" });

exports.handler = async (event) => {
  const { deviceId, kitchenId, temperature, timestamp } = event;
  
  // Get device thresholds
  const deviceResult = await dynamodb.send(new GetItemCommand({
    TableName: 'VisionDrive-Devices',
    Key: {
      PK: { S: `DEVICE#${deviceId}` },
      SK: { S: 'METADATA' }
    }
  }));
  
  const thresholds = deviceResult.Item?.alertThresholds?.M;
  const minTemp = parseFloat(thresholds?.min?.N || '0');
  const maxTemp = parseFloat(thresholds?.max?.N || '8');
  
  let alertType = null;
  if (temperature > maxTemp) {
    alertType = 'HIGH_TEMP';
  } else if (temperature < minTemp) {
    alertType = 'LOW_TEMP';
  }
  
  if (alertType) {
    // Store alert
    await dynamodb.send(new PutItemCommand({
      TableName: 'VisionDrive-Alerts',
      Item: {
        PK: { S: `KITCHEN#${kitchenId}` },
        SK: { S: `ALERT#${timestamp}` },
        GSI1PK: { S: 'ALERT#ACTIVE' },
        GSI1SK: { S: timestamp },
        deviceId: { S: deviceId },
        alertType: { S: alertType },
        temperature: { N: String(temperature) },
        threshold: { N: String(alertType === 'HIGH_TEMP' ? maxTemp : minTemp) },
        acknowledged: { BOOL: false }
      }
    }));
    
    // Send SNS notification
    await sns.send(new PublishCommand({
      TopicArn: process.env.ALERT_TOPIC_ARN,
      Subject: `⚠️ Temperature Alert - ${kitchenId}`,
      Message: `
Temperature Alert!

Device: ${deviceId}
Kitchen: ${kitchenId}
Alert Type: ${alertType}
Current Temperature: ${temperature}°C
Threshold: ${alertType === 'HIGH_TEMP' ? maxTemp : minTemp}°C
Time: ${new Date(parseInt(timestamp)).toISOString()}

Please take immediate action.
      `
    }));
    
    console.log(`Alert created: ${alertType} for ${deviceId}`);
  }
  
  return { statusCode: 200, alertTriggered: !!alertType };
};
```

---

## 6. IoT Rules Engine

### 6.1 Create Rule for Data Ingestion

```bash
cat > iot-rule-ingestion.json << 'EOF'
{
  "sql": "SELECT topic(3) as deviceId, topic(2) as kitchenId, IDC_mA as raw_ma, Battery as battery, timestamp() as received_at FROM 'visiondrive/+/+/temperature'",
  "actions": [
    {
      "lambda": {
        "functionArn": "arn:aws:lambda:me-central-1:YOUR_ACCOUNT:function:smartkitchen-data-ingestion"
      }
    }
  ],
  "ruleDisabled": false,
  "awsIotSqlVersion": "2016-03-23"
}
EOF

aws iot create-topic-rule \
  --rule-name SmartKitchen_DataIngestion \
  --topic-rule-payload file://iot-rule-ingestion.json \
  --region me-central-1
```

### 6.2 Create Rule for Alerts

```bash
cat > iot-rule-alerts.json << 'EOF'
{
  "sql": "SELECT topic(3) as deviceId, topic(2) as kitchenId, IDC_mA as raw_ma, timestamp() as timestamp FROM 'visiondrive/+/+/temperature' WHERE IDC_mA > 15 OR IDC_mA < 5",
  "actions": [
    {
      "lambda": {
        "functionArn": "arn:aws:lambda:me-central-1:YOUR_ACCOUNT:function:smartkitchen-alerts"
      }
    }
  ],
  "ruleDisabled": false,
  "awsIotSqlVersion": "2016-03-23"
}
EOF

aws iot create-topic-rule \
  --rule-name SmartKitchen_Alerts \
  --topic-rule-payload file://iot-rule-alerts.json \
  --region me-central-1
```

---

## 7. API Gateway Setup

### 7.1 Create REST API

```bash
aws apigateway create-rest-api \
  --name SmartKitchenAPI \
  --description "VisionDrive Smart Kitchen API" \
  --endpoint-configuration types=REGIONAL \
  --region me-central-1
```

### 7.2 Enable CORS

For Vercel frontend access, configure CORS on each method.

---

## 8. SNS for Notifications

### 8.1 Create Alert Topic

```bash
aws sns create-topic \
  --name SmartKitchen-Alerts \
  --region me-central-1

# Subscribe email
aws sns subscribe \
  --topic-arn arn:aws:sns:me-central-1:YOUR_ACCOUNT:SmartKitchen-Alerts \
  --protocol email \
  --notification-endpoint your-email@example.com \
  --region me-central-1
```

---

## 9. CloudWatch Monitoring

### 9.1 Create Dashboard

```bash
cat > cloudwatch-dashboard.json << 'EOF'
{
  "widgets": [
    {
      "type": "metric",
      "x": 0,
      "y": 0,
      "width": 12,
      "height": 6,
      "properties": {
        "title": "IoT Messages Received",
        "metrics": [
          ["AWS/IoT", "PublishIn.Success", {"region": "me-central-1"}]
        ],
        "period": 300,
        "stat": "Sum"
      }
    },
    {
      "type": "metric",
      "x": 12,
      "y": 0,
      "width": 12,
      "height": 6,
      "properties": {
        "title": "Lambda Invocations",
        "metrics": [
          ["AWS/Lambda", "Invocations", "FunctionName", "smartkitchen-data-ingestion", {"region": "me-central-1"}]
        ],
        "period": 300,
        "stat": "Sum"
      }
    }
  ]
}
EOF

aws cloudwatch put-dashboard \
  --dashboard-name SmartKitchen \
  --dashboard-body file://cloudwatch-dashboard.json \
  --region me-central-1
```

---

## 10. Cost Estimation

| Service | Usage (100 sensors, 5-min interval) | Est. Monthly Cost |
|---------|-------------------------------------|-------------------|
| IoT Core | 864K messages/month | ~$15 |
| Timestream | 2.6M writes, 50GB storage | ~$60 |
| DynamoDB | On-demand, low volume | ~$5 |
| Lambda | 864K invocations | ~$1 |
| API Gateway | 100K requests | ~$3 |
| SNS | 1K notifications | ~$1 |
| CloudWatch | Basic monitoring | ~$5 |
| **Total** | | **~$90/month** |

---

## 11. Security Best Practices

1. **Use least privilege IAM policies**
2. **Enable VPC endpoints** for internal AWS traffic
3. **Encrypt data at rest** (enabled by default)
4. **Rotate certificates** annually
5. **Enable CloudTrail** for audit logging
6. **Use AWS Secrets Manager** for credentials
7. **Implement IP whitelisting** on API Gateway

---

## 12. Vercel Integration

### Environment Variables for Vercel

```env
AWS_REGION=me-central-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
TIMESTREAM_DATABASE=visiondrive_smartkitchen
TIMESTREAM_TABLE=sensor_readings
IOT_ENDPOINT=xxxxxx-ats.iot.me-central-1.amazonaws.com
```

Add these in Vercel Dashboard → Project Settings → Environment Variables
