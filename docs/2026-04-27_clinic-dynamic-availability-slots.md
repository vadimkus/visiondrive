## 2026-04-27 — Clinic Item 5: Dynamic Availability Slots

Context: item 5 already supported general working hours, blocked time, minimum lead time, fixed slot intervals, slot preview, and service-specific availability overrides. The next Altegio-inspired gap was fixed vs optimal/dynamic slots.

What shipped:
- Added `slotMode` to `ClinicAvailabilityRule`.
- `FIXED` mode preserves existing fixed interval behavior.
- `DYNAMIC` mode spaces candidate slots by the selected service duration plus hidden buffer.
- Availability UI now exposes the slot mode selector per rule and explains dynamic behavior in EN/RU.
- Slot preview reflects the selected service and rule mode.

Operational note:
- This is a schema change. Run `npm run db:generate` and `npm run db:push` against the target database before using it in production.

Validation:
- Added focused coverage for dynamic slot generation.
