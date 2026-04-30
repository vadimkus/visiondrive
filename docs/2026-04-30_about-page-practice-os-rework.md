# About Page Practice OS Rework

## Context

The live `/about` page still showed legacy Smart Kitchen / food-safety positioning under the newer Practice OS shell. That confused the public story because VisionDrive's current product direction is practice operations software for solo practitioners in the UAE.

## What Changed

- Reworked `app/about/AboutClient.tsx` around Practice OS positioning.
- Removed kitchen, food-safety, temperature monitoring, restaurant/hotel, Dubai Municipality, and IoT certificate positioning from the About page.
- Added clearer product pillars: bookings and client flow, clinical workspace, and practice control.
- Updated the company section to keep legal entity/contact details while pointing compliance details to `/compliance`.

## Validation

- `rg "Smart Kitchen|kitchen|Kitchen|Food Safety|temperature|Dubai Municipality|IoT|TDRA|restaurant|hotel" app/about` returned no matches.
- `npx eslint "app/about/AboutClient.tsx" "app/about/page.tsx"`
- `npm run type-check`
