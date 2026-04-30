# Public Pre-Login Practice Positioning Audit

Date: 2026-04-30

## Context

The public website must present VisionDrive as Practice OS for UAE solo practitioners and independent clinics. Legacy IoT and parking-era pages should not be reachable as public marketing content before login.

## What changed

- Replaced legacy public pages with redirects:
  - `/budget` -> `/contact`
  - `/certificates` -> `/compliance`
  - `/data-analytics` -> `/technology`
  - `/download` -> `/login`
  - `/vision` -> `/mission`
  - `/roadmap2` -> `/roadmap`
- Updated route metadata for redirected legacy pages so stale IoT titles are no longer served.
- Removed old redirect-only public URLs from `sitemap.ts`.
- Updated stale public translation snippets in `app/translations/footer.ts` and `app/translations/about.ts`.
- Replaced the old careers government-partner section with a Practice OS ecosystem section.

## Validation

- Targeted search was run for legacy IoT public phrases across public app routes and translation files.
- Legacy kitchen routes and supporting app/API structure were removed in the follow-up cleanup.

## Follow-up Cleanup

- Deleted the remaining Smart Kitchen application/API structure and supporting library/script/infrastructure files.
- Removed stale Smart Kitchen-specific security/compliance docs from the active documentation index.
- Tightened public EN/RU copy on home, about, contact, FAQ, booking, profile, compliance, terms, and login surfaces so the public story is Practice OS for solo practitioners and independent private practices.
- Adjusted CTA/button styling and compliance retention pills to avoid clipping or overlap in RU mobile views.
- Validation passed: `npm run type-check`, `npm run lint`, `npm run build`, plus targeted searches for kitchen/TDRA/food-safety terms in active app routes.

## Homepage Geography-Neutral Positioning

- Removed the UAE suffix from the homepage hero slogan in EN/RU.
- Replaced the "UAE-ready practice data" capability pill with a geography-neutral structured-data benefit.
- Updated homepage metadata and structured data so the main landing page positions VisionDrive as accessible from anywhere, while legal/compliance pages can still mention UAE-specific company and data-residency details where relevant.
- Mirrored the concise "professional system for solo practitioners" footer positioning and dark CTA body in both EN and RU.
- Validation passed: `npm run type-check` and `npm run lint`.
