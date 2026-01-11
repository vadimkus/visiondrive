import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class DatabaseStack extends cdk.Stack {
  public readonly parkingTable: dynamodb.Table;
  public readonly archiveBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ==========================================
    // S3 BUCKET FOR EVENT ARCHIVES
    // ==========================================

    this.archiveBucket = new s3.Bucket(this, 'ParkingArchiveBucket', {
      bucketName: `visiondrive-parking-archive-${this.account}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      lifecycleRules: [
        {
          id: 'ArchiveToGlacier',
          transitions: [
            {
              storageClass: s3.StorageClass.GLACIER,
              transitionAfter: cdk.Duration.days(90),
            },
          ],
        },
      ],
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // ==========================================
    // DYNAMODB TABLE - SINGLE TABLE DESIGN
    // ==========================================

    this.parkingTable = new dynamodb.Table(this, 'ParkingTable', {
      tableName: 'VisionDrive-Parking',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      timeToLiveAttribute: 'ttl',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    });

    // GSI1: For tenant zones, zone events, zone sensors
    this.parkingTable.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI2: For sensor lookups
    this.parkingTable.addGlobalSecondaryIndex({
      indexName: 'GSI2',
      partitionKey: { name: 'GSI2PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI2SK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.KEYS_ONLY,
    });

    // ==========================================
    // OUTPUTS
    // ==========================================

    new cdk.CfnOutput(this, 'TableName', {
      value: this.parkingTable.tableName,
      description: 'VisionDrive Parking Table Name',
      exportName: 'Parking-TableName',
    });

    new cdk.CfnOutput(this, 'TableArn', {
      value: this.parkingTable.tableArn,
      description: 'VisionDrive Parking Table ARN',
      exportName: 'Parking-TableArn',
    });

    new cdk.CfnOutput(this, 'ArchiveBucketName', {
      value: this.archiveBucket.bucketName,
      description: 'Archive S3 Bucket',
      exportName: 'Parking-ArchiveBucket',
    });
  }
}
