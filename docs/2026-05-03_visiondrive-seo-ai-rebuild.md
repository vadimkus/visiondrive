# VisionDrive SEO and AI Rebuild

Date: 2026-05-03

## Context

VisionDrive public discoverability was rebuilt around the current Practice OS positioning: **a professional system for solo practitioners**. The scope was limited to public SEO and AI-indexing infrastructure, not private Practice OS product screens.

## Changes

- Added a central SEO source of truth in `lib/seo.ts` for canonical routes, metadata, keywords, private/duplicate route blocks, and Open Graph image defaults.
- Reworked global and public-route metadata to consistently target solo practitioners, independent clinics, UAE practice management, bookings, records, payments, inventory, reminders, and reporting.
- Expanded `sitemap.xml` from a short manual list to a curated public Practice OS route inventory.
- Tightened `robots.txt` for private, authenticated, token, redirect, and duplicate routes while allowing major search and AI crawlers to access public pages.
- Added generated Open Graph and Twitter preview images for a proper 1200x630 social card.
- Updated JSON-LD schemas for the organization, website, local business, and Practice OS software application.
- Rebuilt `llms.txt` and `llms-full.txt` so AI crawlers understand the public product positioning and do not treat private workspace URLs as public landing pages.

## Validation

Run:

```bash
npm run type-check
npm run lint
npm run build
```

`npm run test` may also be run as a broader regression check if the build and static checks pass.
