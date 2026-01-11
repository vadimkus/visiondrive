import * as cdk from 'aws-cdk-lib';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

interface RdsStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
  rdsSecurityGroup: ec2.ISecurityGroup;
}

/**
 * RDS PostgreSQL Stack for Smart Kitchen
 * 
 * 🇦🇪 UAE Data Residency: All user data stored in me-central-1
 * 
 * This database stores:
 * - User accounts and authentication
 * - Tenant (customer) information
 * - Role-based access control
 * - Audit logs
 */
export class RdsStack extends cdk.Stack {
  public readonly database: rds.DatabaseInstance;
  public readonly databaseSecret: secretsmanager.ISecret;

  constructor(scope: Construct, id: string, props: RdsStackProps) {
    super(scope, id, props);

    const { vpc, rdsSecurityGroup } = props;

    // ==========================================
    // DATABASE CREDENTIALS (Secrets Manager)
    // ==========================================

    // Credentials stored securely in AWS Secrets Manager
    const databaseCredentials = rds.Credentials.fromGeneratedSecret('visiondrive_admin', {
      secretName: 'smartkitchen/rds/credentials',
    });

    // ==========================================
    // RDS POSTGRESQL INSTANCE
    // ==========================================

    this.database = new rds.DatabaseInstance(this, 'PostgresDB', {
      // Engine configuration (using version available in UAE region)
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_16_6,
      }),
      
      // Instance configuration
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO // Start small, scale as needed
      ),
      
      // Database settings
      databaseName: 'visiondrive_smartkitchen',
      credentials: databaseCredentials,
      
      // Network configuration
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: [rdsSecurityGroup],
      
      // Storage configuration
      allocatedStorage: 20, // GB
      maxAllocatedStorage: 100, // Auto-scaling up to 100GB
      storageType: rds.StorageType.GP3,
      storageEncrypted: true, // Encryption at rest
      
      // High availability (enable for production)
      multiAz: false, // Set to true for production
      
      // Backup configuration (1 day for free tier compatibility)
      backupRetention: cdk.Duration.days(1),
      preferredBackupWindow: '03:00-04:00', // 3-4 AM UAE time
      deleteAutomatedBackups: false,
      
      // Maintenance
      preferredMaintenanceWindow: 'Sun:04:00-Sun:05:00',
      autoMinorVersionUpgrade: true,
      
      // Protection
      deletionProtection: true, // Prevent accidental deletion
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Keep on stack deletion
      
      // Monitoring (disabled for free tier)
      enablePerformanceInsights: false,
      
      // CloudWatch logs
      cloudwatchLogsExports: ['postgresql'],
      cloudwatchLogsRetention: cdk.aws_logs.RetentionDays.ONE_MONTH,
      
      // Instance identifier
      instanceIdentifier: 'smartkitchen-postgres',
    });

    this.databaseSecret = this.database.secret!;

    // ==========================================
    // OUTPUTS
    // ==========================================

    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: this.database.instanceEndpoint.hostname,
      description: 'RDS PostgreSQL endpoint',
      exportName: 'SmartKitchen-RdsEndpoint',
    });

    new cdk.CfnOutput(this, 'DatabasePort', {
      value: this.database.instanceEndpoint.port.toString(),
      description: 'RDS PostgreSQL port',
      exportName: 'SmartKitchen-RdsPort',
    });

    new cdk.CfnOutput(this, 'DatabaseSecretArn', {
      value: this.databaseSecret.secretArn,
      description: 'Secrets Manager ARN for database credentials',
      exportName: 'SmartKitchen-RdsSecretArn',
    });

    new cdk.CfnOutput(this, 'DatabaseName', {
      value: 'visiondrive_smartkitchen',
      description: 'Database name',
      exportName: 'SmartKitchen-RdsDbName',
    });
  }
}
