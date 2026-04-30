# Project Structure Guide

VisionDrive is focused on **Practice OS** for UAE solo practitioners and independent clinics.

## Application

```text
app/
├── api/
│   ├── auth/               # Login, logout, current user, registration
│   └── clinic/             # Practice OS APIs
├── clinic/                 # Authenticated practitioner workspace
├── book/                   # Public booking pages
├── patient-portal/         # Token-based patient portal
├── profile/                # Disabled public profile route
├── components/             # Public site components
├── contexts/               # Public language context
├── translations/           # Public website copy
├── page.tsx                # Home
├── login/                  # Workspace login
├── about/                  # Company/product page
├── contact/                # Demo/contact page
├── compliance/             # Security and data-residency page
├── privacy/                # Privacy policy
└── terms/                  # Terms of service
```

## Shared Code

```text
components/clinic/          # Practice OS reusable UI
lib/
├── clinic/                 # Practice OS domain helpers
├── auth.ts                 # JWT and password hashing
├── prisma.ts               # Prisma client
├── sql.ts                  # SQL helper
├── rate-limit.ts           # Login rate limiting
└── password-policy.ts      # Password rules
```

## Data

```text
prisma/
├── schema.prisma           # PostgreSQL schema
└── seed.ts                 # Seed users and demo data
```

## Documentation

```text
docs/
├── README.md               # Documentation index
├── CODEBASE_REFERENCE.md   # Current codebase reference
└── clinic/                 # Practice OS product documentation
```

## Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL + Prisma |
| Auth | JWT, bcrypt |
| Hosting | Vercel |

## Related Documentation

- [clinic/README.md](clinic/README.md)
- [clinic/ARCHITECTURE.md](clinic/ARCHITECTURE.md)
- [CODEBASE_REFERENCE.md](CODEBASE_REFERENCE.md)
