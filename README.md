# VisionDrive Technologies FZ-LLC

VisionDrive builds **Practice OS**: practice operations software for UAE solo practitioners and independent clinics.

The app combines public booking, practitioner workspace, patient records, treatment notes, inventory, payments, reminders, analytics, and patient-safe portal links.

## Key Paths

```text
app/                    Next.js application
app/clinic/             Authenticated practitioner workspace
app/api/clinic/         Practice OS API routes
app/book/               Public booking pages
app/patient-portal/     Token-based patient portal
app/profile/            Public practitioner profiles
components/clinic/      Practice OS shared UI
lib/clinic/             Practice OS domain logic
prisma/schema.prisma    Database schema
docs/clinic/            Product documentation
```

## Documentation

- [docs/clinic/README.md](docs/clinic/README.md) — Practice OS overview
- [docs/clinic/ARCHITECTURE.md](docs/clinic/ARCHITECTURE.md) — data model, APIs, tenancy, security
- [docs/clinic/CHUNKS.md](docs/clinic/CHUNKS.md) — implementation log
- [docs/CODEBASE_REFERENCE.md](docs/CODEBASE_REFERENCE.md) — current codebase reference

## Development

Use the project scripts in `package.json` for local development, type-checking, linting, testing, and builds.
