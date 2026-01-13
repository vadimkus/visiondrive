#!/bin/bash
# VisionDrive Parking - Full AWS Deployment Script
# Deploys Lambda functions, IoT Core, and API Gateway

set -e

REGION="me-central-1"
PROFILE="visiondrive-parking"
ACCOUNT_ID="307436091440"
TABLE_NAME="VisionDrive-Parking"

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║   VisionDrive Parking - AWS Infrastructure Deployment              ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
echo "Region: $REGION"
echo "Account: $ACCOUNT_ID"
echo ""

# ============================================
# 1. Create IAM Role for Lambda
# ============================================

echo "📋 Step 1: Creating IAM Role for Lambda..."

# Trust policy
cat > /tmp/lambda-trust-policy.json << 'EOF'
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

# Create role (ignore if exists)
aws iam create-role \
  --role-name VisionDrive-Parking-Lambda-Role \
  --assume-role-policy-document file:///tmp/lambda-trust-policy.json \
  --profile $PROFILE 2>/dev/null || echo "   Role already exists"

# Policy for Lambda
cat > /tmp/lambda-policy.json << EOF
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
        "dynamodb:Scan",
        "dynamodb:BatchWriteItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:${REGION}:${ACCOUNT_ID}:table/${TABLE_NAME}",
        "arn:aws:dynamodb:${REGION}:${ACCOUNT_ID}:table/${TABLE_NAME}/index/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:${REGION}:${ACCOUNT_ID}:*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "sns:Publish"
      ],
      "Resource": "arn:aws:sns:${REGION}:${ACCOUNT_ID}:*"
    }
  ]
}
EOF

aws iam put-role-policy \
  --role-name VisionDrive-Parking-Lambda-Role \
  --policy-name VisionDrive-Parking-Lambda-Policy \
  --policy-document file:///tmp/lambda-policy.json \
  --profile $PROFILE

echo "   ✅ IAM Role configured"
echo ""

# Wait for role to propagate
echo "   Waiting for IAM role to propagate..."
sleep 10

# ============================================
# 2. Create SNS Topic for Alerts
# ============================================

echo "📋 Step 2: Creating SNS Topic for Alerts..."

ALERT_TOPIC_ARN=$(aws sns create-topic \
  --name VisionDrive-Parking-Alerts \
  --region $REGION \
  --profile $PROFILE \
  --query 'TopicArn' \
  --output text)

echo "   ✅ SNS Topic: $ALERT_TOPIC_ARN"
echo ""

# ============================================
# 3. Package and Deploy Lambda Functions
# ============================================

echo "📋 Step 3: Deploying Lambda Functions..."

LAMBDA_ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/VisionDrive-Parking-Lambda-Role"

# Event Processor Lambda
echo "   Packaging event-processor..."
cd /Users/vadimkus/VisionDrive/Parking/infrastructure/lambda/event-processor
npm install --omit=dev 2>/dev/null
zip -r /tmp/event-processor.zip . -x "*.git*" > /dev/null

echo "   Deploying event-processor..."
aws lambda create-function \
  --function-name VisionDrive-Parking-EventProcessor \
  --runtime nodejs22.x \
  --handler index.handler \
  --role $LAMBDA_ROLE_ARN \
  --zip-file fileb:///tmp/event-processor.zip \
  --timeout 30 \
  --memory-size 256 \
  --environment "Variables={TABLE_NAME=${TABLE_NAME},ALERT_TOPIC_ARN=${ALERT_TOPIC_ARN}}" \
  --region $REGION \
  --profile $PROFILE 2>/dev/null || \
aws lambda update-function-code \
  --function-name VisionDrive-Parking-EventProcessor \
  --zip-file fileb:///tmp/event-processor.zip \
  --region $REGION \
  --profile $PROFILE > /dev/null

echo "   ✅ event-processor deployed"

# API Handler Lambda
echo "   Packaging api-handler..."
cd /Users/vadimkus/VisionDrive/Parking/infrastructure/lambda/api-handler
npm install --omit=dev 2>/dev/null
zip -r /tmp/api-handler.zip . -x "*.git*" > /dev/null

echo "   Deploying api-handler..."
aws lambda create-function \
  --function-name VisionDrive-Parking-ApiHandler \
  --runtime nodejs22.x \
  --handler index.handler \
  --role $LAMBDA_ROLE_ARN \
  --zip-file fileb:///tmp/api-handler.zip \
  --timeout 30 \
  --memory-size 256 \
  --environment "Variables={TABLE_NAME=${TABLE_NAME}}" \
  --region $REGION \
  --profile $PROFILE 2>/dev/null || \
aws lambda update-function-code \
  --function-name VisionDrive-Parking-ApiHandler \
  --zip-file fileb:///tmp/api-handler.zip \
  --region $REGION \
  --profile $PROFILE > /dev/null

echo "   ✅ api-handler deployed"
echo ""

# ============================================
# 4. Create API Gateway
# ============================================

echo "📋 Step 4: Creating API Gateway..."

# Create REST API
API_ID=$(aws apigateway create-rest-api \
  --name "VisionDrive-Parking-API" \
  --description "VisionDrive Parking System API" \
  --endpoint-configuration types=REGIONAL \
  --region $REGION \
  --profile $PROFILE \
  --query 'id' \
  --output text 2>/dev/null) || \
API_ID=$(aws apigateway get-rest-apis \
  --region $REGION \
  --profile $PROFILE \
  --query "items[?name=='VisionDrive-Parking-API'].id" \
  --output text)

echo "   API ID: $API_ID"

# Get root resource
ROOT_ID=$(aws apigateway get-resources \
  --rest-api-id $API_ID \
  --region $REGION \
  --profile $PROFILE \
  --query "items[?path=='/'].id" \
  --output text)

# Create proxy resource
aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $ROOT_ID \
  --path-part "{proxy+}" \
  --region $REGION \
  --profile $PROFILE 2>/dev/null || true

PROXY_ID=$(aws apigateway get-resources \
  --rest-api-id $API_ID \
  --region $REGION \
  --profile $PROFILE \
  --query "items[?path=='/{proxy+}'].id" \
  --output text)

# Create ANY method
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $PROXY_ID \
  --http-method ANY \
  --authorization-type NONE \
  --region $REGION \
  --profile $PROFILE 2>/dev/null || true

# Lambda integration
LAMBDA_ARN="arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:VisionDrive-Parking-ApiHandler"

aws apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $PROXY_ID \
  --http-method ANY \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri "arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/${LAMBDA_ARN}/invocations" \
  --region $REGION \
  --profile $PROFILE 2>/dev/null || true

# Add Lambda permission for API Gateway
aws lambda add-permission \
  --function-name VisionDrive-Parking-ApiHandler \
  --statement-id apigateway-access \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*/*/*" \
  --region $REGION \
  --profile $PROFILE 2>/dev/null || true

# Deploy API
aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name prod \
  --region $REGION \
  --profile $PROFILE > /dev/null

API_URL="https://${API_ID}.execute-api.${REGION}.amazonaws.com/prod"
echo "   ✅ API Gateway deployed: $API_URL"
echo ""

# ============================================
# 5. Set up IoT Core
# ============================================

echo "📋 Step 5: Setting up AWS IoT Core..."

# Get IoT endpoint
IOT_ENDPOINT=$(aws iot describe-endpoint \
  --endpoint-type iot:Data-ATS \
  --region $REGION \
  --profile $PROFILE \
  --query 'endpointAddress' \
  --output text)

echo "   IoT Endpoint: $IOT_ENDPOINT"

# Create IoT Rule for status updates
cat > /tmp/iot-rule-sql.json << EOF
{
  "sql": "SELECT * FROM 'visiondrive/parking/+/+/status'",
  "description": "Process parking sensor status updates",
  "actions": [
    {
      "lambda": {
        "functionArn": "arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:VisionDrive-Parking-EventProcessor"
      }
    }
  ],
  "ruleDisabled": false,
  "awsIotSqlVersion": "2016-03-23"
}
EOF

aws iot create-topic-rule \
  --rule-name VisionDriveParkingStatusRule \
  --topic-rule-payload file:///tmp/iot-rule-sql.json \
  --region $REGION \
  --profile $PROFILE 2>/dev/null || \
aws iot replace-topic-rule \
  --rule-name VisionDriveParkingStatusRule \
  --topic-rule-payload file:///tmp/iot-rule-sql.json \
  --region $REGION \
  --profile $PROFILE

# Add permission for IoT to invoke Lambda
aws lambda add-permission \
  --function-name VisionDrive-Parking-EventProcessor \
  --statement-id iot-invoke \
  --action lambda:InvokeFunction \
  --principal iot.amazonaws.com \
  --source-arn "arn:aws:iot:${REGION}:${ACCOUNT_ID}:rule/VisionDriveParkingStatusRule" \
  --region $REGION \
  --profile $PROFILE 2>/dev/null || true

# Create IoT Rule for low battery alerts
cat > /tmp/iot-battery-rule.json << EOF
{
  "sql": "SELECT *, 'LOW_BATTERY' as alertType FROM 'visiondrive/parking/+/+/status' WHERE battery < 20",
  "description": "Alert on low battery sensors",
  "actions": [
    {
      "lambda": {
        "functionArn": "arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:VisionDrive-Parking-EventProcessor"
      }
    }
  ],
  "ruleDisabled": false,
  "awsIotSqlVersion": "2016-03-23"
}
EOF

aws iot create-topic-rule \
  --rule-name VisionDriveParkingBatteryAlert \
  --topic-rule-payload file:///tmp/iot-battery-rule.json \
  --region $REGION \
  --profile $PROFILE 2>/dev/null || \
aws iot replace-topic-rule \
  --rule-name VisionDriveParkingBatteryAlert \
  --topic-rule-payload file:///tmp/iot-battery-rule.json \
  --region $REGION \
  --profile $PROFILE

echo "   ✅ IoT Rules created"
echo ""

# ============================================
# Summary
# ============================================

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                    DEPLOYMENT COMPLETE                             ║"
echo "╠════════════════════════════════════════════════════════════════════╣"
echo "║                                                                    ║"
echo "║  Lambda Functions:                                                 ║"
echo "║    • VisionDrive-Parking-EventProcessor                           ║"
echo "║    • VisionDrive-Parking-ApiHandler                               ║"
echo "║                                                                    ║"
echo "║  API Gateway:                                                      ║"
echo "║    $API_URL"
echo "║                                                                    ║"
echo "║  IoT Core:                                                         ║"
echo "║    Endpoint: $IOT_ENDPOINT"
echo "║    Topics:                                                         ║"
echo "║      • visiondrive/parking/{zoneId}/{bayId}/status                ║"
echo "║                                                                    ║"
echo "║  SNS Alerts:                                                       ║"
echo "║    $ALERT_TOPIC_ARN"
echo "║                                                                    ║"
echo "╚════════════════════════════════════════════════════════════════════╝"

# Save config for frontend
cat > /Users/vadimkus/VisionDrive/Parking/.env.aws << EOF
# AWS Configuration - Generated $(date)
PARKING_API_URL=$API_URL
IOT_ENDPOINT=$IOT_ENDPOINT
ALERT_TOPIC_ARN=$ALERT_TOPIC_ARN
AWS_REGION=$REGION
EOF

echo ""
echo "Configuration saved to: /Users/vadimkus/VisionDrive/Parking/.env.aws"
