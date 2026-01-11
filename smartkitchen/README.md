# VisionDrive Smart Kitchen

## IoT Temperature Monitoring System

Real-time temperature monitoring for commercial kitchens using NB-IoT sensors with **all data stored exclusively in UAE** for regulatory compliance.

---

## 🚀 Current Status: Phase 1 Complete

**Infrastructure deployed on January 11, 2026**

See [PROGRESS.md](PROGRESS.md) for detailed implementation status.

---

## 🇦🇪 UAE Data Residency Compliance

**All customer data is stored in AWS me-central-1 (Abu Dhabi, UAE)**

| Data Type | Storage | Location |
|-----------|---------|----------|
| User accounts & auth | RDS PostgreSQL | 🇦🇪 UAE |
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

## 📁 Project Structure

```
smartkitchen/
├── README.md                    # This file
├── docs/
│   ├── ARCHITECTURE.md          # System architecture
│   ├── SETUP_GUIDE.md           # Step-by-step setup
│   ├── SENSOR_CONFIG.md         # Dragino sensor configuration
│   └── AWS_SETUP.md             # AWS IoT Core setup
├── infrastructure/
│   ├── cdk/                     # AWS CDK infrastructure code
│   └── cloudformation/          # Alternative CloudFormation templates
├── lambda/
│   ├── data-ingestion/          # Process incoming sensor data
│   ├── alerts/                  # Temperature alert handler
│   └── analytics/               # Daily analytics processor
├── api/
│   └── routes/                  # API route handlers
└── dashboard/
    └── components/              # React components for monitoring
```

---

## 🚀 Quick Start

### Phase 1: AWS Infrastructure
1. Set up AWS account with UAE region access
2. Deploy IoT Core, Timestream, and Lambda
3. Configure IoT policies and certificates

### Phase 2: Sensor Setup
1. Configure Dragino PS-NB-GE sensors
2. Set du APN and MQTT settings
3. Test connectivity

### Phase 3: Dashboard
1. Integrate AWS API with Next.js
2. Build monitoring dashboard
3. Configure alerts

---

## 📋 Implementation Checklist

### Infrastructure
- [ ] AWS Account with me-central-1 access
- [ ] IoT Core endpoint configured
- [ ] Timestream database created
- [ ] Lambda functions deployed
- [ ] API Gateway configured

### Sensors
- [ ] Dragino sensors configured with du APN
- [ ] MQTT topics set up
- [ ] Temperature probes calibrated
- [ ] First data transmission verified

### Frontend
- [ ] AWS SDK integrated
- [ ] Dashboard components built
- [ ] Real-time updates working
- [ ] Alert notifications configured

---

## 🔧 Technology Stack

| Layer | Technology | Location | Status |
|-------|------------|----------|--------|
| **Sensors** | Dragino PS-NB-GE + Temperature Probes | On-site (UAE) | 🔜 Pending |
| **Network** | du NB-IoT (UAE) | UAE | 🔜 Pending |
| **IoT Platform** | AWS IoT Core | me-central-1 🇦🇪 | ✅ Deployed |
| **User Database** | Amazon RDS PostgreSQL 16.6 | me-central-1 🇦🇪 | ✅ Deployed |
| **Sensor Data** | Amazon DynamoDB | me-central-1 🇦🇪 | ✅ Deployed |
| **Compute** | AWS Lambda | me-central-1 🇦🇪 | ✅ Deployed |
| **API** | Amazon API Gateway | me-central-1 🇦🇪 | ✅ Deployed |
| **Frontend** | Next.js (Vercel) | Global CDN (no data) | 🔜 Pending |
| **Monitoring** | Amazon CloudWatch | me-central-1 🇦🇪 | ✅ Deployed |

### Deployed Resources

```
API Endpoint:  https://w7gfk5cka2.execute-api.me-central-1.amazonaws.com/prod/
RDS Endpoint:  smartkitchen-postgres.ctoi8gckc521.me-central-1.rds.amazonaws.com:5432
Database:      visiondrive_smartkitchen
```

---

## 📞 Support

For sensor hardware: [Dragino Support](https://wiki.dragino.com)
For du NB-IoT: [du Business IoT](https://www.du.ae/business/iot)
For AWS: [AWS Support](https://aws.amazon.com/support)

---

## 📄 Documentation

- [**Implementation Progress**](PROGRESS.md) ⭐ Start here to see current status
- [Project Plan](PROJECT_PLAN.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [UAE Data Residency](docs/DATA_RESIDENCY.md) 🇦🇪
- [Setup Guide](docs/SETUP_GUIDE.md)
- [Sensor Configuration](docs/SENSOR_CONFIG.md)
- [AWS Setup](docs/AWS_SETUP.md)
