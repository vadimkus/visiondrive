import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as path from 'path';
import { Construct } from 'constructs';

interface LambdaStackProps extends cdk.StackProps {
  parkingTable: dynamodb.Table;
}

export class LambdaStack extends cdk.Stack {
  public readonly eventProcessorFunction: lambda.Function;
  public readonly apiHandlerFunction: lambda.Function;
  public readonly alertTopic: sns.Topic;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    // ==========================================
    // SNS TOPIC FOR ALERTS
    // ==========================================

    this.alertTopic = new sns.Topic(this, 'ParkingAlertTopic', {
      topicName: 'VisionDrive-Parking-Alerts',
      displayName: 'VisionDrive Parking Alerts',
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

    // DynamoDB permissions
    props.parkingTable.grantReadWriteData(lambdaRole);

    // SNS permissions
    this.alertTopic.grantPublish(lambdaRole);

    // ==========================================
    // EVENT PROCESSOR LAMBDA
    // ==========================================

    this.eventProcessorFunction = new lambda.Function(this, 'EventProcessor', {
      functionName: 'parking-event-processor',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/event-processor')),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        TABLE_NAME: props.parkingTable.tableName,
        ALERT_TOPIC_ARN: this.alertTopic.topicArn,
      },
    });

    // ==========================================
    // API HANDLER LAMBDA
    // ==========================================

    this.apiHandlerFunction = new lambda.Function(this, 'ApiHandler', {
      functionName: 'parking-api-handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/api-handler')),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        TABLE_NAME: props.parkingTable.tableName,
      },
    });

    // ==========================================
    // OUTPUTS
    // ==========================================

    new cdk.CfnOutput(this, 'EventProcessorArn', {
      value: this.eventProcessorFunction.functionArn,
      description: 'Event Processor Lambda ARN',
      exportName: 'Parking-EventProcessorLambda',
    });

    new cdk.CfnOutput(this, 'ApiHandlerArn', {
      value: this.apiHandlerFunction.functionArn,
      description: 'API Handler Lambda ARN',
      exportName: 'Parking-ApiHandlerLambda',
    });

    new cdk.CfnOutput(this, 'AlertTopicArn', {
      value: this.alertTopic.topicArn,
      description: 'Parking Alert SNS Topic ARN',
      exportName: 'Parking-AlertTopic',
    });
  }
}
