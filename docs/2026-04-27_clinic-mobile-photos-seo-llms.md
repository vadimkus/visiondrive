# Clinic Mobile Photos and SEO/LLM Files

Date: 2026-04-27

## Context

Vadim requested two improvements in one pass:

1. Let practitioners take photos on iPad/iPhone and attach/delete them from the patient card.
2. Improve SEO and LLM-facing files.

## Shipped

- Patient Photos tab now has separate mobile-first actions for taking a new photo from the rear camera and choosing an existing photo from Photos/Files.
- Photo uploads can include a short caption and still support Before / After / Other type plus optional visit linkage.
- Private patient media can now be deleted through `DELETE /api/clinic/media/[id]`; Vercel Blob cleanup is best-effort and the tenant-scoped DB row remains the source of truth.
- Photo cards show captions and a delete action.
- EN/RU strings and Knowledge Base photo guidance were updated.
- `robots.ts` now blocks private app routes from indexing: `/clinic`, `/book`, `/portal`, `/login`, and `/api`.
- `llms.txt` and `llms-full.txt` were rewritten to reflect Practice OS as the current primary VisionDrive product, with Smart Kitchen kept as secondary/legacy context.
- Added `PracticeSoftwareSchema` JSON-LD for the public site.

## Notes

- No schema change.
- iOS camera behavior depends on browser support for `capture="environment"`; Safari on iPhone/iPad should offer direct capture for the Take photo action.
- Private booking links are intentionally excluded from indexing.

## Validation

- Required validation: `npm run type-check`, `npm run test`, `npm run lint`, and `npm run build`.
