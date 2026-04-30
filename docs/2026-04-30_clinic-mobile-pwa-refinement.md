# Clinic Mobile PWA Refinement

Date: 2026-04-30

## Context

Mobile Safari screenshot showed the clinic dashboard Practitioner mode card competing with the fixed bottom navigation. The offline note draft controls were partially covered by the mobile footer/nav, and the floating knowledge-base action overlapped the draft area.

## What changed

- Compressed Practitioner mode quick actions into a three-column mobile row.
- Shortened the offline draft textarea on mobile.
- Changed draft actions into full-width, thumb-friendly buttons.
- Increased mobile shell bottom padding to leave room for the fixed bottom nav and safe area.
- Hid the floating knowledge-base button on the dashboard, where it was overlapping the Practitioner mode card.
- Neutralized the login footer from `Dubai · UAE` / `Дубай · ОАЭ` to `Practice OS`.
- Tightened EN/RU Practitioner mode copy around solo mobile work: today agenda, patient lookup, notes, and weak-signal support.

## Validation

- `npm run type-check`
- `npm run lint`

## Follow-up

- Validate on the production iPhone after deploy because Safari browser chrome height differs from desktop emulation.
- If the bottom nav still feels heavy, consider reducing mobile tabs to four primary actions plus an overflow menu.
