# Clinic stock-taking and variance

Date: 2026-04-27

## Context

Point 17 from the Altegio adaptation backlog adds physical inventory counting for solo home-visit practitioners. The goal is to reconcile what is physically in the treatment bag or clinic shelf with the system quantity, and keep an audit trail for expired, damaged, lost, found, or corrected stock.

## Shipped

- Added `ClinicStockCountSession` and `ClinicStockCountLine` to Prisma.
- Added `ClinicStockCountStatus` and `ClinicStockVarianceReason` enums.
- Added `/api/clinic/stock-takes` endpoints for listing and creating count sessions.
- Added `/api/clinic/stock-takes/[id]` for count detail and draft metadata updates.
- Added `/api/clinic/stock-takes/[id]/lines/[lineId]` for saving counted quantities, variance reasons, and notes.
- Added `/api/clinic/stock-takes/[id]/finalize` to create audited `ADJUSTMENT` stock movements and set on-hand quantities to physical counts.
- Added `/clinic/stock-takes` and `/clinic/stock-takes/[id]` UI.
- Added Stock-taking to clinic navigation and Inventory shortcut.
- Added EN/RU strings and a Knowledge Base article.
- Added `lib/clinic/stock-taking.ts` with helper tests.

## Notes

- A new stock count snapshots all active stock items at creation time.
- Variance is stored as `countedQuantity - expectedQuantity`.
- Finalization adjusts from current on-hand to the counted quantity, so the database ends at the physical count even if stock changed after the draft was created.
- A variance reason is required only when expected and counted quantities differ.

## Validation

- `npm run db:generate`
- `npm run type-check`
- `npm run test`
- `npm run lint`
- `npm run build`
- `npm run db:push`
