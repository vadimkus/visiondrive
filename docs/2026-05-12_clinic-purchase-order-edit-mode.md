# Clinic Purchase Order Edit Mode

Date: 2026-05-12

## Context

The purchase order detail page allowed receiving stock and changing status, but it did not expose the existing `PATCH /api/clinic/purchase-orders/[id]` update capability in the UI. A received purchase order therefore looked permanently uneditable from the screen.

## Decision

Add an inline edit mode on `/clinic/purchase-orders/[id]`.

- Supplier, reference, expected delivery, and notes can be edited from the detail page.
- Draft or ordered purchase orders with zero received stock can edit line stock item, quantity ordered, and unit cost at order.
- Cancelled, partially received, and received purchase orders keep their lines locked.

Line locking is intentional. Once stock has been received, the purchase order has already created receipt movements and fixed FIFO cost history. Editing received quantities or costs directly would make the order disagree with inventory movements. Corrections after receipt should be handled through stock adjustments or a new corrective purchase/return workflow.

## Files

- `app/clinic/purchase-orders/[id]/page.tsx`
- `lib/clinic/strings.ts`
- `docs/clinic/CHUNKS.md`

## Validation

- `npm run type-check`
- Linter diagnostics for edited purchase-order and strings files
