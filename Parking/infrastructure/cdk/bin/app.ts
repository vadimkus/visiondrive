#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DatabaseStack } from '../lib/database-stack';
import { LambdaStack } from '../lib/lambda-stack';
import { IoTStack } from '../lib/iot-stack';
import { ApiStack } from '../lib/api-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: 'me-central-1', // UAE Region
};

// Database stack (DynamoDB)
const databaseStack = new DatabaseStack(app, 'Parking-Database', {
  env,
  description: 'VisionDrive Parking - DynamoDB Tables',
});

// Lambda functions stack
const lambdaStack = new LambdaStack(app, 'Parking-Lambda', {
  env,
  description: 'VisionDrive Parking - Lambda Functions',
  parkingTable: databaseStack.parkingTable,
});
lambdaStack.addDependency(databaseStack);

// IoT Core stack
const iotStack = new IoTStack(app, 'Parking-IoT', {
  env,
  description: 'VisionDrive Parking - IoT Core Infrastructure',
  eventProcessorLambda: lambdaStack.eventProcessorFunction,
});
iotStack.addDependency(lambdaStack);

// API Gateway stack
const apiStack = new ApiStack(app, 'Parking-API', {
  env,
  description: 'VisionDrive Parking - API Gateway',
  parkingTable: databaseStack.parkingTable,
});
apiStack.addDependency(databaseStack);

// Output summary
new cdk.CfnOutput(databaseStack, 'ParkingTableName', {
  value: databaseStack.parkingTable.tableName,
  description: 'Main Parking DynamoDB Table',
});

app.synth();
