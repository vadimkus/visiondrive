# System Architecture

## VisionDrive Smart Kitchen - Technical Architecture

---

## 🇦🇪 UAE Data Residency Compliance

**All customer data is stored exclusively in AWS me-central-1 (Abu Dhabi, UAE)**

> ⚠️ **Note:** Amazon Timestream is NOT available in UAE region. Using DynamoDB for time-series data instead.

| Data Type | Storage | Location | Compliance |
|-----------|---------|----------|------------|
| Users & Authentication | RDS PostgreSQL 16.6 | me-central-1 | ✅ UAE |
| Sensor Readings | DynamoDB (VisionDrive-SensorReadings) | me-central-1 | ✅ UAE |
| Device Configs | DynamoDB (VisionDrive-Devices) | me-central-1 | ✅ UAE |
| Alerts & Events | DynamoDB (VisionDrive-Alerts) | me-central-1 | ✅ UAE |
| Frontend Assets | Vercel CDN | Global | ✅ No PII |

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     VISIONDRIVE SMART KITCHEN ARCHITECTURE                  │
│                     🇦🇪 All Data Stored in UAE (me-central-1)               │
└─────────────────────────────────────────────────────────────────────────────┘

                              SENSOR LAYER
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐        │
│   │ PS-NB-GE  │    │ PS-NB-GE  │    │ PS-NB-GE  │    │ PS-NB-GE  │        │
│   │ Kitchen 1 │    │ Kitchen 2 │    │ Kitchen 3 │    │ Kitchen N │        │
│   │   🌡️ 4°C   │    │   🌡️ 3°C   │    │   🌡️ 5°C   │    │   🌡️ 4°C   │        │
│   └─────┬─────┘    └─────┬─────┘    └─────┬─────┘    └─────┬─────┘        │
│         │                │                │                │              │
│         └────────────────┴────────────────┴────────────────┘              │
│                                   │                                        │
│                          ┌────────▼────────┐                              │
│                          │   du NB-IoT     │                              │
│                          │   Network (UAE) │                              │
│                          └────────┬────────┘                              │
│                                   │                                        │
└───────────────────────────────────┼────────────────────────────────────────┘
                                    │
                                    │ MQTTs (Port 8883)
                                    │
                         CLOUD LAYER (AWS me-central-1 UAE) 🇦🇪
┌───────────────────────────────────┼────────────────────────────────────────┐
│                                   │                                        │
│                          ┌────────▼────────┐                              │
│                          │  AWS IoT Core   │                              │
│                          │  ─────────────  │                              │
│                          │  • MQTT Broker  │                              │
│                          │  • Device Reg.  │                              │
│                          │  • Rules Engine │                              │
│                          └────────┬────────┘                              │
│                                   │                                        │
│         ┌─────────────────────────┼─────────────────────────┐             │
│         │                         │                         │             │
│         ▼                         ▼                         ▼             │
│  ┌─────────────┐         ┌─────────────┐         ┌─────────────┐         │
│  │   Lambda    │         │   Lambda    │         │   Lambda    │         │
│  │  Ingestion  │         │   Alerts    │         │    Auth     │         │
│  │             │         │             │         │             │         │
│  │ • Parse mA  │         │ • Check     │         │ • Login     │         │
│  │ • Convert°C │         │   thresholds│         │ • JWT issue │         │
│  │ • Validate  │         │ • Send SNS  │         │ • Verify    │         │
│  └──────┬──────┘         └──────┬──────┘         └──────┬──────┘         │
│         │                       │                       │                 │
│         ▼                       ▼                       ▼                 │
│  ┌─────────────┐         ┌─────────────┐         ┌─────────────┐         │
│  │ Timestream  │         │  DynamoDB   │         │     RDS     │         │
│  │             │         │             │         │  PostgreSQL │         │
│  │ Time-series │         │ • Alerts    │         │ ─────────── │         │
│  │ temperature │         │ • Devices   │         │ • Users     │         │
│  │ data        │         │ • Kitchens  │         │ • Tenants   │         │
│  └──────┬──────┘         └─────────────┘         │ • Sessions  │         │
│         │                                        │ • Roles     │         │
│         │                                        │ • Audit     │         │
│         │                                        └──────┬──────┘         │
│         │                                               │                 │
│         └──────────────────┬────────────────────────────┘                │
│                            │                                              │
│                   ┌────────▼────────┐                                    │
│                   │  API Gateway    │                                    │
│                   │  ─────────────  │                                    │
│                   │  REST API       │                                    │
│                   │  /api/auth      │  ◄── Auth endpoints                │
│                   │  /api/sensors   │                                    │
│                   │  /api/kitchens  │                                    │
│                   │  /api/alerts    │                                    │
│                   └────────┬────────┘                                    │
│                            │                                              │
└────────────────────────────┼──────────────────────────────────────────────┘
                             │
                             │ HTTPS (API calls to UAE)
                             │
                       PRESENTATION LAYER (Vercel - No Data Storage)
┌────────────────────────────┼──────────────────────────────────────────────┐
│                            │                                              │
│                   ┌────────▼────────┐                                    │
│                   │    Next.js      │                                    │
│                   │   Dashboard     │                                    │
│                   │                 │                                    │
│                   │ ⚠️ NO DATA      │                                    │
│                   │    STORED HERE  │                                    │
│                   │                 │                                    │
│                   │ All API calls   │                                    │
│                   │ go to AWS UAE   │                                    │
│                   └─────────────────┘                                    │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 1.1 Customer Access Flow

Kitchen businesses access their data via the VisionDrive portal:

```
                         CUSTOMER ACCESS FLOW
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   🖥️ DESKTOP                           📱 MOBILE                         │
│   Browser                              App / Browser                     │
│      │                                      │                            │
│      └──────────────┬───────────────────────┘                            │
│                     │                                                    │
│                     ▼                                                    │
│      ┌──────────────────────────────┐                                   │
│      │  https://www.visiondrive.ae  │                                   │
│      │          /login              │                                   │
│      │  ────────────────────────────│                                   │
│      │  Username: chef@restaurant.ae│                                   │
│      │  Password: ••••••••          │                                   │
│      │  [Login]                     │                                   │
│      └──────────────┬───────────────┘                                   │
│                     │                                                    │
│                     ▼ Authenticate                                       │
│      ┌──────────────────────────────┐                                   │
│      │   VisionDrive Auth System    │                                   │
│      │  ────────────────────────────│                                   │
│      │  • Validate credentials      │                                   │
│      │  • Check user role           │                                   │
│      │  • Get customerId            │                                   │
│      │  • Issue JWT token           │                                   │
│      └──────────────┬───────────────┘                                   │
│                     │                                                    │
│                     ▼ Redirect to Dashboard                              │
│      ┌──────────────────────────────┐                                   │
│      │  /smart-kitchen              │                                   │
│      │  ────────────────────────────│                                   │
│      │  🏠 My Kitchens              │                                   │
│      │  ┌─────────┐ ┌─────────┐     │                                   │
│      │  │Kitchen 1│ │Kitchen 2│     │◄── Only shows kitchens            │
│      │  │  🌡️ 4°C  │ │  🌡️ 3°C  │     │    owned by this customer        │
│      │  └─────────┘ └─────────┘     │                                   │
│      │                              │                                   │
│      │  🚨 Active Alerts: 0         │                                   │
│      │  📊 View Analytics           │                                   │
│      └──────────────────────────────┘                                   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

                         MULTI-TENANT ISOLATION
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  Customer A (Restaurant Al Barsha)     Customer B (Hotel Marina)         │
│  ┌──────────────────────────────┐     ┌──────────────────────────────┐  │
│  │ ✅ Kitchen A1                │     │ ✅ Kitchen B1                │  │
│  │ ✅ Kitchen A2                │     │ ✅ Kitchen B2                │  │
│  │ ❌ Cannot see Kitchen B1/B2  │     │ ❌ Cannot see Kitchen A1/A2  │  │
│  └──────────────────────────────┘     └──────────────────────────────┘  │
│                                                                          │
│  VisionDrive Admin                                                       │
│  ┌──────────────────────────────┐                                       │
│  │ ✅ ALL Kitchens (A1, A2, B1, B2)                                     │
│  │ ✅ All Customers                                                     │
│  │ ✅ System Settings                                                   │
│  └──────────────────────────────┘                                       │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Flow

### 2.1 Sensor → Cloud (Uplink)

```
Step 1: Sensor Reading
─────────────────────
PS-NB-GE reads temperature probe (4-20mA)
├── Every 5 minutes (configurable via AT+TDC)
├── On threshold breach (AT+ROC feature)
└── On manual trigger (button press)

Step 2: Data Transmission
─────────────────────────
Sensor → du NB-IoT → AWS IoT Core
├── Protocol: MQTTs (TLS 1.2)
├── Port: 8883
├── Topic: visiondrive/kitchen/{kitchenId}/temperature
└── Payload: JSON

Step 3: IoT Rules Processing
────────────────────────────
AWS IoT Rules Engine triggers:
├── Rule 1: ALL data → Lambda (Ingestion) → Timestream
├── Rule 2: temp > threshold → Lambda (Alerts) → SNS
└── Rule 3: Daily → Lambda (Analytics) → S3

Step 4: Storage
───────────────
Timestream stores time-series data:
├── Dimensions: deviceId, kitchenId, location
├── Measures: temperature, humidity, battery
└── Retention: 7 days hot, 1 year cold
```

### 2.2 Cloud → Sensor (Downlink)

```
Dashboard → API Gateway → Lambda → IoT Core → Sensor

Commands:
├── Change transmission interval
├── Update alert thresholds
├── Request immediate reading
└── Firmware update trigger
```

---

## 3. Database Schema

### 3.0 Amazon RDS PostgreSQL (Users & Authentication)

**Location:** AWS me-central-1 (UAE) 🇦🇪
**Purpose:** User accounts, authentication, multi-tenant access control

```sql
-- Database: visiondrive_smartkitchen
-- Uses same schema as main VisionDrive app (Prisma)

-- Users table
CREATE TABLE users (
  id              VARCHAR(25) PRIMARY KEY,
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  name            VARCHAR(255),
  role            user_role DEFAULT 'USER',
  status          user_status DEFAULT 'ACTIVE',
  default_tenant_id VARCHAR(25),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Tenants table (Kitchen businesses)
CREATE TABLE tenants (
  id              VARCHAR(25) PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  slug            VARCHAR(255) UNIQUE NOT NULL,
  status          tenant_status DEFAULT 'ACTIVE',
  tenant_type     VARCHAR(50) DEFAULT 'SMART_KITCHEN',  -- NEW
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Tenant memberships (user ↔ tenant with role)
CREATE TABLE tenant_memberships (
  id              VARCHAR(25) PRIMARY KEY,
  tenant_id       VARCHAR(25) REFERENCES tenants(id),
  user_id         VARCHAR(25) REFERENCES users(id),
  role            user_role NOT NULL,
  status          membership_status DEFAULT 'ACTIVE',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

-- Smart Kitchen specific roles
CREATE TYPE kitchen_role AS ENUM (
  'KITCHEN_OWNER',    -- Full access, manage users
  'KITCHEN_MANAGER',  -- View + acknowledge alerts
  'KITCHEN_STAFF'     -- View only
);

-- Audit log (all data access logged in UAE)
CREATE TABLE audit_logs (
  id              VARCHAR(25) PRIMARY KEY,
  tenant_id       VARCHAR(25),
  actor_user_id   VARCHAR(25),
  action          VARCHAR(100) NOT NULL,
  entity_type     VARCHAR(100),
  entity_id       VARCHAR(255),
  ip              VARCHAR(45),
  user_agent      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Example: Get all users for a kitchen tenant
SELECT u.id, u.email, u.name, tm.role
FROM users u
JOIN tenant_memberships tm ON tm.user_id = u.id
WHERE tm.tenant_id = 'tenant-kitchen-001'
  AND tm.status = 'ACTIVE';
```

---

### 3.1 Amazon Timestream

```sql
-- Database: visiondrive_smartkitchen
-- Table: sensor_readings

-- Schema:
-- ├── Dimensions (indexed metadata)
-- │   ├── device_id: STRING
-- │   ├── kitchen_id: STRING
-- │   └── location: STRING
-- │
-- └── Measures (time-series values)
--     ├── temperature: DOUBLE (°C)
--     ├── raw_ma: DOUBLE (mA from sensor)
--     ├── battery_voltage: DOUBLE (V)
--     └── signal_strength: BIGINT (dBm)

-- Example Query: Last 24h readings for kitchen
SELECT 
    device_id,
    kitchen_id,
    time,
    measure_value::double AS temperature
FROM "visiondrive_smartkitchen"."sensor_readings"
WHERE kitchen_id = 'kitchen-001'
  AND measure_name = 'temperature'
  AND time > ago(24h)
ORDER BY time DESC
```

### 3.2 Amazon DynamoDB

```
Table: VisionDrive-Devices
──────────────────────────
Partition Key: PK (String)
Sort Key: SK (String)

CUSTOMER RECORDS (for multi-tenant access):
┌─────────────────────────────────────────────────────────────┐
│ PK: CUSTOMER#cust-001                                       │
│ SK: METADATA                                                │
│ ─────────────────────────────────────────────────────────── │
│ name: "Al Barsha Restaurant Group"                          │
│ contactEmail: "manager@albarsha.ae"                         │
│ contactPhone: "+971-50-xxx-xxxx"                            │
│ plan: "premium"                                             │
│ maxKitchens: 10                                             │
│ createdAt: "2026-01-01"                                     │
│ status: "active"                                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PK: CUSTOMER#cust-001                                       │
│ SK: USER#user-001                                           │
│ ─────────────────────────────────────────────────────────── │
│ email: "chef@albarsha.ae"                                   │
│ name: "Ahmed Hassan"                                        │
│ role: "owner"           ◄── owner | manager | staff         │
│ createdAt: "2026-01-01"                                     │
│ lastLogin: "2026-01-11T10:00:00Z"                          │
└─────────────────────────────────────────────────────────────┘

DEVICE RECORDS:
┌─────────────────────────────────────────────────────────────┐
│ PK: DEVICE#sensor-001                                       │
│ SK: METADATA                                                │
│ ─────────────────────────────────────────────────────────── │
│ kitchenId: "kitchen-001"                                    │
│ customerId: "cust-001"   ◄── Links sensor to customer       │
│ location: "Walk-in Fridge"                                  │
│ installDate: "2026-01-11"                                   │
│ probeModel: "PT100"                                         │
│ alertThresholds: { min: 0, max: 8 }                         │
│ transmissionInterval: 300                                   │
│ status: "active"                                            │
│ lastSeen: "2026-01-11T10:30:00Z"                           │
└─────────────────────────────────────────────────────────────┘

KITCHEN RECORDS:
┌─────────────────────────────────────────────────────────────┐
│ PK: KITCHEN#kitchen-001                                     │
│ SK: METADATA                                                │
│ ─────────────────────────────────────────────────────────── │
│ customerId: "cust-001"   ◄── Links kitchen to customer      │
│ name: "Main Kitchen"                                        │
│ address: "Dubai Marina, Building A"                         │
│ manager: "John Smith"                                       │
│ phone: "+971-50-xxx-xxxx"                                   │
│ sensorCount: 5                                              │
│ createdAt: "2026-01-01"                                     │
└─────────────────────────────────────────────────────────────┘

Table: VisionDrive-Alerts
─────────────────────────
Partition Key: PK (String)
Sort Key: SK (String)

Records:
┌─────────────────────────────────────────────────────────────┐
│ PK: KITCHEN#kitchen-001                                     │
│ SK: ALERT#2026-01-11T10:30:00Z                             │
│ ─────────────────────────────────────────────────────────── │
│ deviceId: "sensor-001"                                      │
│ alertType: "HIGH_TEMP"                                      │
│ temperature: 12.5                                           │
│ threshold: 8.0                                              │
│ acknowledged: false                                         │
│ acknowledgedBy: null                                        │
│ resolvedAt: null                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. API Design

### 4.1 REST Endpoints

```
Base URL: https://api.visiondrive.ae/smartkitchen/v1

⚠️ All endpoints require authentication via JWT token
   Header: Authorization: Bearer <token>
   Token obtained via https://www.visiondrive.ae/login

AUTHENTICATION (handled by main VisionDrive app)
────────────────────────────────────────────────
POST   /auth/login                  Login (returns JWT + customerId)
POST   /auth/logout                 Logout (invalidate session)
POST   /auth/refresh                Refresh JWT token
POST   /auth/forgot-password        Request password reset
POST   /auth/reset-password         Reset password with token

CUSTOMERS (Admin only)
──────────────────────
GET    /customers                   List all customers
GET    /customers/{id}              Get customer details
POST   /customers                   Create new customer
PUT    /customers/{id}              Update customer
DELETE /customers/{id}              Deactivate customer

USERS (within customer scope)
─────────────────────────────
GET    /customers/{id}/users        List users for customer
POST   /customers/{id}/users        Invite new user
PUT    /users/{id}                  Update user
DELETE /users/{id}                  Remove user access

KITCHENS (filtered by customer)
───────────────────────────────
GET    /kitchens                    List kitchens (for logged-in customer)
GET    /kitchens/{id}               Get kitchen details
POST   /kitchens                    Create new kitchen (admin)
PUT    /kitchens/{id}               Update kitchen
DELETE /kitchens/{id}               Delete kitchen (admin)

SENSORS
───────
GET    /kitchens/{id}/sensors       List sensors in kitchen
GET    /sensors/{id}                Get sensor details
POST   /sensors                     Register new sensor
PUT    /sensors/{id}                Update sensor config
DELETE /sensors/{id}                Remove sensor

READINGS
────────
GET    /sensors/{id}/readings       Get temperature history
GET    /sensors/{id}/current        Get latest reading
GET    /kitchens/{id}/readings      Get all readings for kitchen

ALERTS
──────
GET    /alerts                      List all active alerts
GET    /alerts/{id}                 Get alert details
PUT    /alerts/{id}/acknowledge     Acknowledge alert
GET    /kitchens/{id}/alerts        Get alerts for kitchen

ANALYTICS
─────────
GET    /analytics/daily             Daily summary report
GET    /analytics/weekly            Weekly trend report
GET    /analytics/kitchen/{id}      Kitchen-specific analytics
```

### 4.2 Example Responses

```json
// GET /sensors/sensor-001/current
{
  "deviceId": "sensor-001",
  "kitchenId": "kitchen-001",
  "location": "Walk-in Fridge",
  "temperature": 4.2,
  "unit": "celsius",
  "batteryVoltage": 3.52,
  "signalStrength": -85,
  "timestamp": "2026-01-11T10:30:00Z",
  "status": "normal"
}

// GET /alerts
{
  "alerts": [
    {
      "id": "alert-001",
      "deviceId": "sensor-003",
      "kitchenId": "kitchen-002",
      "type": "HIGH_TEMP",
      "temperature": 12.5,
      "threshold": 8.0,
      "createdAt": "2026-01-11T10:25:00Z",
      "acknowledged": false
    }
  ],
  "totalActive": 1
}
```

---

## 5. Security Architecture

### 5.1 Device Security

```
┌─────────────────────────────────────────────────────────────┐
│                     SECURITY LAYERS                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  TRANSPORT SECURITY                                         │
│  ├── TLS 1.2/1.3 for all communications                    │
│  ├── MQTTs (port 8883) for sensor → cloud                  │
│  └── HTTPS for API calls                                   │
│                                                             │
│  DEVICE AUTHENTICATION                                      │
│  ├── X.509 certificates per device                         │
│  ├── Or custom authorizer with token                       │
│  └── Device provisioning via AWS IoT                       │
│                                                             │
│  API SECURITY                                               │
│  ├── API Gateway with API keys                             │
│  ├── JWT tokens for user authentication                    │
│  └── IAM roles for service-to-service                      │
│                                                             │
│  DATA SECURITY                                              │
│  ├── Encryption at rest (AWS managed keys)                 │
│  ├── Data residency in UAE (me-central-1)                  │
│  └── VPC endpoints for internal traffic                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 User Authentication (Customer Portal)

```
┌─────────────────────────────────────────────────────────────┐
│              USER AUTHENTICATION FLOW                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  LOGIN PORTAL: https://www.visiondrive.ae/login             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  1. User enters credentials                         │   │
│  │     └── Email + Password                            │   │
│  │                                                     │   │
│  │  2. VisionDrive Auth validates                      │   │
│  │     ├── Check password hash (bcrypt)                │   │
│  │     ├── Verify account status                       │   │
│  │     └── Get customerId + role from DB               │   │
│  │                                                     │   │
│  │  3. Issue JWT token                                 │   │
│  │     ├── Payload: { userId, customerId, role, exp }  │   │
│  │     ├── Signed with secret key                      │   │
│  │     └── Expires: 24 hours                           │   │
│  │                                                     │   │
│  │  4. Redirect to /smart-kitchen                      │   │
│  │     └── Token stored in httpOnly cookie             │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ROLE-BASED ACCESS CONTROL                                  │
│  ─────────────────────────                                  │
│  │ Role    │ View  │ Acknowledge │ Settings │ Users │      │
│  │─────────│───────│─────────────│──────────│───────│      │
│  │ staff   │  ✅   │     ❌      │    ❌    │  ❌   │      │
│  │ manager │  ✅   │     ✅      │    ❌    │  ❌   │      │
│  │ owner   │  ✅   │     ✅      │    ✅    │  ✅   │      │
│  │ admin   │  ✅   │     ✅      │    ✅    │  ✅   │      │
│                                                             │
│  MULTI-TENANT ISOLATION                                     │
│  ──────────────────────                                     │
│  Every API request:                                         │
│  1. Extract customerId from JWT                             │
│  2. Filter queries: WHERE customerId = {jwt.customerId}     │
│  3. Block access to other customers' data                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Scalability

| Component | Current | Scalable To |
|-----------|---------|-------------|
| Sensors | 10 | 10,000+ |
| Kitchens | 5 | 1,000+ |
| Readings/day | 2,880 | 1M+ |
| Concurrent API requests | 10 | 10,000+ |

All AWS services used are fully managed and auto-scale.
