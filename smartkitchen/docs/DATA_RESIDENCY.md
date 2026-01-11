# UAE Data Residency Compliance

## VisionDrive Smart Kitchen - Data Residency Documentation

---

## 🇦🇪 Overview

All VisionDrive Smart Kitchen customer data is stored exclusively in the **United Arab Emirates** to comply with local data residency requirements.

**AWS Region Used:** `me-central-1` (Abu Dhabi, UAE)

---

## Data Classification

### Customer Personal Data (Stored in UAE)

| Data Type | Storage Location | Service | Encrypted |
|-----------|------------------|---------|-----------|
| User accounts (email, name) | me-central-1 | RDS PostgreSQL | ✅ Yes |
| Passwords (hashed) | me-central-1 | RDS PostgreSQL | ✅ Yes |
| Business information | me-central-1 | RDS PostgreSQL | ✅ Yes |
| Login sessions | me-central-1 | RDS PostgreSQL | ✅ Yes |
| Audit logs | me-central-1 | RDS PostgreSQL | ✅ Yes |

### Operational Data (Stored in UAE)

| Data Type | Storage Location | Service | Table Name | Encrypted |
|-----------|------------------|---------|------------|-----------|
| Temperature readings | me-central-1 | DynamoDB | VisionDrive-SensorReadings | ✅ Yes |
| Sensor metadata | me-central-1 | DynamoDB | VisionDrive-Devices | ✅ Yes |
| Alert history | me-central-1 | DynamoDB | VisionDrive-Alerts | ✅ Yes |
| Device configurations | me-central-1 | DynamoDB | VisionDrive-Devices | ✅ Yes |

> **Note:** Originally planned to use Amazon Timestream for time-series data, but Timestream is not available in UAE region (me-central-1). Using DynamoDB with time-series access patterns instead.

### Non-Personal Data (Global)

| Data Type | Storage Location | Service | Notes |
|-----------|------------------|---------|-------|
| Static frontend files | Global CDN | Vercel | HTML, CSS, JS only |
| Documentation | Global CDN | Vercel | Public docs only |

---

## Architecture for Compliance

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA RESIDENCY ZONES                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  🇦🇪 UAE ZONE (me-central-1 Abu Dhabi)                              │
│  ═══════════════════════════════════════                           │
│  ALL customer data resides here:                                    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  RDS PostgreSQL                                              │   │
│  │  • User accounts          • Tenant information              │   │
│  │  • Authentication data    • Audit logs                      │   │
│  │  • Role assignments       • Session data                    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Amazon DynamoDB (VisionDrive-SensorReadings)                │   │
│  │  • Temperature readings   • Sensor telemetry                │   │
│  │  • Historical data        • Time-series with TTL            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Amazon DynamoDB                                             │   │
│  │  • Device registry        • Alert records                   │   │
│  │  • Kitchen metadata       • Configuration                   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Amazon S3                                                   │   │
│  │  • Database backups       • Report archives                 │   │
│  │  • Audit exports          • Compliance records              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  AWS Secrets Manager                                         │   │
│  │  • Database credentials   • API keys                        │   │
│  │  • Encryption keys        • JWT secrets                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  🌍 GLOBAL ZONE (Vercel CDN)                                        │
│  ═══════════════════════════                                       │
│  NO customer data - static assets only:                            │
│                                                                     │
│  • HTML templates            • CSS stylesheets                     │
│  • JavaScript bundles        • Image assets                        │
│  • Font files                • Public documentation                │
│                                                                     │
│  ⚠️ All API calls route to UAE (me-central-1)                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Security Measures

### Encryption

| Layer | Method | Key Management |
|-------|--------|----------------|
| Data at rest | AES-256 | AWS KMS (me-central-1) |
| Data in transit | TLS 1.3 | AWS Certificate Manager |
| Database connections | SSL/TLS required | RDS enforced |
| Backups | AES-256 | AWS KMS (me-central-1) |

### Access Control

| Control | Implementation |
|---------|----------------|
| Authentication | JWT tokens issued from UAE |
| Authorization | Role-based access control (RBAC) |
| Multi-tenancy | Tenant ID on all queries |
| Audit logging | All access logged in UAE |

### Network Security

| Component | Protection |
|-----------|------------|
| VPC | Private subnets for databases |
| RDS | No public access, security groups |
| API Gateway | WAF protection, rate limiting |
| Lambda | VPC-attached for RDS access |

---

## Compliance Controls

### Data Processing Agreements

- [ ] AWS Data Processing Addendum signed
- [ ] Vercel DPA for frontend hosting
- [ ] Customer data processing agreements

### Audit Requirements

| Requirement | Implementation |
|-------------|----------------|
| Access logging | CloudTrail in me-central-1 |
| Data access audit | Application-level audit logs |
| Change tracking | Database audit tables |
| Retention | 7 years for compliance data |

### Data Subject Rights

| Right | Implementation |
|-------|----------------|
| Access | API endpoint for data export |
| Rectification | User profile editing |
| Erasure | Account deletion workflow |
| Portability | JSON data export |

---

## Prohibited Actions

To maintain UAE data residency compliance, the following are **NOT ALLOWED**:

1. ❌ Cross-region replication to non-UAE regions
2. ❌ Backup storage outside me-central-1
3. ❌ Log shipping to non-UAE destinations
4. ❌ Third-party analytics with non-UAE storage
5. ❌ Caching customer data in Vercel/CDN

---

## Verification Checklist

### Infrastructure Verification

```bash
# Verify all resources are in UAE region
aws resourcegroupstaggingapi get-resources \
  --region me-central-1 \
  --tag-filters Key=Project,Values=SmartKitchen

# Check RDS region
aws rds describe-db-instances \
  --region me-central-1 \
  --query 'DBInstances[].AvailabilityZone'

# Check S3 bucket location
aws s3api get-bucket-location \
  --bucket smartkitchen-backups
```

### Application Verification

- [ ] All API endpoints resolve to me-central-1
- [ ] JWT tokens issued with UAE timestamp
- [ ] No localStorage/sessionStorage of PII in browser
- [ ] All form submissions POST to UAE API

---

## Incident Response

In case of data residency breach:

1. **Immediately** disable affected data flow
2. **Notify** compliance officer within 1 hour
3. **Document** scope and affected data
4. **Remediate** by deleting non-compliant copies
5. **Report** to authorities if required

---

## Contact

| Role | Contact |
|------|---------|
| Data Protection Officer | dpo@visiondrive.ae |
| Technical Lead | tech@visiondrive.ae |
| Compliance | compliance@visiondrive.ae |

---

*Last Updated: January 11, 2026*
*Document Version: 1.1 - Updated to reflect DynamoDB instead of Timestream*
