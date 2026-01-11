# VisionDrive Parking System

Smart parking management system using NB-IoT sensors with AWS cloud infrastructure in the UAE region.

---

## 🚀 Quick Links

| Resource | URL |
|----------|-----|
| **Dashboard** | `/portal/parking` |
| **API Endpoint** | `https://o2s68toqw0.execute-api.me-central-1.amazonaws.com/prod` |
| **IoT Endpoint** | `a15wlpv31y3kre-ats.iot.me-central-1.amazonaws.com` |
| **AWS Region** | `me-central-1` (UAE) |

---

## 📊 System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           VISIONDRIVE PARKING                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────┐                                            ┌─────────────┐    │
│   │ PSL01B  │──── NB-IoT (du) ────▶ AWS IoT Core ──────▶│   Lambda    │    │
│   │ Sensors │                       (UAE Region)         │  Processor  │    │
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

## 📈 Current Stats

| Metric | Value |
|--------|-------|
| Zones | 36 |
| Bays | 40 |
| Sensors | 46 |
| Events | 192+ |
| Database Records | 356 |

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [docs/OVERVIEW.md](docs/OVERVIEW.md) | System overview and features |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Technical architecture |
| [docs/AWS_SETUP.md](docs/AWS_SETUP.md) | AWS services configuration |
| [docs/API_REFERENCE.md](docs/API_REFERENCE.md) | Complete API documentation |
| [docs/SENSOR_GUIDE.md](docs/SENSOR_GUIDE.md) | PSL01B sensor configuration |
| [docs/DASHBOARD_GUIDE.md](docs/DASHBOARD_GUIDE.md) | Portal user guide |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Deployment instructions |
| [docs/MIGRATION.md](docs/MIGRATION.md) | TimescaleDB migration guide |
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Common issues and solutions |
| [docs/SECURITY.md](docs/SECURITY.md) | Security best practices |

---

## 🛠️ Project Structure

```
Parking/
├── ARCHITECTURE.md           # System architecture
├── MIGRATION_PLAN.md         # Migration planning
├── README.md                 # This file
│
├── docs/                     # Documentation
│   ├── README.md
│   ├── OVERVIEW.md
│   ├── AWS_SETUP.md
│   ├── API_REFERENCE.md
│   ├── SENSOR_GUIDE.md
│   ├── DASHBOARD_GUIDE.md
│   ├── DEPLOYMENT.md
│   ├── MIGRATION.md
│   ├── TROUBLESHOOTING.md
│   └── SECURITY.md
│
├── infrastructure/           # AWS infrastructure
│   ├── cdk/                  # CDK definitions
│   │   ├── bin/
│   │   ├── lib/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── lambda/               # Lambda functions
│       ├── event-processor/
│       │   ├── index.js
│       │   └── package.json
│       └── api-handler/
│           ├── index.js
│           └── package.json
│
└── scripts/                  # Utility scripts
    ├── deploy/
    │   └── deploy-all.sh     # Full deployment
    ├── migration/
    │   ├── run-migration.js  # TimescaleDB migration
    │   └── explore-schema.js
    └── sensor-config/
        ├── register-sensors.ts
        └── sensors.example.csv
```

---

## 🔧 Quick Commands

### Test API
```bash
curl https://o2s68toqw0.execute-api.me-central-1.amazonaws.com/prod/zones | jq
```

### Check DynamoDB
```bash
aws dynamodb scan --table-name VisionDrive-Parking --select COUNT \
  --profile visiondrive-parking --region me-central-1
```

### View Lambda Logs
```bash
aws logs tail /aws/lambda/VisionDrive-Parking-ApiHandler --follow \
  --profile visiondrive-parking --region me-central-1
```

### Deploy Updates
```bash
cd scripts/deploy && ./deploy-all.sh
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/zones` | List all zones |
| GET | `/zones/{id}` | Get zone details |
| GET | `/zones/{id}/bays` | List bays in zone |
| GET | `/zones/{id}/events` | Get zone events |
| GET | `/sensors` | List all sensors |
| POST | `/sensors` | Register sensor |
| GET | `/events` | Query events |
| GET | `/analytics/occupancy` | Occupancy stats |

---

## 🌐 Dashboard Pages

| Page | Path | Description |
|------|------|-------------|
| Dashboard | `/portal/parking` | Overview & stats |
| Live Map | `/portal/parking/map` | Zone visualization |
| Zones | `/portal/parking/zones` | Zone management |
| Zone Detail | `/portal/parking/zones/[id]` | Bay grid & events |
| Sensors | `/portal/parking/sensors` | Sensor health |
| Events | `/portal/parking/events` | Activity log |
| Analytics | `/portal/parking/analytics` | Usage statistics |
| Alerts | `/portal/parking/alerts` | Alert management |
| Settings | `/portal/parking/settings` | Configuration |

---

## 🔐 Security

- All data in UAE region (me-central-1)
- TLS encryption in transit
- IAM-based access control
- Credentials should be rotated regularly

See [docs/SECURITY.md](docs/SECURITY.md) for full security guide.

---

## 📞 Support

- **Technical Issues**: See [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
- **API Issues**: Check CloudWatch logs
- **Sensor Issues**: See [docs/SENSOR_GUIDE.md](docs/SENSOR_GUIDE.md)

---

## 📜 License

Proprietary - VisionDrive
