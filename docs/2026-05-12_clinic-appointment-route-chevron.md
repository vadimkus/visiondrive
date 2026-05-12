# 2026-05-12 - Clinic Appointment Route Chevron

## Context

Vadim asked to move the appointment home-visit route fields under a chevron and keep them hidden by default.

## Shipped

- New appointment form now shows the `Home visit route / Маршрут выездов` section as a collapsed card with a chevron.
- Edit appointment form uses the same collapsed chevron pattern.
- Route values are still kept in form state and submitted normally when present; the change is UI-only and does not alter scheduling logic.

## Validation

- Run TypeScript and linter diagnostics after the UI change.
