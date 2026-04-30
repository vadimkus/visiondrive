# Local development (without Timescale / cloud DB)

Use Docker Postgres so you can run `prisma db push`, seed, and the full Next.js app while a hosted database is unavailable.

## 1. Start Postgres

From the VisionDrive repo root:

```bash
docker compose up -d
```

## 2. Point Prisma at localhost

In `.env`, set (or override) **`VISIONDRIVE_DATABASE_URL`**:

```text
postgresql://visiondrive:visiondrive@localhost:5432/visiondrive?schema=public
```

`prisma.config.ts` reads `VISIONDRIVE_DATABASE_URL` first, then `PRISMA_DATABASE_URL`, `POSTGRES_URL`, `DATABASE_URL`.

## 3. Apply schema and seed

```bash
npx prisma db push
npm run db:seed
```

Optional: set `CLINIC_*` seed variables in `.env` (see `.env.example`) before seeding.

## 4. Run the app

```bash
npm run dev
```

Sign in at `/login` (Workspace uses `portal: 'clinic'` from the login page).

## Tests (no DB required)

Pure helpers (week math, timeline merge):

```bash
npm test
```

## Troubleshooting

- **Port 5432 in use:** change the host port in `docker-compose.yml` (e.g. `5433:5432`) and update the URL accordingly.
- **SSL:** local Postgres usually does not need `sslmode=require`; omit it for `localhost`.
- **Timescale / managed TLS in dev:** `lib/db-tls.ts` skips strict cert verification when `NODE_ENV=development` unless `STRICT_SSL_VALIDATION=true`. If you need to verify chains locally, set that env var.
