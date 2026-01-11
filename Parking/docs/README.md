# VisionDrive Parking System - Documentation

## Complete Technical Documentation

This folder contains all documentation for the VisionDrive Parking System.

---

## 📚 Documentation Index

| Document | Description |
|----------|-------------|
| [OVERVIEW.md](./OVERVIEW.md) | System overview and key features |
| [ARCHITECTURE.md](../ARCHITECTURE.md) | Technical architecture and data flow |
| [AWS_SETUP.md](./AWS_SETUP.md) | AWS services configuration |
| [API_REFERENCE.md](./API_REFERENCE.md) | Complete API documentation |
| [SENSOR_GUIDE.md](./SENSOR_GUIDE.md) | PSL01B sensor configuration |
| [DASHBOARD_GUIDE.md](./DASHBOARD_GUIDE.md) | Portal user guide |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Deployment instructions |
| [MIGRATION.md](./MIGRATION.md) | TimescaleDB migration guide |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Common issues and solutions |

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

## 📊 System Stats

| Metric | Value |
|--------|-------|
| AWS Region | me-central-1 (UAE) |
| Total Zones | 36 |
| Total Sensors | 46 |
| Total Bays | 40 |
| Database | DynamoDB |

---

## 🔐 Security

All credentials should be stored securely:
- AWS credentials in environment variables
- API keys in Vercel/deployment platform
- IoT certificates in secure storage

See [SECURITY.md](./SECURITY.md) for security best practices.
