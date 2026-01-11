import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

/**
 * Database Stack for Smart Kitchen
 * 
 * 🇦🇪 UAE Data Residency: All data stored in me-central-1
 * 
 * Note: Using DynamoDB for time-series data instead of Timestream
 * because Timestream is not available in UAE region (me-central-1)
 */
export class DatabaseStack extends cdk.Stack {
  public readonly sensorReadingsTable: dynamodb.Table;
  public readonly devicesTable: dynamodb.Table;
  public readonly alertsTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ==========================================
    // SENSOR READINGS TABLE (Time-Series Data)
    // Using DynamoDB instead of Timestream for UAE compliance
    // ==========================================

    this.sensorReadingsTable = new dynamodb.Table(this, 'SensorReadingsTable', {
      tableName: 'VisionDrive-SensorReadings',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING }, // SENSOR#<sensorId>
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },      // READING#<timestamp>
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      timeToLiveAttribute: 'ttl', // Auto-expire old readings after 1 year
    });

    // GSI for querying by kitchen
    this.sensorReadingsTable.addGlobalSecondaryIndex({
      indexName: 'GSI1-Kitchen',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING }, // KITCHEN#<kitchenId>
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },      // READING#<timestamp>
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI for querying by tenant (customer)
    this.sensorReadingsTable.addGlobalSecondaryIndex({
      indexName: 'GSI2-Tenant',
      partitionKey: { name: 'GSI2PK', type: dynamodb.AttributeType.STRING }, // TENANT#<tenantId>
      sortKey: { name: 'GSI2SK', type: dynamodb.AttributeType.STRING },      // READING#<timestamp>
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // ==========================================
    // DEVICES TABLE (Device Config & Metadata)
    // ==========================================

    this.devicesTable = new dynamodb.Table(this, 'DevicesTable', {
      tableName: 'VisionDrive-Devices',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // GSI for querying by kitchen
    this.devicesTable.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // ==========================================
    // ALERTS TABLE
    // ==========================================

    this.alertsTable = new dynamodb.Table(this, 'AlertsTable', {
      tableName: 'VisionDrive-Alerts',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      timeToLiveAttribute: 'ttl',
    });

    // GSI for querying active alerts
    this.alertsTable.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // ==========================================
    // OUTPUTS
    // ==========================================

    new cdk.CfnOutput(this, 'SensorReadingsTableName', {
      value: this.sensorReadingsTable.tableName,
      description: 'DynamoDB Sensor Readings Table Name',
      exportName: 'SmartKitchen-SensorReadingsTable',
    });

    new cdk.CfnOutput(this, 'SensorReadingsTableArn', {
      value: this.sensorReadingsTable.tableArn,
      description: 'DynamoDB Sensor Readings Table ARN',
      exportName: 'SmartKitchen-SensorReadingsTableArn',
    });

    new cdk.CfnOutput(this, 'DevicesTableName', {
      value: this.devicesTable.tableName,
      description: 'DynamoDB Devices Table Name',
      exportName: 'SmartKitchen-DevicesTable',
    });

    new cdk.CfnOutput(this, 'AlertsTableName', {
      value: this.alertsTable.tableName,
      description: 'DynamoDB Alerts Table Name',
      exportName: 'SmartKitchen-AlertsTable',
    });
  }
}
