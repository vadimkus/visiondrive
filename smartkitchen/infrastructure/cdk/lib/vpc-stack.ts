import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

/**
 * VPC Stack for Smart Kitchen
 * 
 * Creates a VPC in UAE region (me-central-1) for:
 * - RDS PostgreSQL (private subnets)
 * - Lambda functions (needs VPC access for RDS)
 * - NAT Gateway for outbound internet access
 */
export class VpcStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly lambdaSecurityGroup: ec2.SecurityGroup;
  public readonly rdsSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ==========================================
    // VPC Configuration
    // ==========================================

    this.vpc = new ec2.Vpc(this, 'SmartKitchenVpc', {
      vpcName: 'visiondrive-smartkitchen-vpc',
      maxAzs: 2, // Use 2 AZs for high availability
      natGateways: 1, // Single NAT for cost savings (increase for prod)
      
      subnetConfiguration: [
        {
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        },
        {
          name: 'Isolated',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24,
        },
      ],
    });

    // ==========================================
    // Security Groups
    // ==========================================

    // Security group for Lambda functions
    this.lambdaSecurityGroup = new ec2.SecurityGroup(this, 'LambdaSG', {
      vpc: this.vpc,
      securityGroupName: 'smartkitchen-lambda-sg',
      description: 'Security group for Smart Kitchen Lambda functions',
      allowAllOutbound: true,
    });

    // Security group for RDS PostgreSQL
    this.rdsSecurityGroup = new ec2.SecurityGroup(this, 'RdsSG', {
      vpc: this.vpc,
      securityGroupName: 'smartkitchen-rds-sg',
      description: 'Security group for Smart Kitchen RDS PostgreSQL',
      allowAllOutbound: false,
    });

    // Allow Lambda to connect to RDS on PostgreSQL port
    this.rdsSecurityGroup.addIngressRule(
      this.lambdaSecurityGroup,
      ec2.Port.tcp(5432),
      'Allow Lambda to connect to PostgreSQL'
    );

    // ==========================================
    // Outputs
    // ==========================================

    new cdk.CfnOutput(this, 'VpcId', {
      value: this.vpc.vpcId,
      description: 'VPC ID',
      exportName: 'SmartKitchen-VpcId',
    });

    new cdk.CfnOutput(this, 'LambdaSecurityGroupId', {
      value: this.lambdaSecurityGroup.securityGroupId,
      description: 'Lambda Security Group ID',
      exportName: 'SmartKitchen-LambdaSG',
    });

    new cdk.CfnOutput(this, 'RdsSecurityGroupId', {
      value: this.rdsSecurityGroup.securityGroupId,
      description: 'RDS Security Group ID',
      exportName: 'SmartKitchen-RdsSG',
    });
  }
}
