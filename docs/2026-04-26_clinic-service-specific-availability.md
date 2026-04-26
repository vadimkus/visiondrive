## 2026-04-26 — Clinic Item 5: Service-Specific Availability

Context: backlog item 5 covered availability rules inspired by Altegio fixed/optimal/dynamic slots. The first pass already had general working hours, minimum lead time, slot interval, blocked time, and slot preview. This follow-up adds service-specific availability.

What shipped:
- Added optional `procedureId` to `ClinicAvailabilityRule`.
- Slot generation now uses general rules by default, but if a selected service has rules for a day, those rules override the general day rules.
- Scheduling checks now receive `procedureId`, so manual bookings, reschedules, follow-ups, and public booking all respect service-specific hours.
- Availability UI can add/remove service-specific rules and preview available slots by service.

Operational note:
- This is a schema change. Run `npm run db:generate` and `npm run db:push` against the target database before using it in production.

Validation:
- Focused unit tests cover service-specific slot generation and scheduling guard behavior.
