# VisionDrive Parking - Security Guide

## Overview

This document outlines security best practices and configurations for the VisionDrive Parking system.

---

## Data Residency

All data is stored in the **UAE region (me-central-1)** for compliance with local data residency requirements.

| Service | Region | Data Classification |
|---------|--------|---------------------|
| DynamoDB | me-central-1 | Parking events, sensor data |
| IoT Core | me-central-1 | Device connections |
| Lambda | me-central-1 | Processing logic |
| API Gateway | me-central-1 | API requests |
| CloudWatch | me-central-1 | Logs and metrics |

---

## AWS Security Configuration

### IAM Roles

#### Lambda Role
- **Name:** `VisionDrive-Parking-Lambda-Role`
- **Principle of Least Privilege:** Only permissions needed for operation

**Permissions:**
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
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:me-central-1:307436091440:table/VisionDrive-Parking",
        "arn:aws:dynamodb:me-central-1:307436091440:table/VisionDrive-Parking/index/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:me-central-1:307436091440:*"
    },
    {
      "Effect": "Allow",
      "Action": "sns:Publish",
      "Resource": "arn:aws:sns:me-central-1:307436091440:VisionDrive-Parking-Alerts"
    }
  ]
}
```

### API Gateway Security

#### Current State (Development)
- No authentication
- CORS enabled for all origins

#### Production Recommendations

1. **API Key Authentication**
   ```bash
   aws apigateway create-api-key --name "parking-api-key" --enabled
   ```

2. **IAM Authentication**
   - Use AWS Signature Version 4
   - Suitable for server-to-server

3. **JWT Authentication**
   - Use Amazon Cognito
   - Best for user-facing apps

4. **Rate Limiting**
   ```bash
   aws apigateway create-usage-plan \
     --name "parking-standard" \
     --throttle burstLimit=100,rateLimit=50
   ```

### IoT Core Security

#### Device Authentication

Each sensor requires:
1. **X.509 Certificate** - Device identity
2. **IoT Policy** - Permission to publish/subscribe
3. **Thing Registration** - Device metadata

**IoT Policy Example:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "iot:Connect",
      "Resource": "arn:aws:iot:me-central-1:307436091440:client/${iot:ClientId}"
    },
    {
      "Effect": "Allow",
      "Action": "iot:Publish",
      "Resource": "arn:aws:iot:me-central-1:307436091440:topic/visiondrive/parking/*"
    }
  ]
}
```

#### Certificate Management

- Rotate certificates annually
- Revoke compromised certificates immediately
- Use AWS IoT Fleet Provisioning for new devices

---

## Encryption

### Data at Rest

| Service | Encryption |
|---------|------------|
| DynamoDB | AWS managed keys (default) |
| S3 (if used) | SSE-S3 |
| CloudWatch Logs | AWS managed keys |

### Data in Transit

| Connection | Encryption |
|------------|------------|
| API Gateway | TLS 1.2+ |
| IoT Core | TLS 1.2 (MQTTS) |
| Lambda to DynamoDB | AWS internal (TLS) |

---

## Credential Management

### AWS Credentials

**DO NOT:**
- Commit credentials to Git
- Share credentials in chat/email
- Use root account credentials

**DO:**
- Use IAM users with MFA
- Rotate access keys regularly
- Use environment variables

### Credential Rotation

```bash
# Create new access key
aws iam create-access-key --user-name visiondrive-admin

# Delete old access key
aws iam delete-access-key --user-name visiondrive-admin --access-key-id OLD_KEY_ID
```

### Secrets Management

For production, use AWS Secrets Manager:

```bash
aws secretsmanager create-secret \
  --name VisionDrive/Parking/ApiKeys \
  --secret-string '{"apiKey":"xxx","webhookSecret":"yyy"}'
```

---

## Network Security

### VPC Configuration (Optional)

For enhanced security, deploy Lambdas in VPC:

1. Create VPC with private subnets
2. Add VPC endpoints for DynamoDB
3. Configure Lambda VPC settings

### Web Application Firewall (WAF)

Enable WAF for API Gateway:

```bash
aws wafv2 create-web-acl \
  --name VisionDrive-Parking-WAF \
  --scope REGIONAL \
  --default-action Allow={} \
  --rules file://waf-rules.json
```

Recommended rules:
- Rate limiting
- SQL injection protection
- XSS protection
- Geographic restrictions (UAE only)

---

## Monitoring & Auditing

### CloudTrail

Enable CloudTrail for API activity logging:

```bash
aws cloudtrail create-trail \
  --name VisionDrive-Audit \
  --s3-bucket-name visiondrive-audit-logs \
  --is-multi-region-trail
```

### CloudWatch Alarms

Create security alarms:

```bash
# Alert on unusual API activity
aws cloudwatch put-metric-alarm \
  --alarm-name "Parking-Unusual-API-Activity" \
  --metric-name Count \
  --namespace AWS/ApiGateway \
  --dimensions Name=ApiName,Value=VisionDrive-Parking-API \
  --statistic Sum \
  --period 300 \
  --threshold 10000 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions arn:aws:sns:me-central-1:307436091440:VisionDrive-Parking-Alerts
```

### AWS Config

Enable Config for compliance monitoring:
- Check IAM policies
- Verify encryption settings
- Monitor resource changes

---

## Incident Response

### Security Incident Procedure

1. **Detect**
   - CloudWatch alarms
   - GuardDuty findings
   - User reports

2. **Contain**
   - Disable compromised credentials
   - Block suspicious IPs
   - Isolate affected resources

3. **Investigate**
   - Review CloudTrail logs
   - Analyze CloudWatch metrics
   - Check access patterns

4. **Remediate**
   - Patch vulnerabilities
   - Rotate credentials
   - Update policies

5. **Recover**
   - Restore from backup if needed
   - Verify system integrity
   - Resume operations

### Emergency Contacts

- AWS Support: (via AWS Console)
- Security Team: security@visiondrive.ae

---

## Compliance Checklist

### Regular Reviews

- [ ] IAM users and roles audited monthly
- [ ] Access keys rotated quarterly
- [ ] Security patches applied promptly
- [ ] Logs reviewed for anomalies
- [ ] Backup procedures tested

### Security Controls

- [ ] MFA enabled for all IAM users
- [ ] Root account protected
- [ ] Encryption enabled at rest and in transit
- [ ] API authentication configured
- [ ] Rate limiting enabled
- [ ] WAF rules configured

---

## Security Headers

For the frontend (Vercel), add security headers in `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'" }
      ]
    }
  ]
}
```

---

## Vulnerability Disclosure

If you discover a security vulnerability:

1. Do not disclose publicly
2. Email security@visiondrive.ae
3. Provide detailed description
4. Allow 90 days for remediation

---

## Resources

- [AWS Security Best Practices](https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [IoT Security Guidelines](https://docs.aws.amazon.com/iot/latest/developerguide/security.html)
