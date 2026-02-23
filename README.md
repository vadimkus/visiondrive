# Vision Drive Technologies FZ-LLC

## Mission Statement

To revolutionize food safety in the UAE by delivering cutting-edge, data-driven temperature monitoring solutions for commercial kitchens.

## Overview

Vision Drive is a Smart Kitchen temperature monitoring platform that leverages IoT sensors and AWS cloud technology to provide Dubai Municipality compliant food safety monitoring for commercial kitchens across the UAE.

## Project Structure

```
VisionDrive/
├── app/                    # Next.js application (visiondrive.ae)
│   ├── portal/             # Customer portals
│   │   └── smart-kitchen/  # 🍳 Kitchen temperature monitoring portal
│   ├── api/                # API routes
│   └── components/         # Reusable components
│
├── smartkitchen/           # 🍳 SMART KITCHEN IoT PROJECT
│   ├── README.md           # Project overview
│   ├── docs/               # Documentation
│   │   ├── ARCHITECTURE.md
│   │   ├── AWS_SETUP.md
│   │   ├── LAMBDA_FUNCTIONS.md
│   │   ├── SENSOR_CONFIG.md
│   │   └── DATA_RESIDENCY.md
│   ├── infrastructure/     # AWS infrastructure
│   │   ├── cdk/            # CDK definitions
│   │   └── lambda/         # Lambda functions (Node.js 22.x)
│   └── scripts/            # Utility scripts
│
├── docs/                   # Main documentation
├── lib/                    # Shared libraries
├── prisma/                 # Database schema
├── public/                 # Static assets
└── scripts/                # Utility scripts
```

## Website Structure

The Vision Drive website (visiondrive.ae) features a streamlined navigation structure:

### Primary Navigation
- **Home**: Central hub with core value proposition and pilot showcase
- **Solutions**: Technology solutions for Communities/Malls and Municipalities/RTA
- **The App**: User experience and benefits for end-drivers
- **Data & Analytics**: B2B partner focus showcasing data value
- **About Us**: Credibility (FZ-LLC status, vision, team)
- **Contact**: Lead generation and pilot inquiry form

### Key Pages
- **Home**: Hero with core value proposition and pilot showcase
- **Solutions**: LW009-SM Sensors & RAK7289CV2 Gateway technology deep dive
- **The App**: Real-time map, reservation, pricing, and payment features
- **Data & Analytics**: Demand reports, turnover metrics, violation reports, and business intelligence
- **About Us**: Mission statement, FZ-LLC compliance, UAE Smart City standards

See [WEBSITE_STRUCTURE_V2.md](docs/WEBSITE_STRUCTURE_V2.md) for complete page structure and [CONTENT_STRATEGY.md](docs/CONTENT_STRATEGY.md) for content guidelines.

### Documentation

| Document | Description |
|----------|-------------|
| [FEATURES_AND_FUNCTIONALITY.md](docs/FEATURES_AND_FUNCTIONALITY.md) | **All features and functionality** |
| [CODEBASE_REFERENCE.md](docs/CODEBASE_REFERENCE.md) | **Code structure, API routes, libraries** |
| [docs/README.md](docs/README.md) | Full documentation index |

## IoT Projects

### 🍳 Smart Kitchen (Temperature Monitoring)

Real-time temperature monitoring for commercial kitchens with Dubai Municipality compliance.

| Feature | Value |
|---------|-------|
| **Sensors** | Dragino PS-NB-GE |
| **Network** | du NB-IoT (UAE) |
| **Cloud** | AWS me-central-1 (UAE) |
| **Runtime** | Node.js 22.x |
| **Database** | DynamoDB |
| **Dashboard** | `/portal/smart-kitchen` |

📖 **Documentation:** [smartkitchen/README.md](smartkitchen/README.md)

---

## Features

- **Temperature Monitoring**: DM-compliant kitchen temperature tracking
- **Data Analytics**: Comprehensive insights for commercial partners
- **User-Friendly Interface**: Seamless experience for kitchen managers
- **Commercial Partner Portal**: Management tools for kitchen operators
- **UAE Data Residency**: All data stored in AWS UAE region (me-central-1)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Python (v3.9 or higher) - if using Python backend
- PostgreSQL or MongoDB - for database
- Redis - for caching and real-time features

### Installation

[Add installation instructions here]

### Usage

[Add usage instructions here]

## Development

[Add development instructions here]

## Recent Updates

| Date | Update | Documentation |
|------|--------|---------------|
| 2026-01-13 | Lambda Runtime Upgrade to Node.js 22.x | [LAMBDA_RUNTIME_UPGRADE.md](docs/LAMBDA_RUNTIME_UPGRADE.md) |

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

