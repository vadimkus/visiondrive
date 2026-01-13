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
| [../docs/LAMBDA_RUNTIME_UPGRADE.md](../docs/LAMBDA_RUNTIME_UPGRADE.md) | Node.js 22.x upgrade (Jan 2026) |

---

## 🛠️ Project Structure

```
Parking/
├── ARCHITECTURE.md           # System architecture
├── MIGRATION_PLAN.md         # Migration planning
├── README.md                 # This file
│
├── docs/                     # Documentation
│   ├── README.md             # Documentation index
│   ├── OVERVIEW.md           # System overview
│   ├── AWS_SETUP.md          # AWS services configuration
│   ├── AWS_ACCOUNT_SETUP.md  # AWS account setup
│   ├── API_REFERENCE.md      # REST API documentation
│   ├── SENSOR_GUIDE.md       # PSL01B sensor configuration
│   ├── DASHBOARD_GUIDE.md    # Portal user guide
│   ├── DEPLOYMENT.md         # Deployment instructions
│   ├── MIGRATION.md          # TimescaleDB migration guide
│   ├── TROUBLESHOOTING.md    # Common issues & solutions
│   └── SECURITY.md           # Security best practices
│
├── infrastructure/           # AWS infrastructure
│   ├── cdk/                  # CDK definitions (optional)
│   │   ├── bin/
│   │   ├── lib/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── lambda/               # Lambda functions
│       ├── event-processor/  # Processes sensor events
│       │   ├── index.js
│       │   └── package.json
│       ├── api-handler/      # REST API handler
│       │   ├── index.js
│       │   └── package.json
│       └── custom-authorizer/  # MQTT authentication
│           ├── index.js        # Username/password validation
│           └── package.json
│
└── scripts/                  # Utility scripts
    ├── deploy/
    │   ├── deploy-all.sh     # Full infrastructure deployment
    │   └── setup-mqtt-auth.sh  # MQTT auth setup
    ├── migration/
    │   ├── run-migration.js  # TimescaleDB → DynamoDB
    │   ├── explore-schema.js # Schema exploration
    │   └── package.json
    └── sensor-config/
        ├── register-sensors.ts
        ├── sensors.example.csv
        ├── package.json
        └── README.md
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
# API Handler logs
aws logs tail /aws/lambda/VisionDrive-Parking-ApiHandler --follow \
  --profile visiondrive-parking --region me-central-1

# Event Processor logs
aws logs tail /aws/lambda/VisionDrive-Parking-EventProcessor --follow \
  --profile visiondrive-parking --region me-central-1

# Custom Authorizer logs (for MQTT auth debugging)
aws logs tail /aws/lambda/VisionDrive-Parking-CustomAuthorizer --follow \
  --profile visiondrive-parking --region me-central-1
```

### Deploy Updates
```bash
# Full deployment
cd scripts/deploy && ./deploy-all.sh

# Update MQTT authentication only
cd scripts/deploy && SWIOTT_PASSWORD='Demolition999' ./setup-mqtt-auth.sh
```

### Check Custom Authorizer
```bash
aws iot describe-authorizer --authorizer-name VisionDriveParkingAuthorizer \
  --profile visiondrive-parking --region me-central-1
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

## 🔐 Security & Authentication

### Sensor Authentication (MQTT)

| Setting | Value |
|---------|-------|
| **Authorizer** | `VisionDriveParkingAuthorizer` |
| **Username** | `swiott01` |
| **Password** | `Demolition999` |
| **SSL** | Enabled (Port 8883) |

### Security Features

- All data in UAE region (me-central-1)
- TLS encryption in transit (MQTTS)
- Custom Authorizer for sensor authentication
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
