# Clinic Mobile Header and Footer Refinement

Date: 2026-04-30

## Context

The logged-in mobile workspace header was too dense after private practitioner personalization: it showed practitioner identity, Lite mode, language, account, and other controls in one small row. The public mobile header had the cleaner pattern: VisionDrive brand on the left and compact actions on the right.

## What Changed

- Mobile `/clinic` header now uses the public-style brand treatment:
  - logo + `VisionDrive`
  - compact language selector
  - account icon
  - logout icon
  - hamburger menu
- Practitioner name/title stays out of the mobile top bar to keep it clean.
- Lite/Full mode moved into the hamburger menu on mobile.
- Hamburger menu opens the workspace tool list for mobile users.
- Bottom mobile navigation active state changed from a heavy black pill to a lighter orange highlight, making selected items clearer without dominating the screen.

## Validation

- `npm run type-check`
- `npm run lint`
- `npm test`
