# VisionDrive Smart Kitchen

## 🍳 IoT Temperature Monitoring System

Real-time temperature monitoring for commercial kitchens using NB-IoT sensors with **all data stored exclusively in UAE** for regulatory compliance.

---

## 🚀 Current Status: Full Kitchen Management System

**Last Updated:** January 13, 2026

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ Complete | AWS Infrastructure in UAE |
| Phase 2 | ✅ Complete | Kitchen Management Portal |
| Phase 3 | ✅ Complete | Equipment Management |
| Phase 4 | ✅ Complete | Owner Management |
| Phase 5 | ✅ Complete | Dashboard + DM Compliance |
| Phase 6 | 🔜 Next | Physical Sensor Setup |

---

## ✨ New Features (January 2026)

### 🏠 Kitchen Management
- Create and manage multiple kitchen locations
- Trade License & Dubai Municipality Permit tracking
- Contact information management
- Emirate selection (Dubai, Abu Dhabi, Sharjah, etc.)
- Real-time status (Normal, Warning, Critical)

### 🧊 Equipment Management
- Add equipment with **serial numbers**
- Register **Dragino PS-NB-GE sensors** with DevEUI/IMEI
- Temperature thresholds (DM compliant)
- Equipment types: Fridge, Freezer, Display Fridge, Cold Room, Blast Chiller
- Track last reading, battery level, signal strength

### 👥 Kitchen Owner Management
- Add multiple owners per kitchen
- **Primary owner** designation
- **Permissions**: Can Manage, Can View Reports
- **Notifications**: Email, WhatsApp, Alerts, Daily Reports
- Emirates ID tracking for verification

---

## 🏛️ Dubai Municipality Compliance

**Reference:** DM-HSD-GU46-KFPA2 (Version 3, May 9, 2024)

The portal implements Dubai Municipality food safety temperature requirements:

| Equipment | Arabic | Required | Status |
|-----------|--------|----------|--------|
| Refrigerator | ثلاجة | 0°C to 5°C | ✅ Implemented |
| Freezer | فريزر | ≤ -18°C | ✅ Implemented |
| Walk-in Fridge | غرفة تبريد | 0°C to 5°C | ✅ Implemented |
| Display Fridge | ثلاجة عرض | 0°C to 5°C | ✅ Implemented |
| Hot Holding | حفظ ساخن | ≥ 60°C | ✅ Implemented |
| Blast Chiller | مبرد سريع | -10°C to 3°C | ✅ Implemented |
| **Danger Zone** | **منطقة الخطر** | **5°C - 60°C** | ⚠️ **Alerts** |

---

## 🇦🇪 UAE Data Residency Compliance

**All customer data is stored in AWS me-central-1 (Abu Dhabi, UAE)**

| Data Type | Storage | Location |
|-----------|---------|----------|
| Kitchens | DynamoDB | 🇦🇪 UAE |
| Equipment | DynamoDB | 🇦🇪 UAE |
| Owners | DynamoDB | 🇦🇪 UAE |
| Temperature readings | DynamoDB | 🇦🇪 UAE |
| Alerts | DynamoDB | 🇦🇪 UAE |
| User accounts | DynamoDB | 🇦🇪 UAE |

> **Note:** Using DynamoDB instead of Timestream because Timestream is not available in UAE region.

---

## 🎯 Project Overview

| Attribute | Value |
|-----------|-------|
| **Project Name** | VisionDrive Smart Kitchen |
| **Sensors** | Dragino PS-NB-GE |
| **Network** | du NB-IoT (UAE) |
| **Cloud** | AWS me-central-1 (Abu Dhabi) |
| **Database** | Amazon DynamoDB |
| **Frontend** | Next.js on Vercel (no data stored) |
| **Data Residency** | 🇦🇪 100% UAE Compliant |
| **Customer Portal** | https://www.visiondrive.ae/login |

---

## 📱 Portal Access

### Login
```
URL:      https://www.visiondrive.ae/login
Portal:   Kitchen 🍳
Email:    admin@kitchen.ae
Password: Kitchen@2026
```

### Portal Pages

| Page | Route | Description |
|------|-------|-------------|
| Overview | `/portal/smart-kitchen` | Compliance dashboard with key metrics |
| **Kitchens** | `/portal/smart-kitchen/kitchens` | ⭐ Manage kitchen locations |
| Kitchen Detail | `/portal/smart-kitchen/kitchens/{id}` | Equipment & Owners tabs |
| Sensors | `/portal/smart-kitchen/sensors` | Sensor grid with equipment types |
| Alerts | `/portal/smart-kitchen/alerts` | Alert management |
| Reports | `/portal/smart-kitchen/reports` | Analytics and PDF exports |
| Settings | `/portal/smart-kitchen/settings` | DM requirements reference |

---

## 🔧 API Reference

### Base URL
```
https://w7gfk5cka2.execute-api.me-central-1.amazonaws.com/prod
```

### Kitchens API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/kitchens` | List all kitchens |
| POST | `/kitchens` | Create a new kitchen |
| GET | `/kitchens/{id}` | Get kitchen with equipment & owners |
| PUT | `/kitchens/{id}` | Update kitchen |
| DELETE | `/kitchens/{id}` | Delete kitchen |

### Equipment API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/kitchens/{id}/equipment` | List equipment |
| POST | `/kitchens/{id}/equipment` | Add equipment |
| PUT | `/kitchens/{id}/equipment/{equipmentId}` | Update equipment |
| DELETE | `/kitchens/{id}/equipment/{equipmentId}` | Delete equipment |

### Owners API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/kitchens/{id}/owners` | List owners |
| POST | `/kitchens/{id}/owners` | Add owner |
| PUT | `/kitchens/{id}/owners/{ownerId}` | Update owner |
| DELETE | `/kitchens/{id}/owners/{ownerId}` | Delete owner |

### Authentication API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login (returns JWT) |
| POST | `/auth/register` | Register (requires adminKey) |

---

## 📁 Project Structure

```
smartkitchen/
├── README.md                    # This file
├── PROGRESS.md                  # Implementation progress
├── PROJECT_PLAN.md              # Full project plan
├── docs/
│   ├── README.md                # Documentation index
│   ├── ARCHITECTURE.md          # System architecture
│   ├── AWS_SETUP.md             # AWS services setup
│   ├── API_REFERENCE.md         # Full API documentation
│   ├── KITCHEN_MANAGEMENT.md    # ⭐ Kitchen/Equipment/Owners guide
│   ├── LAMBDA_FUNCTIONS.md      # Lambda reference
│   ├── SENSOR_CONFIG.md         # Dragino configuration
│   ├── DATA_RESIDENCY.md        # UAE compliance
│   ├── SETUP_GUIDE.md           # Step-by-step guide
│   └── WHATSAPP_SETUP.md        # WhatsApp alerts
├── infrastructure/
│   ├── cdk/                     # AWS CDK infrastructure
│   │   └── lib/
│   │       ├── database-stack.ts
│   │       ├── lambda-stack.ts
│   │       ├── iot-stack.ts
│   │       └── api-stack.ts
│   └── lambda/
│       ├── api/index.js         # ⭐ REST API (kitchens, equipment, owners)
│       ├── data-ingestion/      # Sensor data processing
│       └── alerts/              # Alert notifications
└── scripts/
    ├── test/                    # Test scripts
    └── dragino-config/          # Sensor config tools

app/portal/smart-kitchen/        # Frontend (Next.js)
├── page.tsx                     # Overview dashboard
├── layout.tsx                   # Portal layout
├── lib/compliance.ts            # DM compliance library
├── components/
│   ├── KitchenSidebar.tsx
│   └── KitchenHeader.tsx
├── kitchens/
│   ├── page.tsx                 # ⭐ Kitchen list + Add Kitchen modal
│   └── [id]/page.tsx            # ⭐ Kitchen detail with tabs
├── sensors/page.tsx
├── alerts/page.tsx
├── reports/page.tsx
└── settings/page.tsx
```

---

## 🔧 Technology Stack

| Layer | Technology | Location | Status |
|-------|------------|----------|--------|
| **Sensors** | Dragino PS-NB-GE | On-site (UAE) | 🔜 Pending |
| **Network** | du NB-IoT (UAE) | UAE | 🔜 Pending |
| **IoT Platform** | AWS IoT Core | me-central-1 🇦🇪 | ✅ Deployed |
| **Database** | Amazon DynamoDB | me-central-1 🇦🇪 | ✅ Deployed |
| **Compute** | AWS Lambda (Node.js 22.x) | me-central-1 🇦🇪 | ✅ Deployed |
| **API** | Amazon API Gateway | me-central-1 🇦🇪 | ✅ Deployed |
| **Frontend** | Next.js (Vercel) | Global CDN (no data) | ✅ Deployed |

### Deployed Resources

```
API Endpoint:     https://w7gfk5cka2.execute-api.me-central-1.amazonaws.com/prod/
DynamoDB Tables:  VisionDrive-Devices, VisionDrive-SensorReadings, VisionDrive-Alerts
Lambda Functions: smartkitchen-api, smartkitchen-data-ingestion, smartkitchen-alerts
```

---

## 📄 Documentation

| Document | Description |
|----------|-------------|
| [**KITCHEN_MANAGEMENT.md**](docs/KITCHEN_MANAGEMENT.md) | ⭐ Kitchen, Equipment, Owners guide |
| [**API_REFERENCE.md**](docs/API_REFERENCE.md) | Complete API documentation |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture |
| [AWS_SETUP.md](docs/AWS_SETUP.md) | AWS services setup |
| [LAMBDA_FUNCTIONS.md](docs/LAMBDA_FUNCTIONS.md) | Lambda reference |
| [LAMBDA_RUNTIME_UPGRADE.md](../docs/LAMBDA_RUNTIME_UPGRADE.md) | Node.js 22.x upgrade (Jan 2026) |
| [SENSOR_CONFIG.md](docs/SENSOR_CONFIG.md) | Dragino configuration |
| [DATA_RESIDENCY.md](docs/DATA_RESIDENCY.md) | 🇦🇪 UAE compliance |
| [SETUP_GUIDE.md](docs/SETUP_GUIDE.md) | Step-by-step guide |
| [WHATSAPP_SETUP.md](docs/WHATSAPP_SETUP.md) | WhatsApp alerts |

---

## 💰 Pricing & Subscription

### Market Position: **Exclusive Provider**

VisionDrive is the **only** Dubai Municipality-compliant, UAE data-resident IoT temperature monitoring solution in the market. No alternatives exist that meet UAE regulatory requirements.

### Hardware & Installation (One-Time)

| Item | Cost | Notes |
|------|------|-------|
| Sensor (Dragino S31-NB) | 257 AED | ~70 USD |
| Shipping (from China) | 55-75 AED | ~$15-20 per unit |
| SIM Card Activation | 25 AED | du NB-IoT |
| Installation & Setup | Included | Professional configuration |
| Site Survey | Included | Free with commitment |
| Training (1 hour) | Included | Staff onboarding |
| **Total Installation Fee** | **999 AED** | Per sensor, one-time |

> ⚠️ **Sensor Replacement:** All sensors must be replaced every **5 years** (battery life / wear). Free replacement included with active subscription.

### Monthly Subscription Plans (Premium Pricing)

| Plan | Sensors | Price/Sensor/Month | Annual Price (15% off) |
|------|---------|-------------------|------------------------|
| **Starter** | 1-2 | **449 AED** | 382 AED/sensor/month |
| **Standard** | 3-5 | **399 AED** | 339 AED/sensor/month |
| **Professional** | 6-15 | **349 AED** | 297 AED/sensor/month |
| **Enterprise** | 16+ | **299 AED** | 254 AED/sensor/month |

### Daily Cost Perspective

| Plan | Monthly | Daily Cost | Equivalent To |
|------|---------|------------|---------------|
| Starter | 449 AED | **~15 AED/day** | Less than a sandwich |
| Standard | 399 AED | **~13 AED/day** | A coffee |
| Professional | 349 AED | **~12 AED/day** | A snack |
| Enterprise | 299 AED | **~10 AED/day** | A water bottle |

### ROI Justification

| Scenario | Cost | vs VisionDrive |
|----------|------|----------------|
| 1 DM fine (temperature violation) | 10,000-100,000 AED | = 2-20+ years of subscription |
| 1 fridge failure (food spoilage) | 5,000-30,000 AED | = 1-6+ years of subscription |
| License suspension (1 week) | 50,000-200,000 AED | = 10-40+ years of subscription |
| Manual temperature logging (labor) | 500-1,500 AED/month | = More than subscription cost |

---

## 📊 Business Cost Structure (Internal)

### Fixed Monthly Overhead

| Item | Monthly Cost | Annual Cost | Amortization |
|------|--------------|-------------|--------------|
| **Staff Salary** | **25,000 AED** | 300,000 AED | Operations & Support |
| Company Setup (UAE) | 444 AED | 5,333 AED | 16,000 AED / 3 years |
| TDRA Dealer Certificate | 93 AED | 1,120 AED | 5,600 AED / 5 years |
| TDRA Device Authorization | 19 AED | 233 AED | 700 AED / 3 years |
| Website Domain (Tasjeel) | 417 AED | 5,000 AED | Per year |
| AWS Hosting (at scale) | 1,000 AED | 12,000 AED | Per month |
| **Total Fixed Overhead** | **26,973 AED** | **323,686 AED** | |

### Per-Sensor Variable Costs

| Item | Monthly Cost | Notes |
|------|--------------|-------|
| SIM Data (du) | 30 AED | NB-IoT connectivity |
| AWS Infrastructure | ~5-10 AED | IoT Core, DynamoDB, Lambda |
| **Sensor Depreciation** | **~6 AED** | 350 AED hardware / 60 months (5-year replacement) |
| **Total Variable** | **~41-46 AED** | Per sensor per month |

### Break-Even Analysis (Premium Pricing)

| Subscription Price | Margin per Sensor | Sensors to Break Even |
|-------------------|-------------------|----------------------|
| 449 AED (Starter) | ~403 AED | **67 sensors** |
| 399 AED (Standard) | ~353 AED | **76 sensors** |
| 349 AED (Professional) | ~303 AED | **89 sensors** |
| 299 AED (Enterprise) | ~253 AED | **107 sensors** |
| **Blended Average (~374 AED)** | **~328 AED** | **~82 sensors** |

> 💡 **Target:** Minimum **85-100 sensors** deployed to cover fixed costs (including salary).

### Profitability Scenarios (Premium Pricing)

#### Scenario A: 85 Sensors (Break-Even)
| Revenue | Amount |
|---------|--------|
| Installation (one-time) | 85 × 999 = 84,915 AED |
| Monthly subscription (avg 374 AED) | 85 × 374 = 31,790 AED |
| **Monthly Costs** | 26,973 + (85 × 46) = 30,883 AED |
| **Monthly P&L** | **+907 AED (Break-Even)** |

#### Scenario B: 100 Sensors (Profitable)
| Revenue | Amount |
|---------|--------|
| Installation (one-time) | 100 × 999 = 99,900 AED |
| Monthly subscription (avg 374 AED) | 100 × 374 = 37,400 AED |
| **Monthly Costs** | 26,973 + (100 × 46) = 31,573 AED |
| **Monthly P&L** | **+5,827 AED (Profit)** |
| **Annual Profit** | **~69,924 AED** |

#### Scenario C: 150 Sensors (Growth)
| Revenue | Amount |
|---------|--------|
| Installation (one-time) | 150 × 999 = 149,850 AED |
| Monthly subscription (avg 374 AED) | 150 × 374 = 56,100 AED |
| **Monthly Costs** | 26,973 + (150 × 46) = 33,873 AED |
| **Monthly P&L** | **+22,227 AED (Profit)** |
| **Annual Profit** | **~266,724 AED** |

#### Scenario D: 250 Sensors (Scale)
| Revenue | Amount |
|---------|--------|
| Installation (one-time) | 250 × 999 = 249,750 AED |
| Monthly subscription (avg 349 AED) | 250 × 349 = 87,250 AED |
| **Monthly Costs** | 26,973 + (250 × 46) = 38,473 AED |
| **Monthly P&L** | **+48,777 AED (Profit)** |
| **Annual Profit** | **~585,324 AED** |

#### Scenario E: 500 Sensors (Market Leader)
| Revenue | Amount |
|---------|--------|
| Installation (one-time) | 500 × 999 = 499,500 AED |
| Monthly subscription (avg 324 AED) | 500 × 324 = 162,000 AED |
| **Monthly Costs** | 26,973 + (500 × 46) = 49,973 AED |
| **Monthly P&L** | **+112,027 AED (Profit)** |
| **Annual Profit** | **~1,344,324 AED** |

---

### Value Proposition (Customer Benefits)

| Benefit | Value to Kitchen Owner |
|---------|----------------------|
| **Avoid DM fines** | 5,000-50,000 AED per violation |
| **Prevent license suspension** | Business continuity |
| **Food waste prevention** | 10,000+ AED per fridge failure |
| **Insurance compliance** | May reduce premiums |
| **24/7 automated monitoring** | No manual temperature logs |

### Features Included (All Plans)
- ✅ 24/7 real-time temperature monitoring
- ✅ Instant alerts (Dashboard, WhatsApp, Email)
- ✅ Dubai Municipality compliance reports
- ✅ PDF export for inspections
- ✅ 2-year data retention
- ✅ Equipment & kitchen management
- ✅ Multi-user access with permissions
- ✅ Priority email support
- ✅ **Sensor replacement included after 5 years**

---

## 📞 Support

| Resource | Link |
|----------|------|
| Sensor Hardware | [Dragino Wiki](https://wiki.dragino.com) |
| du NB-IoT | [du Business IoT](https://www.du.ae/business/iot) |
| AWS | [AWS Support](https://aws.amazon.com/support) |
| DM Guidelines | [Dubai Municipality](https://www.dm.gov.ae) |
| VisionDrive | support@visiondrive.ae |
