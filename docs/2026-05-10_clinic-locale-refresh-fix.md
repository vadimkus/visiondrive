# Clinic Locale Refresh Fix

Date: 2026-05-10

## Context

Russian locale could be selected inside the Practice OS clinic workspace, but refreshing the page switched the UI back to English.

## Cause

`ClinicLocaleProvider` correctly restored the browser `localStorage` locale on reload, but `ClinicShell` then fetched `/api/clinic/me` and overwrote the client locale with the persisted account preference. If the account preference was still `en`, the shell reverted the UI from `ru` to `en`.

## Fix

- Language switch actions in `ClinicShell` now optimistically update the UI and persist the selected locale through `PATCH /api/clinic/me`.
- On shell initialization, a valid browser-stored locale wins over a conflicting server preference and is synced back to the account preference.
- If there is no browser-stored locale, the server preference remains the fallback.

## Verification

- `npm run type-check`
