# Compliance Page Practice OS Rework

## Context

The public `/compliance` page still reflected the legacy Smart Kitchen product: Dubai Municipality food-safety thresholds, temperature sensors, TDRA device certificates, and hardware/cloud infrastructure language. The current VisionDrive direction is Practice OS for UAE solo practitioners, so the compliance story needed to match patient data and private practice operations.

## What Changed

- Replaced the legacy hardware/food-safety compliance page with Practice OS security and compliance content.
- Focused the page on UAE data residency, UAE PDPL alignment, tenant isolation, private patient records, patient-safe sharing, retention, and practitioner responsibilities.
- Removed public-facing Smart Kitchen, food-safety, temperature monitoring, device, sensor, TDRA, IoT, and DynamoDB/AWS IoT language from `app/compliance`.
- Updated route metadata in `app/compliance/layout.tsx` so search snippets match Practice OS.

## Validation

- `rg "Smart Kitchen|Food Safety|Dubai Municipality|temperature|kitchen|sensor|TDRA|IoT|Dragino|DynamoDB|NB-IoT|DM-HSD|AWS IoT" app/compliance` returned no matches.
- `npx eslint "app/compliance/page.tsx" "app/compliance/layout.tsx"`
- `npm run type-check`
