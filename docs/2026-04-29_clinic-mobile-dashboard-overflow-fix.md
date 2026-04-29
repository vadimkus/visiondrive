# Clinic Mobile Dashboard Overflow Fix

## Intent

Fix the mobile web dashboard rendering where the page appeared as a narrow left column with blank space on the right.

## Changes

- Added explicit full-width/min-width constraints to the clinic shell and conditional app wrapper.
- Hid horizontal overflow at the clinic shell boundary so oversized children cannot stretch the mobile page.
- Clamped the Google/Instagram/WhatsApp booking link card with `min-w-0` and truncated long attributed URLs.
- Kept service direct links copyable while preventing long service names or links from expanding the grid.

## Verification

- Reproduced `/clinic` at a phone viewport and confirmed the dashboard fills the width.
- `npm run type-check`: passed.
- `npm run lint`: passed; existing `MODULE_TYPELESS_PACKAGE_JSON` warning remains unrelated.
- `npm run test:clinic-flow`: passed.
