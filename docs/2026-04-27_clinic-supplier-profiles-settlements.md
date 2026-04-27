# Clinic supplier profiles and settlement history

## Context

Point 26 from the Altegio solo-practitioner adaptation backlog adds supplier profiles for home-visit practices that manage consumables, stock receiving, and supplier payments without a full procurement team.

## Shipped

- Added `ClinicSupplier` for supplier contact details, WhatsApp/email/phone, payment terms, address, reorder notes, and internal notes.
- Added `ClinicSupplierSettlement` for supplier payment/settlement history.
- Linked `ClinicPurchaseOrder` to optional `supplierId` while preserving the existing `supplierName` snapshot for compatibility.
- Added `/clinic/suppliers` for creating and listing suppliers.
- Added `/clinic/suppliers/[id]` with purchase history, received stock value, paid amount, unpaid balance, and settlement entry.
- Updated purchase-order creation to choose an existing supplier profile when available.
- Added EN/RU UI copy and Knowledge Base guidance.

## Accounting logic

Supplier payable is derived from **received** purchase-order line cost, not unreceived ordered stock:

- `received value = quantityReceived * unitCostCents`
- `paid value = sum(ClinicSupplierSettlement.amountCents)`
- `unpaid = max(0, received value - paid value)`

Cancelled purchase orders are excluded from supplier value calculations.

## Validation

- Added unit coverage for supplier normalization, received payable cost, and settlement summary.
- Run: `npm run type-check`, `npm run test`, `npm run lint`, `npm run build`.

## Operational note

This is a schema change. Run `npx prisma db push` against the target production database after deploying.
