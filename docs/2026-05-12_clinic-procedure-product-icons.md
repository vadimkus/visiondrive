# Clinic Procedure Product Icons

Date: 2026-05-12

## Context

The procedure catalogue needed quick visual recognition for aesthetic product names. Example request: show a small image/icon for `Belotero Volume`.

## Changes

- Added automatic product/brand icon detection in `/clinic/procedures`.
- Product cards now always show a small icon before the procedure name.
- Known brands/products show an online brand favicon from the relevant official/brand domain.
- Unknown procedure names show a clean initials + sparkle fallback, so no procedure card is left visually empty.
- Current mappings:
  - `Belotero` and `Blanch Balance` / `Blanch Soft` -> Belotero / Merz brand family.
  - `AestheFill` -> AestheFill / Regen Biotech.
  - `Dr. CYJ` -> DR. CYJ / Caregen.
  - `ASCE` / `HRLV` -> ASCE+ / ExoCoBio.
  - Common aesthetic brands such as Juvéderm, Botox, Dysport, Restylane, Radiesse, Xeomin, Profhilo, Sculptra, Teosyal, Stylage, Nucleofill, Rejuran, and Jalupro.
- Icons use official-domain favicons through Google favicon service, with a text-initial fallback if an image cannot load or no mapping exists.
- No database change; this is a display-only enhancement based on procedure names.

## Verification

- `ReadLints` on `app/clinic/procedures/page.tsx`: no diagnostics.
- `npm run type-check`: passed.
