# Project Structure Guide

## Directory Overview

### Root Level
- `package.json` - Next.js app, Prisma, dependencies
- `.env` - Environment variables (DATABASE_URL, JWT_SECRET, etc.)
- `.gitignore` - Git ignore rules
- `README.md` - Project overview and mission statement
- `CONTRIBUTING.md` - Contribution guidelines
- `LICENSE` - MIT License
- `middleware.ts` - Auth, route protection

### Application (`/app`)
Next.js App Router — web application for visiondrive.ae.

```
app/
├── api/                    # API routes (REST)
│   ├── auth/               # Login, logout, me
│   ├── portal/             # Portal APIs (smart-kitchen, map, sensors, etc.)
│   ├── replay/             # Replay upload, run, dead-letters
│   ├── webhooks/           # Stripe webhooks
│   └── images/             # Logo, upload
├── components/             # Shared components
│   ├── layout/             # Header, Footer, ConditionalLayout
│   ├── portal/             # PortalSidebar, PortalNavigation
│   └── common/             # Logo, LanguageSelector
├── contexts/               # React contexts (LanguageContext)
├── portal/                 # Operator portal pages
│   ├── smart-kitchen/      # Kitchen temperature monitoring
│   ├── admin/              # Admin, tenants, finance, audit
│   ├── map/                # Map view
│   ├── alerts/             # Alerts
│   ├── sensors/           # Sensors list & detail
│   ├── events/             # Events viewer
│   ├── replay/             # Replay tools
│   ├── calibration/        # Calibration
│   └── reports/            # Reports
├── kitchen-owner/          # Owner-facing simplified portal
├── page.tsx                # Home
├── login/                  # Login (dual portal)
├── solutions/              # Solutions page
├── about/                   # About
├── contact/                # Contact
└── ...                     # Other public pages
```

### Shared Libraries (`/lib`)
Server-side utilities and business logic.

```
lib/
├── auth.ts                 # JWT, bcrypt, authenticateUser
├── sql.ts                  # PostgreSQL client
├── rate-limit.ts           # Brute-force protection
├── password-policy.ts      # Password validation
├── audit.ts                # Audit logging
├── stripe-webhook.ts       # Stripe verification
├── smart-kitchen/          # AWS client for Smart Kitchen
├── portal/                 # Portal session
└── decoders/               # Sensor payload decoders
```

### Database (`/prisma`)
- `schema.prisma` - PostgreSQL schema (users, tenants, sensors, alerts, etc.)
- `seed.ts` - Seed admin user, logo

### Smart Kitchen (`/smartkitchen`)
IoT temperature monitoring — AWS-based.

```
smartkitchen/
├── docs/                   # ARCHITECTURE, API_REFERENCE, AWS_SETUP, etc.
├── infrastructure/
│   └── cdk/lib/            # CDK stacks (IoT, Lambda, API, WAF, CloudTrail)
└── scripts/                # Provisioning, utilities
```

### Documentation (`/docs`)
- `README.md` - Documentation index
- `FEATURES_AND_FUNCTIONALITY.md` - All features
- `CODEBASE_REFERENCE.md` - Code structure, API, libraries
- `api/` - API documentation
- `architecture/` - System architecture

### Public (`/public`)
- Static assets
- `Certification/` - TDRA, DM certificates (PDF)

### Scripts (`/scripts`)
Utility scripts for development and deployment.

## Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL (Prisma) |
| IoT | AWS Lambda, DynamoDB (Smart Kitchen) |
| Maps | Mapbox GL JS |
| Auth | JWT, bcrypt |

## Related Documentation

- [FEATURES_AND_FUNCTIONALITY.md](FEATURES_AND_FUNCTIONALITY.md) - Feature overview
- [CODEBASE_REFERENCE.md](CODEBASE_REFERENCE.md) - Detailed code reference











