# VisionDrive Smart Kitchen - Project Plan

## 📋 Implementation Roadmap

---

## 🇦🇪 UAE Data Residency Compliance

**Requirement:** All customer data must be stored exclusively in the UAE.

**Solution:** All databases hosted in AWS me-central-1 (Abu Dhabi)

> ⚠️ **Note:** Amazon Timestream is NOT available in UAE region. Using DynamoDB for time-series data instead.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AWS me-central-1 (Abu Dhabi) 🇦🇪                  │
│                    ALL DATA STAYS IN UAE                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────────────────────────┐     │
│  │  Amazon RDS     │  │  Amazon DynamoDB                     │     │
│  │  PostgreSQL     │  │  ─────────────────────────────────   │     │
│  │  ─────────────  │  │  • VisionDrive-SensorReadings       │     │
│  │  • Users        │  │    (temperature time-series data)   │     │
│  │  • Tenants      │  │  • VisionDrive-Devices              │     │
│  │  • Auth/Login   │  │    (sensor/kitchen configs)         │     │
│  │  • Permissions  │  │  • VisionDrive-Alerts               │     │
│  │  • Audit logs   │  │    (alert history)                  │     │
│  └─────────────────┘  └─────────────────────────────────────┘     │
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │
│  │  AWS Lambda     │  │  AWS IoT Core   │  │  API Gateway    │    │
│  │  ─────────────  │  │  ─────────────  │  │  ─────────────  │    │
│  │  • Ingestion    │  │  • MQTT Broker  │  │  • REST API     │    │
│  │  • Alerts       │  │  • Rules Engine │  │  • CORS enabled │    │
│  │  • Analytics    │  │  • Device Reg.  │  │  • Rate limiting│    │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTPS
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Vercel (Frontend Only - No Data Storage)                          │
│  • Next.js static files served globally                            │
│  • All API calls route to AWS UAE                                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: AWS Infrastructure Setup ✅ COMPLETED (Jan 11, 2026)

### 1.1 AWS Account Configuration ✅
- [x] Create/access AWS account (ID: `307436091440`)
- [x] Enable UAE region (me-central-1) in account settings
- [x] Set up IAM admin user (`visiondrive-admin`)
- [x] Configure AWS CLI locally
- [ ] Set budget alerts ($100, $200, $500) - TODO

### 1.2 Deploy Database Infrastructure ✅
- [x] Install AWS CDK (`npm install -g aws-cdk`) - v2.1100.3
- [x] Bootstrap CDK in UAE region

**PostgreSQL (User/Auth Database):** ✅
- [x] Deploy RDS PostgreSQL instance (db.t3.micro)
  - Endpoint: `smartkitchen-postgres.ctoi8gckc521.me-central-1.rds.amazonaws.com`
  - Database: `visiondrive_smartkitchen`
  - Engine: PostgreSQL 16.6
- [x] Configure VPC and security groups
- [x] Set up database credentials in AWS Secrets Manager
- [ ] Run Prisma migrations to create tables - **NEXT STEP**
- [ ] Verify connection from Lambda

**Time-Series Database:** ✅ (Using DynamoDB - Timestream not available in UAE)
- [x] Deploy DynamoDB table for sensor readings (`VisionDrive-SensorReadings`)
- [x] Configure TTL for automatic data expiration

**NoSQL Database:** ✅
- [x] Deploy DynamoDB tables (Devices, Alerts)
- [x] Set up GSI indexes for queries

### 1.3 Deploy Compute & API Infrastructure ✅
- [x] Deploy Lambda functions
  - `smartkitchen-data-ingestion`
  - `smartkitchen-alerts`
  - `smartkitchen-analytics`
- [x] Deploy IoT Core stack (Thing Type, Policy, Rules)
- [x] Deploy API Gateway stack
  - URL: `https://w7gfk5cka2.execute-api.me-central-1.amazonaws.com/prod/`
- [x] Verify all resources in AWS Console

### 1.4 Test Infrastructure (Partial)
- [ ] Verify RDS PostgreSQL accessible from Lambda
- [ ] Test user creation/authentication via API
- [x] DynamoDB tables accessible
- [x] IoT endpoint reachable
- [ ] Test API Gateway endpoints with curl

### 1.5 Migrate Existing VisionDrive Data (Not Started)
- [ ] Export users from current Vercel Postgres
- [ ] Import users to AWS RDS PostgreSQL
- [ ] Update VisionDrive app to use AWS API for auth
- [ ] Test login flow end-to-end
- [ ] Decommission Vercel Postgres (after validation)

---

## Phase 2: Sensor Configuration (Week 2)

### 2.1 First Sensor Setup
- [ ] Unbox Dragino PS-NB-GE
- [ ] Insert du SIM card
- [ ] Download Dragino BLE Config App
- [ ] Connect to sensor via Bluetooth
- [ ] Record device password from label

### 2.2 Network Configuration
- [ ] Set du APN (`AT+APN=du`)
- [ ] Verify signal strength (`AT+CSQ` > 10)
- [ ] Test network registration

### 2.3 AWS IoT Configuration
- [ ] Register sensor as AWS IoT Thing
- [ ] Create device certificate
- [ ] Attach policy to certificate
- [ ] Configure sensor with IoT endpoint
- [ ] Set MQTT topics
- [ ] Enable TLS mode

### 2.4 Probe Configuration
- [ ] Connect temperature probe to sensor
- [ ] Configure probe type (`AT+PROBE=1`)
- [ ] Set power output time
- [ ] Test sensor reading (`AT+GETSENSORVALUE=0`)
- [ ] Verify reading is reasonable

### 2.5 First Data Transmission
- [ ] Set transmission interval (`AT+TDC=300000`)
- [ ] Force first transmission (`AT+SEND`)
- [ ] Monitor in AWS IoT Test Client
- [ ] Verify data appears in Timestream
- [ ] Check CloudWatch logs for errors

---

## Phase 3: Multi-Sensor Deployment (Week 3)

### 3.1 Additional Sensors
| Sensor ID | Kitchen | Location | Status |
|-----------|---------|----------|--------|
| sensor-001 | Kitchen 1 | Walk-in Fridge | ⬜ |
| sensor-002 | Kitchen 1 | Freezer | ⬜ |
| sensor-003 | Kitchen 2 | Main Fridge | ⬜ |
| sensor-004 | Kitchen 2 | Prep Area | ⬜ |
| sensor-005 | Kitchen 3 | Cold Storage | ⬜ |

### 3.2 For Each Sensor
- [ ] Configure with unique client ID
- [ ] Set appropriate MQTT topic
- [ ] Configure alert thresholds
- [ ] Verify data transmission
- [ ] Add to DynamoDB device registry

---

## Phase 4: Customer Authentication & Access (Week 4)

### 4.1 VisionDrive Portal Integration
Kitchen businesses access their data via: **https://www.visiondrive.ae/login**

All user data stored in **AWS RDS PostgreSQL (UAE)** for data residency compliance.

- [ ] Configure VisionDrive app to use AWS RDS for auth
- [ ] Add "KITCHEN_OWNER", "KITCHEN_MANAGER", "KITCHEN_STAFF" roles to UserRole enum
- [ ] Create customer onboarding flow (invite via email)
- [ ] Implement password reset for kitchen users
- [ ] Set up JWT session management (tokens issued from UAE)

### 4.2 Multi-Tenant Data Access
Each kitchen business sees ONLY their own data:

| Customer | Access To | Restricted From |
|----------|-----------|-----------------|
| Kitchen A | Kitchen A sensors, alerts, data | Kitchen B, C data |
| Kitchen B | Kitchen B sensors, alerts, data | Kitchen A, C data |
| VisionDrive Admin | ALL kitchens | None |

- [ ] Link Smart Kitchen tenants to existing Tenant model in RDS
- [ ] Add `tenantId` to all Timestream queries (filter by customer)
- [ ] Update API Gateway to validate JWT → tenant ownership
- [ ] Implement row-level security in API Lambda functions
- [ ] Add audit logging for data access (stored in RDS)

### 4.3 Customer Account Structure (in RDS PostgreSQL)
```
Tenant (Customer Business Entity) ──────► RDS PostgreSQL
├── Users (login accounts)
│   ├── Owner (KITCHEN_OWNER role)
│   ├── Manager (KITCHEN_MANAGER role)
│   └── Staff (KITCHEN_STAFF role)
├── TenantMemberships (user ↔ tenant link)
└── TenantSettings (alert thresholds, etc.)

Kitchens & Sensors ──────────────────────► DynamoDB
├── Kitchen records (with tenantId)
└── Sensor records (with tenantId + kitchenId)

Temperature Data ────────────────────────► Timestream
└── Readings (with tenantId dimension for filtering)
```

- [ ] Add Smart Kitchen tenant type flag in RDS Tenant table
- [ ] Create Kitchen model in DynamoDB (linked by tenantId)
- [ ] Add tenantId dimension to all Timestream writes
- [ ] Implement role-based permissions in Lambda authorizer
- [ ] Add user management UI for customer owners

---

## Phase 5: Dashboard Development (Week 5)

### 5.1 Frontend Setup
- [ ] Create `/smart-kitchen` route in VisionDrive app
- [ ] Protect route with authentication (redirect to /login if not logged in)
- [ ] Install AWS SDK packages
- [ ] Configure environment variables in Vercel
- [ ] Set up API client service with auth headers

### 5.2 Customer Dashboard (Desktop & Mobile Responsive)

**Access Points:**
- 🖥️ Desktop: https://www.visiondrive.ae/smart-kitchen
- 📱 Mobile: Same URL (responsive) or VisionDrive App

**Dashboard Components:**
- [ ] Kitchen overview card (shows all customer's kitchens)
- [ ] Sensor status widget (real-time status per sensor)
- [ ] Real-time temperature display (live updates)
- [ ] Temperature history chart (hourly/daily/weekly)
- [ ] Alert notification panel (active + history)
- [ ] Device management table (for customer owners)

### 5.3 Mobile App Integration (Future)
- [ ] Add Smart Kitchen tab to VisionDrive mobile app
- [ ] Push notifications for temperature alerts
- [ ] Offline alert history caching
- [ ] Biometric login support

### 5.4 Alert System
- [ ] Configure SNS topic subscriptions per customer
- [ ] Set up email notifications (to kitchen managers)
- [ ] SMS alerts for critical temperatures
- [ ] Implement acknowledge flow in UI
- [ ] Add alert sound/visual indicators
- [ ] Allow customers to customize alert thresholds

---

## Phase 6: Testing & Validation (Week 6)

### 6.1 Authentication Testing
- [ ] Test login flow at https://www.visiondrive.ae/login
- [ ] Verify multi-tenant isolation (Kitchen A cannot see Kitchen B)
- [ ] Test role-based permissions (Owner vs Manager vs Staff)
- [ ] Test password reset flow
- [ ] Verify session timeout behavior

### 6.2 Functional Testing
- [ ] Verify all sensors reporting
- [ ] Test temperature conversion accuracy
- [ ] Validate alert thresholds trigger correctly
- [ ] Test alert acknowledgment flow
- [ ] Verify historical data queries
- [ ] Test on desktop browsers (Chrome, Safari, Firefox)
- [ ] Test on mobile devices (iOS Safari, Android Chrome)

### 6.3 Edge Case Testing
- [ ] Test sensor offline handling
- [ ] Test network disconnection recovery
- [ ] Test battery low alerts
- [ ] Test extreme temperature handling
- [ ] Test concurrent user sessions

### 6.4 Performance Testing
- [ ] Measure API response times
- [ ] Check dashboard load time (target < 3s)
- [ ] Verify Timestream query performance
- [ ] Test concurrent sensor transmissions
- [ ] Load test with multiple logged-in users

---

## Phase 7: Customer Onboarding (Week 7)

### 7.1 First Customer Setup
| Field | Value |
|-------|-------|
| Customer Name | [Kitchen Business Name] |
| Primary Contact | [Name, Email, Phone] |
| Kitchens | [Number of locations] |
| Sensors per Kitchen | [Count] |

- [ ] Create customer account in DynamoDB
- [ ] Create owner user account
- [ ] Send welcome email with login instructions
- [ ] Schedule onboarding call

### 7.2 Customer Training
- [ ] Dashboard walkthrough (30 min video call)
- [ ] Alert management training
- [ ] Show how to add additional users
- [ ] Provide quick reference guide (PDF)

### 7.3 Sensor Installation
- [ ] Coordinate installation date with customer
- [ ] Install sensors at customer locations
- [ ] Verify data appearing in customer dashboard
- [ ] Configure customer-specific alert thresholds
- [ ] Confirm customer can access via login

---

## Phase 8: Go Live (Week 8)

### 8.1 Pre-Launch Checklist
- [ ] All sensors installed and transmitting
- [ ] All customer accounts created and tested
- [ ] Alert recipients configured per customer
- [ ] Dashboard accessible via https://www.visiondrive.ae/login
- [ ] Backup procedures documented
- [ ] Monitoring dashboards set up

### 8.2 Launch
- [ ] Enable production alert notifications
- [ ] Notify all customers of go-live
- [ ] Monitor for 48 hours closely
- [ ] Address any issues

### 8.3 Handover & Support
- [ ] Document all configurations
- [ ] Create customer support guide
- [ ] Set up support email (smartkitchen@visiondrive.ae)
- [ ] Establish SLA for alert response
- [ ] Schedule weekly check-ins for first month

---

## 📊 Key Metrics to Track

| Metric | Target | Monitoring |
|--------|--------|------------|
| Sensor uptime | > 99.5% | CloudWatch |
| Data latency | < 30 seconds | Custom metric |
| Alert response time | < 5 minutes | SNS metrics |
| Dashboard load time | < 3 seconds | Vercel analytics |
| Battery life | > 6 months | DynamoDB tracking |

---

## 🚨 Risk Mitigation

| Risk | Mitigation |
|------|------------|
| du network issues | Contact du IoT support, have backup APN |
| AWS region unavailable | Data persists, alerts queue |
| Sensor malfunction | Keep spare sensors |
| Certificate expiry | Set calendar reminders, auto-rotation |
| Cost overruns | Budget alerts, usage monitoring |
| **Data residency breach** | All data in me-central-1, no cross-region replication |
| **RDS downtime** | Multi-AZ deployment, automated backups |
| **Database connection limits** | RDS Proxy for Lambda connection pooling |

---

## 📞 Contacts

| Role | Contact | Notes |
|------|---------|-------|
| du IoT Support | TBD | For network issues |
| Dragino Support | support@dragino.cc | Hardware issues |
| AWS Support | AWS Console | Infrastructure issues |

---

## 📁 Project Files

```
smartkitchen/
├── README.md                           # Project overview
├── PROJECT_PLAN.md                     # This file
├── docs/
│   ├── ARCHITECTURE.md                 # System architecture
│   ├── SETUP_GUIDE.md                  # Step-by-step setup
│   ├── SENSOR_CONFIG.md                # Dragino configuration
│   ├── AWS_SETUP.md                    # AWS setup guide
│   └── DATA_RESIDENCY.md               # UAE compliance docs
└── infrastructure/
    ├── cdk/                            # AWS CDK code
    │   ├── bin/app.ts                  # CDK app entry
    │   └── lib/
    │       ├── vpc-stack.ts            # VPC for RDS connectivity
    │       ├── rds-stack.ts            # PostgreSQL (users/auth) 🆕
    │       ├── database-stack.ts       # Timestream + DynamoDB
    │       ├── lambda-stack.ts         # Lambda functions
    │       ├── iot-stack.ts            # IoT Core
    │       └── api-stack.ts            # API Gateway
    ├── prisma/
    │   └── schema.prisma               # RDS PostgreSQL schema 🆕
    └── lambda/
        ├── auth/                       # Authentication handlers 🆕
        │   ├── login.ts
        │   ├── register.ts
        │   └── refresh-token.ts
        ├── data-ingestion/             # Process sensor data
        ├── alerts/                     # Handle alerts
        ├── analytics/                  # Generate reports
        └── api/                        # REST API handler
```

---

## ✅ Next Steps

1. **Today**: Review project plan, confirm AWS account access
2. **Tomorrow**: Start Phase 1.1 (AWS Account Configuration)
3. **This Week**: Complete Phase 1 (Infrastructure)

---

*Last Updated: January 11, 2026 - Phase 1 Infrastructure Complete*
