# AWS Account Setup for VisionDrive Parking

## Using Your Existing VisionDrive AWS Account

Yes, you can and should use your existing VisionDrive AWS account! This guide covers enabling the UAE region and organizing resources.

---

## Step 1: Enable UAE Region (me-central-1)

The UAE region is an **opt-in region** that must be manually enabled.

### Via AWS Console

1. **Sign in** to the AWS Management Console as your root user or an IAM user with administrative permissions

2. Navigate to **Account Settings**:
   - Click your account name (top right)
   - Select **Account**
   - Or go directly to: https://console.aws.amazon.com/billing/home#/account

3. Scroll down to **AWS Regions**

4. Find **Middle East (UAE) me-central-1**

5. Click **Enable** button

6. Confirm in the dialog that appears

7. **Wait 5-10 minutes** for the region to activate

### Via AWS CLI

```bash
# Check current region status
aws account list-regions --region us-east-1

# Enable UAE region
aws account enable-region --region-name me-central-1 --region us-east-1

# Verify (may take a few minutes)
aws account get-region-opt-status --region-name me-central-1 --region us-east-1
```

---

## Step 2: Verify Region Access

After enabling, verify you can access the UAE region:

```bash
# Set default region
export AWS_DEFAULT_REGION=me-central-1

# List S3 buckets (should work even if empty)
aws s3 ls --region me-central-1

# Check IoT Core endpoint
aws iot describe-endpoint --endpoint-type iot:Data-ATS --region me-central-1

# Check DynamoDB
aws dynamodb list-tables --region me-central-1
```

---

## Step 3: Project Organization Strategy

### Option A: Tags (Recommended)

Use AWS tags to separate Smart Kitchen and Parking resources:

```yaml
# Smart Kitchen resources
Project: VisionDrive
Application: SmartKitchen
Environment: production | staging

# Parking resources  
Project: VisionDrive
Application: Parking
Environment: production | staging
```

### Option B: Resource Naming Convention

Use prefixes to distinguish projects:

```
Smart Kitchen:
- visiondrive-kitchen-data        (Timestream DB)
- visiondrive-kitchen-sensors     (DynamoDB)
- visiondrive-kitchen-*           (Lambda functions)

Parking:
- visiondrive-parking-data        (DynamoDB table)
- visiondrive-parking-*           (Lambda functions)
```

### CDK Stack Names

```typescript
// Smart Kitchen
SmartKitchenDatabaseStack
SmartKitchenIoTStack
SmartKitchenApiStack

// Parking
ParkingDatabaseStack
ParkingIoTStack
ParkingApiStack
```

---

## Step 4: IAM Configuration

### Create Parking-Specific Role

Create a deployment role for the parking project:

```bash
# Create role trust policy
cat > trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": [
          "lambda.amazonaws.com",
          "iot.amazonaws.com"
        ]
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create the role
aws iam create-role \
  --role-name VisionDrive-Parking-Lambda \
  --assume-role-policy-document file://trust-policy.json \
  --tags Key=Project,Value=VisionDrive Key=Application,Value=Parking
```

### Attach Required Policies

```bash
# DynamoDB access
aws iam attach-role-policy \
  --role-name VisionDrive-Parking-Lambda \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

# CloudWatch logs
aws iam attach-role-policy \
  --role-name VisionDrive-Parking-Lambda \
  --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess

# IoT data access (for Lambda to read IoT topics)
aws iam attach-role-policy \
  --role-name VisionDrive-Parking-Lambda \
  --policy-arn arn:aws:iam::aws:policy/AWSIoTDataAccess
```

---

## Step 5: Configure Local AWS CLI

### Set Up Named Profile

```bash
# Edit ~/.aws/credentials
[visiondrive-parking]
aws_access_key_id = YOUR_ACCESS_KEY
aws_secret_access_key = YOUR_SECRET_KEY

# Edit ~/.aws/config
[profile visiondrive-parking]
region = me-central-1
output = json
```

### Use the Profile

```bash
# Set for current session
export AWS_PROFILE=visiondrive-parking

# Or use --profile flag
aws dynamodb list-tables --profile visiondrive-parking
```

---

## Step 6: CDK Bootstrap for UAE Region

Before deploying CDK stacks to UAE, bootstrap the region:

```bash
cd /Users/vadimkus/VisionDrive/Parking/infrastructure/cdk

# Install dependencies
npm install

# Bootstrap UAE region
npx cdk bootstrap aws://YOUR_ACCOUNT_ID/me-central-1 --profile visiondrive-parking
```

Replace `YOUR_ACCOUNT_ID` with your AWS account ID (12 digits).

---

## Step 7: Environment Variables

Create `.env.local` for local development:

```bash
# /Users/vadimkus/VisionDrive/.env.local

# AWS Configuration
AWS_REGION=me-central-1
AWS_PROFILE=visiondrive-parking

# Parking API (update after CDK deploy)
PARKING_API_URL=https://xxxxxxxxxx.execute-api.me-central-1.amazonaws.com/prod

# Smart Kitchen API (if already deployed)
SMART_KITCHEN_API_URL=https://yyyyyyyyyy.execute-api.me-central-1.amazonaws.com/prod
```

---

## Cost Allocation (Track Spending by Project)

### Enable Cost Allocation Tags

1. Go to **Billing** → **Cost allocation tags**
2. Activate these user-defined tags:
   - `Project`
   - `Application`
   - `Environment`

### View Costs by Project

1. Go to **Cost Explorer**
2. Group by → Tag: Application
3. Filter by → Tag: Project = VisionDrive

This lets you see Smart Kitchen vs Parking costs separately.

---

## Quick Verification Checklist

After setup, verify everything works:

```bash
# 1. Region enabled
aws account get-region-opt-status --region-name me-central-1 --region us-east-1

# 2. Can create resources in UAE
aws dynamodb create-table \
  --table-name test-uae-region \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region me-central-1

# 3. Clean up test
aws dynamodb delete-table --table-name test-uae-region --region me-central-1

# 4. IoT Core works
aws iot describe-endpoint --endpoint-type iot:Data-ATS --region me-central-1
```

---

## Next Steps

Once AWS is configured:

1. **Deploy CDK infrastructure**:
   ```bash
   cd /Users/vadimkus/VisionDrive/Parking/infrastructure/cdk
   npm install
   npx cdk deploy --all --profile visiondrive-parking
   ```

2. **Register sensors** (after IoT Core is deployed)

3. **Run migration** from TimescaleDB

4. **Update Vercel env vars** with new API endpoint

---

## Troubleshooting

### "Region not enabled" Error

```
An error occurred (UnrecognizedClientException): The security token included 
in the request is invalid.
```

**Solution**: Wait 5-10 minutes after enabling region. The activation is asynchronous.

### "Access Denied" Errors

Ensure your IAM user has `account:EnableRegion` permission:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "account:EnableRegion",
        "account:GetRegionOptStatus",
        "account:ListRegions"
      ],
      "Resource": "*"
    }
  ]
}
```

### CDK Bootstrap Fails

If bootstrap fails, ensure your account has the necessary permissions:

```bash
# Check caller identity
aws sts get-caller-identity --profile visiondrive-parking
```

The user needs `AdministratorAccess` or equivalent for first-time CDK bootstrap.
