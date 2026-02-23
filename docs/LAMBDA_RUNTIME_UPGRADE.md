# Lambda Runtime Upgrade: Node.js 22.x

> **Date:** January 13, 2026  
> **Author:** VisionDrive DevOps  
> **Status:** ✅ Completed

## Executive Summary

All VisionDrive AWS Lambda functions have been upgraded from Node.js 18.x/20.x to **Node.js 22.x** in response to AWS Health notification regarding Node.js 20.x end-of-life scheduled for April 30, 2026.

---

## Background

### AWS Health Notification

On January 13, 2026, AWS issued a notification ([AWS_LAMBDA_PLANNED_LIFECYCLE_EVENT](https://health.aws.amazon.com)) regarding the deprecation of Node.js 20.x runtime in AWS Lambda:

| Milestone | Date | Impact |
|-----------|------|--------|
| End of Support | April 30, 2026 | No security patches, no technical support |
| Creation Blocked | June 1, 2026 | Cannot create new functions with Node.js 20.x |
| Updates Blocked | July 1, 2026 | Cannot update existing functions |

### Affected Account

- **AWS Account:** 307436091440
- **Region:** me-central-1 (UAE)
- **Services:** Smart Kitchen IoT, Parking Management System

---

## Pre-Upgrade State

### Smart Kitchen Functions (Node.js 20.x)

| Function Name | Previous Runtime | Purpose |
|---------------|------------------|---------|
| `smartkitchen-api` | nodejs20.x | REST API handler for kitchen management |
| `smartkitchen-data-ingestion` | nodejs20.x | Process IoT sensor data from kitchens |
| `smartkitchen-alerts` | nodejs20.x | Temperature threshold alerts & notifications |
| `smartkitchen-analytics` | nodejs20.x | Daily reports and statistics generation |

---

## Upgrade Actions

### 1. Infrastructure Code Updates

#### CDK Stack Files (TypeScript)

| File | Changes |
|------|---------|
| `smartkitchen/infrastructure/cdk/lib/lambda-stack.ts` | 3× `NODEJS_20_X` → `NODEJS_22_X` |
| `smartkitchen/infrastructure/cdk/lib/api-stack.ts` | 1× `NODEJS_20_X` → `NODEJS_22_X` |
| `Parking/infrastructure/cdk/lib/lambda-stack.ts` | 2× `NODEJS_18_X` → `NODEJS_22_X` |
| `Parking/infrastructure/cdk/lib/api-stack.ts` | 1× `NODEJS_18_X` → `NODEJS_22_X` |

#### Deployment Scripts (Shell)

| File | Changes |
|------|---------|
| `Parking/scripts/deploy/setup-mqtt-auth.sh` | `--runtime nodejs20.x` → `--runtime nodejs22.x` |
| `Parking/scripts/deploy/deploy-all.sh` | 2× `--runtime nodejs20.x` → `--runtime nodejs22.x` |

### 2. Documentation Updates

| File | Updated References |
|------|-------------------|
| `smartkitchen/PROGRESS.md` | Runtime version references |
| `smartkitchen/README.md` | Infrastructure table |
| `smartkitchen/docs/README.md` | Changelog entry |
| `smartkitchen/docs/LAMBDA_FUNCTIONS.md` | All function runtime specs |
| `smartkitchen/docs/AWS_SETUP.md` | Setup instructions |
| `smartkitchen/docs/SETUP_GUIDE.md` | CLI examples |
| `Parking/docs/AWS_SETUP.md` | Function specifications |
| `README.md` (root) | Project overview |

### 3. AWS Deployment

#### Smart Kitchen (via CDK)

```bash
cd smartkitchen/infrastructure/cdk
npm install
npx cdk deploy --all --require-approval never
```

**Deployment Output:**
- SmartKitchen-VPC: No changes
- SmartKitchen-Database: No changes
- SmartKitchen-RDS: No changes
- SmartKitchen-Lambda: ✅ Updated (3 functions)
- SmartKitchen-API: ✅ Updated (1 function)
- SmartKitchen-IoT: No changes

#### Parking (via AWS CLI)

CDK deployment was blocked due to existing DynamoDB table (`VisionDrive-Parking`) created outside CDK management. Functions were updated directly via AWS CLI:

```bash
aws lambda update-function-configuration \
  --function-name VisionDrive-Parking-EventProcessor \
  --runtime nodejs22.x \
  --region me-central-1 \
  --profile visiondrive-parking

aws lambda update-function-configuration \
  --function-name VisionDrive-Parking-ApiHandler \
  --runtime nodejs22.x \
  --region me-central-1 \
  --profile visiondrive-parking

aws lambda update-function-configuration \
  --function-name VisionDrive-Parking-CustomAuthorizer \
  --runtime nodejs22.x \
  --region me-central-1 \
  --profile visiondrive-parking
```

---

## Post-Upgrade State

### Verification Command

```bash
aws lambda list-functions --region me-central-1 \
  --query "Functions[].{Name:FunctionName,Runtime:Runtime}" \
  --output table
```

### Final Configuration

| Function | Runtime | Status |
|----------|---------|--------|
| `smartkitchen-api` | nodejs22.x | ✅ Active |
| `smartkitchen-data-ingestion` | nodejs22.x | ✅ Active |
| `smartkitchen-alerts` | nodejs22.x | ✅ Active |
| `smartkitchen-analytics` | nodejs22.x | ✅ Active |
| `VisionDrive-Parking-EventProcessor` | nodejs22.x | ✅ Active |
| `VisionDrive-Parking-ApiHandler` | nodejs22.x | ✅ Active |
| `VisionDrive-Parking-CustomAuthorizer` | nodejs22.x | ✅ Active |

**Total Functions Upgraded:** 7

---

## Runtime Support Timeline

| Runtime | EOL Date | Support Status |
|---------|----------|----------------|
| Node.js 18.x | October 2025 | ❌ End of Life |
| Node.js 20.x | April 30, 2026 | ⚠️ Approaching EOL |
| **Node.js 22.x** | **April 2027** | ✅ **Current LTS** |
| Node.js 24.x | TBD (~2028) | 🔮 Future |

---

## Known Issues & Notes

### Parking CDK Stack Drift

The Parking infrastructure has a DynamoDB table (`VisionDrive-Parking`) that exists outside CDK management. This causes CDK deployments to fail with:

```
Resource of type 'AWS::DynamoDB::Table' with identifier 'VisionDrive-Parking' already exists.
```

**Workaround Options:**
1. Import the existing table into CDK (recommended for future)
2. Use AWS CLI for Lambda updates (current approach)
3. Modify CDK to reference existing table instead of creating

### Compatibility

Node.js 22.x includes:
- V8 engine 12.4 (improved performance)
- Native WebSocket client
- Built-in test runner improvements
- `require(esm)` support

All existing Lambda function code is compatible with Node.js 22.x without modifications.

---

## Rollback Procedure

If issues arise, rollback to Node.js 20.x:

```bash
# Smart Kitchen (via CDK)
# Revert code changes and redeploy

# Parking (via CLI)
aws lambda update-function-configuration \
  --function-name <FUNCTION_NAME> \
  --runtime nodejs20.x \
  --region me-central-1 \
  --profile visiondrive-parking
```

---

## Future Maintenance

### Next Upgrade Window

- **Target Runtime:** Node.js 24.x (when available in Lambda)
- **Expected Timeline:** Q2 2027
- **Trigger:** Node.js 22.x EOL announcement (~6 months before April 2027)

### Monitoring

Set up AWS Health notifications for future runtime deprecations:

```bash
# Subscribe to Lambda runtime events
aws health describe-event-types \
  --filter "services=LAMBDA,eventTypeCategories=scheduledChange"
```

---

## References

- [AWS Lambda Runtime Support Policy](https://docs.aws.amazon.com/lambda/latest/dg/runtime-support-policy.html)
- [Node.js Release Schedule](https://github.com/nodejs/Release#release-schedule)
- [AWS Health Dashboard](https://health.aws.amazon.com)
- [Node.js 22 Release Notes](https://nodejs.org/en/blog/release/v22.0.0)

---

## Changelog

| Date | Action | By |
|------|--------|-----|
| 2026-01-13 | Upgraded all 7 Lambda functions to Node.js 22.x | DevOps |
| 2026-01-13 | Updated CDK infrastructure code | DevOps |
| 2026-01-13 | Updated deployment scripts | DevOps |
| 2026-01-13 | Updated all documentation | DevOps |

---

*Document generated: January 13, 2026*
