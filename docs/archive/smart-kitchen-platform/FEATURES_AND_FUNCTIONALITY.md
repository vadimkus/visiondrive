# VisionDrive - Features & Functionality

> Comprehensive documentation of all features, functionality, and user-facing capabilities across the VisionDrive platform.

**Last Updated:** February 2026

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Public Website](#2-public-website)
3. [Authentication & Portals](#3-authentication--portals)
4. [Smart Kitchen Portal](#4-smart-kitchen-portal)
5. [Kitchen Owner Portal](#5-kitchen-owner-portal)
6. [Admin & Master Admin](#6-admin--master-admin)
7. [IoT Systems](#7-iot-systems)
8. [Compliance & Security](#8-compliance--security)

---

## 1. Platform Overview

### Mission

> "To revolutionize food safety in the UAE by delivering cutting-edge, data-driven temperature monitoring solutions for commercial kitchens."

### Product Line

| Product | Description | Target Users |
|---------|-------------|--------------|
| **Smart Kitchen** | Temperature monitoring for commercial kitchens | Restaurants, hotels, food businesses |

### Key Capabilities

- **Multi-tenant architecture** — Isolated data per customer (tenant)
- **Kitchen portal login** — AWS API (me-central-1) with DynamoDB
- **UAE data residency** — All IoT data in AWS me-central-1 (Abu Dhabi)
- **TDRA certified** — IoT Services License IOT-26-100000007
- **Dubai Municipality compliant** — Smart Kitchen meets DM-HSD-GU46-KFPA2 food safety

---

## 2. Public Website

**Domain:** visiondrive.ae

### Primary Navigation

| Page | Route | Purpose |
|------|-------|---------|
| Home | `/` | Hero, value proposition, pilot showcase |
| Solutions | `/solutions` | Technology for Communities/Malls & Municipalities |
| Technology | `/technology` | LW009-SM sensors, RAK7289CV2 gateway |
| About | `/about` | Mission, vision, FZ-LLC status |
| Contact | `/contact` | Lead generation, pilot inquiry form |

### Additional Public Pages

| Page | Route | Purpose |
|------|-------|---------|
| The App | `/app` | User app features, download |
| Data & Analytics | `/data-analytics` | B2B data products showcase |
| Communities | `/communities` | Community solutions |
| Municipalities | `/municipalities` | Government solutions |
| Partners | `/partners` | Partner program |
| Certificates | `/certificates` | TDRA, DM compliance certificates |
| Compliance | `/compliance` | Regulatory compliance info |
| FAQ | `/faq` | Frequently asked questions |
| Blog | `/blog` | News and insights |
| Careers | `/careers` | Job opportunities |
| Privacy | `/privacy` | Privacy policy |
| Terms | `/terms` | Terms of service |
| Download | `/download` | App download links |

### Multi-Language Support

- **English** (default)
- **Arabic** (RTL layout for UAE market)

---

## 3. Authentication & Portals

### Login Page (`/login`)

- **Credentials**: Email + password
- **Rate limiting**: 5 attempts per 15 minutes (brute-force protection)
- **Session**: JWT, 24-hour expiry (VD-2026-004)
- **Password policy**: 12+ chars, mixed case, numbers, special (VD-2026-005)

### Backend

| Component | Technology |
|-----------|------------|
| **Auth** | AWS API Gateway (me-central-1) |
| **Database** | DynamoDB |

### User Roles

| Role | Scope | Capabilities |
|------|-------|--------------|
| MASTER_ADMIN | Global | All tenants, finance, audit |
| ADMIN | Tenant | Full tenant management |
| CUSTOMER_ADMIN | Tenant | User management, settings |
| CUSTOMER_OPS | Tenant | Day-to-day operations |
| CUSTOMER_ANALYST | Tenant | Reports, read-only analytics |
| USER | Tenant | Basic access |
| PARTNER | Partner | Partner-specific access |

---

## 4. Smart Kitchen Portal

**Base path:** `/portal/smart-kitchen`

### Overview Dashboard (`/portal/smart-kitchen`)

- **Compliance rate** (DM food safety)
- **Danger zone counter** (5°C–60°C alerts)
- Kitchen cards with compliance status
- Temperature zone visualization

### Kitchens (`/portal/smart-kitchen/kitchens`)

- List all kitchens
- Create, update, delete kitchens
- Trade license, DM permit fields

### Kitchen Detail (`/portal/smart-kitchen/kitchens/[id]`)

- Equipment management (fridges, freezers)
- Owner management
- Sensor DevEUI binding

### Sensors (`/portal/smart-kitchen/sensors`)

- Sensor grid with equipment types
- Current readings, compliance status
- DM equipment types (walk-in fridge, main freezer, etc.)

### Sensor Detail (`/portal/smart-kitchen/sensors/[id]`)

- Temperature history chart
- Compliance status
- Alert history

### Alerts (`/portal/smart-kitchen/alerts`)

- Temperature alerts (danger zone, out of range)
- Acknowledge, resolve workflow

### Reports (`/portal/smart-kitchen/reports`)

- Compliance reports
- PDF export

### Compliance (`/portal/smart-kitchen/compliance`)

- Full DM compliance report
- Equipment thresholds reference
- Arabic translations (غرفة تبريد, فريزر, etc.)

### Settings (`/portal/smart-kitchen/settings`)

- DM requirements reference

### Owner View (`/portal/smart-kitchen/owner`)

- Simplified owner-facing dashboard
- Reports, alerts, equipment

---

## 5. Kitchen Owner Portal

**Base path:** `/kitchen-owner`

Simplified portal for kitchen business owners (non-technical users).

| Page | Route | Purpose |
|------|-------|---------|
| Dashboard | `/kitchen-owner` | Overview, compliance summary |
| Equipment | `/kitchen-owner/equipment` | View equipment and sensors |
| Alerts | `/kitchen-owner/alerts` | Active alerts |
| Reports | `/kitchen-owner/reports` | Compliance reports |
| Subscription | `/kitchen-owner/subscription` | Billing info |
| Help | `/kitchen-owner/help` | Support |
| Settings | `/kitchen-owner/settings` | Profile |
| Privacy | `/kitchen-owner/privacy` | Privacy policy |
| Terms | `/kitchen-owner/terms` | Terms |

---

## 6. Admin & Master Admin

### Admin (`/portal/admin`)

- Tenant settings
- User management
- Threshold configuration

### Admin Tenants (`/portal/admin/tenants`) — Master Admin only

- Create/disable tenants
- Manage customer admins
- Cross-tenant overview

### Admin Audit (`/portal/admin/audit`)

- Audit log viewer
- Filter by entity, action, actor

### Admin Finance (`/portal/admin/finance`) — Master Admin only

- **Stripe integration**: Subscriptions, payments, MRR/ARR
- **Expenses**: Cloud, hardware, ops, support, marketing
- **Billing events**: Webhook ingestion
- Net margin, unit economics

### Report Subscriptions (`/portal/admin/reports/subscriptions`)

- Create scheduled reports
- Recipients, cadence (daily/weekly/monthly)
- Report kinds: SENSOR_PERFORMANCE, GATEWAY_HEALTH, WEATHER_DAILY_SUMMARY

---

## 7. IoT Systems

### Smart Kitchen IoT

| Component | Technology |
|-----------|------------|
| **Sensors** | Dragino PS-NB-GE (NB-IoT) |
| **Network** | du NB-IoT (UAE) |
| **Cloud** | AWS IoT Core (me-central-1) |
| **Protocol** | MQTTs (TLS 1.2, port 8883) |
| **Storage** | DynamoDB |
| **Lambda** | Node.js 22.x |

**Data flow:** Sensor → du NB-IoT → AWS IoT Core → Lambda → DynamoDB
**Alerts:** WhatsApp, SNS

---

## 8. Compliance & Security

### Dubai Municipality (Smart Kitchen)

- **Reference:** DM-HSD-GU46-KFPA2 (Version 3, May 9, 2024)
- **Equipment types:** Walk-in fridge (0–5°C), Main freezer (≤-18°C), Hot bain-marie (≥60°C), etc.
- **Danger zone:** 5°C–60°C — Alert required

### TDRA

- **IoT Services License:** IOT-26-100000007
- **Type Approval:** EA-2026-1-55656
- **Penetration Test:** Complete, all findings resolved

### Security Controls

| Control | Implementation |
|---------|----------------|
| AWS WAF | OWASP rules, rate limiting |
| CloudTrail | Audit logging |
| Rate limiting | 5 login attempts / 15 min |
| Security headers | CSP, HSTS, X-Frame-Options |
| Password policy | 12+ chars, complexity |

---

## Related Documentation

- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) — Folder structure
- [CODEBASE_REFERENCE.md](CODEBASE_REFERENCE.md) — Code structure
- [WEBSITE_STRUCTURE_V2.md](WEBSITE_STRUCTURE_V2.md) — Website structure
- [smartkitchen/docs/README.md](../smartkitchen/docs/README.md) — Smart Kitchen
- [api/README.md](api/README.md) — API reference
