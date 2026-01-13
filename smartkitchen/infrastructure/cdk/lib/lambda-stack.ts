import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as path from 'path';
import { Construct } from 'constructs';

interface LambdaStackProps extends cdk.StackProps {
  sensorReadingsTable: dynamodb.Table;
  devicesTable: dynamodb.Table;
  alertsTable: dynamodb.Table;
}

/**
 * Lambda Stack for Smart Kitchen
 * 
 * 🇦🇪 UAE Data Residency: All functions run in me-central-1
 */
export class LambdaStack extends cdk.Stack {
  public readonly dataIngestionFunction: lambda.Function;
  public readonly alertsFunction: lambda.Function;
  public readonly analyticsFunction: lambda.Function;
  public readonly alertTopic: sns.Topic;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    // ==========================================
    // SNS TOPIC FOR ALERTS
    // ==========================================

    this.alertTopic = new sns.Topic(this, 'AlertTopic', {
      topicName: 'SmartKitchen-Alerts',
      displayName: 'VisionDrive Smart Kitchen Alerts',
    });

    // ==========================================
    // LAMBDA EXECUTION ROLE
    // ==========================================

    const lambdaRole = new iam.Role(this, 'LambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // DynamoDB permissions for all tables
    props.sensorReadingsTable.grantReadWriteData(lambdaRole);
    props.devicesTable.grantReadWriteData(lambdaRole);
    props.alertsTable.grantReadWriteData(lambdaRole);

    // SNS permissions
    this.alertTopic.grantPublish(lambdaRole);

    // ==========================================
    // DATA INGESTION LAMBDA
    // ==========================================

    this.dataIngestionFunction = new lambda.Function(this, 'DataIngestion', {
      functionName: 'smartkitchen-data-ingestion',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/data-ingestion')),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        SENSOR_READINGS_TABLE: props.sensorReadingsTable.tableName,
        DEVICES_TABLE: props.devicesTable.tableName,
      },
    });

    // ==========================================
    // ALERTS LAMBDA
    // ==========================================

    this.alertsFunction = new lambda.Function(this, 'Alerts', {
      functionName: 'smartkitchen-alerts',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/alerts')),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        DEVICES_TABLE: props.devicesTable.tableName,
        ALERTS_TABLE: props.alertsTable.tableName,
        ALERT_TOPIC_ARN: this.alertTopic.topicArn,
      },
    });

    // ==========================================
    // ANALYTICS LAMBDA
    // ==========================================

    this.analyticsFunction = new lambda.Function(this, 'Analytics', {
      functionName: 'smartkitchen-analytics',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/analytics')),
      role: lambdaRole,
      timeout: cdk.Duration.minutes(5),
      memorySize: 512,
      environment: {
        SENSOR_READINGS_TABLE: props.sensorReadingsTable.tableName,
        DEVICES_TABLE: props.devicesTable.tableName,
      },
    });

    // ==========================================
    // OUTPUTS
    // ==========================================

    new cdk.CfnOutput(this, 'DataIngestionFunctionArn', {
      value: this.dataIngestionFunction.functionArn,
      description: 'Data Ingestion Lambda ARN',
      exportName: 'SmartKitchen-DataIngestionLambda',
    });

    new cdk.CfnOutput(this, 'AlertsFunctionArn', {
      value: this.alertsFunction.functionArn,
      description: 'Alerts Lambda ARN',
      exportName: 'SmartKitchen-AlertsLambda',
    });

    new cdk.CfnOutput(this, 'AlertTopicArn', {
      value: this.alertTopic.topicArn,
      description: 'Alert SNS Topic ARN',
      exportName: 'SmartKitchen-AlertTopic',
    });
  }
}
