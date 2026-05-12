# 2026-05-12 - Clinic Procedure Policy Chevron

## Context

Vadim asked to hide the procedure booking rules block under a chevron and keep it closed by default.

## Shipped

- Existing procedure cards now show `Booking policy / Правила записи` as a collapsed chevron section.
- The new procedure form uses the same hidden-by-default chevron pattern.
- Policy form state and save/create payloads are unchanged; this is a UI simplification only.

## Validation

- Run TypeScript and linter diagnostics after the UI change.
