# Clinic Occupancy And Free Slots

Date: 2026-04-28

## Context

Backlog item 49 asks for occupancy analytics adapted to solo home-visit practitioners: how much planned working time is booked, where free slots exist, and whether travel buffers are excessive.

## Shipped

- Added `/clinic/occupancy` as a mobile-friendly report for the next 7 or 14 days.
- Added `GET /api/clinic/occupancy/overview`.
- Reuses availability rules as planned working time, with default availability fallback.
- Counts active appointments as booked time, including cleanup and travel buffers where they overlap planned working hours.
- Subtracts blocked times from free capacity.
- Shows total occupancy percentage, planned/booked/free time, appointment count, free slot count, travel buffer load, and day-by-day free windows.
- Flags travel-heavy days when travel buffers are high versus treatment time.
- Added sidebar navigation, dashboard quick action, EN/RU strings, and Knowledge Base guidance.

## Follow-up: Calendar Sync

On 2026-04-29, Availability gained a private ICS feed for external calendars. The feed includes appointments and blocked time, so personal blocks remain the source for lunch, leave, training, supply runs, and other unavailable periods.

## Limits

- First pass is single-practitioner only.
- Free windows are derived from general availability rules, not service-specific rule variants.
- There is no map routing optimization yet; travel buffer pressure is calculated from stored appointment buffers.
