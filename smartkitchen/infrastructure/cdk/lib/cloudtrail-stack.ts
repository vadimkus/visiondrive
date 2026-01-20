import * as cdk from 'aws-cdk-lib';
import * as cloudtrail from 'aws-cdk-lib/aws-cloudtrail';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

/**
 * CloudTrail Stack for Smart Kitchen
 * 
 * 📋 Audit Logging: Comprehensive logging for security and compliance
 * 🇦🇪 UAE Data Residency: All logs stored in me-central-1
 * 
 * Captures:
 * - IoT Core management actions
 * - API Gateway requests
 * - Lambda invocations
 * - DynamoDB operations
 * - IAM changes
 */
export class CloudTrailStack extends cdk.Stack {
  public readonly trail: cloudtrail.Trail;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ==========================================
    // S3 BUCKET FOR CLOUDTRAIL LOGS
    // ==========================================

    const trailBucket = new s3.Bucket(this, 'CloudTrailBucket', {
      bucketName: `visiondrive-cloudtrail-${this.account}-${this.region}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      versioned: true,
      lifecycleRules: [
        {
          // Transition to Infrequent Access after 30 days
          transitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: cdk.Duration.days(30),
            },
            {
              storageClass: s3.StorageClass.GLACIER,
              transitionAfter: cdk.Duration.days(90),
            },
          ],
          // Delete after 1 year (adjust based on compliance requirements)
          expiration: cdk.Duration.days(365),
        },
      ],
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Keep logs even if stack is deleted
    });

    // ==========================================
    // CLOUDWATCH LOG GROUP FOR CLOUDTRAIL
    // ==========================================

    const logGroup = new logs.LogGroup(this, 'CloudTrailLogGroup', {
      logGroupName: '/aws/cloudtrail/smartkitchen',
      retention: logs.RetentionDays.THREE_MONTHS, // 90 days retention
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // IAM Role for CloudTrail to write to CloudWatch
    const cloudTrailRole = new iam.Role(this, 'CloudTrailRole', {
      assumedBy: new iam.ServicePrincipal('cloudtrail.amazonaws.com'),
    });

    logGroup.grantWrite(cloudTrailRole);

    // ==========================================
    // CLOUDTRAIL TRAIL
    // ==========================================

    this.trail = new cloudtrail.Trail(this, 'SmartKitchenTrail', {
      trailName: 'SmartKitchen-AuditTrail',
      bucket: trailBucket,
      cloudWatchLogGroup: logGroup,
      cloudWatchLogsRetention: logs.RetentionDays.THREE_MONTHS,
      sendToCloudWatchLogs: true,
      enableFileValidation: true, // Log file integrity validation
      includeGlobalServiceEvents: true, // Include IAM, STS, CloudFront
      isMultiRegionTrail: false, // Only UAE region for data residency
      managementEvents: cloudtrail.ReadWriteType.ALL, // Log all management events
    });

    // ==========================================
    // EVENT SELECTORS FOR SPECIFIC SERVICES
    // ==========================================

    // Add data events for DynamoDB tables (optional - can generate many logs)
    // Uncomment if detailed DynamoDB logging is needed:
    // this.trail.addEventSelector(cloudtrail.DataResourceType.DYNAMODB_TABLE, [
    //   `arn:aws:dynamodb:${this.region}:${this.account}:table/VisionDrive-*`,
    // ]);

    // Add data events for Lambda functions
    this.trail.addLambdaEventSelector([
      // Log all Lambda invocations for Smart Kitchen functions
    ], {
      includeManagementEvents: true,
      readWriteType: cloudtrail.ReadWriteType.ALL,
    });

    // ==========================================
    // CLOUDWATCH ALARMS FOR SECURITY EVENTS
    // ==========================================

    // Metric filter for unauthorized API calls
    const unauthorizedApiCallsMetric = new logs.MetricFilter(this, 'UnauthorizedApiCalls', {
      logGroup,
      filterPattern: logs.FilterPattern.literal('{ ($.errorCode = "*UnauthorizedAccess*") || ($.errorCode = "AccessDenied*") }'),
      metricNamespace: 'SmartKitchen/Security',
      metricName: 'UnauthorizedApiCalls',
      metricValue: '1',
    });

    // Metric filter for root account usage
    const rootAccountUsageMetric = new logs.MetricFilter(this, 'RootAccountUsage', {
      logGroup,
      filterPattern: logs.FilterPattern.literal('{ $.userIdentity.type = "Root" && $.userIdentity.invokedBy NOT EXISTS && $.eventType != "AwsServiceEvent" }'),
      metricNamespace: 'SmartKitchen/Security',
      metricName: 'RootAccountUsage',
      metricValue: '1',
    });

    // Metric filter for IAM policy changes
    const iamPolicyChangesMetric = new logs.MetricFilter(this, 'IAMPolicyChanges', {
      logGroup,
      filterPattern: logs.FilterPattern.literal('{ ($.eventName = DeleteGroupPolicy) || ($.eventName = DeleteRolePolicy) || ($.eventName = DeleteUserPolicy) || ($.eventName = PutGroupPolicy) || ($.eventName = PutRolePolicy) || ($.eventName = PutUserPolicy) || ($.eventName = CreatePolicy) || ($.eventName = DeletePolicy) || ($.eventName = CreatePolicyVersion) || ($.eventName = DeletePolicyVersion) || ($.eventName = AttachRolePolicy) || ($.eventName = DetachRolePolicy) || ($.eventName = AttachUserPolicy) || ($.eventName = DetachUserPolicy) || ($.eventName = AttachGroupPolicy) || ($.eventName = DetachGroupPolicy) }'),
      metricNamespace: 'SmartKitchen/Security',
      metricName: 'IAMPolicyChanges',
      metricValue: '1',
    });

    // Metric filter for IoT configuration changes
    const iotConfigChangesMetric = new logs.MetricFilter(this, 'IoTConfigChanges', {
      logGroup,
      filterPattern: logs.FilterPattern.literal('{ ($.eventSource = "iot.amazonaws.com") && (($.eventName = CreateThing) || ($.eventName = DeleteThing) || ($.eventName = UpdateThing) || ($.eventName = CreatePolicy) || ($.eventName = DeletePolicy) || ($.eventName = AttachPolicy) || ($.eventName = DetachPolicy)) }'),
      metricNamespace: 'SmartKitchen/Security',
      metricName: 'IoTConfigChanges',
      metricValue: '1',
    });

    // ==========================================
    // OUTPUTS
    // ==========================================

    new cdk.CfnOutput(this, 'TrailArn', {
      value: this.trail.trailArn,
      description: 'CloudTrail Trail ARN',
      exportName: 'SmartKitchen-CloudTrail-ARN',
    });

    new cdk.CfnOutput(this, 'TrailBucketName', {
      value: trailBucket.bucketName,
      description: 'CloudTrail S3 Bucket',
      exportName: 'SmartKitchen-CloudTrail-Bucket',
    });

    new cdk.CfnOutput(this, 'LogGroupName', {
      value: logGroup.logGroupName,
      description: 'CloudTrail CloudWatch Log Group',
      exportName: 'SmartKitchen-CloudTrail-LogGroup',
    });
  }
}
