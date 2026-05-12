# Clinic Locale Refresh Fix

Date: 2026-05-10

## Context

Russian locale could be selected inside the Practice OS clinic workspace, but refreshing the page switched the UI back to English.

Follow-up: after the first refresh fix, the locale could still switch back to English in some navigation cases when moving between clinic sections.

## Cause

`ClinicLocaleProvider` correctly restored the browser `localStorage` locale on reload, but `ClinicShell` then fetched `/api/clinic/me` and overwrote the client locale with the persisted account preference. If the account preference was still `en`, the shell reverted the UI from `ru` to `en`.

The navigation-only version had two additional sources:

- The public website `LanguageContext` also wrote `visiondrive-clinic-locale`. It preferred the older public `language` value first, so a stale `language=en` could overwrite a valid clinic `ru` value during remounts.
- `PATCH /api/clinic/me` normalized partial preference updates against the default preference object. A locale-only update could preserve the selected language but reset other preference fields, and a partial preference update could fall back to the default `en` if locale was missing.

## Fix

- Language switch actions in `ClinicShell` now optimistically update the UI and persist the selected locale through `PATCH /api/clinic/me`.
- On shell initialization, a valid browser-stored locale wins over a conflicting server preference and is synced back to the account preference.
- If there is no browser-stored locale, the server preference remains the fallback.
- `ClinicLocaleProvider` now keeps the public `language` key in sync with `visiondrive-clinic-locale`.
- Public `LanguageContext` now treats the clinic locale as the source of truth when it exists, so stale public language storage cannot flip Practice OS back to English.
- Account page initialization also respects the browser-stored clinic locale and syncs it back to account preferences if the server value is stale.
- `PATCH /api/clinic/me` now normalizes partial preference updates against the current stored preference row instead of always falling back to defaults.

## Verification

- `npm run type-check`
