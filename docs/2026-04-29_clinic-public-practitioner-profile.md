# Clinic Public Practitioner Profile

Date: 2026-04-29

## Context

The backlog item was a lightweight website/profile builder for a solo practitioner: services, booking link, reviews, before/after gallery, and policies.

## Shipped

- Added public profile route: `/profile/[tenant-slug]`.
- Added public profile API: `GET /api/clinic/public-profile/[slug]`.
- Added public-safe media route: `GET /api/public/clinic/media/[id]`.
- Dashboard booking-links card now includes a copy-ready `Public profile` link.
- Knowledge Base includes EN/RU workflow instructions.

## Safety Rules

- Public profile only reads active tenants.
- Services shown are active procedures only.
- Reviews shown are only `PUBLISHED` reviews with `publishedAt`.
- Before/after gallery only uses media with `marketingConsent = true`.
- Public media endpoint refuses non-image media and refuses any image without marketing/public-use consent.
- Patient names in public reviews are anonymized as first name plus last initial.

## No Schema Change

This reuses existing models:

- `Tenant.slug`
- `ClinicProcedure`
- `ClinicPatientReview`
- `ClinicPatientMedia.marketingConsent`
- existing public booking link `/book/[slug]`

## Validation

- Public profile helper tests added in `lib/clinic/public-profile.test.ts`.
- Run `npm run type-check`, `npm test -- public-profile`, and browser-check `/profile/visiondrive`.
