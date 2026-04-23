# VisionDrive Practice OS (clinic module)

This folder documents the **practice / clinic operations** product: appointments, patients, procedures, and (in later chunks) visits with media, inventory, finance, and patient-safe exports.

**Brand slogan (EN):** *Practice operations, made clear* — defined in `lib/brand.ts` with Arabic counterpart for header/footer.

## Quick links

| Doc | Purpose |
|-----|---------|
| [PLAN.md](./PLAN.md) | Phased roadmap and chunk boundaries |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Schema, tenancy, API conventions, UAE data notes |
| [CHUNKS.md](./CHUNKS.md) | What shipped in each chunk (living log) |

## Code entry points

| Area | Path |
|------|------|
| App shell | `app/clinic/` |
| REST API | `app/api/clinic/` |
| Session helpers | `lib/clinic/session.ts` |
| DB (Prisma) | `prisma/schema.prisma` (`Clinic*` models), `lib/prisma.ts` |

## Deploy (Vercel)

1. Connect **Vercel Postgres** (or compatible Postgres) and set `VISIONDRIVE_DATABASE_URL` / `POSTGRES_URL` / `DATABASE_URL` per [QUICK_SETUP.md](../QUICK_SETUP.md).
2. Run **`npx prisma db push`** against that database (CI or local with env).
3. Ensure **`JWT_SECRET`** and clinic user seed env vars are set; redeploy.

Legacy parking / kitchen documentation was moved under [`../archive/`](../archive/).
