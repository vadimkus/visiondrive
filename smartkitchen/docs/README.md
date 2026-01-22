# Smart Kitchen Documentation

## VisionDrive Smart Kitchen - Documentation Index

Complete documentation for the Smart Kitchen IoT temperature monitoring system.

---

## Quick Links

| Document | Description |
|----------|-------------|
| [**../README.md**](../README.md) | 📋 Project overview and quick start |
| [**../PROGRESS.md**](../PROGRESS.md) | ✅ Implementation status |

---

## Core Documentation

### Business & Pricing

| Document | Description |
|----------|-------------|
| [**BUSINESS_MODEL.md**](BUSINESS_MODEL.md) | 💰 **Complete business model, pricing, market analysis** |
| [**PRICING_CARD.md**](PRICING_CARD.md) | 📋 **Quick reference pricing card for sales** |

### Getting Started

| Document | Description |
|----------|-------------|
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | Step-by-step setup instructions |
| [SENSOR_CONFIG.md](SENSOR_CONFIG.md) | Dragino S31-NB sensor configuration |

### Features

| Document | Description |
|----------|-------------|
| [**KITCHEN_MANAGEMENT.md**](KITCHEN_MANAGEMENT.md) | ⭐ **NEW** Kitchen, Equipment & Owner management |
| [**API_REFERENCE.md**](API_REFERENCE.md) | ⭐ **NEW** Complete REST API documentation |
| [WHATSAPP_SETUP.md](WHATSAPP_SETUP.md) | WhatsApp alert notifications |

### Architecture & Infrastructure

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | System architecture diagrams |
| [AWS_SETUP.md](AWS_SETUP.md) | AWS services configuration |
| [LAMBDA_FUNCTIONS.md](LAMBDA_FUNCTIONS.md) | Lambda function reference |
| [DATA_RESIDENCY.md](DATA_RESIDENCY.md) | 🇦🇪 UAE data compliance |

---

## Document Summaries

### BUSINESS_MODEL.md 💰 NEW

Complete business documentation including:
- **Market Analysis** - TAM of 150,000-200,000 refrigeration units in UAE
- **Competitive Landscape** - VisionDrive is the ONLY DM-compliant solution
- **Cost Structure** - Fixed overhead (26,973 AED/month) + variable costs (46 AED/sensor)
- **Pricing Strategy** - Premium tiered pricing (299-449 AED/sensor/month)
- **Break-Even Analysis** - ~82 sensors with blended pricing
- **Profitability Projections** - 5-year financial model
- **Value Proposition** - ROI justification and customer value analysis
- **Sales & Marketing** - Target segments, messaging, objection handling

### PRICING_CARD.md 📋 NEW

Quick reference for sales team:
- **Installation fee** - 999 AED per sensor
- **Subscription tiers** - Starter/Standard/Professional/Enterprise
- **Quick quotes** - Pre-calculated for 2, 4, 10, 25 sensors
- **ROI calculator** - Risk vs cost comparison
- **Objection handling** - Ready responses

### KITCHEN_MANAGEMENT.md ⭐

Complete guide to managing:
- **Kitchens** - Create, update, delete kitchen locations with trade license and DM permit
- **Equipment** - Add fridges/freezers with serial numbers and sensor DevEUI
- **Owners** - Manage owners with permissions and notification preferences

### API_REFERENCE.md ⭐ NEW

Full REST API documentation:
- Authentication endpoints
- CRUD operations for kitchens, equipment, owners
- Sensor readings and alerts
- Request/response examples
- Error codes

### ARCHITECTURE.md

System architecture including:
- High-level component diagram
- Data flow from sensor to dashboard
- DynamoDB schema design
- Security layers
- Dubai Municipality compliance processing

### AWS_SETUP.md

AWS configuration guide:
- IoT Core setup (Things, Policies, Rules)
- DynamoDB tables
- Lambda functions
- API Gateway
- SNS for notifications
- CloudWatch monitoring

### SENSOR_CONFIG.md

Dragino PS-NB-GE configuration:
- Hardware specifications
- du NB-IoT APN settings
- MQTT configuration
- AT commands reference
- Temperature probe calibration

### DATA_RESIDENCY.md

UAE compliance documentation:
- Data storage locations
- No data leaves UAE
- DynamoDB in me-central-1
- Vercel as CDN only (no data stored)

### LAMBDA_FUNCTIONS.md

Lambda function reference:
- `smartkitchen-api` - REST API handler
- `smartkitchen-data-ingestion` - Process sensor readings
- `smartkitchen-alerts` - Temperature alert processing
- `smartkitchen-analytics` - Statistics and reporting

### WHATSAPP_SETUP.md

WhatsApp Business API integration:
- Meta Business account setup
- Message templates
- Alert delivery configuration
- Rate limits and costs

---

## API Quick Reference

### Base URL
```
https://w7gfk5cka2.execute-api.me-central-1.amazonaws.com/prod
```

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/kitchens` | List all kitchens |
| POST | `/kitchens` | Create kitchen |
| GET | `/kitchens/{id}` | Get kitchen with equipment & owners |
| POST | `/kitchens/{id}/equipment` | Add equipment |
| POST | `/kitchens/{id}/owners` | Add owner |
| GET | `/alerts` | List active alerts |

See [API_REFERENCE.md](API_REFERENCE.md) for complete documentation.

---

## DynamoDB Tables

| Table | Purpose |
|-------|---------|
| `VisionDrive-Devices` | Kitchens, Equipment, Owners, Users |
| `VisionDrive-SensorReadings` | Temperature readings (time-series) |
| `VisionDrive-Alerts` | Alert records |

---

## Portal URLs

| Portal | URL | Description |
|--------|-----|-------------|
| Login | https://www.visiondrive.ae/login | Select Kitchen portal |
| Overview | https://www.visiondrive.ae/portal/smart-kitchen | Dashboard |
| Kitchens | https://www.visiondrive.ae/portal/smart-kitchen/kitchens | ⭐ Kitchen management |
| Kitchen Detail | https://www.visiondrive.ae/portal/smart-kitchen/kitchens/{id} | Equipment & Owners |

---

## Support

| Resource | Contact |
|----------|---------|
| Technical Support | support@visiondrive.ae |
| Sales | sales@visiondrive.ae |
| Billing | billing@visiondrive.ae |

---

## Updates

| Date | Changes |
|------|---------|
| 2026-01-21 | **Added BUSINESS_MODEL.md** - Complete pricing, market analysis, profitability |
| 2026-01-21 | Updated pricing to premium tiers (299-449 AED) |
| 2026-01-21 | Installation fee updated to 999 AED |
| 2026-01-13 | Added Kitchen Management, Equipment, Owners APIs |
| 2026-01-13 | Updated Lambda runtime to Node.js 22.x |
| 2026-01-12 | PDF compliance reports |
| 2026-01-11 | Dark/Light mode |
| 2026-01-10 | Dubai Municipality compliance |
