# Clinic PWA Practitioner Mode

Date: 2026-04-28

## Context

Backlog item 40 from the Altegio home-visit adaptation map: installable mobile app feel, today screen, quick actions, reminders, and offline note draft.

## Shipped

- Updated `/site.webmanifest` so installed sessions start at `/clinic`.
- Added manifest shortcuts for Today, New appointment, and Patients.
- Added a dedicated clinic app icon at `/clinic-app-icon.svg`.
- Updated `/clinic-push-sw.js` to activate/claim clients and use the clinic icon for notifications.
- Added a Practitioner mode card to the clinic dashboard with:
  - install prompt when supported,
  - online/offline state,
  - today agenda,
  - fast actions,
  - device-local offline note draft stored in localStorage.

## Intentional Limits

- No authenticated route caching yet. Stale admin dashboards are more dangerous than useful offline shells.
- Offline draft is local-only and must be pasted into a patient/visit note. Patient-linked offline sync is a later chunk.

## Validation

- `npm run type-check`
- `npm run lint`

## Next Improvements

- iOS install guidance.
- Dedicated mobile bottom navigation.
- Patient-linked offline visit drafts with explicit sync/review step.
