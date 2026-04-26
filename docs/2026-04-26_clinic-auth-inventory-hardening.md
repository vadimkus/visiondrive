# 2026-04-26 — Clinic Auth + Inventory Hardening

## Context

Vadim asked to investigate the recent Practice OS follow-up implementation, validate it, amend code to a better standard, and list owner-side production actions.

## Findings

- Production login failure shown in browser was not credential-related: `getaddrinfo ENOTFOUND ...tsdb.cloud.timescale.com` means the deployed app cannot resolve the configured database hostname.
- Local DB users exist and are linked to the `visiondrive` tenant: `admin`, `vadim@visiondrive.ae`, `iryna@visiondrive.ae`.
- Implementation needed hardening around visit status parsing, stock mutation races, visit inventory idempotency, push subscription reuse, and barcode camera cleanup.

## Code Changes

- Reject invalid visit statuses instead of defaulting to `COMPLETED`.
- Make visit auto-consumption use atomic stock decrement with created-by and appointment reference on movements.
- Claim `inventoryConsumedAt` before PATCH-triggered inventory deduction to reduce repeated consumption risk.
- Make purchase-order receiving aggregate duplicate line submissions and use guarded line increments plus atomic stock increments.
- Only set low-stock notification cooldown after email or push delivery succeeds.
- Reuse existing browser push subscription when enabling push alerts.
- Stop barcode camera stream on component unmount.
- Updated clinic docs: `ARCHITECTURE.md`, `DATA_MODEL.md`, `CHUNKS.md`, `RUNBOOK.md`.

## Validation

- `npm run type-check` passed.
- `npm test -- --run` passed: 7 files, 27 tests.
- `npm run build` passed. Build warnings remain for pre-existing Next.js metadata/middleware conventions in kitchen-owner/login pages.
- IDE lints on touched files: clean.

## Owner-Side Actions

- Set a working `VISIONDRIVE_DATABASE_URL` in Vercel Production from the current Tiger Cloud / Timescale connection string.
- Set stable `JWT_SECRET` in Vercel Production.
- Run `npx prisma db push` against the production DB after schema changes.
- Ensure users exist in the same production DB; use `npx tsx scripts/list-users.ts` to verify.
- Optional: configure Resend, low-stock recipients, VAPID keys, Blob token, Mapbox token.
