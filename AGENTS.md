# AI Agent Instructions for VisionDrive

## Important: Read Documentation First

Before making any changes or answering questions about this project, **you MUST read the documentation files** in the `docs/` folder.

## Documentation Location

All project documentation is centralized in the `docs/` directory:

```
docs/
├── README.md                    # Documentation index and overview
├── PROJECT_STRUCTURE.md         # Project architecture and folder structure
├── WEBSITE_STRUCTURE.md         # Website pages and components
├── WEBSITE_STRUCTURE_V2.md      # Updated website structure
├── WEBSITE_SUMMARY.md           # Website features summary
│
├── # Compliance & Certificates
├── IOT_CERTIFICATE_ADDITION.md  # TDRA IoT Services License details
├── TDRA_COMPLIANCE_SUMMARY.md   # TDRA regulatory compliance
├── CONTRIBUTING.md              # Contribution guidelines
│
├── # Security
├── SECURITY_AWARENESS_TRAINING.md
├── INCIDENT_RESPONSE_PLAN.md
├── PENETRATION_TESTING_SCHEDULE.md
│
├── # Setup & Configuration
├── QUICK_SETUP.md               # Quick start guide
├── SETUP_DB.md                  # Database setup
├── README_AUTH.md               # Authentication setup
├── LAMBDA_RUNTIME_UPGRADE.md    # AWS Lambda configuration
│
├── # Development
├── SMART_KITCHEN_CHANGELOG.md   # Smart Kitchen feature changes
├── BAYS_PAGE_FIXES.md           # Parking bays page fixes
├── NOTES_REORGANIZATION_SUMMARY.md
├── SENSOR_TESTING_PLAN.md       # Sensor testing procedures
├── README_IMAGES.md             # Image guidelines
├── CONTENT_STRATEGY.md          # Content and marketing
│
├── # Feature Documentation (11.x series)
├── 11-action-plan.md            # Overall action plan
├── 11.1-foundation.md           # Foundation setup
├── 11.2-simulated-ingestion.md  # Data ingestion simulation
├── 11.3-operator-portal-mvp.md  # Operator portal MVP
├── ... (and more 11.x files)
│
├── api/                         # API documentation
│   └── README.md
│
└── architecture/                # Architecture documentation
    └── README.md
```

## Additional Documentation

Some modules have their own documentation:

- `smartkitchen/docs/` - Smart Kitchen specific documentation
- `Parking/docs/` - Parking system documentation

## Key Files to Read

1. **For project overview**: `docs/README.md`, `docs/PROJECT_STRUCTURE.md`
2. **For website changes**: `docs/WEBSITE_STRUCTURE_V2.md`
3. **For compliance/certificates**: `docs/IOT_CERTIFICATE_ADDITION.md`, `docs/TDRA_COMPLIANCE_SUMMARY.md`
4. **For Smart Kitchen**: `smartkitchen/docs/README.md`
5. **For Parking**: `Parking/docs/README.md`

## Project Context

VisionDrive is a UAE-based IoT company providing:
- **Smart Kitchen**: Temperature monitoring for commercial kitchens (Dubai Municipality compliant)
- **Smart Parking**: IoT parking sensor solutions

All services are:
- TDRA certified for UAE operation
- UAE data resident (AWS me-central-1)
- Dubai Municipality compliant (for food safety)

## Before Making Changes

1. Read relevant documentation in `docs/`
2. Check existing implementations in the codebase
3. Follow the established patterns and coding style
4. Update documentation if you make significant changes
