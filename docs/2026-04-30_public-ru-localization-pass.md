# Public RU Localization Pass

Date: 2026-04-30

## Context

The public website needed to show Russian copy when the RU locale is selected, with no English-only visible UI text before login.

## Changes

- Connected the public language selector to both `language` and `visiondrive-clinic-locale` localStorage keys so public booking and patient portal pages inherit the RU choice.
- Localized public header/footer accessibility labels and the 404 page.
- Added RU dictionaries for the main pre-login public pages: home title, about, compliance, terms, privacy, contact, FAQ, and login.
- Added a small client-side document title hook so RU-selected public pages replace English metadata titles after hydration.

## Verification

- `npm run type-check`: passed.
- `npx eslint` on the edited public localization files: passed.
- Browser spot-checks confirmed the main public content, navigation, footer, legal links, and translated collapsible labels render in Russian after selecting RU.
