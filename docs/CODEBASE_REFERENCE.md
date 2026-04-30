# VisionDrive Codebase Reference

Last updated: 2026-04-30

VisionDrive is now focused on **Practice OS**: practice operations software for UAE solo practitioners and independent clinics.

## Repository Structure

```text
VisionDrive/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── auth/             # Login, logout, current user
│   │   └── clinic/           # Practice OS APIs
│   ├── clinic/               # Authenticated practitioner workspace
│   ├── book/                 # Public booking links
│   ├── patient-portal/       # Token-based patient portal
│   ├── profile/              # Public practitioner profiles
│   ├── components/           # Public site and shared UI
│   ├── contexts/             # Public language context
│   └── translations/         # Public website copy
├── components/clinic/        # Shared Practice OS components
├── lib/                      # Server/client libraries
│   ├── clinic/               # Practice OS domain helpers
│   ├── auth.ts               # JWT auth and password hashing
│   ├── prisma.ts             # Prisma client
│   ├── sql.ts                # SQL client
│   └── rate-limit.ts         # Login rate limiting
├── prisma/
│   ├── schema.prisma         # PostgreSQL schema
│   └── seed.ts               # Database seed
├── docs/
│   └── clinic/               # Current product documentation
├── public/                   # Static assets
└── middleware.ts             # Route protection
```

## Technology Stack

| Layer | Technology |
|-------|-------------|
| Framework | Next.js App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL + Prisma |
| Auth | JWT, bcrypt |
| Hosting | Vercel |
| Data residency | UAE-capable hosting target |

## Primary Product Areas

- Public website: `/`, `/about`, `/contact`, `/faq`, `/privacy`, `/terms`, `/compliance`, `/solutions`, `/technology`
- Practitioner workspace: `/clinic`
- Public booking: `/book/[slug]`
- Patient portal: `/patient-portal/[token]`
- Disabled public profile route: `/profile/[slug]`

## Main API Areas

| Area | Routes |
|------|--------|
| Auth | `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`, `/api/auth/register` |
| Clinic dashboard | `/api/clinic/stats`, `/api/dashboard` |
| Patients | `/api/clinic/patients/*` |
| Appointments | `/api/clinic/appointments/*` |
| Procedures | `/api/clinic/procedures/*` |
| Booking | `/api/clinic/booking/*`, `/api/clinic/public-booking/*` |
| Payments and finance | `/api/clinic/payments/*`, `/api/clinic/finance/*` |
| Marketing and loyalty | `/api/clinic/marketing/*`, `/api/clinic/loyalty/*` |
| Portal links | `/api/clinic/patient-portal/*` |
| Admin tools | `/api/clinic/admin/users`, `/api/clinic/admin/users/[id]` |

## Related Documentation

- [clinic/README.md](clinic/README.md) — Practice OS overview
- [clinic/ARCHITECTURE.md](clinic/ARCHITECTURE.md) — Practice OS architecture
- [clinic/CHUNKS.md](clinic/CHUNKS.md) — Implementation log
