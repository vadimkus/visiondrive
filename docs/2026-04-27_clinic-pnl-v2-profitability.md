# Clinic P&L v2 and Procedure Profitability

Date: 2026-04-27

## Context

Point 19 from the Altegio home-visit adaptation backlog adds a more useful finance view for solo practitioners: not just revenue and expenses, but whether each procedure is actually profitable after materials and direct product costs.

## Shipped

- Added `lib/clinic/profitability.ts` to derive procedure-level profitability from completed visits, linked payments, refunds, and active procedure bill-of-material rows.
- Extended `GET /api/clinic/finance/overview` with product-sale revenue, procedure material cost, product cost, direct cost, gross profit, operating profit, completed visit count, product sale count, and procedure profitability rows.
- Updated `/clinic/finance` with a P&L v2 section showing gross profit, direct costs, product sales revenue/cost, operating profit, and a procedure profitability table.
- Updated the in-app Knowledge Base in EN/RU to explain how to read true profitability and use P&L v2 for repricing decisions.
- Updated the Altegio adaptation map and canvas to mark Point 19 as shipped.

## Notes

- This is a derived-data feature and does not add schema.
- Procedure material cost uses the current active BOM configuration for the linked procedure. A future hardening step should snapshot material cost at visit completion for perfect historical accounting.
- Product sale cost is read from `ClinicProductSaleLine.unitCostCents`; current sale creation supports the field in the model, but retail cost capture can be improved by carrying supplier cost from purchasing into stock/product sale lines.
- Processor fees are not yet modeled separately. Existing payment `feeCents` is patient-facing, so this release avoids treating it as a merchant cost.

## Validation

- Added Vitest coverage for material cost calculation, deduped payment net totals, and procedure profitability rows.
- Required validation: `npm run type-check`, `npm run test`, `npm run lint`, and `npm run build`.
- No `npm run db:push` is required for this point because there is no schema change.
