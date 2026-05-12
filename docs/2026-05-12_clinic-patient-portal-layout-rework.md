# Clinic Patient Portal Layout Rework

Date: 2026-05-12

## Context

The public patient portal URL was visually colliding with the standard marketing site shell. The portal content was rendered inside the global public header/footer layout, which made the page feel duplicated and cramped.

The follow-up design pass reframed the page as a customer link, not an internal workspace dashboard. The information architecture now prioritizes the customer jobs: see the next booking, prepare for the visit, understand what was done, read recommendations, check packages/care plan, and download receipts if needed.

## Changes

- Excluded `/patient-portal/*` from the public marketing `Header` and `Footer` in `ConditionalLayout`.
- Reworked the portal page into a standalone patient-facing surface with a compact VisionDrive top bar, secure-link badge, customer greeting, next booking panel, care-at-a-glance metrics, and local footer.
- Moved the main content order to customer-useful sections: upcoming bookings, request form, what was done, recommendations/next steps, care plan/packages, payments/receipts, and documents/consents.
- Removed the internal-style wallet dashboard hierarchy from the primary flow. Payments are still visible, but only as customer-facing balance, pending requests, and receipts.
- Added a general contact action so the patient can send a private message through the portal without tying it to a specific appointment.
- Improved responsive behavior for appointment cards, visit summaries, care plan cards, receipts, consents, action buttons, and long text labels.
- Added wrapping and `min-w-0` safeguards to prevent long EN/RU copy, patient names, procedure names, and money values from causing horizontal overlap.

## Verification

- Run targeted lint/type checks after the UI change.
