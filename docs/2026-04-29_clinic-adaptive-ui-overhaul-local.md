# Clinic Adaptive UI Overhaul — Local First Pass

## Intent

Rework Practice OS into two adaptive experiences:

- **Desktop Command Center:** manager/admin/deep-focus workflow, wide screens, dense navigation, analytics, modular cards.
- **Mobile Solo Practitioner:** app-like browser experience for Safari/Chrome on phones, fast tap targets, fixed bottom navigation, low distraction.

## Architecture Recommendation

Use **Tailwind breakpoint-driven adaptive composition** first:

- Shared data fetching and session logic stay in the same pages.
- `lg:hidden` and `hidden lg:block` render different mobile/desktop layout sections where the use case truly differs.
- The shell owns responsive navigation: desktop sidebar, mobile top bar + bottom tabs.
- Avoid a global `useMediaQuery` split for the first pass because it adds hydration edge cases, duplicate component trees, and unnecessary JS for a layout problem CSS handles well.
- Use separate mobile component trees only for interaction-heavy flows later: bottom sheets, camera/photo capture, appointment drawer replacement, and dense tables.

## Design System Draft

- **Palette:** warm neutral canvas (`#f6f3ee`), slate command surfaces, orange/amber primary action, emerald success, amber risk, indigo/violet accents.
- **Typography:** keep current Tailwind/system stack; use tighter desktop tracking for command titles and compact mobile labels.
- **Spacing:** mobile uses 4/5/6 increments with `min-h-14` primary touch rows; desktop uses 6/8/10 spacing with wider card grids.
- **Shape:** mobile `rounded-2xl` to `rounded-[2rem]` for tactile app cards; desktop uses structured rounded cards with subtle glass borders.
- **Viewport:** shell uses `min-h-[100dvh]`; mobile bottom nav includes `env(safe-area-inset-bottom)`.

## First Local Implementation

- `app/clinic/ClinicShell.tsx`: adaptive shell with desktop command sidebar, mobile top bar, and fixed bottom tabs.
- `app/clinic/page.tsx`: bifurcated dashboard with mobile solo cockpit and desktop command center.

## Still To Do

- Extend the same shell rules to appointment drawer/data-entry flows with mobile bottom sheets.
- Redesign dense desktop tables for patients, appointments, finance, and inventory.
- Add optional keyboard shortcut layer for desktop command-center actions.
