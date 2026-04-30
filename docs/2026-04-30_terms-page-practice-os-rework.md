# Terms Page Practice OS Rework

## Context

The live `/terms` page still referenced the legacy Kitchen Owner Portal and smart kitchen monitoring platform. The current public product is VisionDrive Practice OS for UAE solo practitioners, so the legal page needed to match the current service surface.

## What Changed

- Reworked `app/terms/page.tsx` into Practice OS Terms of Service.
- Added clearer sections for practitioner responsibilities, patient data, portal/booking/public links, payments/wallets/packages/subscriptions, AI-assisted features, third-party services, liability, and UAE governing law.
- Replaced the dynamic effective date with a stable `30 Apr 2026` date.
- Updated `app/terms/layout.tsx` metadata for Practice OS terms snippets.
- Removed legacy kitchen, sensor, IoT, TDRA, temperature, and monitoring platform references from `app/terms`.

## Validation

- `rg "Kitchen|kitchen|Smart Kitchen|sensor|temperature|IoT|TDRA|Dubai Municipality|monitoring platform|Kitchen Owner Portal" app/terms` returned no matches.
- `npx eslint "app/terms/page.tsx" "app/terms/layout.tsx"`
- `npm run type-check`
