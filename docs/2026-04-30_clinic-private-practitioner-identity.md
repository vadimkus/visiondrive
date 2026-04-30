# Clinic Private Practitioner Identity

Date: 2026-04-30

## Context

Solo practitioners usually operate under a personal name, not a company brand. The product should feel personal once the practitioner gives us their name, but it should not expose them through a public profile, custom domain, or public media gallery.

## What Changed

- Added private practitioner identity fields to `/clinic/account`:
  - display name
  - professional title
  - specialty
  - message signature
- Stored extra identity fields in `tenant_settings.thresholds.practitionerIdentity` to avoid a schema migration.
- Kept `User.name` aligned with the saved display name.
- Personalized the authenticated workspace header and dashboard greeting after a display name is saved.
- Added the saved message signature to WhatsApp Assistant drafts.
- Removed the public profile link from the dashboard booking-links card.
- Disabled `/profile/[slug]`, `GET /api/clinic/public-profile/[slug]`, and `GET /api/public/clinic/media/[id]` by returning not found.
- Updated active public terms/compliance copy so the product no longer promises public practitioner profiles.

## Product Decision

Private personalization is in scope:

- workspace header
- dashboard greeting
- account identity card
- practitioner-controlled WhatsApp drafts
- later: receipts, quotes, aftercare PDFs, and patient portal copy when intentionally shared

Public exposure is out of scope for now:

- public practitioner profile pages
- public media galleries
- custom practitioner domains
- marketplace-style discovery
- website widget identity surfaces

## Validation

Run:

- `npm run type-check`
- `npm run lint`
