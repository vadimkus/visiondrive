# Practice OS — operations runbook

## Environments

| Concern | Notes |
|--------|--------|
| **Database** | PostgreSQL; URL from `VISIONDRIVE_DATABASE_URL` (preferred; see `prisma.config.ts`). |
| **Auth** | JWT in httpOnly cookie `authToken`; practice UI requires `portal=clinic`. |
| **Tenancy** | All `Clinic*` rows are scoped by `tenantId` from the user’s default tenant. |
| **Alerts** | Low-stock email uses Resend env vars; Web Push requires VAPID env vars. |

## Deploy / schema changes

1. Merge code to the target branch.
2. On the **target database**, run:

   ```bash
   npx prisma db push
   ```

   (Or use migrations if you adopt a migration workflow later.)

3. Redeploy the Next.js app (e.g. Vercel) so serverless functions pick up new code.

## Health checks

- **App:** open `/login`, sign in, confirm redirect to `/clinic`.
- **API:** authenticated `GET /api/clinic/stats` returns JSON (401 without session).
- **Smoke (HTTP):** with `npm run dev`, `npm run test:clinic-flow` exercises login → chart → anamnesis → **summary PDF** → media → payments → inventory auto-deduct → purchase order receive (optional env: `CLINIC_E2E_*`).
- **Users:** `npx tsx scripts/list-users.ts` lists users and tenant memberships for the DB configured in the env chain.
- **DB:** `prisma db push` succeeds against the same URL the app uses in production.

## Incident: cannot connect to DB (P1001)

- Verify the database service is running and the hostname resolves (`ENOTFOUND` / `getaddrinfo` means stale or wrong DB host).
- Confirm production env vars match the intended instance (pooled vs direct URL). The app reads `VISIONDRIVE_DATABASE_URL` first, then `PRISMA_DATABASE_URL`, `POSTGRES_URL`, `DATABASE_URL`.
- For local dev, use [SETUP_LOCAL.md](./SETUP_LOCAL.md).

## Backups

- Rely on your host’s automated backups (e.g. Vercel Postgres / managed Postgres).
- Clinical photos: `clinic_patient_media` (`BYTEA` and/or Vercel Blob pathnames); include DB + Blob lifecycle in backup scope if you use object storage.

## Security reminders

- Rotate `JWT_SECRET` if leaked; all users must re-authenticate.
- Restrict DB credentials to least privilege.
- See [ARCHITECTURE.md](./ARCHITECTURE.md) for PDPL-oriented notes.
