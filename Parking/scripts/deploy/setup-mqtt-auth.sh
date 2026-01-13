#!/bin/bash
# VisionDrive Parking - Setup MQTT Username/Password Authentication
# Creates IoT Custom Authorizer for SWIOTT sensors

set -e

REGION="me-central-1"
PROFILE="visiondrive-parking"
ACCOUNT_ID="307436091440"

# Sensor credentials (CHANGE THESE!)
SWIOTT_PASSWORD="${SWIOTT_PASSWORD:-your-secure-password-here}"

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║   Setup MQTT Username/Password Authentication                      ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# ============================================
# 1. Create Lambda for Custom Authorizer
# ============================================

echo "📋 Step 1: Deploying Custom Authorizer Lambda..."

cd /Users/vadimkus/VisionDrive/Parking/infrastructure/lambda/custom-authorizer
zip -r /tmp/custom-authorizer.zip . -x "*.git*" > /dev/null

# Create or update Lambda
aws lambda create-function \
  --function-name VisionDrive-Parking-CustomAuthorizer \
  --runtime nodejs22.x \
  --handler index.handler \
  --role arn:aws:iam::${ACCOUNT_ID}:role/VisionDrive-Parking-Lambda-Role \
  --zip-file fileb:///tmp/custom-authorizer.zip \
  --timeout 10 \
  --memory-size 128 \
  --environment "Variables={SWIOTT_PASSWORD=${SWIOTT_PASSWORD},AWS_ACCOUNT_ID=${ACCOUNT_ID}}" \
  --region $REGION \
  --profile $PROFILE 2>/dev/null || \
aws lambda update-function-code \
  --function-name VisionDrive-Parking-CustomAuthorizer \
  --zip-file fileb:///tmp/custom-authorizer.zip \
  --region $REGION \
  --profile $PROFILE > /dev/null

# Update environment variables
aws lambda update-function-configuration \
  --function-name VisionDrive-Parking-CustomAuthorizer \
  --environment "Variables={SWIOTT_PASSWORD=${SWIOTT_PASSWORD},AWS_ACCOUNT_ID=${ACCOUNT_ID}}" \
  --region $REGION \
  --profile $PROFILE > /dev/null

echo "   ✅ Lambda deployed"

# ============================================
# 2. Add Lambda Permission for IoT
# ============================================

echo "📋 Step 2: Adding IoT permission to invoke Lambda..."

aws lambda add-permission \
  --function-name VisionDrive-Parking-CustomAuthorizer \
  --statement-id iot-invoke-authorizer \
  --action lambda:InvokeFunction \
  --principal iot.amazonaws.com \
  --region $REGION \
  --profile $PROFILE 2>/dev/null || true

echo "   ✅ Permission added"

# ============================================
# 3. Create IoT Custom Authorizer
# ============================================

echo "📋 Step 3: Creating IoT Custom Authorizer..."

LAMBDA_ARN="arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:VisionDrive-Parking-CustomAuthorizer"

# Delete existing authorizer if exists
aws iot delete-authorizer \
  --authorizer-name VisionDriveParkingAuthorizer \
  --region $REGION \
  --profile $PROFILE 2>/dev/null || true

# Create new authorizer
aws iot create-authorizer \
  --authorizer-name VisionDriveParkingAuthorizer \
  --authorizer-function-arn $LAMBDA_ARN \
  --status ACTIVE \
  --signing-disabled \
  --region $REGION \
  --profile $PROFILE

echo "   ✅ Custom Authorizer created"

# ============================================
# 4. Set as Default Authorizer (Optional)
# ============================================

echo "📋 Step 4: Configuring authorizer..."

# Get authorizer ARN
AUTHORIZER_ARN=$(aws iot describe-authorizer \
  --authorizer-name VisionDriveParkingAuthorizer \
  --region $REGION \
  --profile $PROFILE \
  --query 'authorizerDescription.authorizerArn' \
  --output text)

echo "   Authorizer ARN: $AUTHORIZER_ARN"

# ============================================
# Summary
# ============================================

IOT_ENDPOINT=$(aws iot describe-endpoint \
  --endpoint-type iot:Data-ATS \
  --region $REGION \
  --profile $PROFILE \
  --query 'endpointAddress' \
  --output text)

echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                    SETUP COMPLETE                                  ║"
echo "╠════════════════════════════════════════════════════════════════════╣"
echo "║                                                                    ║"
echo "║  Custom Authorizer: VisionDriveParkingAuthorizer                  ║"
echo "║                                                                    ║"
echo "║  SWIOTT App Configuration:                                        ║"
echo "║    Host: ${IOT_ENDPOINT}"
echo "║    Port: 8883                                                      ║"
echo "║    Username: swiott01                                             ║"
echo "║    Password: (as configured)                                      ║"
echo "║    SSL: ENABLED                                                   ║"
echo "║                                                                    ║"
echo "║  Note: Sensors connect using custom auth endpoint:                ║"
echo "║    ${IOT_ENDPOINT}?x-amz-customauthorizer-name=VisionDriveParkingAuthorizer"
echo "║                                                                    ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
echo "⚠️  Important: Update SWIOTT_PASSWORD environment variable with your actual password!"
echo ""
echo "To update the password:"
echo "  SWIOTT_PASSWORD='your-actual-password' ./setup-mqtt-auth.sh"
