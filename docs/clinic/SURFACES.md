# Practice OS Surface Contract

Date: 2026-05-10

Practice OS has three active user-facing surfaces today and one future surface. All feature work should respect this contract before it is considered complete.

## Active Surfaces

| Surface | Status | Primary users | Layout contract |
|---|---|---|---|
| Desktop web | Active | Owner, admin, deep work | Persistent left sidebar, wide command canvas, breadcrumbs, dense tables/cards, keyboard-friendly controls. |
| Mobile web | Active | Solo practitioner on iPhone or Android browser | Compact top bar, language/account controls, fixed bottom navigation, safe-area padding, thumb-friendly actions, no horizontal overflow. |
| iPad / tablet web | Active | Practitioner or assistant during clinic/home-visit work | Touch-first tablet canvas. Portrait uses the expanded mobile shell; landscape at desktop width uses the desktop command shell. Navigation should not be phone-narrow on tablet widths. |
| Native mobile app | Future | Practitioner and possibly clients later | Not part of v1. Current mobile strategy is responsive web plus installable PWA. A future native app should reuse the existing tenant APIs and Practice OS information architecture instead of creating a separate product. |

## Breakpoint Rules

- `<640px`: phone-first mobile web. Keep primary controls reachable by thumb and preserve bottom safe-area padding.
- `640px-1023px`: tablet/mobile web. Use wider tablet containers, expanded mobile menu grids, and touch targets suitable for iPad portrait.
- `>=1024px`: desktop command shell. Use persistent sidebar and wide management views.

The current shell implementation lives in `app/clinic/ClinicShell.tsx`:

- mobile/tablet header: `lg:hidden`
- desktop sidebar: `hidden lg:flex`
- main canvas: shared content area with mobile safe-area bottom padding and desktop internal scrolling

## Alignment Checklist

Before shipping a Practice OS UI change, check:

1. Desktop web: page fits the wide canvas, sidebar state is clear, dense content does not feel artificially mobile.
2. Mobile web: no horizontal overflow, bottom navigation does not cover controls, forms and buttons have at least 44px touch targets.
3. iPad/tablet: portrait does not look like a narrow phone column, navigation/menu width expands, landscape remains usable with the desktop shell.
4. EN/RU: labels fit on mobile and tablet, especially navigation, buttons, empty states, and card titles.
5. PWA: installed browser mode still opens `/clinic` and preserves the mobile/tablet safe-area layout.

## Future Mobile App Boundary

Do not build separate native-app-only behavior yet. For now:

- Treat mobile web and PWA as the production mobile experience.
- Keep APIs reusable for a future app.
- Avoid coupling UX decisions to browser-only behavior when a future app will need the same workflow.
- Patient-facing native app remains later; patient portal links and WhatsApp handoff are the current client experience.
