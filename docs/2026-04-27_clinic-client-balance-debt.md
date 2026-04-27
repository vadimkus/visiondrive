# Clinic Client Balance And Debt

Date: 2026-04-27

Context: implemented the first item from the Altegio home-visit adaptation map: client balance and debt visibility for solo/home practitioners.

## What Shipped

- Added `lib/clinic/client-balance.ts` to derive balance from existing appointment/payment data.
- Added tests in `lib/clinic/client-balance.test.ts`.
- Patient list API now returns `clientBalance` for each patient.
- Patient detail API now returns `clientBalance` and keeps appointment response clean by stripping internal balance-only nested visit rows.
- Appointment detail API now returns the patient's global `clientBalance` for drawer context.
- Patient list shows balance chips: clear, outstanding, or credit.
- Patient chart shows a balance summary card above tabs and inside the Payments tab.
- Appointment drawer shows the current appointment payment snapshot plus global client balance.
- Added EN/RU copy for client balance labels.

## Calculation Rules

- `ARRIVED` and `COMPLETED` appointment procedure prices are treated as expected charges.
- Linked `PAID` payments reduce due.
- Linked `REFUNDED` payments reduce paid value.
- Linked or standalone `PENDING` payments count as due.
- Standalone `PAID` payments count as patient credit/deposit.
- `VOID` payments are ignored.

## Notes

- No schema change. This is a derived balance layer over existing `ClinicAppointment`, `ClinicProcedure`, `ClinicVisit`, and `ClinicPatientPayment` rows.
- Next improvement should be inline payment closure from the appointment drawer, then receipt PDF and partial refund workflow.

