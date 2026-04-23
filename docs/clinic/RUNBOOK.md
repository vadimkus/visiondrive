# Practice OS — operations runbook

## Environments

| Concern | Notes |
|--------|--------|
| **Database** | PostgreSQL; URL from `VISIONDRIVE_DATABASE_URL` (see `prisma.config.ts`). |
| **Auth** | JWT in httpOnly cookie `authToken`; practice UI requires `portal=clinic`. |
| **Tenancy** | All `Clinic*` rows are scoped by `tenantId` from the user’s default tenant. |

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
- **DB:** `prisma db push` succeeds against the same URL the app uses in production.

## Incident: cannot connect to DB (P1001)

- Verify the database service is running and not IP-blocked.
- Confirm production env vars match the intended instance (pooled vs direct URL).
- For local dev, use [SETUP_LOCAL.md](./SETUP_LOCAL.md).

## Backups

- Rely on your host’s automated backups (e.g. Vercel Postgres / managed Postgres).
- Clinical photos are stored as `BYTEA` in `clinic_patient_media`; include this table in backup scope.

## Security reminders

- Rotate `JWT_SECRET` if leaked; all users must re-authenticate.
- Restrict DB credentials to least privilege.
- See [ARCHITECTURE.md](./ARCHITECTURE.md) for PDPL-oriented notes.
