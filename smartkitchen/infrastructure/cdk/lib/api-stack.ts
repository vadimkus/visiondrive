import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as path from 'path';
import { Construct } from 'constructs';

interface ApiStackProps extends cdk.StackProps {
  sensorReadingsTable: dynamodb.Table;
  devicesTable: dynamodb.Table;
  alertsTable: dynamodb.Table;
}

/**
 * API Stack for Smart Kitchen
 * 
 * 🇦🇪 UAE Data Residency: API Gateway deployed in me-central-1
 */
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

    // DynamoDB permissions for all tables
    props.sensorReadingsTable.grantReadWriteData(apiLambdaRole);
    props.devicesTable.grantReadWriteData(apiLambdaRole);
    props.alertsTable.grantReadWriteData(apiLambdaRole);

    // ==========================================
    // API HANDLER LAMBDA
    // ==========================================

    const apiHandler = new lambda.Function(this, 'ApiHandler', {
      functionName: 'smartkitchen-api',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/api')),
      role: apiLambdaRole,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        SENSOR_READINGS_TABLE: props.sensorReadingsTable.tableName,
        DEVICES_TABLE: props.devicesTable.tableName,
        ALERTS_TABLE: props.alertsTable.tableName,
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1', // Connection reuse for better performance
      },
    });

    // ==========================================
    // API GATEWAY
    // ==========================================

    this.api = new apigateway.RestApi(this, 'SmartKitchenApi', {
      restApiName: 'SmartKitchen API',
      description: 'VisionDrive Smart Kitchen REST API - UAE Region',
      deployOptions: {
        stageName: 'prod',
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
    // API RESOURCES
    // ==========================================

    // /auth
    const auth = this.api.root.addResource('auth');
    
    // /auth/login
    const authLogin = auth.addResource('login');
    authLogin.addMethod('POST', lambdaIntegration);  // Login
    
    // /auth/register (admin only)
    const authRegister = auth.addResource('register');
    authRegister.addMethod('POST', lambdaIntegration);  // Create user

    // /kitchens
    const kitchens = this.api.root.addResource('kitchens');
    kitchens.addMethod('GET', lambdaIntegration);    // List kitchens
    kitchens.addMethod('POST', lambdaIntegration);   // Create kitchen

    // /kitchens/{kitchenId}
    const kitchen = kitchens.addResource('{kitchenId}');
    kitchen.addMethod('GET', lambdaIntegration);     // Get kitchen
    kitchen.addMethod('PUT', lambdaIntegration);     // Update kitchen
    kitchen.addMethod('DELETE', lambdaIntegration);  // Delete kitchen

    // /kitchens/{kitchenId}/sensors
    const kitchenSensors = kitchen.addResource('sensors');
    kitchenSensors.addMethod('GET', lambdaIntegration); // List sensors in kitchen

    // /kitchens/{kitchenId}/readings
    const kitchenReadings = kitchen.addResource('readings');
    kitchenReadings.addMethod('GET', lambdaIntegration); // Get readings for kitchen

    // /kitchens/{kitchenId}/alerts
    const kitchenAlerts = kitchen.addResource('alerts');
    kitchenAlerts.addMethod('GET', lambdaIntegration); // Get alerts for kitchen

    // /sensors
    const sensors = this.api.root.addResource('sensors');
    sensors.addMethod('GET', lambdaIntegration);     // List all sensors
    sensors.addMethod('POST', lambdaIntegration);    // Register sensor

    // /sensors/{sensorId}
    const sensor = sensors.addResource('{sensorId}');
    sensor.addMethod('GET', lambdaIntegration);      // Get sensor details
    sensor.addMethod('PUT', lambdaIntegration);      // Update sensor
    sensor.addMethod('DELETE', lambdaIntegration);   // Remove sensor

    // /sensors/{sensorId}/readings
    const sensorReadings = sensor.addResource('readings');
    sensorReadings.addMethod('GET', lambdaIntegration); // Get sensor readings

    // /sensors/{sensorId}/current
    const sensorCurrent = sensor.addResource('current');
    sensorCurrent.addMethod('GET', lambdaIntegration); // Get current reading

    // /alerts
    const alerts = this.api.root.addResource('alerts');
    alerts.addMethod('GET', lambdaIntegration);      // List all alerts

    // /alerts/{alertId}
    const alert = alerts.addResource('{alertId}');
    alert.addMethod('GET', lambdaIntegration);       // Get alert details

    // /alerts/{alertId}/acknowledge
    const alertAck = alert.addResource('acknowledge');
    alertAck.addMethod('PUT', lambdaIntegration);    // Acknowledge alert

    // /analytics
    const analytics = this.api.root.addResource('analytics');
    
    // /analytics/daily
    const analyticsDaily = analytics.addResource('daily');
    analyticsDaily.addMethod('GET', lambdaIntegration);

    // /analytics/kitchen/{kitchenId}
    const analyticsKitchen = analytics.addResource('kitchen');
    const analyticsKitchenId = analyticsKitchen.addResource('{kitchenId}');
    analyticsKitchenId.addMethod('GET', lambdaIntegration);

    // ==========================================
    // OUTPUTS
    // ==========================================

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.api.url,
      description: 'Smart Kitchen API URL',
      exportName: 'SmartKitchen-ApiUrl',
    });

    new cdk.CfnOutput(this, 'ApiId', {
      value: this.api.restApiId,
      description: 'API Gateway ID',
      exportName: 'SmartKitchen-ApiId',
    });
  }
}
