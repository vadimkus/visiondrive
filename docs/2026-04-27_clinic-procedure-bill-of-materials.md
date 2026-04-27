# Clinic Procedure Bill Of Materials

Date: 2026-04-27

## Context

Point 16 from the Altegio-inspired home-visit backlog adds procedure-level bills of materials. The old flow could deduct one linked item type from inventory. Home-visit practitioners need each service to consume multiple items so material cost and stock usage are closer to reality.

## Shipped

- Added `ClinicProcedureMaterial` with tenant, procedure, stock item, quantity per visit, unit material cost, active flag, note, and sort order.
- Added material APIs:
  - `GET/POST /api/clinic/procedures/[id]/materials`
  - `PATCH/DELETE /api/clinic/procedures/[id]/materials/[materialId]`
- Updated visit completion inventory deduction:
  - If a procedure has active BOM rows, every active row is deducted.
  - If no BOM rows exist, the old `procedureId + consumePerVisit` stock-item fallback still works.
- Updated the procedure catalog with inline BOM management and material cost summary.
- Added EN/RU strings and Knowledge Base content.

## Notes

- Unit material cost is stored on the BOM row, not the stock item. This lets the practitioner estimate the cost of the material as used in a specific procedure even before full inventory costing exists.
- Per-visit material quantity override is not yet implemented; the current version deducts the standard procedure BOM quantity.
- Future profitability work should use procedure revenue minus BOM material cost, payment fees, and operating expenses.

## Validation

- `npm run db:generate`
- `npm run type-check`
- `npm run test`
- `npm run lint`
- `npm run build`
- `npm run db:push`
