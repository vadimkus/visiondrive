# Clinic Memberships, Subscriptions, And Autopay

## Context

Solo home doctors need a lightweight way to sell recurring maintenance plans: monthly facial care, injectable review plans, wellness follow-ups, or other predictable treatments.

## What Shipped

- Added `/clinic/memberships` in the Growth navigation.
- Stores first-pass membership plans and patient subscriptions in `tenant_settings.thresholds.memberships`, avoiding a schema migration for the MVP.
- Supports plan creation with monthly price, included sessions, and description.
- Supports patient subscription creation with next billing date, note, and autopay-consent flag.
- Shows active plans, active subscriptions, due subscriptions, autopay-consent count, and monthly recurring revenue.
- Adds a due-cycle workflow that prepares a pending `ClinicPatientPayment` with `MEMBERSHIP:*` reference and advances the next billing date.
- Keeps the guardrail clear: no card is charged automatically until a real payment provider tokenization flow is integrated.

## Validation

- `npm test -- --run lib/clinic/memberships.test.ts`
- `npm run type-check`
- `npx eslint "lib/clinic/memberships.ts" "lib/clinic/memberships.test.ts" "app/api/clinic/memberships/route.ts" "app/clinic/memberships/page.tsx" "app/clinic/ClinicShell.tsx" "lib/clinic/strings.ts"`
