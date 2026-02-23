# VisionDrive - Codebase Reference

> Comprehensive reference for the VisionDrive codebase structure, key modules, and development patterns.

**Last Updated:** February 2026

---

## Table of Contents

1. [Repository Structure](#1-repository-structure)
2. [Technology Stack](#2-technology-stack)
3. [Application Architecture](#3-application-architecture)
4. [Key Directories](#4-key-directories)
5. [Database Schema](#5-database-schema)
6. [API Routes](#6-api-routes)
7. [Shared Libraries](#7-shared-libraries)
8. [IoT Infrastructure](#8-iot-infrastructure)

---

## 1. Repository Structure

```
VisionDrive/
├── app/                      # Next.js App Router (visiondrive.ae)
│   ├── api/                  # API routes
│   ├── components/           # Shared components
│   ├── contexts/             # React contexts (Language, etc.)
│   ├── kitchen-owner/        # Kitchen owner portal
│   ├── portal/               # Main operator portal
│   │   ├── smart-kitchen/    # Smart Kitchen sub-portal
│   │   ├── admin/            # Admin pages
│   │   └── ...               # Map, alerts, sensors, etc.
│   ├── page.tsx              # Home
│   ├── login/                # Login page
│   ├── solutions/            # Solutions page
│   └── ...                   # Public pages
│
├── lib/                      # Shared server-side libraries
│   ├── auth.ts               # JWT auth, password hashing
│   ├── sql.ts                # PostgreSQL client
│   ├── rate-limit.ts         # Brute-force protection
│   ├── password-policy.ts    # Password validation
│   ├── audit.ts              # Audit logging
│   ├── stripe-webhook.ts     # Stripe event handling
│   ├── smart-kitchen/        # Smart Kitchen AWS client
│   ├── portal/               # Portal session utilities
│   └── decoders/             # Sensor payload decoders
│
├── prisma/
│   ├── schema.prisma         # PostgreSQL schema
│   └── seed.ts               # Database seed
│
├── smartkitchen/             # Smart Kitchen IoT project
│   ├── docs/                 # Smart Kitchen documentation
│   ├── infrastructure/       # AWS CDK stacks
│   │   └── cdk/lib/          # IoT, Lambda, API, WAF, CloudTrail
│   └── scripts/              # Provisioning, utilities
│
│   ├── docs/
│   └── infrastructure/
│
├── docs/                     # Main documentation
├── public/                   # Static assets
│   └── Certification/        # TDRA, DM certificates
├── scripts/                  # Utility scripts
└── middleware.ts             # Auth, route protection
```

---

## 2. Technology Stack

| Layer | Technology |
|-------|-------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4 |
| **Database** | PostgreSQL (Prisma ORM) |
| **IoT Backend** | AWS Lambda (Node.js 22.x) |
| **IoT Storage** | DynamoDB (Smart Kitchen) |
| **Maps** | Mapbox GL JS |
| **Auth** | JWT, bcrypt |
| **Hosting** | Vercel (web), AWS me-central-1 (IoT) |

---

## 3. Application Architecture

### Request Flow

```
Browser → Vercel (Next.js) → API Routes
                ↓
         AWS API (me-central-1) — Smart Kitchen
                ↓
         DynamoDB
```

### Multi-Tenant Model

- **Tenant**: Customer/organization (e.g., mall, restaurant chain)
- **TenantMembership**: User ↔ Tenant with role
- All queries scoped by `tenantId`

---

## 4. Key Directories

### `app/`

| Path | Purpose |
|------|---------|
| `app/api/` | Next.js API routes (REST) |
| `app/components/` | Layout, Header, Footer, PortalSidebar, etc. |
| `app/portal/` | Operator portal pages |
| `app/portal/smart-kitchen/` | Kitchen sub-portal |
| `app/kitchen-owner/` | Owner-facing simplified portal |
| `app/contexts/` | LanguageContext, etc. |

### `app/components/`

| Component | Purpose |
|-----------|---------|
| `layout/` | Header, Footer, ConditionalLayout |
| `portal/` | PortalSidebar, PortalNavigation |
| `common/` | Logo, LanguageSelector |

### `lib/`

| Module | Purpose |
|--------|---------|
| `auth.ts` | hashPassword, verifyPassword, generateToken, verifyToken, authenticateUser |
| `sql.ts` | PostgreSQL connection (postgres.js) |
| `rate-limit.ts` | Rate limiting for login |
| `password-policy.ts` | validatePassword (12+ chars, complexity) |
| `audit.ts` | Audit log writes |
| `stripe-webhook.ts` | Stripe webhook verification |
| `smart-kitchen/aws-client.ts` | AWS API client for Smart Kitchen |
| `portal/session.ts` | Portal session helpers |
| `decoders/index.ts` | Sensor payload decoders |

---

## 5. Database Schema

### Core Models (Prisma)

| Model | Purpose |
|-------|---------|
| **User** | Email, passwordHash, role, status |
| **Tenant** | Customer/organization |
| **TenantMembership** | User ↔ Tenant, role |
| **Site** | Physical location |
| **Zone** | Zone (FREE/PAID/PRIVATE) |
| **Bay** | Bay |
| **Sensor** | IoT sensor (PARKING/WEATHER/OTHER) |
| **Gateway** | LoRaWAN gateway |
| **SensorEvent** | Time-series events (UPLINK/DERIVED/OVERRIDE/HEARTBEAT) |
| **Alert** | SENSOR_OFFLINE, LOW_BATTERY, etc. |
| **AlertEvent** | Alert audit trail |
| **MaintenanceNote** | Sensor maintenance notes |
| **AuditLog** | Admin/operator actions |
| **IngestFile** | Replay upload metadata |
| **IngestEvent** | Replay event records |
| **IngestDeadLetter** | Failed decode records |
| **ReplayJob** | Replay run status |
| **ReportSubscription** | Scheduled reports |
| **ReportDelivery** | Report run history |
| **Expense** | Finance expenses |
| **BillingEvent** | Stripe events |
| **BillingSubscription** | Stripe subscriptions |
| **Image** | Logo, favicon, etc. |
| **RateLimit** | Login rate limiting |

### Enums

- **UserRole**: MASTER_ADMIN, ADMIN, CUSTOMER_ADMIN, CUSTOMER_OPS, CUSTOMER_ANALYST, USER, PARTNER
- **UserStatus**: ACTIVE, INACTIVE, SUSPENDED
- **ZoneKind**: FREE, PAID, PRIVATE
- **AssetStatus**: ACTIVE, INACTIVE, MAINTENANCE, RETIRED
- **SensorType**: PARKING, WEATHER, OTHER
- **AlertType**: SENSOR_OFFLINE, LOW_BATTERY, POOR_SIGNAL, FLAPPING, DECODE_ERRORS
- **AlertSeverity**: INFO, WARNING, CRITICAL
- **AlertStatus**: OPEN, ACKNOWLEDGED, RESOLVED

---

## 6. API Routes

### Authentication

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/auth/login` | Login (portal selector) |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user (session check) |

### Portal – Smart Kitchen (Next.js proxy to AWS)

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/portal/smart-kitchen/kitchens` | List kitchens |
| GET | `/api/portal/smart-kitchen/kitchens/[id]` | Get kitchen |
| POST | `/api/portal/smart-kitchen/kitchens` | Create kitchen |
| PUT | `/api/portal/smart-kitchen/kitchens/[id]` | Update kitchen |
| GET | `/api/portal/smart-kitchen/kitchens/[id]/equipment` | List equipment |
| POST | `/api/portal/smart-kitchen/kitchens/[id]/equipment` | Add equipment |
| GET | `/api/portal/smart-kitchen/kitchens/[id]/owners` | List owners |
| POST | `/api/portal/smart-kitchen/kitchens/[id]/owners` | Add owner |
| GET | `/api/portal/smart-kitchen/sensors` | List sensors |
| GET | `/api/portal/smart-kitchen/sensors/[id]/current` | Current reading |
| GET | `/api/portal/smart-kitchen/alerts` | List alerts |
| GET | `/api/portal/smart-kitchen/stats` | Dashboard stats |

### Portal – Operator

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/portal/dashboard` | Dashboard KPIs |
| GET | `/api/portal/map` | Map data |
| GET | `/api/portal/sensors` | List sensors |
| GET | `/api/portal/sensors/[id]` | Sensor detail |
| GET | `/api/portal/events` | Event list |
| GET | `/api/portal/alerts` | Alerts |
| GET | `/api/portal/zones` | Zones |
| GET | `/api/portal/reports/sensors` | Sensor reports |
| GET | `/api/portal/admin/tenants` | Tenants (master) |
| GET | `/api/portal/admin/finance/overview` | Finance KPIs |
| GET | `/api/portal/admin/audit` | Audit log |

### Replay

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/replay/upload` | Upload uplink file |
| POST | `/api/replay/run` | Run replay |
| GET | `/api/replay/dead-letters` | Dead letters |
| POST | `/api/replay/bench/preview` | Decoder preview |
| POST | `/api/replay/bench/save` | Save decoded event |

### Other

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/weather` | Weather data |
| POST | `/api/webhooks/stripe` | Stripe webhooks |
| GET | `/api/images/logo` | Logo image |
| POST | `/api/images/upload` | Upload image |

---

## 7. Shared Libraries

### `lib/auth.ts`

```typescript
hashPassword(password)      // bcrypt, cost 12
verifyPassword(password, hash)
generateToken(userId, email, role, tenantId?)  // 24h expiry
verifyToken(token)
authenticateUser(email, password)  // Returns user or null
```

### `lib/rate-limit.ts`

- Rule: `login` — 5 attempts per 15 minutes per IP
- Uses `rate_limits` table

### `lib/password-policy.ts`

- `validatePassword(password)` → `{ isValid, errors[] }`
- 12+ chars, uppercase, lowercase, number, special

### `lib/audit.ts`

- `auditLog(tenantId, actorUserId, action, entityType, entityId, before?, after?)`

### `lib/decoders/index.ts`

- Decode sensor payloads
- Used by replay and ingestion pipeline

---

## 8. IoT Infrastructure

### Smart Kitchen (AWS CDK)

| Stack | Purpose |
|-------|---------|
| `SmartKitchen-IoT` | IoT Core rules, policies |
| `SmartKitchen-Lambda` | Ingestion, alerts, auth |
| `SmartKitchen-API` | API Gateway |
| `SmartKitchen-WAF` | Web Application Firewall |
| `SmartKitchen-CloudTrail` | Audit logging |

**Location:** `smartkitchen/infrastructure/cdk/lib/`

### DynamoDB Tables (Smart Kitchen)

| Table | Purpose |
|-------|---------|
| VisionDrive-Devices | Users, kitchens, equipment, owners |
| VisionDrive-SensorReadings | Temperature time-series |
| VisionDrive-Alerts | Alert records |

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL (Vercel/Neon) |
| `VISIONDRIVE_DATABASE_URL` | Override for Prisma |
| `JWT_SECRET` | JWT signing (required in prod) |
| `SMART_KITCHEN_JWT_SECRET` | Kitchen portal JWT |
| `SMART_KITCHEN_API_URL` | AWS API base URL |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification |
| `MAPBOX_ACCESS_TOKEN` | Mapbox maps |

---

## Related Documentation

- [FEATURES_AND_FUNCTIONALITY.md](FEATURES_AND_FUNCTIONALITY.md) — Feature overview
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) — Folder structure
- [api/README.md](api/README.md) — API reference
- [architecture/README.md](architecture/README.md) — Architecture
- [smartkitchen/docs/ARCHITECTURE.md](../smartkitchen/docs/ARCHITECTURE.md) — Smart Kitchen architecture
