# Clinic Revenue Plan

Date: 2026-04-28

## Context

Backlog item 48 asks for a solo-practitioner revenue plan: monthly target, required visits, achieved revenue, daily pace, and gap. The first pass should help a practitioner know whether the month is on track without building a heavy forecasting module.

## Shipped

- Added `/clinic/revenue-plan` with a mobile-friendly target form and monthly progress view.
- Added `GET/PATCH /api/clinic/revenue-plan`.
- Stores the monthly target and optional average visit value in `tenant_settings.thresholds.revenuePlan`.
- Calculates achieved revenue from paid patient payments minus refunded payments for the current month.
- Calculates completed visits, actual average visit value, gap, daily pace, required daily pace, projected month, and required remaining visits.
- Added sidebar navigation, dashboard quick action, EN/RU strings, and Knowledge Base guidance.

## Limits

- The first pass tracks the current calendar month only.
- There is no history table of past revenue plans yet.
- Required visits use the configured average visit value, or the current month average when no value is configured.
