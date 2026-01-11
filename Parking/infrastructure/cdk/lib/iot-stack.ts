import * as cdk from 'aws-cdk-lib';
import * as iot from 'aws-cdk-lib/aws-iot';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

interface IoTStackProps extends cdk.StackProps {
  eventProcessorLambda: lambda.Function;
}

export class IoTStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: IoTStackProps) {
    super(scope, id, props);

    // ==========================================
    // IOT THING TYPE
    // ==========================================

    const thingType = new iot.CfnThingType(this, 'ParkingSensorType', {
      thingTypeName: 'ParkingSensor',
      thingTypeProperties: {
        thingTypeDescription: 'SWI PSL01B NB-IoT Parking Sensor',
        searchableAttributes: ['zone', 'bay', 'model'],
      },
    });

    // ==========================================
    // IOT POLICY FOR SENSORS
    // ==========================================

    const sensorPolicy = new iot.CfnPolicy(this, 'ParkingSensorPolicy', {
      policyName: 'VisionDrive-ParkingSensorPolicy',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'AllowConnect',
            Effect: 'Allow',
            Action: 'iot:Connect',
            Resource: `arn:aws:iot:${this.region}:${this.account}:client/PSL01B-*`,
          },
          {
            Sid: 'AllowPublishStatus',
            Effect: 'Allow',
            Action: 'iot:Publish',
            Resource: `arn:aws:iot:${this.region}:${this.account}:topic/visiondrive/parking/+/+/status`,
          },
          {
            Sid: 'AllowPublishHealth',
            Effect: 'Allow',
            Action: 'iot:Publish',
            Resource: `arn:aws:iot:${this.region}:${this.account}:topic/visiondrive/parking/+/+/health`,
          },
          {
            Sid: 'AllowSubscribeCommands',
            Effect: 'Allow',
            Action: 'iot:Subscribe',
            Resource: `arn:aws:iot:${this.region}:${this.account}:topicfilter/visiondrive/parking/+/+/commands`,
          },
          {
            Sid: 'AllowReceiveCommands',
            Effect: 'Allow',
            Action: 'iot:Receive',
            Resource: `arn:aws:iot:${this.region}:${this.account}:topic/visiondrive/parking/+/+/commands`,
          },
        ],
      },
    });

    // ==========================================
    // IOT RULE - PROCESS STATUS UPDATES
    // ==========================================

    // Grant IoT permission to invoke Lambda
    props.eventProcessorLambda.addPermission('IoTInvoke', {
      principal: new iam.ServicePrincipal('iot.amazonaws.com'),
      action: 'lambda:InvokeFunction',
    });

    const statusRule = new iot.CfnTopicRule(this, 'StatusProcessingRule', {
      ruleName: 'VisionDrive_ParkingStatus',
      topicRulePayload: {
        sql: `
          SELECT 
            topic(3) as zoneId,
            topic(4) as bayId,
            deviceId,
            status,
            battery,
            signal,
            mode,
            timestamp() as receivedAt
          FROM 'visiondrive/parking/+/+/status'
        `,
        awsIotSqlVersion: '2016-03-23',
        ruleDisabled: false,
        actions: [
          {
            lambda: {
              functionArn: props.eventProcessorLambda.functionArn,
            },
          },
        ],
        errorAction: {
          cloudwatchLogs: {
            logGroupName: '/aws/iot/parking-errors',
            roleArn: this.createIoTLogsRole().roleArn,
          },
        },
      },
    });

    // ==========================================
    // IOT RULE - LOW BATTERY ALERT
    // ==========================================

    const lowBatteryRule = new iot.CfnTopicRule(this, 'LowBatteryRule', {
      ruleName: 'VisionDrive_ParkingLowBattery',
      topicRulePayload: {
        sql: `
          SELECT 
            topic(3) as zoneId,
            topic(4) as bayId,
            deviceId,
            battery,
            'LOW_BATTERY' as alertType,
            timestamp() as timestamp
          FROM 'visiondrive/parking/+/+/status'
          WHERE battery < 20
        `,
        awsIotSqlVersion: '2016-03-23',
        ruleDisabled: false,
        actions: [
          {
            lambda: {
              functionArn: props.eventProcessorLambda.functionArn,
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
      description: 'IoT Policy Name for Parking Sensors',
      exportName: 'Parking-IoTPolicy',
    });

    new cdk.CfnOutput(this, 'ThingTypeName', {
      value: thingType.thingTypeName!,
      description: 'IoT Thing Type Name',
      exportName: 'Parking-ThingType',
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
