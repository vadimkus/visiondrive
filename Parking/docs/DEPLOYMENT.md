# VisionDrive Parking - Deployment Guide

## Prerequisites

- Node.js 20+
- AWS CLI configured
- Access to VisionDrive AWS account
- Vercel account (for frontend)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         AWS (me-central-1)                       │
│                                                                  │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐     │
│  │ IoT Core │──▶│  Lambda  │──▶│ DynamoDB │◀──│  Lambda  │     │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘     │
│                                                    ▲             │
│                                                    │             │
│                                              ┌─────┴────┐       │
│                                              │API Gateway│       │
│                                              └─────┬────┘       │
└────────────────────────────────────────────────────┼────────────┘
                                                     │
                                              ┌──────▼──────┐
                                              │   Vercel    │
                                              │  (Next.js)  │
                                              └─────────────┘
```

---

## Step 1: AWS Infrastructure

### 1.1 Configure AWS Profile

```bash
aws configure set aws_access_key_id YOUR_KEY --profile visiondrive-parking
aws configure set aws_secret_access_key YOUR_SECRET --profile visiondrive-parking
aws configure set region me-central-1 --profile visiondrive-parking
```

### 1.2 Run Deployment Script

```bash
cd /Users/vadimkus/VisionDrive/Parking/scripts/deploy
chmod +x deploy-all.sh
./deploy-all.sh
```

This creates:
- DynamoDB table
- Lambda functions
- API Gateway
- IoT Core rules
- SNS topic
- IAM roles

### 1.3 Verify Deployment

```bash
# Check Lambda functions
aws lambda list-functions --profile visiondrive-parking --region me-central-1 | grep Parking

# Check DynamoDB table
aws dynamodb describe-table --table-name VisionDrive-Parking --profile visiondrive-parking --region me-central-1

# Test API
curl https://o2s68toqw0.execute-api.me-central-1.amazonaws.com/prod/zones
```

---

## Step 2: Frontend Deployment (Vercel)

### 2.1 Environment Variables

Add to Vercel project settings:

```env
NEXT_PUBLIC_PARKING_API_URL=https://o2s68toqw0.execute-api.me-central-1.amazonaws.com/prod
```

### 2.2 Deploy to Vercel

```bash
cd /Users/vadimkus/VisionDrive
vercel --prod
```

Or connect to GitHub for automatic deployments.

### 2.3 Verify Frontend

Visit: `https://your-domain.vercel.app/portal/parking`

---

## Step 3: Sensor Configuration

### 3.1 Register Sensors

```bash
cd /Users/vadimkus/VisionDrive/Parking/scripts/sensor-config
npx tsx register-sensors.ts sensors.csv
```

### 3.2 Configure IoT Certificates

For each sensor, create IoT thing with certificate:

```bash
aws iot create-thing --thing-name PSL01B-001 --profile visiondrive-parking --region me-central-1

aws iot create-keys-and-certificate \
  --set-as-active \
  --certificate-pem-outfile "sensor-cert.pem" \
  --public-key-outfile "sensor-public.key" \
  --private-key-outfile "sensor-private.key" \
  --profile visiondrive-parking \
  --region me-central-1
```

---

## Updating Lambda Functions

### Update Code

```bash
cd /Users/vadimkus/VisionDrive/Parking/infrastructure/lambda/event-processor
npm install --omit=dev
zip -r /tmp/event-processor.zip . -x "*.git*"

aws lambda update-function-code \
  --function-name VisionDrive-Parking-EventProcessor \
  --zip-file fileb:///tmp/event-processor.zip \
  --profile visiondrive-parking \
  --region me-central-1
```

### Update Environment Variables

```bash
aws lambda update-function-configuration \
  --function-name VisionDrive-Parking-EventProcessor \
  --environment "Variables={TABLE_NAME=VisionDrive-Parking,ALERT_TOPIC_ARN=arn:aws:sns:me-central-1:307436091440:VisionDrive-Parking-Alerts}" \
  --profile visiondrive-parking \
  --region me-central-1
```

---

## Database Operations

### Backup

```bash
aws dynamodb create-backup \
  --table-name VisionDrive-Parking \
  --backup-name "parking-backup-$(date +%Y%m%d)" \
  --profile visiondrive-parking \
  --region me-central-1
```

### Restore

```bash
aws dynamodb restore-table-from-backup \
  --target-table-name VisionDrive-Parking-Restored \
  --backup-arn arn:aws:dynamodb:me-central-1:307436091440:table/VisionDrive-Parking/backup/xxx \
  --profile visiondrive-parking \
  --region me-central-1
```

---

## Rollback

### Lambda Rollback

```bash
# List versions
aws lambda list-versions-by-function \
  --function-name VisionDrive-Parking-EventProcessor \
  --profile visiondrive-parking \
  --region me-central-1

# Rollback to previous version
aws lambda update-alias \
  --function-name VisionDrive-Parking-EventProcessor \
  --name prod \
  --function-version 1 \
  --profile visiondrive-parking \
  --region me-central-1
```

### Database Rollback

Use Point-in-Time Recovery (PITR) if enabled:

```bash
aws dynamodb restore-table-to-point-in-time \
  --source-table-name VisionDrive-Parking \
  --target-table-name VisionDrive-Parking-Restored \
  --restore-date-time "2026-01-11T00:00:00Z" \
  --profile visiondrive-parking \
  --region me-central-1
```

---

## Monitoring

### CloudWatch Dashboards

Create dashboard for:
- Lambda invocations
- API Gateway latency
- DynamoDB read/write capacity
- IoT Core message count

### Alarms

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name "Parking-API-Errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --dimensions Name=FunctionName,Value=VisionDrive-Parking-ApiHandler \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --alarm-actions arn:aws:sns:me-central-1:307436091440:VisionDrive-Parking-Alerts \
  --profile visiondrive-parking \
  --region me-central-1
```

---

## Production Checklist

### Pre-Deployment

- [ ] AWS credentials configured
- [ ] DynamoDB table created
- [ ] Lambda functions deployed
- [ ] API Gateway configured
- [ ] IoT Core rules active
- [ ] SNS topic created
- [ ] Vercel environment variables set

### Post-Deployment

- [ ] API endpoint accessible
- [ ] Dashboard loads data
- [ ] Sensors connecting
- [ ] Events being recorded
- [ ] Alerts working
- [ ] Logs being captured

### Security

- [ ] API authentication enabled
- [ ] HTTPS enforced
- [ ] IAM roles minimal permissions
- [ ] Credentials rotated
- [ ] Audit logging enabled

---

## Scaling Considerations

### DynamoDB

- On-demand billing scales automatically
- For predictable traffic, switch to provisioned capacity
- Enable auto-scaling if needed

### Lambda

- Current memory: 256MB
- Increase if processing time is slow
- Consider provisioned concurrency for predictable load

### API Gateway

- Consider caching for read-heavy endpoints
- Enable throttling for production

---

## Cost Optimization

### DynamoDB
- Use TTL to auto-delete old events (90 days)
- Monitor read/write capacity usage

### Lambda
- Right-size memory allocation
- Review CloudWatch Insights for optimization

### API Gateway
- Enable caching for static data
- Use edge-optimized for global access
