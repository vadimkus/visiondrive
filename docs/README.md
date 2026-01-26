# VisionDrive Documentation

> **AI Agents**: Read this file and relevant documentation before making changes. See `/AGENTS.md` for full instructions.

## Documentation Index

### Project Overview
| Document | Description |
|----------|-------------|
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | Project architecture and folder structure |
| [WEBSITE_STRUCTURE.md](WEBSITE_STRUCTURE.md) | Website pages and components |
| [WEBSITE_STRUCTURE_V2.md](WEBSITE_STRUCTURE_V2.md) | Updated website structure |
| [WEBSITE_SUMMARY.md](WEBSITE_SUMMARY.md) | Website features summary |
| [CONTENT_STRATEGY.md](CONTENT_STRATEGY.md) | Content and marketing strategy |

### Compliance & Certificates
| Document | Description |
|----------|-------------|
| [IOT_CERTIFICATE_ADDITION.md](IOT_CERTIFICATE_ADDITION.md) | TDRA IoT Services License (IOT-26-100000007) |
| [TDRA_COMPLIANCE_SUMMARY.md](TDRA_COMPLIANCE_SUMMARY.md) | TDRA regulatory compliance details |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guidelines |

### Security
| Document | Description |
|----------|-------------|
| [SECURITY_AWARENESS_TRAINING.md](SECURITY_AWARENESS_TRAINING.md) | Security training documentation |
| [INCIDENT_RESPONSE_PLAN.md](INCIDENT_RESPONSE_PLAN.md) | Incident response procedures |
| [PENETRATION_TESTING_SCHEDULE.md](PENETRATION_TESTING_SCHEDULE.md) | Security testing schedule |

### Setup & Configuration
| Document | Description |
|----------|-------------|
| [QUICK_SETUP.md](QUICK_SETUP.md) | Quick start guide |
| [SETUP_DB.md](SETUP_DB.md) | Database setup instructions |
| [README_AUTH.md](README_AUTH.md) | Authentication setup |
| [LAMBDA_RUNTIME_UPGRADE.md](LAMBDA_RUNTIME_UPGRADE.md) | AWS Lambda Node.js 22.x upgrade |
| [update-favicon.md](update-favicon.md) | Favicon update instructions |

### Development Notes
| Document | Description |
|----------|-------------|
| [SMART_KITCHEN_CHANGELOG.md](SMART_KITCHEN_CHANGELOG.md) | Smart Kitchen feature changelog |
| [BAYS_PAGE_FIXES.md](BAYS_PAGE_FIXES.md) | Parking bays page fixes |
| [NOTES_REORGANIZATION_SUMMARY.md](NOTES_REORGANIZATION_SUMMARY.md) | Notes reorganization |
| [SENSOR_TESTING_PLAN.md](SENSOR_TESTING_PLAN.md) | Sensor testing procedures |
| [README_IMAGES.md](README_IMAGES.md) | Image guidelines |
| [telemetry-component.md](telemetry-component.md) | Telemetry component docs |
| [2gis-parking-import.md](2gis-parking-import.md) | 2GIS parking data import |

### Action Plan (Section 11)

Implementation documentation aligned with `/notes` → **Section 11 (Action Plan)**.

| Phase | Document | Description |
|-------|----------|-------------|
| 11 | [11-action-plan.md](11-action-plan.md) | Overall action plan and delivery checklist |
| 11.1 | [11.1-foundation.md](11.1-foundation.md) | Multi-tenant + data model foundation |
| 11.2 | [11.2-simulated-ingestion.md](11.2-simulated-ingestion.md) | Simulated ingestion / decoder bench / dead letters |
| 11.3 | [11.3-operator-portal-mvp.md](11.3-operator-portal-mvp.md) | Operator portal MVP |
| 11.3.1 | [11.3.1-zone-selector-and-demo-seed.md](11.3.1-zone-selector-and-demo-seed.md) | Zone selector + filtering + demo seed |
| 11.3.2 | [11.3.2-mapbox-portal-map.md](11.3.2-mapbox-portal-map.md) | Mapbox GL JS map rendering |
| 11.3.3 | [11.3.3-map-interactions-filters-selection.md](11.3.3-map-interactions-filters-selection.md) | Map UX interactions and filters |
| 11.3.4 | [11.3.4-dubai-pulse-zones-import.md](11.3.4-dubai-pulse-zones-import.md) | Dubai Pulse parking zones import |
| 11.3.5 | [11.3.5-map-calibration-sensors.md](11.3.5-map-calibration-sensors.md) | Manual sensor placement calibration |
| 11.3.6 | [11.3.6-calibration-ux-all-sensors-installed-only.md](11.3.6-calibration-ux-all-sensors-installed-only.md) | Calibration UX improvements |
| 11.4 | [11.4-hardware-health-alerts.md](11.4-hardware-health-alerts.md) | Hardware health metrics + alerts |
| 11.6 | [11.6-analytics-reporting.md](11.6-analytics-reporting.md) | Analytics and reporting |
| 11.6.1 | [11.6.1-maps-and-navigation.md](11.6.1-maps-and-navigation.md) | Portal Mapbox + mobile navigation |
| 11.7 | [11.7-finance.md](11.7-finance.md) | Stripe billing + finance dashboard |

### API Documentation
- [api/README.md](api/README.md) - API reference and endpoints

### Architecture Documentation
- [architecture/README.md](architecture/README.md) - System architecture

---

## Module-Specific Documentation

### Smart Kitchen (`/smartkitchen/docs/`)
Temperature monitoring system for commercial kitchens.
- [smartkitchen/docs/README.md](../smartkitchen/docs/README.md) - Smart Kitchen overview
- Architecture, API, setup guides, sensor configuration

### Parking (`/Parking/docs/`)
IoT parking sensor solutions.
- [Parking/docs/README.md](../Parking/docs/README.md) - Parking system overview
- AWS setup, API reference, deployment, security

---

## Key Information

### Project Context
VisionDrive is a UAE-based IoT company providing:
- **Smart Kitchen**: Dubai Municipality compliant temperature monitoring
- **Smart Parking**: IoT parking sensor solutions

### Compliance
- TDRA IoT Services License: `IOT-26-100000007`
- TDRA Type Approval: `EA-2026-1-55656`
- UAE Data Residency: AWS me-central-1 (Abu Dhabi)
- Dubai Municipality: DM-HSD-GU46-KFPA2 compliant

### Certificates Location
All certificates are in `/public/Certification/`:
- `IoT_Certificate_IOT-26-100000007.pdf` - IoT Services License
- `TDRA_TYPE_APPROVAL_Certificate.pdf` - Device Type Approval
- `Dealer_Certificate.pdf` - Authorized Dealer Certificate
- `Nol_Report.pdf` - NOL Compliance Report
