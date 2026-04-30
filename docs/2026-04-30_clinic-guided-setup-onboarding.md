# Clinic Guided Setup Onboarding

Date: 2026-04-30

## Context

Practice OS has deep functionality, but a new solo practitioner needs a separate activation path that gets the workspace ready for bookings without changing Lite / Full Mode. Lite Mode remains navigation density only; guided setup is an optional dashboard layer.

## What Shipped

- Added a dismissible dashboard checklist: "Get ready to take bookings".
- Stored dismissal per device with `localStorage` key `visiondrive-clinic-onboarding-dismissed`.
- Added a "Show guided setup" button so users can reopen the checklist.
- Checklist progress is derived from real workspace state:
  - Practice profile exists.
  - At least one service/procedure exists.
  - Working hours have been saved.
  - Public booking link is enabled.
  - Active WhatsApp reminder templates exist.
  - At least one client/patient exists.
- Extended `/api/clinic/stats` with `availabilityRuleCount` and `whatsappTemplateCount`.
- Added smarter empty states for patients, procedures, and appointments.
- Added EN/RU copy for all new onboarding text.

## Product Rationale

This is intentionally not a forced wizard. It acts like a coaching layer on top of the normal product: visible enough for first-run activation, dismissible for experienced users, and independent from Lite / Full navigation mode.

## Follow-Up Ideas

- Persist dismissal to `ClinicUserPreference` if this should roam across devices.
- Add a setup card to the account page for reopening from settings.
- Track completion events to see where users stall during activation.
