# Clinic Loyalty And Client Points

## Context

Home doctors need a simple way to recognize repeat clients without introducing a heavy loyalty program or a separate points ledger too early.

## What Shipped

- Added `/clinic/loyalty` in the Growth navigation.
- Added `GET /api/clinic/loyalty/overview` to derive client points from existing records.
- Points are calculated from paid spend, repeat completed visits, package purchases, and referrals.
- Added Bronze / Silver / Gold / VIP tiers with EN/RU WhatsApp reward copy.
- Added copy/open-WhatsApp actions and patient-card links for practitioner-reviewed rewards.
- No points table was added in this first pass; the view is derived from current source-of-truth records.

## Validation

- `npm test -- --run lib/clinic/loyalty.test.ts`
- `npm run type-check`
- `npx eslint "lib/clinic/loyalty.ts" "lib/clinic/loyalty.test.ts" "app/api/clinic/loyalty/overview/route.ts" "app/clinic/loyalty/page.tsx" "app/clinic/ClinicShell.tsx" "lib/clinic/strings.ts"`
