# Setup Guide

## VisionDrive Smart Kitchen - Step-by-Step Implementation

---

## Phase 1: AWS Infrastructure Setup

### Step 1.1: Create AWS Account & Enable UAE Region

```bash
# 1. Go to https://aws.amazon.com and create account
# 2. Enable me-central-1 (UAE) region in account settings
# 3. Set billing preferences and budget alerts
```

### Step 1.2: Install AWS CLI & CDK

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /

# Configure AWS CLI
aws configure
# AWS Access Key ID: YOUR_ACCESS_KEY
# AWS Secret Access Key: YOUR_SECRET_KEY
# Default region name: me-central-1
# Default output format: json

# Install AWS CDK
npm install -g aws-cdk

# Verify installation
aws --version
cdk --version
```

### Step 1.3: Deploy Infrastructure

```bash
cd smartkitchen/infrastructure/cdk

# Install dependencies
npm install

# Bootstrap CDK in UAE region
cdk bootstrap aws://YOUR_ACCOUNT_ID/me-central-1

# Deploy all stacks
cdk deploy --all
```

---

## Phase 2: AWS IoT Core Setup

### Step 2.1: Create IoT Policy

```bash
# Create policy file
cat > iot-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["iot:Connect"],
      "Resource": ["arn:aws:iot:me-central-1:*:client/visiondrive-*"]
    },
    {
      "Effect": "Allow",
      "Action": ["iot:Publish"],
      "Resource": ["arn:aws:iot:me-central-1:*:topic/visiondrive/*"]
    },
    {
      "Effect": "Allow",
      "Action": ["iot:Subscribe"],
      "Resource": ["arn:aws:iot:me-central-1:*:topicfilter/visiondrive/*/commands"]
    },
    {
      "Effect": "Allow",
      "Action": ["iot:Receive"],
      "Resource": ["arn:aws:iot:me-central-1:*:topic/visiondrive/*/commands"]
    }
  ]
}
EOF

# Create policy in AWS
aws iot create-policy \
  --policy-name VisionDrive-SensorPolicy \
  --policy-document file://iot-policy.json \
  --region me-central-1
```

### Step 2.2: Register a Sensor (Thing)

```bash
# Create thing
aws iot create-thing \
  --thing-name visiondrive-sensor-001 \
  --thing-type-name TemperatureSensor \
  --region me-central-1

# Create certificate
aws iot create-keys-and-certificate \
  --set-as-active \
  --certificate-pem-outfile sensor-001.crt \
  --public-key-outfile sensor-001.public.key \
  --private-key-outfile sensor-001.private.key \
  --region me-central-1

# Note the certificate ARN from output
CERT_ARN="arn:aws:iot:me-central-1:YOUR_ACCOUNT:cert/CERT_ID"

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
```

### Step 2.3: Get IoT Endpoint

```bash
# Get your IoT endpoint
aws iot describe-endpoint \
  --endpoint-type iot:Data-ATS \
  --region me-central-1

# Output example:
# {
#   "endpointAddress": "xxxxxx-ats.iot.me-central-1.amazonaws.com"
# }
```

### Step 2.4: Create IoT Rule

```bash
# Create rule for data ingestion
cat > iot-rule.json << 'EOF'
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
  --rule-name SmartKitchenDataIngestion \
  --topic-rule-payload file://iot-rule.json \
  --region me-central-1
```

---

## Phase 3: Timestream Setup

### Step 3.1: Create Database and Table

```bash
# Create database
aws timestream-write create-database \
  --database-name visiondrive_smartkitchen \
  --region me-central-1

# Create table
aws timestream-write create-table \
  --database-name visiondrive_smartkitchen \
  --table-name sensor_readings \
  --retention-properties \
    MemoryStoreRetentionPeriodInHours=24,MagneticStoreRetentionPeriodInDays=365 \
  --region me-central-1
```

---

## Phase 4: Dragino Sensor Configuration

### Step 4.1: Connect to Sensor via BLE

1. Download **Dragino BLE Config App** (iOS/Android)
2. Power on PS-NB-GE sensor
3. Open app and scan for device
4. Connect using password from device label (AT+PIN=xxxxxx)

### Step 4.2: Configure Sensor (AT Commands)

```bash
# Basic Configuration
# ===================

# Set du APN
AT+APN=du

# Set protocol to MQTTs
AT+PRO=3

# Set AWS IoT endpoint (replace with your endpoint)
AT+SERVADDR=xxxxxx-ats.iot.me-central-1.amazonaws.com,8883

# Set unique client ID
AT+CLIENT=visiondrive-sensor-001

# Set MQTT topics
AT+PUBTOPIC=visiondrive/kitchen-001/sensor-001/temperature
AT+SUBTOPIC=visiondrive/kitchen-001/sensor-001/commands

# Enable TLS
AT+TLSMOD=1

# Set transmission interval (5 minutes = 300000ms)
AT+TDC=300000

# Temperature Probe Configuration
# ================================

# Set probe model (1 for 4-20mA)
AT+PROBE=1

# Set power output time for sensor (2 seconds)
AT+5VT=2000

# Set payload to JSON format
AT+PAYLOADTYPE=5

# Save and verify
AT+CFG

# Test reading
AT+GETSENSORVALUE=0
```

### Step 4.3: Verify Connectivity

```bash
# Check network registration
AT+CSQ  # Signal quality (should be > 10)

# Force an uplink
# Press the button on sensor or use:
AT+SEND
```

---

## Phase 5: Lambda Functions

### Step 5.1: Data Ingestion Function

```javascript
// lambda/data-ingestion/index.js

const { TimestreamWriteClient, WriteRecordsCommand } = require("@aws-sdk/client-timestream-write");

const client = new TimestreamWriteClient({ region: "me-central-1" });

// Temperature conversion: 4-20mA to Celsius
// Adjust these values based on your probe specifications
const convertToTemperature = (mA) => {
  const minMA = 4;
  const maxMA = 20;
  const minTemp = -40;  // °C at 4mA (adjust per probe)
  const maxTemp = 85;   // °C at 20mA (adjust per probe)
  
  if (mA < minMA || mA > maxMA) {
    console.warn(`mA value ${mA} out of expected range`);
  }
  
  return minTemp + ((mA - minMA) / (maxMA - minMA)) * (maxTemp - minTemp);
};

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  const { deviceId, kitchenId, raw_ma, battery, received_at } = event;
  
  // Convert mA to temperature
  const temperature = convertToTemperature(raw_ma);
  
  // Prepare records for Timestream
  const records = [
    {
      Dimensions: [
        { Name: 'device_id', Value: deviceId },
        { Name: 'kitchen_id', Value: kitchenId }
      ],
      MeasureName: 'temperature',
      MeasureValue: String(temperature.toFixed(2)),
      MeasureValueType: 'DOUBLE',
      Time: String(received_at),
      TimeUnit: 'MILLISECONDS'
    },
    {
      Dimensions: [
        { Name: 'device_id', Value: deviceId },
        { Name: 'kitchen_id', Value: kitchenId }
      ],
      MeasureName: 'raw_ma',
      MeasureValue: String(raw_ma),
      MeasureValueType: 'DOUBLE',
      Time: String(received_at),
      TimeUnit: 'MILLISECONDS'
    },
    {
      Dimensions: [
        { Name: 'device_id', Value: deviceId },
        { Name: 'kitchen_id', Value: kitchenId }
      ],
      MeasureName: 'battery_voltage',
      MeasureValue: String(battery),
      MeasureValueType: 'DOUBLE',
      Time: String(received_at),
      TimeUnit: 'MILLISECONDS'
    }
  ];
  
  const command = new WriteRecordsCommand({
    DatabaseName: 'visiondrive_smartkitchen',
    TableName: 'sensor_readings',
    Records: records
  });
  
  try {
    await client.send(command);
    console.log(`Stored reading: ${deviceId} = ${temperature.toFixed(1)}°C`);
    return { statusCode: 200, body: 'OK' };
  } catch (error) {
    console.error('Error writing to Timestream:', error);
    throw error;
  }
};
```

### Step 5.2: Deploy Lambda

```bash
cd lambda/data-ingestion

# Install dependencies
npm init -y
npm install @aws-sdk/client-timestream-write

# Create deployment package
zip -r function.zip .

# Create Lambda function
aws lambda create-function \
  --function-name smartkitchen-data-ingestion \
  --runtime nodejs22.x \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --role arn:aws:iam::YOUR_ACCOUNT:role/LambdaTimestreamRole \
  --timeout 30 \
  --memory-size 256 \
  --region me-central-1

# Add IoT permission
aws lambda add-permission \
  --function-name smartkitchen-data-ingestion \
  --statement-id IoTInvoke \
  --action lambda:InvokeFunction \
  --principal iot.amazonaws.com \
  --region me-central-1
```

---

## Phase 6: API Gateway Setup

### Step 6.1: Create REST API

```bash
# Create API
aws apigateway create-rest-api \
  --name SmartKitchenAPI \
  --region me-central-1

# Get API ID and root resource ID from output
# Then create resources and methods...
```

### Step 6.2: Integrate with Vercel

```javascript
// app/api/sensors/[id]/current/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { TimestreamQueryClient, QueryCommand } from "@aws-sdk/client-timestream-query";

const client = new TimestreamQueryClient({
  region: "me-central-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const deviceId = params.id;
  
  const query = `
    SELECT device_id, kitchen_id, time, measure_name, measure_value::double
    FROM "visiondrive_smartkitchen"."sensor_readings"
    WHERE device_id = '${deviceId}'
    ORDER BY time DESC
    LIMIT 3
  `;
  
  try {
    const command = new QueryCommand({ QueryString: query });
    const response = await client.send(command);
    
    // Parse response and return formatted data
    const readings = parseTimestreamResponse(response);
    
    return NextResponse.json({
      deviceId,
      ...readings,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error querying Timestream:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
```

---

## Phase 7: Testing & Validation

### Step 7.1: Test Sensor Uplink

```bash
# Monitor IoT Core MQTT messages
aws iot-data get-retained-message \
  --topic visiondrive/kitchen-001/sensor-001/temperature \
  --region me-central-1

# Or use AWS IoT Test Client in Console
# Subscribe to: visiondrive/#
```

### Step 7.2: Verify Timestream Data

```bash
aws timestream-query query \
  --query-string "SELECT * FROM visiondrive_smartkitchen.sensor_readings ORDER BY time DESC LIMIT 10" \
  --region me-central-1
```

### Step 7.3: Test API Endpoint

```bash
curl https://your-api.execute-api.me-central-1.amazonaws.com/prod/sensors/sensor-001/current
```

---

## Troubleshooting

### Sensor Not Connecting

1. Check du APN: `AT+APN?`
2. Check signal: `AT+CSQ` (should be > 10)
3. Verify endpoint: `AT+SERVADDR?`
4. Check TLS: `AT+TLSMOD?` (should be 1)

### No Data in Timestream

1. Check IoT Rule is enabled
2. Check Lambda permissions
3. Check CloudWatch logs for errors

### API Errors

1. Verify AWS credentials in Vercel
2. Check API Gateway configuration
3. Review CORS settings

---

## Next Steps

After completing all phases:

1. ✅ Add more sensors following Step 2.2
2. ✅ Build dashboard components
3. ✅ Configure alert thresholds
4. ✅ Set up CloudWatch alarms
5. ✅ Create daily reports
