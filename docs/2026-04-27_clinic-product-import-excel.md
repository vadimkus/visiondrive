# Clinic Product Import From Excel

Date: 2026-04-27

## Context

Point 25 from the Altegio home-visit adaptation backlog adds bulk inventory setup from spreadsheet files. This follows the client import workflow and helps a solo practitioner move an existing stock catalog into Practice OS without manual one-by-one entry.

## Shipped

- Added `lib/clinic/product-import.ts` to map product spreadsheet rows, validate fields, match procedure names, and detect duplicates.
- Added `POST /api/clinic/inventory/import`:
  - multipart upload returns preview rows and summary counts;
  - JSON `action=commit` creates only clean non-duplicate stock items.
- Added `/clinic/inventory/import` with upload, preview, duplicate warnings, and import commit.
- Added an Inventory page button for import.
- Opening quantities create `RECEIPT` movements and set on-hand stock.
- Supplier and unit cost are preserved in notes until supplier/cost accounting gets its dedicated model.
- Updated EN/RU copy, Knowledge Base, architecture docs, data model docs, implementation log, and backlog canvas.

## Supported Columns

- Product / name
- SKU / article
- Barcode
- Unit
- Quantity / on-hand stock
- Reorder point / minimum stock
- Consume per visit
- Linked procedure / service
- Supplier
- Unit cost
- Notes

## Validation

- `npm run type-check`
- `npm run test`
- `npm run lint`
- `npm run build`
