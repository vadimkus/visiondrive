# Clinic Visit Multiple Procedure Actions

## Context

Iryna's workflow needs one patient visit to contain several procedure lines:

- **Add procedure** stages the current procedure inside the current visit.
- **Save visit** creates one completed visit containing all staged procedure lines.
- Each procedure line needs a price, paid amount, and payment method so the practitioner can see debt or credit/deposit immediately.

## What Changed

- Renamed the former `Overview` patient tab to `Visit` / `Визит`; `History` remains the place to review completed visits in order.
- Added a secondary `Add procedure` / `Добавить процедуру` button next to `Save visit`.
- `Add procedure` no longer creates a separate visit. It stages the current procedure line inside the current visit, then clears only procedure-specific fields so the practitioner can add the next line.
- `Save visit` sends one completed visit with all procedure lines summarized in the visit record.
- Added procedure-line billing fields: procedure price, paid amount, and payment method.
- The visit summary now records the line-by-line procedure billing plus visit total, paid amount, debt, or credit/deposit.
- Visit billing creates a pending charge for the visit total and paid payment records for collected amounts, allowing the patient balance card to show outstanding debt or credit/deposit.
- Added EN/RU confirmation copy after adding a procedure.
- Added an inline `Procedure map and photos` / `Разметка процедуры и фото` block inside the visit form.
- The practitioner can draw the face/procedure map and stage `Before` / `After` photos without leaving the visit form.
- Each staged procedure line carries its own pending face map and before/after photos. When `Save visit` creates the visit, all staged media uploads with that new `visitId`.
- Added a catalogue procedure selector above `Procedure / summary`.
- Selecting a catalogue procedure fills the summary when empty and passes `procedureId` to the visit API.
- The visit API now accepts multiple `procedureIds` and applies procedure-linked inventory consumption from each selected procedure BOM, even when the visit was entered manually without a calendar appointment.

## Verification

- `npm run type-check`
- `npm run lint -- --max-warnings=0`
