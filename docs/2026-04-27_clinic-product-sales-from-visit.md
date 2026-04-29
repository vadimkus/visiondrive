# Clinic product sales from visit

Date: 2026-04-27

## Context

Point 18 from the Altegio adaptation backlog adds visit-linked aftercare product sales for solo home-visit practitioners. The goal is to sell recommended retail products during a visit, deduct inventory immediately, record revenue, and keep the patient history clear.

## Shipped

- Added `ClinicProductSale` and `ClinicProductSaleLine` to Prisma.
- Added `/api/clinic/patients/[id]/product-sales` for listing and recording product sales.
- Recording a sale validates active stock, checks available quantity, creates `CONSUMPTION` stock movements, and decrements inventory.
- Product sales create `ClinicPatientPayment` rows with `PRODUCT_SALE:*` references for finance revenue.
- Client balance now excludes product-sale payment references so retail payments do not become patient credit.
- Appointment drawer now has a Product sales block after a visit starts or completes.
- Patient Payments tab now shows product sale history.
- Added EN/RU strings and Knowledge Base article.
- Updated architecture, data model, backlog, canvas, and implementation log.

## Notes

- The UI currently records one product line at a time, while the API accepts multiple lines for future expansion.
- Product sale payments are intentionally not linked to `visitId` or `appointmentId` on the payment row, because treatment balance logic treats linked payments as appointment charge payments.
- The sale record itself keeps the visit and appointment context.

## Follow-up: Add-On Recommendations

Added 2026-04-29.

- `GET /api/clinic/product-recommendations` ranks in-stock add-ons by service match, patient repeat purchases, and recent popularity.
- The appointment drawer checkout shows recommendation chips above the product selector.
- Selecting a recommendation pre-fills the product and last known unit price when available; the practitioner still reviews price/quantity before recording the sale.

## Validation

- `npm run db:generate`
- `npm run type-check`
- `npm run test`
- `npm run lint`
- `npm run build`
- `npm run db:push`
