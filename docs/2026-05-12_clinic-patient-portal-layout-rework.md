# Clinic Patient Portal Layout Rework

Date: 2026-05-12

## Context

The public patient portal URL was visually colliding with the standard marketing site shell. The portal content was rendered inside the global public header/footer layout, which made the page feel duplicated and cramped.

## Changes

- Excluded `/patient-portal/*` from the public marketing `Header` and `Footer` in `ConditionalLayout`.
- Reworked the portal page into a standalone patient-facing surface with a compact VisionDrive top bar, secure-link badge, patient greeting, private-link notice, appointment summary, balance summary, and local footer.
- Improved responsive behavior for wallet metrics, appointment cards, consent cards, quote rows, action buttons, and long text labels.
- Added wrapping and `min-w-0` safeguards to prevent long EN/RU copy, patient names, procedure names, and money values from causing horizontal overlap.

## Verification

- Run targeted lint/type checks after the UI change.
