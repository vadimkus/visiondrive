import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as path from 'path';
import { Construct } from 'constructs';

interface ApiStackProps extends cdk.StackProps {
  parkingTable: dynamodb.Table;
}

export class ApiStack extends cdk.Stack {
  public readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // ==========================================
    // API LAMBDA ROLE
    // ==========================================

    const apiLambdaRole = new iam.Role(this, 'ApiLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // DynamoDB permissions
    props.parkingTable.grantReadWriteData(apiLambdaRole);

    // ==========================================
    // API HANDLER LAMBDA
    // ==========================================

    const apiHandler = new lambda.Function(this, 'ApiHandler', {
      functionName: 'parking-api',
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/api-handler')),
      role: apiLambdaRole,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        TABLE_NAME: props.parkingTable.tableName,
      },
    });

    // ==========================================
    // API GATEWAY
    // ==========================================

    this.api = new apigateway.RestApi(this, 'ParkingApi', {
      restApiName: 'VisionDrive Parking API',
      description: 'VisionDrive Parking System REST API',
      deployOptions: {
        stageName: 'v1',
        throttlingBurstLimit: 100,
        throttlingRateLimit: 50,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
      },
    });

    const lambdaIntegration = new apigateway.LambdaIntegration(apiHandler);

    // ==========================================
    // API RESOURCES - ZONES
    // ==========================================

    // /zones
    const zones = this.api.root.addResource('zones');
    zones.addMethod('GET', lambdaIntegration);    // List zones
    zones.addMethod('POST', lambdaIntegration);   // Create zone

    // /zones/{zoneId}
    const zone = zones.addResource('{zoneId}');
    zone.addMethod('GET', lambdaIntegration);     // Get zone
    zone.addMethod('PUT', lambdaIntegration);     // Update zone
    zone.addMethod('DELETE', lambdaIntegration);  // Delete zone

    // /zones/{zoneId}/bays
    const zoneBays = zone.addResource('bays');
    zoneBays.addMethod('GET', lambdaIntegration); // List bays in zone

    // /zones/{zoneId}/bays/{bayNumber}
    const zoneBay = zoneBays.addResource('{bayNumber}');
    zoneBay.addMethod('GET', lambdaIntegration);  // Get specific bay

    // /zones/{zoneId}/events
    const zoneEvents = zone.addResource('events');
    zoneEvents.addMethod('GET', lambdaIntegration); // Get zone events

    // /zones/{zoneId}/analytics
    const zoneAnalytics = zone.addResource('analytics');
    zoneAnalytics.addMethod('GET', lambdaIntegration); // Get zone analytics

    // ==========================================
    // API RESOURCES - SENSORS
    // ==========================================

    // /sensors
    const sensors = this.api.root.addResource('sensors');
    sensors.addMethod('GET', lambdaIntegration);   // List sensors
    sensors.addMethod('POST', lambdaIntegration);  // Register sensor

    // /sensors/{sensorId}
    const sensor = sensors.addResource('{sensorId}');
    sensor.addMethod('GET', lambdaIntegration);    // Get sensor
    sensor.addMethod('PUT', lambdaIntegration);    // Update sensor
    sensor.addMethod('DELETE', lambdaIntegration); // Remove sensor

    // ==========================================
    // API RESOURCES - EVENTS
    // ==========================================

    // /events
    const events = this.api.root.addResource('events');
    events.addMethod('GET', lambdaIntegration);    // Query all events

    // ==========================================
    // API RESOURCES - ANALYTICS
    // ==========================================

    // /analytics
    const analytics = this.api.root.addResource('analytics');

    // /analytics/occupancy
    const occupancy = analytics.addResource('occupancy');
    occupancy.addMethod('GET', lambdaIntegration);

    // /analytics/revenue
    const revenue = analytics.addResource('revenue');
    revenue.addMethod('GET', lambdaIntegration);

    // ==========================================
    // OUTPUTS
    // ==========================================

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.api.url,
      description: 'Parking API URL',
      exportName: 'Parking-ApiUrl',
    });

    new cdk.CfnOutput(this, 'ApiId', {
      value: this.api.restApiId,
      description: 'API Gateway ID',
      exportName: 'Parking-ApiId',
    });
  }
}
