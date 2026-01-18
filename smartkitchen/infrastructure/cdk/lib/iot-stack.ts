import * as cdk from 'aws-cdk-lib';
import * as iot from 'aws-cdk-lib/aws-iot';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

interface IoTStackProps extends cdk.StackProps {
  dataIngestionLambda: lambda.Function;
  alertsLambda: lambda.Function;
}

export class IoTStack extends cdk.Stack {
  private iotLogsRole: iam.Role;

  constructor(scope: Construct, id: string, props: IoTStackProps) {
    super(scope, id, props);

    // Create IoT Logs Role once for reuse
    this.iotLogsRole = this.createIoTLogsRole();

    // ==========================================
    // IOT THING TYPES
    // ==========================================

    // PS-NB-GE: Analog temperature sensor (4-20mA probe)
    const thingType = new iot.CfnThingType(this, 'TemperatureSensorType', {
      thingTypeName: 'TemperatureSensor',
      thingTypeProperties: {
        thingTypeDescription: 'Dragino PS-NB-GE Temperature Sensor',
        searchableAttributes: ['kitchen', 'location'],
      },
    });

    // S31-NB: Environment sensor (SHT31 temp + humidity)
    const environmentSensorType = new iot.CfnThingType(this, 'EnvironmentSensorType', {
      thingTypeName: 'EnvironmentSensor',
      thingTypeProperties: {
        thingTypeDescription: 'Dragino S31-NB Temperature & Humidity Sensor',
        searchableAttributes: ['kitchen', 'location'],
      },
    });

    // ==========================================
    // IOT POLICY FOR SENSORS
    // ==========================================

    const sensorPolicy = new iot.CfnPolicy(this, 'SensorPolicy', {
      policyName: 'VisionDrive-SensorPolicy',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'AllowConnect',
            Effect: 'Allow',
            Action: 'iot:Connect',
            Resource: `arn:aws:iot:${this.region}:${this.account}:client/visiondrive-*`,
          },
          {
            Sid: 'AllowPublish',
            Effect: 'Allow',
            Action: 'iot:Publish',
            Resource: `arn:aws:iot:${this.region}:${this.account}:topic/visiondrive/*`,
          },
          {
            Sid: 'AllowSubscribe',
            Effect: 'Allow',
            Action: 'iot:Subscribe',
            Resource: `arn:aws:iot:${this.region}:${this.account}:topicfilter/visiondrive/*/commands`,
          },
          {
            Sid: 'AllowReceive',
            Effect: 'Allow',
            Action: 'iot:Receive',
            Resource: `arn:aws:iot:${this.region}:${this.account}:topic/visiondrive/*/commands`,
          },
        ],
      },
    });

    // ==========================================
    // IOT RULE - DATA INGESTION
    // ==========================================

    // Grant IoT permission to invoke Lambda
    props.dataIngestionLambda.addPermission('IoTInvoke', {
      principal: new iam.ServicePrincipal('iot.amazonaws.com'),
      action: 'lambda:InvokeFunction',
    });

    const dataIngestionRule = new iot.CfnTopicRule(this, 'DataIngestionRule', {
      ruleName: 'SmartKitchen_DataIngestion',
      topicRulePayload: {
        sql: `SELECT 
          topic(3) as deviceId, 
          topic(2) as kitchenId, 
          IDC_mA as raw_ma, 
          Battery as battery,
          VDC_V as voltage,
          timestamp() as received_at 
        FROM 'visiondrive/+/+/temperature'`,
        awsIotSqlVersion: '2016-03-23',
        ruleDisabled: false,
        actions: [
          {
            lambda: {
              functionArn: props.dataIngestionLambda.functionArn,
            },
          },
        ],
        errorAction: {
          cloudwatchLogs: {
            logGroupName: '/aws/iot/smartkitchen-errors',
            roleArn: this.iotLogsRole.roleArn,
          },
        },
      },
    });

    // ==========================================
    // IOT RULE - S31-NB ENVIRONMENT SENSORS
    // ==========================================
    // S31-NB sends Temperature and Humidity directly (no mA conversion needed)
    // Payload: { mod: "S31-NB", Battery: 3.52, Temperature: 24.5, Humidity: 62.3 }

    props.dataIngestionLambda.addPermission('IoTInvokeEnvironment', {
      principal: new iam.ServicePrincipal('iot.amazonaws.com'),
      action: 'lambda:InvokeFunction',
      sourceArn: `arn:aws:iot:${this.region}:${this.account}:rule/SmartKitchen_EnvironmentIngestion`,
    });

    const environmentIngestionRule = new iot.CfnTopicRule(this, 'EnvironmentIngestionRule', {
      ruleName: 'SmartKitchen_EnvironmentIngestion',
      topicRulePayload: {
        sql: `SELECT 
          topic(3) as deviceId, 
          topic(2) as kitchenId, 
          Temperature as temperature,
          Humidity as humidity,
          Battery as battery,
          mod as sensorModel,
          timestamp() as received_at 
        FROM 'visiondrive/+/+/environment'`,
        awsIotSqlVersion: '2016-03-23',
        ruleDisabled: false,
        actions: [
          {
            lambda: {
              functionArn: props.dataIngestionLambda.functionArn,
            },
          },
        ],
        errorAction: {
          cloudwatchLogs: {
            logGroupName: '/aws/iot/smartkitchen-errors',
            roleArn: this.iotLogsRole.roleArn,
          },
        },
      },
    });

    // ==========================================
    // IOT RULE - S31-NB ALERTS (Danger Zone)
    // ==========================================
    // Alert when temperature is in danger zone (5°C - 60°C) for refrigeration equipment

    props.alertsLambda.addPermission('IoTInvokeEnvironmentAlerts', {
      principal: new iam.ServicePrincipal('iot.amazonaws.com'),
      action: 'lambda:InvokeFunction',
      sourceArn: `arn:aws:iot:${this.region}:${this.account}:rule/SmartKitchen_EnvironmentAlerts`,
    });

    const environmentAlertsRule = new iot.CfnTopicRule(this, 'EnvironmentAlertsRule', {
      ruleName: 'SmartKitchen_EnvironmentAlerts',
      topicRulePayload: {
        // Alert when temperature is in Dubai Municipality danger zone (5°C - 60°C)
        sql: `SELECT 
          topic(3) as deviceId, 
          topic(2) as kitchenId, 
          Temperature as temperature,
          Humidity as humidity,
          timestamp() as timestamp 
        FROM 'visiondrive/+/+/environment' 
        WHERE Temperature > 5 AND Temperature < 60`,
        awsIotSqlVersion: '2016-03-23',
        ruleDisabled: false,
        actions: [
          {
            lambda: {
              functionArn: props.alertsLambda.functionArn,
            },
          },
        ],
      },
    });

    // ==========================================
    // IOT RULE - ALERTS (High/Low Temperature) for PS-NB-GE
    // ==========================================

    props.alertsLambda.addPermission('IoTInvokeAlerts', {
      principal: new iam.ServicePrincipal('iot.amazonaws.com'),
      action: 'lambda:InvokeFunction',
    });

    const alertsRule = new iot.CfnTopicRule(this, 'AlertsRule', {
      ruleName: 'SmartKitchen_Alerts',
      topicRulePayload: {
        // Alert when current is outside normal range
        // 4-20mA range, so < 5mA or > 18mA indicates extreme temps
        sql: `SELECT 
          topic(3) as deviceId, 
          topic(2) as kitchenId, 
          IDC_mA as raw_ma,
          timestamp() as timestamp 
        FROM 'visiondrive/+/+/temperature' 
        WHERE IDC_mA < 5.5 OR IDC_mA > 17.5`,
        awsIotSqlVersion: '2016-03-23',
        ruleDisabled: false,
        actions: [
          {
            lambda: {
              functionArn: props.alertsLambda.functionArn,
            },
          },
        ],
      },
    });

    // ==========================================
    // OUTPUTS
    // ==========================================

    new cdk.CfnOutput(this, 'IoTPolicyName', {
      value: sensorPolicy.policyName!,
      description: 'IoT Policy Name for Sensors',
      exportName: 'SmartKitchen-IoTPolicy',
    });

    new cdk.CfnOutput(this, 'ThingTypeName', {
      value: thingType.thingTypeName!,
      description: 'IoT Thing Type Name',
      exportName: 'SmartKitchen-ThingType',
    });
  }

  private createIoTLogsRole(): iam.Role {
    const role = new iam.Role(this, 'IoTLogsRole', {
      assumedBy: new iam.ServicePrincipal('iot.amazonaws.com'),
    });

    role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:PutLogEvents',
      ],
      resources: ['*'],
    }));

    return role;
  }
}
