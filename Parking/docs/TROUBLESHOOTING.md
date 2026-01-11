# VisionDrive Parking - Troubleshooting Guide

## Quick Diagnostics

### Check System Status

```bash
# API Health
curl -s https://o2s68toqw0.execute-api.me-central-1.amazonaws.com/prod/zones | jq '.count'

# DynamoDB
aws dynamodb scan --table-name VisionDrive-Parking --select COUNT --profile visiondrive-parking --region me-central-1

# Lambda Status
aws lambda get-function --function-name VisionDrive-Parking-ApiHandler --profile visiondrive-parking --region me-central-1 | jq '.Configuration.State'
```

---

## Common Issues

### 1. Dashboard Not Loading Data

**Symptoms:**
- Spinning loader indefinitely
- "Error loading data" message
- Empty zone/sensor lists

**Causes & Solutions:**

| Cause | Solution |
|-------|----------|
| API endpoint unreachable | Check network connectivity |
| CORS issues | Verify API Gateway CORS settings |
| Lambda timeout | Increase Lambda timeout |
| DynamoDB throttling | Check capacity/switch to on-demand |

**Debug Steps:**

1. Open browser developer tools (F12)
2. Check Network tab for failed requests
3. Check Console for JavaScript errors
4. Test API directly:
   ```bash
   curl -v https://o2s68toqw0.execute-api.me-central-1.amazonaws.com/prod/zones
   ```

---

### 2. Sensors Not Reporting

**Symptoms:**
- "Last Seen" timestamp is stale
- Sensor shows as "Offline"
- No events being recorded

**Causes & Solutions:**

| Cause | Solution |
|-------|----------|
| Network connectivity | Check NB-IoT signal |
| Wrong APN settings | Verify du APN configuration |
| IoT certificate expired | Renew certificate |
| IoT rule disabled | Enable IoT rule |
| Sensor battery depleted | Replace battery |

**Debug Steps:**

1. Check IoT Core logs:
   ```bash
   aws logs tail /aws/iot/VisionDriveParkingStatusRule \
     --follow \
     --profile visiondrive-parking \
     --region me-central-1
   ```

2. Verify IoT rule is active:
   ```bash
   aws iot get-topic-rule \
     --rule-name VisionDriveParkingStatusRule \
     --profile visiondrive-parking \
     --region me-central-1
   ```

3. Test MQTT connection:
   ```bash
   mosquitto_pub -h a15wlpv31y3kre-ats.iot.me-central-1.amazonaws.com \
     -p 8883 \
     --cafile root-CA.crt \
     --cert device.pem.crt \
     --key private.pem.key \
     -t "visiondrive/parking/test/test/status" \
     -m '{"deviceId":"test","status":"vacant","battery":100,"signal":-70}'
   ```

---

### 3. API Errors (5xx)

**Symptoms:**
- "Internal Server Error" responses
- API returns 500/502/503

**Causes & Solutions:**

| Cause | Solution |
|-------|----------|
| Lambda timeout | Increase timeout to 30s |
| Lambda memory | Increase to 512MB |
| DynamoDB errors | Check table status |
| Code errors | Check CloudWatch logs |

**Debug Steps:**

1. Check Lambda logs:
   ```bash
   aws logs tail /aws/lambda/VisionDrive-Parking-ApiHandler \
     --follow \
     --profile visiondrive-parking \
     --region me-central-1
   ```

2. Check Lambda errors:
   ```bash
   aws cloudwatch get-metric-statistics \
     --namespace AWS/Lambda \
     --metric-name Errors \
     --dimensions Name=FunctionName,Value=VisionDrive-Parking-ApiHandler \
     --start-time $(date -u -v-1H +%Y-%m-%dT%H:%M:%SZ) \
     --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
     --period 300 \
     --statistics Sum \
     --profile visiondrive-parking \
     --region me-central-1
   ```

---

### 4. Incorrect Occupancy Data

**Symptoms:**
- Occupancy doesn't match physical status
- Stuck at 0% or 100%
- Count doesn't update

**Causes & Solutions:**

| Cause | Solution |
|-------|----------|
| Sensor miscalibration | Recalibrate sensor |
| Events not processing | Check Lambda function |
| State mismatch | Run data reconciliation |

**Debug Steps:**

1. Check recent events for bay:
   ```bash
   curl "https://o2s68toqw0.execute-api.me-central-1.amazonaws.com/prod/events?zoneId=ZONE_ID&limit=20"
   ```

2. Verify bay status:
   ```bash
   curl "https://o2s68toqw0.execute-api.me-central-1.amazonaws.com/prod/zones/ZONE_ID/bays"
   ```

3. Check Lambda processing:
   ```bash
   aws logs filter-log-events \
     --log-group-name /aws/lambda/VisionDrive-Parking-EventProcessor \
     --filter-pattern "State change" \
     --profile visiondrive-parking \
     --region me-central-1
   ```

---

### 5. Alerts Not Sending

**Symptoms:**
- No email/SMS for low battery
- Offline sensors not alerting

**Causes & Solutions:**

| Cause | Solution |
|-------|----------|
| SNS subscription not confirmed | Confirm email subscription |
| Wrong topic ARN | Check Lambda env vars |
| No subscribers | Add email to SNS topic |

**Debug Steps:**

1. Check SNS subscriptions:
   ```bash
   aws sns list-subscriptions-by-topic \
     --topic-arn arn:aws:sns:me-central-1:307436091440:VisionDrive-Parking-Alerts \
     --profile visiondrive-parking \
     --region me-central-1
   ```

2. Verify subscription is confirmed:
   - Check for "PendingConfirmation" status
   - Click confirmation link in email

3. Test SNS manually:
   ```bash
   aws sns publish \
     --topic-arn arn:aws:sns:me-central-1:307436091440:VisionDrive-Parking-Alerts \
     --subject "Test Alert" \
     --message "This is a test alert" \
     --profile visiondrive-parking \
     --region me-central-1
   ```

---

### 6. High Latency

**Symptoms:**
- Dashboard loads slowly
- API responses take >3 seconds
- Timeouts

**Causes & Solutions:**

| Cause | Solution |
|-------|----------|
| Cold starts | Enable provisioned concurrency |
| Large scan queries | Add filters, use indexes |
| Network latency | Use regional endpoints |

**Debug Steps:**

1. Check Lambda duration:
   ```bash
   aws cloudwatch get-metric-statistics \
     --namespace AWS/Lambda \
     --metric-name Duration \
     --dimensions Name=FunctionName,Value=VisionDrive-Parking-ApiHandler \
     --start-time $(date -u -v-1H +%Y-%m-%dT%H:%M:%SZ) \
     --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
     --period 300 \
     --statistics Average \
     --profile visiondrive-parking \
     --region me-central-1
   ```

2. Check DynamoDB latency:
   ```bash
   aws cloudwatch get-metric-statistics \
     --namespace AWS/DynamoDB \
     --metric-name SuccessfulRequestLatency \
     --dimensions Name=TableName,Value=VisionDrive-Parking \
     --start-time $(date -u -v-1H +%Y-%m-%dT%H:%M:%SZ) \
     --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
     --period 300 \
     --statistics Average \
     --profile visiondrive-parking \
     --region me-central-1
   ```

---

## Log Locations

| Component | Log Location |
|-----------|--------------|
| API Handler Lambda | `/aws/lambda/VisionDrive-Parking-ApiHandler` |
| Event Processor Lambda | `/aws/lambda/VisionDrive-Parking-EventProcessor` |
| IoT Core Rules | `/aws/iot/VisionDriveParkingStatusRule` |
| API Gateway | Enable access logging in API Gateway |

### View Logs

```bash
# Real-time API logs
aws logs tail /aws/lambda/VisionDrive-Parking-ApiHandler --follow --profile visiondrive-parking --region me-central-1

# Search for errors
aws logs filter-log-events \
  --log-group-name /aws/lambda/VisionDrive-Parking-ApiHandler \
  --filter-pattern "ERROR" \
  --profile visiondrive-parking \
  --region me-central-1
```

---

## Health Check Commands

```bash
# Full system check script
echo "=== API Check ==="
curl -s https://o2s68toqw0.execute-api.me-central-1.amazonaws.com/prod/zones | jq '.count'

echo "=== DynamoDB Check ==="
aws dynamodb describe-table --table-name VisionDrive-Parking --profile visiondrive-parking --region me-central-1 | jq '.Table.TableStatus'

echo "=== Lambda Check ==="
aws lambda get-function --function-name VisionDrive-Parking-ApiHandler --profile visiondrive-parking --region me-central-1 | jq '.Configuration.State'

echo "=== IoT Check ==="
aws iot describe-endpoint --endpoint-type iot:Data-ATS --profile visiondrive-parking --region me-central-1

echo "=== SNS Check ==="
aws sns list-subscriptions-by-topic --topic-arn arn:aws:sns:me-central-1:307436091440:VisionDrive-Parking-Alerts --profile visiondrive-parking --region me-central-1 | jq '.Subscriptions | length'
```

---

## Escalation

If issues persist after troubleshooting:

1. Collect relevant logs
2. Document reproduction steps
3. Check AWS Service Health Dashboard
4. Contact AWS Support (if applicable)

---

## Useful Links

- [AWS IoT Core Troubleshooting](https://docs.aws.amazon.com/iot/latest/developerguide/iot-troubleshooting.html)
- [DynamoDB Troubleshooting](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Troubleshooting.html)
- [Lambda Troubleshooting](https://docs.aws.amazon.com/lambda/latest/dg/troubleshooting.html)
