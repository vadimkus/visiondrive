import * as cdk from 'aws-cdk-lib';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

interface WafStackProps extends cdk.StackProps {
  api: apigateway.RestApi;
}

/**
 * WAF Stack for Smart Kitchen API
 * 
 * 🛡️ Security: AWS WAF with managed rules for API protection
 * 🇦🇪 UAE Data Residency: WAF deployed in me-central-1
 * 
 * Protects against:
 * - SQL Injection
 * - Cross-Site Scripting (XSS)
 * - Known bad inputs
 * - DDoS (rate-based rules)
 */
export class WafStack extends cdk.Stack {
  public readonly webAcl: wafv2.CfnWebACL;

  constructor(scope: Construct, id: string, props: WafStackProps) {
    super(scope, id, props);

    // ==========================================
    // WEB ACL WITH MANAGED RULES
    // ==========================================

    this.webAcl = new wafv2.CfnWebACL(this, 'SmartKitchenWAF', {
      name: 'SmartKitchen-API-WAF',
      description: 'WAF for VisionDrive Smart Kitchen API - OWASP Protection',
      scope: 'REGIONAL', // For API Gateway (use CLOUDFRONT for CloudFront)
      defaultAction: {
        allow: {},
      },
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: 'SmartKitchenWAF',
        sampledRequestsEnabled: true,
      },
      rules: [
        // ==========================================
        // RULE 1: AWS Managed Rules - Core Rule Set (CRS)
        // Protects against common web attacks (OWASP Top 10)
        // ==========================================
        {
          name: 'AWS-AWSManagedRulesCommonRuleSet',
          priority: 1,
          overrideAction: { none: {} },
          statement: {
            managedRuleGroupStatement: {
              vendorName: 'AWS',
              name: 'AWSManagedRulesCommonRuleSet',
              excludedRules: [], // Can exclude specific rules if needed
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'AWSManagedRulesCommonRuleSet',
            sampledRequestsEnabled: true,
          },
        },

        // ==========================================
        // RULE 2: AWS Managed Rules - Known Bad Inputs
        // Blocks requests with known malicious patterns
        // ==========================================
        {
          name: 'AWS-AWSManagedRulesKnownBadInputsRuleSet',
          priority: 2,
          overrideAction: { none: {} },
          statement: {
            managedRuleGroupStatement: {
              vendorName: 'AWS',
              name: 'AWSManagedRulesKnownBadInputsRuleSet',
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'AWSManagedRulesKnownBadInputsRuleSet',
            sampledRequestsEnabled: true,
          },
        },

        // ==========================================
        // RULE 3: AWS Managed Rules - SQL Injection
        // Specialized SQL injection protection
        // ==========================================
        {
          name: 'AWS-AWSManagedRulesSQLiRuleSet',
          priority: 3,
          overrideAction: { none: {} },
          statement: {
            managedRuleGroupStatement: {
              vendorName: 'AWS',
              name: 'AWSManagedRulesSQLiRuleSet',
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'AWSManagedRulesSQLiRuleSet',
            sampledRequestsEnabled: true,
          },
        },

        // ==========================================
        // RULE 4: Rate-Based Rule - DDoS Protection
        // Limits requests per IP to prevent abuse
        // 1000 requests per 5 minutes per IP
        // ==========================================
        {
          name: 'RateLimitRule',
          priority: 4,
          action: { block: {} },
          statement: {
            rateBasedStatement: {
              limit: 1000, // 1000 requests per 5 minutes
              aggregateKeyType: 'IP',
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'RateLimitRule',
            sampledRequestsEnabled: true,
          },
        },

        // ==========================================
        // RULE 5: Block requests with no User-Agent
        // Filters out basic bots/scanners
        // ==========================================
        {
          name: 'BlockNoUserAgent',
          priority: 5,
          action: { block: {} },
          statement: {
            sizeConstraintStatement: {
              comparisonOperator: 'EQ',
              size: 0,
              fieldToMatch: {
                singleHeader: { name: 'user-agent' },
              },
              textTransformations: [
                {
                  priority: 0,
                  type: 'NONE',
                },
              ],
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'BlockNoUserAgent',
            sampledRequestsEnabled: true,
          },
        },

        // ==========================================
        // RULE 6: Geo-restriction (Optional - Allow UAE region)
        // Can be enabled to restrict access to specific countries
        // ==========================================
        // Commented out - enable if geo-restriction needed
        // {
        //   name: 'GeoRestriction',
        //   priority: 6,
        //   action: { block: {} },
        //   statement: {
        //     notStatement: {
        //       statement: {
        //         geoMatchStatement: {
        //           countryCodes: ['AE', 'US', 'GB'], // Allowed countries
        //         },
        //       },
        //     },
        //   },
        //   visibilityConfig: {
        //     cloudWatchMetricsEnabled: true,
        //     metricName: 'GeoRestriction',
        //     sampledRequestsEnabled: true,
        //   },
        // },
      ],
    });

    // ==========================================
    // ASSOCIATE WAF WITH API GATEWAY
    // ==========================================

    const apiArn = `arn:aws:apigateway:${this.region}::/restapis/${props.api.restApiId}/stages/${props.api.deploymentStage.stageName}`;

    new wafv2.CfnWebACLAssociation(this, 'WafApiAssociation', {
      resourceArn: apiArn,
      webAclArn: this.webAcl.attrArn,
    });

    // ==========================================
    // OUTPUTS
    // ==========================================

    new cdk.CfnOutput(this, 'WebAclArn', {
      value: this.webAcl.attrArn,
      description: 'WAF Web ACL ARN',
      exportName: 'SmartKitchen-WAF-ARN',
    });

    new cdk.CfnOutput(this, 'WebAclId', {
      value: this.webAcl.attrId,
      description: 'WAF Web ACL ID',
      exportName: 'SmartKitchen-WAF-ID',
    });

    new cdk.CfnOutput(this, 'WafName', {
      value: 'SmartKitchen-API-WAF',
      description: 'WAF Name',
      exportName: 'SmartKitchen-WAF-Name',
    });
  }
}
