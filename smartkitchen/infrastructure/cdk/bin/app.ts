#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VpcStack } from '../lib/vpc-stack';
import { RdsStack } from '../lib/rds-stack';
import { IoTStack } from '../lib/iot-stack';
import { DatabaseStack } from '../lib/database-stack';
import { LambdaStack } from '../lib/lambda-stack';
import { ApiStack } from '../lib/api-stack';
import { WafStack } from '../lib/waf-stack';
import { CloudTrailStack } from '../lib/cloudtrail-stack';

const app = new cdk.App();

// ==========================================
// 🇦🇪 UAE DATA RESIDENCY CONFIGURATION
// All resources deployed to me-central-1 (Abu Dhabi)
// ==========================================

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: 'me-central-1', // UAE Region - Data Residency Compliance
};

// ==========================================
// STACK 1: VPC (Network Infrastructure)
// ==========================================
const vpcStack = new VpcStack(app, 'SmartKitchen-VPC', {
  env,
  description: 'VisionDrive Smart Kitchen - VPC for RDS & Lambda',
});

// ==========================================
// STACK 2: RDS PostgreSQL (Users & Auth)
// 🇦🇪 UAE Compliant: All user data in me-central-1
// ==========================================
const rdsStack = new RdsStack(app, 'SmartKitchen-RDS', {
  env,
  description: 'VisionDrive Smart Kitchen - RDS PostgreSQL (Users/Auth)',
  vpc: vpcStack.vpc,
  rdsSecurityGroup: vpcStack.rdsSecurityGroup,
});
rdsStack.addDependency(vpcStack);

// ==========================================
// STACK 3: IoT Databases (Timestream + DynamoDB)
// ==========================================
const databaseStack = new DatabaseStack(app, 'SmartKitchen-Database', {
  env,
  description: 'VisionDrive Smart Kitchen - IoT Database Infrastructure',
});

// ==========================================
// STACK 4: Lambda Functions
// ==========================================
const lambdaStack = new LambdaStack(app, 'SmartKitchen-Lambda', {
  env,
  description: 'VisionDrive Smart Kitchen - Lambda Functions',
  sensorReadingsTable: databaseStack.sensorReadingsTable,
  devicesTable: databaseStack.devicesTable,
  alertsTable: databaseStack.alertsTable,
});
lambdaStack.addDependency(databaseStack);

// ==========================================
// STACK 5: IoT Core
// ==========================================
const iotStack = new IoTStack(app, 'SmartKitchen-IoT', {
  env,
  description: 'VisionDrive Smart Kitchen - IoT Core Infrastructure',
  dataIngestionLambda: lambdaStack.dataIngestionFunction,
  alertsLambda: lambdaStack.alertsFunction,
});
iotStack.addDependency(lambdaStack);

// ==========================================
// STACK 6: API Gateway
// ==========================================
const apiStack = new ApiStack(app, 'SmartKitchen-API', {
  env,
  description: 'VisionDrive Smart Kitchen - API Gateway',
  sensorReadingsTable: databaseStack.sensorReadingsTable,
  devicesTable: databaseStack.devicesTable,
  alertsTable: databaseStack.alertsTable,
});
apiStack.addDependency(databaseStack);

// ==========================================
// STACK 7: WAF (Web Application Firewall)
// 🛡️ Security: OWASP protection for API
// ==========================================
const wafStack = new WafStack(app, 'SmartKitchen-WAF', {
  env,
  description: 'VisionDrive Smart Kitchen - AWS WAF Protection',
  api: apiStack.api,
});
wafStack.addDependency(apiStack);

// ==========================================
// STACK 8: CloudTrail (Audit Logging)
// 📋 Security: Comprehensive audit trail
// ==========================================
const cloudTrailStack = new CloudTrailStack(app, 'SmartKitchen-CloudTrail', {
  env,
  description: 'VisionDrive Smart Kitchen - CloudTrail Audit Logging',
});

// ==========================================
// DEPLOYMENT ORDER
// ==========================================
// 1. VPC (network foundation)
// 2. RDS (user database)
// 3. Database (Timestream + DynamoDB)
// 4. Lambda (functions with VPC access)
// 5. IoT Core (sensor connectivity)
// 6. API Gateway (REST API)
// 7. WAF (Web Application Firewall)
// 8. CloudTrail (Audit Logging)

app.synth();
