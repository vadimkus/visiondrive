# Clinic Marketing Automation Builder

## Context

The P0 growth build needs a lightweight campaign builder for solo home doctors. The goal is not a bulk sender; it is a safe segmentation and copy-prep workflow for WhatsApp-first patient reactivation.

## What Shipped

- Added `/clinic/marketing` as a manual campaign builder in the Growth navigation.
- Added `GET /api/clinic/marketing/segments` for live patient segments.
- Supported segments: tag, service, last visit, package balance, birthday, dormant, and no-show recovery.
- Added EN/RU WhatsApp copy generation per patient, with copy/open-WhatsApp actions and patient-card links.
- Kept the guardrail explicit: nothing is auto-sent, and every message must be reviewed by the practitioner.
- Added EN/RU knowledge-base guidance for using marketing campaigns.

## Validation

- `npm test -- --run lib/clinic/marketing-automation.test.ts`
- `npm run type-check`
- `npx eslint "lib/clinic/marketing-automation.ts" "lib/clinic/marketing-automation.test.ts" "app/api/clinic/marketing/segments/route.ts" "app/clinic/marketing/page.tsx"`
