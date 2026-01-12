# VisionDrive Parking System - Documentation

## Complete Technical Documentation

This folder contains all documentation for the VisionDrive Parking System.

---

## 📚 Documentation Index

| Document | Description |
|----------|-------------|
| [OVERVIEW.md](./OVERVIEW.md) | System overview and key features |
| [AWS_SETUP.md](./AWS_SETUP.md) | AWS services configuration |
| [AWS_ACCOUNT_SETUP.md](./AWS_ACCOUNT_SETUP.md) | AWS account and region setup |
| [API_REFERENCE.md](./API_REFERENCE.md) | Complete REST API documentation |
| [SENSOR_GUIDE.md](./SENSOR_GUIDE.md) | PSL01B sensor configuration with SWIOTT app |
| [DASHBOARD_GUIDE.md](./DASHBOARD_GUIDE.md) | Portal user guide |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Infrastructure deployment instructions |
| [MIGRATION.md](./MIGRATION.md) | TimescaleDB to DynamoDB migration guide |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Common issues and solutions |
| [SECURITY.md](./SECURITY.md) | Security architecture and best practices |

**Architecture:** See [../ARCHITECTURE.md](../ARCHITECTURE.md) for detailed technical architecture.

---

## 🚀 Quick Start

### 1. Access the Dashboard
```
https://your-domain.vercel.app/portal/parking
```

### 2. API Endpoint
```
https://o2s68toqw0.execute-api.me-central-1.amazonaws.com/prod
```

### 3. IoT Endpoint
```
a15wlpv31y3kre-ats.iot.me-central-1.amazonaws.com
```

---

## 📊 System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           VISIONDRIVE PARKING                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────┐       MQTT + Username/Password             ┌─────────────┐    │
│   │ PSL01B  │──── NB-IoT (du) ────▶ AWS IoT Core ──────▶│   Lambda    │    │
│   │ Sensors │    User: swiott01     │ Custom Auth │      │  Processor  │    │
│   └─────────┘    SSL: Enabled       └─────────────┘      └──────┬──────┘    │
│                                                                  │          │
│                                                                  ▼          │
│                                                          ┌──────────────┐   │
│   ┌─────────────┐                                        │   DynamoDB   │   │
│   │   Next.js   │◀──── API Gateway ◀────────────────────│   (NoSQL)    │   │
│   │  Dashboard  │      (REST API)                        └──────────────┘   │
│   └─────────────┘                                                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication (MQTT)

SWIOTT PSL01B sensors use **username/password authentication**:

| Setting | Value |
|---------|-------|
| **Authorizer** | `VisionDriveParkingAuthorizer` |
| **Username** | `swiott01` |
| **Password** | `Demolition999` |
| **Port** | `8883` (MQTTS) |
| **SSL** | Enabled |

All sensors share the same credentials for simplified management.

---

## 📦 AWS Resources

| Resource | Name/ARN |
|----------|----------|
| **Region** | `me-central-1` (UAE) |
| **Account ID** | `307436091440` |
| **DynamoDB Table** | `VisionDrive-Parking` |
| **Lambda - API** | `VisionDrive-Parking-ApiHandler` |
| **Lambda - Events** | `VisionDrive-Parking-EventProcessor` |
| **Lambda - Auth** | `VisionDrive-Parking-CustomAuthorizer` |
| **API Gateway** | `o2s68toqw0` |
| **IoT Authorizer** | `VisionDriveParkingAuthorizer` |
| **SNS Topic** | `VisionDrive-Parking-Alerts` |

---

## 📊 Current Stats

| Metric | Value |
|--------|-------|
| AWS Region | me-central-1 (UAE) |
| Total Zones | 36 |
| Total Sensors | 46 |
| Total Bays | 40 |
| Events | 192+ |
| Database | DynamoDB (Single-table design) |

---

## 🔧 Quick Commands

### Test API
```bash
curl https://o2s68toqw0.execute-api.me-central-1.amazonaws.com/prod/zones | jq
```

### View Auth Logs
```bash
aws logs tail /aws/lambda/VisionDrive-Parking-CustomAuthorizer --follow \
  --profile visiondrive-parking --region me-central-1
```

### Check Authorizer Status
```bash
aws iot describe-authorizer --authorizer-name VisionDriveParkingAuthorizer \
  --profile visiondrive-parking --region me-central-1
```

---

## 🔐 Security Notes

- All data stored in UAE region (me-central-1) for data residency compliance
- TLS 1.2 encryption for all MQTT connections
- Custom Authorizer validates sensor credentials
- IAM roles with least privilege principle
- See [SECURITY.md](./SECURITY.md) for full security documentation

---

## 📞 Getting Help

1. **Sensor Issues**: See [SENSOR_GUIDE.md](./SENSOR_GUIDE.md)
2. **API Issues**: See [API_REFERENCE.md](./API_REFERENCE.md)
3. **Auth Issues**: See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) → Section 2.1
4. **Dashboard Issues**: See [DASHBOARD_GUIDE.md](./DASHBOARD_GUIDE.md)
