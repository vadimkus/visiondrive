# VisionDrive Smart Kitchen - Project Plan

## 📋 Implementation Roadmap

---

## 🇦🇪 UAE Data Residency & Compliance

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

## 🏛️ Dubai Municipality Food Safety Compliance

**Reference Document:** DM-HSD-GU46-KFPA2  
**Title:** Technical Guidelines for Occupational Health & Safety in Kitchens  
**Version:** 3 (Latest)  
**Issued:** May 9, 2024  
**Download:** [Dubai Municipality Official PDF](https://www.dm.gov.ae/wp-content/uploads/2024/07/DM-HSD-GU46-KFPA2_Technical-Guidelines-for-Occupational-Health-and-Safety_Kitchen-Food-Areas_V3.pdf)

### Temperature Requirements (Implemented in Portal)

| Equipment Type | Temperature | DM Reference | Icon |
|---------------|-------------|--------------|------|
| Refrigerator | 0°C to 5°C | Cold storage | 🧊 |
| Freezer | ≤ -18°C | Frozen foods | ❄️ |
| Walk-in Cooler | 0°C to 5°C | Cold storage | 🚪 |
| Walk-in Freezer | ≤ -18°C | Frozen foods | 🏔️ |
| Display Fridge | 0°C to 5°C | Cold storage | 🛒 |
| Prep Area Fridge | 0°C to 5°C | Cold storage | 🔪 |
| Hot Holding | ≥ 60°C | Bain-marie | 🔥 |
| Blast Chiller | -10°C to 3°C | Rapid cooling | 💨 |
| **Danger Zone** | **5°C - 60°C** | **Food unsafe (2hr max)** | ⚠️ |
| Cooking | ≥ 75°C core | Safe cooking | 🍳 |

### Compliance Features in Portal

- ✅ Real-time compliance status per sensor
- ✅ Equipment type categorization with Arabic translations
- ✅ Danger Zone alerts (immediate food safety violations)
- ✅ Compliance rate dashboard (percentage tracking)
- ✅ Daily compliance trend charts
- ✅ Sensor compliance details with violation counts
- ✅ PDF export for compliance reports
- ✅ DM document reference in Settings page

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
- [x] Run Prisma migrations to create tables (25 tables created)
- [ ] Verify connection from Lambda (using DynamoDB for auth instead)

**Time-Series Database:** ✅ (Using DynamoDB - Timestream not available in UAE)
- [x] Deploy DynamoDB table for sensor readings (`VisionDrive-SensorReadings`)
- [x] Configure TTL for automatic data expiration

**NoSQL Database:** ✅
- [x] Deploy DynamoDB tables (Devices, Alerts)
- [x] Set up GSI indexes for queries

### 1.3 Deploy Compute & API Infrastructure ✅
- [x] Deploy Lambda functions
  - `smartkitchen-api` (with auth endpoints)
  - `smartkitchen-data-ingestion`
  - `smartkitchen-alerts`
  - `smartkitchen-analytics`
- [x] Deploy IoT Core stack (Thing Type, Policy, Rules)
- [x] Deploy API Gateway stack
  - URL: `https://w7gfk5cka2.execute-api.me-central-1.amazonaws.com/prod/`
- [x] Verify all resources in AWS Console

### 1.4 Test Infrastructure ✅
- [x] DynamoDB tables accessible
- [x] IoT endpoint reachable
- [x] Test API Gateway endpoints with curl
- [x] Auth endpoints working (login/register)
- [x] Created test kitchen and sensor via API

### 1.5 VisionDrive Integration ✅ COMPLETED
- [x] Update VisionDrive login page with Kitchen/Parking selector
- [x] Route Kitchen auth to AWS API (UAE data residency)
- [x] Create kitchen admin user (`admin@kitchen.ae`)
- [x] Test login flow end-to-end
- [x] Push code to GitHub, deployed to Vercel

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

## Phase 4: Customer Authentication & Access ✅ COMPLETED (Jan 11, 2026)

### 4.1 VisionDrive Portal Integration ✅
Kitchen businesses access their data via: **https://www.visiondrive.ae/login**

All user data stored in **AWS DynamoDB (UAE)** for data residency compliance.

- [x] Configure VisionDrive login to route Kitchen auth to AWS API
- [x] Add Kitchen/Parking portal selector to login page
- [x] Create admin user (`admin@kitchen.ae` / `Kitchen@2026`)
- [x] JWT tokens issued from AWS Lambda in UAE
- [ ] Create customer onboarding flow (invite via email) - FUTURE
- [ ] Implement password reset for kitchen users - FUTURE

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

## Phase 5: Dashboard Development ✅ COMPLETED (Jan 12, 2026)

### 5.1 Frontend Setup ✅
- [x] Create `/portal/smart-kitchen` route in VisionDrive app
- [x] Protect route with authentication
- [x] Create AWS client library (`lib/smart-kitchen/aws-client.ts`)
- [x] Configure API calls to AWS Gateway
- [x] Push to GitHub, deployed to Vercel

### 5.2 Customer Dashboard ✅

**Access Points:**
- 🖥️ Desktop: https://www.visiondrive.ae/portal/smart-kitchen
- 📱 Mobile: Same URL (responsive)

**Dashboard Components Built:**
- [x] Kitchen overview cards with compliance rates
- [x] Sensor status grid with equipment types
- [x] Real-time temperature display with DM thresholds
- [x] Temperature history chart (TemperatureChart.tsx)
- [x] Alert notification panel (AlertsPanel.tsx)
- [x] Kitchen detail page (/kitchens/[id])
- [x] Sensor detail page (/sensors/[id])

### 5.3 Kitchen Portal Redesign ✅ (Jan 12, 2026)

**New Apple-like Design:**
- [x] Dark sidebar with Smart Kitchen branding
- [x] Real-time clock widget
- [x] Kitchen-only navigation (removed parking items)
- [x] Weather info in header
- [x] Professional stat cards

**Pages Created:**
- [x] Overview - DM compliance dashboard
- [x] Kitchens - List with search and filters
- [x] Sensors - Grid with equipment types and compliance
- [x] Alerts - Acknowledge workflow with severity badges
- [x] Reports - Analytics and downloadable reports
- [x] Settings - DM requirements reference
- [x] Compliance - Full compliance report page

### 5.4 Dubai Municipality Compliance ✅ (Jan 12, 2026)

**Compliance Library (`lib/compliance.ts`):**
- [x] Equipment type definitions (8 types)
- [x] Arabic translations for all equipment
- [x] `checkCompliance()` function for real-time status
- [x] Color-coded status (Compliant/Warning/Critical/Danger Zone)
- [x] DM document references

**Dashboard Features:**
- [x] Compliance Rate card (percentage of sensors in compliance)
- [x] Danger Zone counter with "Immediate action needed!" warning
- [x] Temperature Zones section (Refrigeration, Freezer, Hot Holding, Danger Zone)
- [x] Kitchen cards show compliance percentage badges
- [x] Sensor cards show equipment icons and required thresholds

**Compliance Report Page (`/portal/smart-kitchen/compliance`):**
- [x] Overall compliance rate with visual indicator
- [x] Total violations count
- [x] Danger zone events count
- [x] Daily compliance trend chart (7-day/30-day/90-day)
- [x] Sensor compliance details table
- [x] Export PDF button (placeholder)
- [x] DM document reference banner

### 5.5 Mobile App Integration (Future)
- [ ] Add Smart Kitchen tab to VisionDrive mobile app
- [ ] Push notifications for temperature alerts
- [ ] Offline alert history caching
- [ ] Biometric login support

### 5.6 Alert System
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

### 6.3 DM Compliance Testing
- [ ] Verify temperature thresholds match DM requirements
- [ ] Test Danger Zone alerts (5°C - 60°C)
- [ ] Validate compliance rate calculations
- [ ] Test equipment type categorization
- [ ] Verify Arabic translations display correctly

### 6.4 Edge Case Testing
- [ ] Test sensor offline handling
- [ ] Test network disconnection recovery
- [ ] Test battery low alerts
- [ ] Test extreme temperature handling
- [ ] Test concurrent user sessions

### 6.5 Performance Testing
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
- [ ] DM compliance features explanation
- [ ] Show how to add additional users
- [ ] Provide quick reference guide (PDF)

### 7.3 Sensor Installation
- [ ] Coordinate installation date with customer
- [ ] Install sensors at customer locations
- [ ] Configure equipment types for each sensor
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
- [ ] DM compliance features verified
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
| **DM Compliance Rate** | > 95% | Dashboard |
| **Danger Zone Events** | 0 per day | Dashboard |

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
| **DM compliance violation** | Real-time monitoring, immediate alerts |

---

## 📞 Contacts

| Role | Contact | Notes |
|------|---------|-------|
| du IoT Support | TBD | For network issues |
| Dragino Support | support@dragino.cc | Hardware issues |
| AWS Support | AWS Console | Infrastructure issues |
| Dubai Municipality | dm.gov.ae | Food safety regulations |

---

## 📁 Project Files

```
smartkitchen/
├── README.md                           # Project overview
├── PROJECT_PLAN.md                     # This file
├── PROGRESS.md                         # Implementation progress
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
    │       ├── rds-stack.ts            # PostgreSQL (users/auth)
    │       ├── database-stack.ts       # DynamoDB tables
    │       ├── lambda-stack.ts         # Lambda functions
    │       ├── iot-stack.ts            # IoT Core
    │       └── api-stack.ts            # API Gateway
    ├── prisma/
    │   └── schema.prisma               # RDS PostgreSQL schema
    └── lambda/
        ├── auth/                       # Authentication handlers
        │   ├── login.ts
        │   ├── register.ts
        │   └── refresh-token.ts
        ├── data-ingestion/             # Process sensor data
        ├── alerts/                     # Handle alerts
        ├── analytics/                  # Generate reports
        └── api/                        # REST API handler

app/portal/smart-kitchen/              # Frontend components
├── page.tsx                           # Overview dashboard
├── layout.tsx                         # Kitchen portal layout
├── lib/compliance.ts                  # DM compliance library
├── components/
│   ├── KitchenSidebar.tsx             # Dark sidebar
│   └── KitchenHeader.tsx              # Weather header
├── kitchens/page.tsx                  # Kitchens list
├── sensors/page.tsx                   # Sensors list
├── alerts/page.tsx                    # Alerts with acknowledge
├── reports/page.tsx                   # Analytics reports
├── settings/page.tsx                  # DM requirements
└── compliance/page.tsx                # Compliance report
```

---

## ✅ Next Steps

### Immediate (Jan 12, 2026)
1. **Get du SIM card** for Dragino sensor
2. **Configure sensor** with du APN and AWS IoT endpoint
3. **Test first transmission** - verify data in DynamoDB

### This Week
4. **Link admin to kitchen** - set kitchenId for admin user
5. **Create additional users** - test multi-user access
6. **Test live site** - login at visiondrive.ae with Kitchen portal

### Coming Weeks
7. **Phase 2**: Sensor deployment at customer kitchens
8. **Phase 6**: Testing and validation
9. **Phase 7**: Customer onboarding
10. **Phase 8**: Go live with first customer

---

## 🔑 Quick Reference

### Login Credentials
```
URL:      https://www.visiondrive.ae/login
Portal:   Kitchen 🍳
Email:    admin@kitchen.ae
Password: Kitchen@2026
```

### AWS API
```
Base URL: https://w7gfk5cka2.execute-api.me-central-1.amazonaws.com/prod/

POST /auth/login      - Login
POST /auth/register   - Create user (needs adminKey)
GET  /kitchens        - List kitchens
POST /kitchens        - Create kitchen
GET  /sensors         - List sensors
POST /sensors         - Register sensor
GET  /alerts          - List alerts
```

### DM Compliance Thresholds
```
Refrigeration:  0°C to 5°C
Freezer:        ≤ -18°C
Hot Holding:    ≥ 60°C
Danger Zone:    5°C - 60°C (UNSAFE)
Cooking:        ≥ 75°C core
```

---

*Last Updated: January 12, 2026 - Phases 1, 4, 5 Complete + DM Compliance*
