# Clinic Referral Tracking

## Context

Backlog point 32 adapts Altegio-style referral programs for a solo home-visit practitioner. The first pass deliberately avoids points, balances, or automated rewards.

## Shipped

- Added `referredByName` and `referralNote` to `ClinicPatient`.
- Patient create/edit forms can capture who referred the client and any manual reward/context note.
- Added `GET /api/clinic/referrals/overview` for 30-day, 90-day, yearly, and all-time referral reporting.
- Added `/clinic/referrals` with source/person summary, recent referred clients, patient links, and EN/RU localization.
- Added Knowledge Base guidance for using referral tracking without creating a heavy loyalty program.

## Next Improvements

- Save thank-you/reward outreach as CRM activity.
- Optionally link a referred-by patient to an actual patient record.
- Add a manual "reward fulfilled" checkbox if practitioners start promising consistent rewards.
