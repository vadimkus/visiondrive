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
| **Compute** | AWS Lambda (Node.js 20.x) | me-central-1 🇦🇪 | ✅ Deployed |
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
| [SENSOR_CONFIG.md](docs/SENSOR_CONFIG.md) | Dragino configuration |
| [DATA_RESIDENCY.md](docs/DATA_RESIDENCY.md) | 🇦🇪 UAE compliance |
| [SETUP_GUIDE.md](docs/SETUP_GUIDE.md) | Step-by-step guide |
| [WHATSAPP_SETUP.md](docs/WHATSAPP_SETUP.md) | WhatsApp alerts |

---

## 💰 Subscription & Billing

### Pricing
| Plan | Price | Discount |
|------|-------|----------|
| Monthly | 199 AED/sensor | - |
| Yearly | 179 AED/sensor/month | 10% off |

### Features Included
- 24/7 temperature monitoring
- Real-time alerts (dashboard + WhatsApp)
- PDF compliance reports
- 2-year data retention
- Email support

---

## 📞 Support

| Resource | Link |
|----------|------|
| Sensor Hardware | [Dragino Wiki](https://wiki.dragino.com) |
| du NB-IoT | [du Business IoT](https://www.du.ae/business/iot) |
| AWS | [AWS Support](https://aws.amazon.com/support) |
| DM Guidelines | [Dubai Municipality](https://www.dm.gov.ae) |
| VisionDrive | support@visiondrive.ae |
