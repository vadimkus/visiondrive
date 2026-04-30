# Clinic Admin Tools

Date: 2026-04-30

## Context

Practice OS now has an admin-only control surface for tenant user management. This is for the practitioner or practice owner who needs to create staff/admin accounts, remove access, reset passwords, and see basic operational/admin stats without touching the database directly.

## What Shipped

- New clinic route: `/clinic/admin-tools`.
- Admin-only nav item shown only to `MASTER_ADMIN`, `ADMIN`, or `CUSTOMER_ADMIN`.
- New API routes:
  - `GET/POST /api/clinic/admin/users`
  - `PATCH/DELETE /api/clinic/admin/users/[id]`
- New helper: `lib/clinic/admin.ts` for server-side admin session verification.
- User creation/linking through existing `users` and `tenant_memberships`.
- Password reset with existing password policy and hashing.
- Safe delete behavior: remove access by setting the tenant membership inactive; if the user has no other active memberships, the user is marked inactive.
- Guardrails:
  - Non-admins receive 403.
  - Admins cannot remove/deactivate themselves.
  - The system blocks removing or demoting the last active admin.
  - Non-master admins cannot manage `MASTER_ADMIN` users.
- Audit events are written to existing `audit_logs`.

## Database Decision

No new tables were added. The correct source of truth already exists:

- `users` stores credentials, global status, default tenant, and global role.
- `tenant_memberships` stores tenant-scoped role and access status.
- `audit_logs` records admin mutations.

Adding duplicate user-management tables would create drift and make authentication less reliable.

## Admin Stats

The Admin Tools page shows:

- total users
- active users
- admin users
- patients
- appointments
- completed visits
- audit events

These are tenant-scoped to the signed-in practice.

## Validation

Run:

```bash
npm run type-check
npm run lint
```
