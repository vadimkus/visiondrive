# 2026-05-12 - Clinic Patient And Stock Bugfixes

## Context

Vadim reported three Practice OS bugs:

- Existing patient records could not be deleted from the patient card.
- Existing stock items needed checkbox selection and batch deletion.
- Patient creation should not require date of birth because practitioners often do not know it.

## Shipped

- Patient card deletion now shows a clear warning confirmation and then sends the required tenant-safe delete confirmation to `DELETE /api/clinic/patients/[id]`.
- `ClinicPatient.dateOfBirth` is now nullable in Prisma, and patient creation accepts an empty DOB from manual create, import, public booking, and Instagram lead conversion flows.
- Public booking and new-patient forms no longer mark DOB as required.
- Patient lists, patient headers, birthday/occasion logic, and patient-safe PDFs handle missing DOB with an empty placeholder instead of failing.
- Inventory now supports row checkboxes, select-all, and a selected-items delete action from `/clinic/inventory`.
- Inventory deletion removes selected items from the active inventory list by setting `active=false`, preserving stock movements, purchase history, and audit context.

## Validation Notes

- Prisma client must be regenerated after the nullable DOB schema change.
- Database schema must be pushed/migrated so `clinic_patients.date_of_birth` accepts `NULL`.
