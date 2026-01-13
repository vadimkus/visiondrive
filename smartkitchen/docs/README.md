# VisionDrive Smart Kitchen - Documentation

## Complete Technical Documentation

This folder contains all documentation for the VisionDrive Smart Kitchen IoT Temperature Monitoring System.

---

## 📚 Documentation Index

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture, data flow, and DM compliance |
| [AWS_SETUP.md](./AWS_SETUP.md) | AWS services configuration |
| [SETUP_GUIDE.md](./SETUP_GUIDE.md) | Step-by-step implementation guide |
| [SENSOR_CONFIG.md](./SENSOR_CONFIG.md) | Dragino PS-NB-GE sensor configuration |
| [DATA_RESIDENCY.md](./DATA_RESIDENCY.md) | UAE data residency compliance |
| [WHATSAPP_SETUP.md](./WHATSAPP_SETUP.md) | WhatsApp alert integration |

**Main README:** See [../README.md](../README.md) for project overview.

---

## 🚀 Quick Start

### 1. Access the Dashboard
```
URL:      https://www.visiondrive.ae/login
Portal:   Kitchen 🍳
Email:    admin@kitchen.ae
Password: Kitchen@2026
```

### 2. API Endpoint
```
https://w7gfk5cka2.execute-api.me-central-1.amazonaws.com/prod/
```

### 3. IoT Endpoint
```
xxxxxx-ats.iot.me-central-1.amazonaws.com
```

---

## 📊 System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        VISIONDRIVE SMART KITCHEN                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────┐       MQTTs (X.509 Cert)                   ┌─────────────┐    │
│   │ Dragino │──── NB-IoT (du) ────▶ AWS IoT Core ──────▶│   Lambda    │    │
│   │ PS-NB-GE│                       (UAE Region)         │  Node.js 20 │    │
│   └─────────┘                                            └──────┬──────┘    │
│                                                                  │          │
│                                                                  ▼          │
│                                                          ┌──────────────┐   │
│   ┌─────────────┐                                        │   DynamoDB   │   │
│   │   Next.js   │◀──── API Gateway ◀────────────────────│   (NoSQL)    │   │
│   │  Dashboard  │      (REST API)                        └──────────────┘   │
│   └─────────────┘                                                           │
│        │                                                                    │
│        ▼                                                                    │
│   ┌─────────┐                                                               │
│   │ Vercel  │                                                               │
│   └─────────┘                                                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏛️ Dubai Municipality Compliance

**Reference:** DM-HSD-GU46-KFPA2 (Version 3, May 9, 2024)

| Equipment | Arabic | Required Temp | Status |
|-----------|--------|---------------|--------|
| Walk-in Fridge | غرفة تبريد | 0°C to 5°C | ✅ |
| Main Freezer | فريزر | ≤ -18°C | ✅ |
| Hot Holding | حفظ ساخن | ≥ 60°C | ✅ |
| **Danger Zone** | **منطقة الخطر** | **5°C - 60°C** | ⚠️ Alert |

---

## 📦 AWS Resources

| Resource | Name/Value |
|----------|------------|
| **Region** | `me-central-1` (UAE) |
| **Lambda - Ingestion** | `smartkitchen-data-ingestion` (Node.js 20.x) |
| **Lambda - Alerts** | `smartkitchen-alerts` (Node.js 20.x) |
| **Lambda - API** | `smartkitchen-api` (Node.js 20.x) |
| **Lambda - Analytics** | `smartkitchen-analytics` (Node.js 20.x) |
| **API Gateway** | `w7gfk5cka2` |
| **DynamoDB - Devices** | `VisionDrive-Devices` |
| **DynamoDB - Alerts** | `VisionDrive-Alerts` |
| **DynamoDB - Readings** | `VisionDrive-SensorReadings` |
| **SNS Topic** | `SmartKitchen-Alerts` |

---

## 🔧 Quick Commands

### Test API
```bash
curl https://w7gfk5cka2.execute-api.me-central-1.amazonaws.com/prod/kitchens | jq
```

### View Lambda Logs
```bash
# API Handler
aws logs tail /aws/lambda/smartkitchen-api --follow --region me-central-1

# Data Ingestion
aws logs tail /aws/lambda/smartkitchen-data-ingestion --follow --region me-central-1

# Alerts
aws logs tail /aws/lambda/smartkitchen-alerts --follow --region me-central-1
```

### Check Lambda Runtime
```bash
aws lambda list-functions --region me-central-1 \
  --query 'Functions[?starts_with(FunctionName, `smartkitchen`)].{Name:FunctionName,Runtime:Runtime}' \
  --output table
```

---

## 🇦🇪 UAE Data Residency

All customer data is stored exclusively in **AWS me-central-1 (Abu Dhabi, UAE)**:

| Data Type | Storage | Location |
|-----------|---------|----------|
| User accounts | DynamoDB | 🇦🇪 UAE |
| Temperature readings | DynamoDB | 🇦🇪 UAE |
| Device configs | DynamoDB | 🇦🇪 UAE |
| Alerts | DynamoDB | 🇦🇪 UAE |
| Frontend assets | Vercel CDN | Global (no PII) |

> **Note:** Using DynamoDB instead of Timestream because Timestream is not available in UAE region.

---

## 📞 Getting Help

1. **Sensor Issues**: See [SENSOR_CONFIG.md](./SENSOR_CONFIG.md)
2. **AWS Issues**: See [AWS_SETUP.md](./AWS_SETUP.md)
3. **Architecture Questions**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
4. **Data Compliance**: See [DATA_RESIDENCY.md](./DATA_RESIDENCY.md)
