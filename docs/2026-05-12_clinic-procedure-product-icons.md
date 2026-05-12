# Clinic Procedure Product Icons

Date: 2026-05-12

## Context

The procedure catalogue needed quick visual recognition for aesthetic product names. Example request: show a small image/icon for `Belotero Volume`.

## Changes

- Added automatic product/brand icon detection in `/clinic/procedures`.
- Product cards now show a small icon before the procedure name when the procedure name matches a known product/brand.
- Current mappings:
  - `Belotero` and `Blanch Balance` / `Blanch Soft` -> Belotero / Merz brand family.
  - `AestheFill` -> AestheFill.
  - `Dr. CYJ` -> DR. CYJ / Caregen.
  - `ASCE` / `HRLV` -> ASCE+ / ExoCoBio.
- Icons use official-domain favicons through Google favicon service, with a text-initial fallback if an image cannot load.
- No database change; this is a display-only enhancement based on procedure names.

## Verification

- `ReadLints` on `app/clinic/procedures/page.tsx`: no diagnostics.
- `npm run type-check`: passed.
