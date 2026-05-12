# Clinic Procedure Card Edit Accordion

Date: 2026-05-12

Context: Existing Practice OS procedure catalog allowed creating procedures, but the list view did not expose an editable procedure card for the core service fields. The page also rendered every procedure fully expanded, making the catalog hard to scan.

Changes:
- Converted the procedure catalog into a top-level chevron list: each procedure row shows name, status, duration, buffer, base price, and material cost summary.
- Added an expandable procedure card editor for name, service duration, post-appointment buffer, base price, currency, and active status.
- Extended `PATCH /api/clinic/procedures/[id]` to update core procedure fields in addition to booking policy fields.
- Kept booking policy under its own nested chevron inside the expanded procedure card.
- Added material-cost prefill: selecting a stock item in a procedure bill of materials now pulls the latest known unit cost from inventory purchase-order history, with imported unit-cost notes as fallback.
- Updated purchase orders so the line unit cost is entered as a normal currency amount, prefills from the latest known stock cost, and is displayed as the fixed cost snapshot for that order line.
- Added EN/RU strings for the procedure card editor labels and validation.

Verification:
- `npx eslint "app/clinic/procedures/page.tsx" "app/api/clinic/procedures/[id]/route.ts" "lib/clinic/strings.ts"`
- `npx eslint "app/api/clinic/inventory/route.ts" "app/clinic/procedures/page.tsx"`
- `npx eslint "app/api/clinic/inventory/route.ts" "app/clinic/procedures/page.tsx" "app/clinic/purchase-orders/new/page.tsx" "app/clinic/purchase-orders/[id]/page.tsx" "lib/clinic/strings.ts"`
- `npm run type-check`
