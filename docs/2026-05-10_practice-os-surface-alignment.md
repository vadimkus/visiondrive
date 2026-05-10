# Practice OS Surface Alignment

Date: 2026-05-10

## Context

Vadim clarified the product needs three active versions to work on now:

1. Desktop
2. Mobile web
3. iPad

Native mobile app is a future version, not current scope.

## Decision

Practice OS should treat the active surfaces as one responsive product with surface-specific layout contracts:

- Desktop web: command-center experience with persistent sidebar, wide canvas, breadcrumbs, and dense management views.
- Mobile web: phone-first browser experience with compact top bar, bottom navigation, safe-area spacing, and thumb-friendly actions.
- iPad/tablet web: touch-first tablet experience. Portrait uses the expanded mobile/tablet shell; landscape at desktop width uses the desktop command shell.
- Native mobile app: future scope. Current mobile strategy remains responsive web plus installable PWA.

## Changes

- Added `docs/clinic/SURFACES.md` as the canonical surface contract and QA checklist.
- Updated `ClinicShell` tablet spacing so iPad portrait navigation and menus expand beyond phone width.
- Kept the Lite/Full mode toggle visually consistent by using the same orange card and switch treatment in both states.
- Simplified the Lite mode label to `Lite mode` / `Легкий режим`; the switch itself communicates whether the mode is active.
- Updated Knowledge Base capability copy in EN/RU to mention desktop, mobile web, iPad/tablet, PWA, and future app boundaries.
- Linked the surface contract from `docs/README.md`, `docs/clinic/README.md`, `docs/clinic/ARCHITECTURE.md`, and `docs/clinic/IRYNA_FLOWS.md`.

## Verification

- `npm run type-check`
