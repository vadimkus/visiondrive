# Practice OS Iryna Account

Date: 2026-05-12

## Context

Vadim requested a Practice OS account for Iryna Kobzarenko.

## Action Completed

- Created or updated the user login `iryna`.
- Set display name to `Iryna Kobzarenko`.
- Set global role to `ADMIN`.
- Initially linked the account to the shared `visiondrive` tenant.
- Verified the account through the same `authenticateUser` path used by the login route.

## Isolation Update

Vadim clarified that each account should see only its own customers and that Iryna must not see demo data.

- Created or reused a dedicated tenant: `iryna-kobzarenko` (`Iryna Kobzarenko Practice`).
- Set `users.defaultTenantId` for `iryna` to the dedicated tenant.
- Ensured the `iryna-kobzarenko` membership is `ACTIVE` with tenant role `ADMIN`.
- Set the old `visiondrive` membership for `iryna` to `INACTIVE`.
- Verified login resolves to tenant slug `iryna-kobzarenko`.
- Checked all 47 tenant-scoped `clinic_*` tables with a `tenantId` column: zero rows exist for Iryna's tenant.

## Production Patient Migration

After isolation, Iryna's tablet still had an older clinic auth cookie whose JWT pointed at the shared `visiondrive` tenant. The tablet saved `Горшунова Елена` there, while a fresh Mac login as `iryna` correctly opened the empty `iryna-kobzarenko` tenant.

Production correction completed:

- Moved patient `Горшунова Елена` from `visiondrive` to `iryna-kobzarenko`.
- Moved the same patient's 2 `ClinicVisit` rows to `iryna-kobzarenko`.
- Moved the same patient's 1 `ClinicPatientMedia` row to `iryna-kobzarenko`.
- Verified `iryna` login resolves to `iryna-kobzarenko`.
- Verified `iryna-kobzarenko` now has Elena visible with 2 visits and 1 media item.
- Verified no Elena patient row remains under `visiondrive`.

Operational note: after tenant reassignment, any already-open browser/tablet session should log out and log back in once so its JWT carries the current tenant id.

## Security Note

The password was set from Vadim's direct instruction but is intentionally not stored in this note.
