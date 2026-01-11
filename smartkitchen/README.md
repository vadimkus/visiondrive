# VisionDrive Smart Kitchen

## 🍳 IoT Temperature Monitoring System

Real-time temperature monitoring for commercial kitchens using NB-IoT sensors with **all data stored exclusively in UAE** for regulatory compliance.

---

## 🚀 Current Status: Phase 5 Complete + DM Compliance

**Last Updated:** January 12, 2026

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ Complete | AWS Infrastructure in UAE |
| Phase 4 | ✅ Complete | Customer Authentication |
| Phase 5 | ✅ Complete | Dashboard + DM Compliance |
| Phase 2 | 🔜 Next | Sensor Configuration |

See [PROGRESS.md](PROGRESS.md) for detailed implementation status.

---

## 🏛️ Dubai Municipality Compliance

**Reference:** DM-HSD-GU46-KFPA2 (Version 3, May 9, 2024)

The portal implements Dubai Municipality food safety temperature requirements:

| Equipment | Required | Status |
|-----------|----------|--------|
| Refrigerator | 0°C to 5°C | ✅ Implemented |
| Freezer | ≤ -18°C | ✅ Implemented |
| Hot Holding | ≥ 60°C | ✅ Implemented |
| Danger Zone | 5°C - 60°C | ✅ Alerts |
| Cooking | ≥ 75°C core | ✅ Implemented |

**Features:**
- Real-time compliance status per sensor
- Danger Zone alerts (immediate food safety violations)
- Daily compliance trend tracking
- Export PDF compliance reports
- Arabic translations for all equipment types

---

## 🇦🇪 UAE Data Residency Compliance

**All customer data is stored in AWS me-central-1 (Abu Dhabi, UAE)**

| Data Type | Storage | Location |
|-----------|---------|----------|
| User accounts & auth | DynamoDB | 🇦🇪 UAE |
| Temperature readings | DynamoDB* | 🇦🇪 UAE |
| Device configs | DynamoDB | 🇦🇪 UAE |
| Alerts | DynamoDB | 🇦🇪 UAE |

> *Note: Using DynamoDB instead of Timestream because Timestream is not available in UAE region.

---

## 🎯 Project Overview

| Attribute | Value |
|-----------|-------|
| **Project Name** | VisionDrive Smart Kitchen |
| **Sensors** | Dragino PS-NB-GE |
| **Network** | du NB-IoT (UAE) |
| **Cloud** | AWS me-central-1 (Abu Dhabi) |
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

| Page | Description |
|------|-------------|
| Overview | Compliance dashboard with key metrics |
| Kitchens | List of all kitchen locations |
| Sensors | Sensor grid with equipment types |
| Alerts | Alert management with acknowledge workflow |
| Reports | Analytics and data exports |
| Settings | DM requirements and notifications |
| Compliance | Full compliance report |

---

## 📁 Project Structure

```
smartkitchen/
├── README.md                    # This file
├── PROGRESS.md                  # Implementation progress ⭐
├── PROJECT_PLAN.md              # Full project plan
├── docs/
│   ├── ARCHITECTURE.md          # System architecture
│   ├── SETUP_GUIDE.md           # Step-by-step setup
│   ├── SENSOR_CONFIG.md         # Dragino configuration
│   ├── DATA_RESIDENCY.md        # UAE compliance
│   └── AWS_SETUP.md             # AWS IoT Core setup
├── infrastructure/
│   ├── cdk/                     # AWS CDK infrastructure code
│   │   └── lib/
│   │       ├── vpc-stack.ts
│   │       ├── rds-stack.ts
│   │       ├── database-stack.ts
│   │       ├── lambda-stack.ts
│   │       ├── iot-stack.ts
│   │       └── api-stack.ts
│   └── lambda/
│       └── api/index.js         # REST API handler
└── scripts/
    ├── test/                    # Test scripts
    └── dragino-config/          # Sensor config tools

app/portal/smart-kitchen/        # Frontend components
├── page.tsx                     # Overview dashboard
├── layout.tsx                   # Portal layout
├── lib/compliance.ts            # DM compliance library
├── components/
│   ├── KitchenSidebar.tsx       # Dark sidebar
│   └── KitchenHeader.tsx        # Weather header
├── kitchens/page.tsx
├── sensors/page.tsx
├── alerts/page.tsx
├── reports/page.tsx
├── settings/page.tsx
└── compliance/page.tsx          # Compliance report
```

---

## 🔧 Technology Stack

| Layer | Technology | Location | Status |
|-------|------------|----------|--------|
| **Sensors** | Dragino PS-NB-GE | On-site (UAE) | 🔜 Pending |
| **Network** | du NB-IoT (UAE) | UAE | 🔜 Pending |
| **IoT Platform** | AWS IoT Core | me-central-1 🇦🇪 | ✅ Deployed |
| **User Database** | Amazon RDS PostgreSQL 16.6 | me-central-1 🇦🇪 | ✅ Deployed |
| **Sensor Data** | Amazon DynamoDB | me-central-1 🇦🇪 | ✅ Deployed |
| **Compute** | AWS Lambda | me-central-1 🇦🇪 | ✅ Deployed |
| **API** | Amazon API Gateway | me-central-1 🇦🇪 | ✅ Deployed |
| **Frontend** | Next.js (Vercel) | Global CDN (no data) | ✅ Deployed |
| **Monitoring** | Amazon CloudWatch | me-central-1 🇦🇪 | ✅ Deployed |

### Deployed Resources

```
API Endpoint:  https://w7gfk5cka2.execute-api.me-central-1.amazonaws.com/prod/
RDS Endpoint:  smartkitchen-postgres.ctoi8gckc521.me-central-1.rds.amazonaws.com:5432
Database:      visiondrive_smartkitchen
```

---

## 🚀 Quick Start

### Phase 1: AWS Infrastructure ✅ DONE
1. Set up AWS account with UAE region access
2. Deploy VPC, RDS, DynamoDB, Lambda
3. Configure IoT policies and rules
4. Deploy API Gateway

### Phase 2: Sensor Setup 🔜 NEXT
1. Configure Dragino PS-NB-GE sensors
2. Insert du SIM card
3. Set du APN and MQTT settings
4. Test connectivity

### Phase 3: Dashboard ✅ DONE
1. Integrate AWS API with Next.js
2. Build monitoring dashboard
3. Configure DM compliance tracking
4. Configure alerts

---

## 📞 Support

| Resource | Link |
|----------|------|
| Sensor Hardware | [Dragino Wiki](https://wiki.dragino.com) |
| du NB-IoT | [du Business IoT](https://www.du.ae/business/iot) |
| AWS | [AWS Support](https://aws.amazon.com/support) |
| DM Guidelines | [Dubai Municipality](https://www.dm.gov.ae) |

---

## 📄 Documentation

- [**Implementation Progress**](PROGRESS.md) ⭐ Current status
- [Project Plan](PROJECT_PLAN.md) - Full roadmap
- [Architecture Overview](docs/ARCHITECTURE.md)
- [UAE Data Residency](docs/DATA_RESIDENCY.md) 🇦🇪
- [Setup Guide](docs/SETUP_GUIDE.md)
- [Sensor Configuration](docs/SENSOR_CONFIG.md)
- [AWS Setup](docs/AWS_SETUP.md)
