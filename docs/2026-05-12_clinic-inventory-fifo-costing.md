# Clinic Inventory FIFO Costing

Date: 2026-05-12

Context: Inventory needed proper cost flow, not only quantity movement. Purchase orders should fix item cost at order/receipt time, and stock write-offs should consume cost in FIFO order.

Changes:
- Added inventory cost metadata on stock movements without changing the database schema.
- Receipt movements can now carry unit cost and total receipt cost.
- Purchase-order receiving writes receipt cost from the fixed purchase-order line unit cost.
- Opening balances from new stock items and imports can carry initial unit cost.
- Manual stock receipts can capture unit cost in the inventory item movement form.
- Consumption/write-off movements now calculate FIFO cost from prior receipt layers.
- Visit-completion BOM consumption and product-sale stock consumption now write FIFO cost metadata.
- Product sale lines now snapshot FIFO unit cost into `unitCostCents`.
- Inventory movement history shows receipt cost or FIFO write-off cost while hiding internal metadata from visible notes.
- Knowledge Base updated in EN/RU with purchase-order cost snapshots, FIFO inventory costing, BOM stock-cost prefill, product-sale FIFO cost, and import opening-cost behavior.

Verification:
- `npx vitest run "lib/clinic/inventory-costing.test.ts"`
- `npx eslint "lib/clinic/inventory-costing.ts" "lib/clinic/inventory-costing.test.ts" "lib/clinic/inventory-visit-consume.ts" "app/api/clinic/inventory/route.ts" "app/api/clinic/inventory/[id]/route.ts" "app/api/clinic/inventory/[id]/movements/route.ts" "app/api/clinic/inventory/import/route.ts" "app/api/clinic/purchase-orders/[id]/receive/route.ts" "app/api/clinic/patients/[id]/product-sales/route.ts" "app/clinic/inventory/[id]/page.tsx" "app/clinic/inventory/new/page.tsx" "lib/clinic/strings.ts"`
- `npx eslint "app/clinic/knowledge-base/page.tsx"`
- `npm run type-check`
