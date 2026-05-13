# Clinic Patient Timeline Visit Grouping

Date: 2026-05-13

## Context

In the patient history timeline, multi-procedure visits could appear as repeated `Visit · Completed` rows with the same date/time. This made one real appointment look like several separate visits.

## Change

The timeline builder now groups visit rows that share the same visit minute and status.

- One timeline row is shown per same-time visit group.
- Unique procedure summaries are joined into one detail line.
- Single visit rows still behave as before and keep their `refId` for expansion.
- Grouped rows intentionally do not merge database records; this is display-only.

This keeps patient history easier to scan while preserving the source visit records for payments, media, stock consumption, consents, and audit history.

## Validation

- `npx vitest run lib/clinic/timeline.test.ts`
- `npm run type-check`
- Linter diagnostics for `lib/clinic/timeline.ts` and `lib/clinic/timeline.test.ts`
