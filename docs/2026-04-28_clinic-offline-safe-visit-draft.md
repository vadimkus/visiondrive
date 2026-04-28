# Clinic offline-safe visit draft

## Context

Solo practitioners often write treatment notes during home visits where mobile signal is unstable. The dashboard already had a device-local scratchpad; this chunk turns the patient card visit form into a safer review-and-sync flow.

## Shipped

- Patient-card `Log a visit` autosaves clinical fields, treatment-plan link, and aftercare selection to `localStorage` under a patient-scoped key.
- The form shows online/offline status and the last local save time.
- The dashboard scratchpad can be imported into the selected patient visit draft, then cleared from the dashboard storage.
- Successful `POST /api/clinic/visits` clears the local draft. Failed sync keeps the local draft available for retry.
- Patient photo uploads that are attempted offline or fail due to connectivity are queued in IndexedDB with kind, caption, visit link, protocol checklist, and marketing-consent metadata.
- Queued photos can be synced individually or all at once from the Photos tab.
- Added EN/RU strings and a Knowledge Base article.

## Limits

- Drafts are local to the browser/device and are not visible to other devices.
- Authenticated route caching and background sync are still future work.
- There is no server-side draft list yet, so a lost device/browser storage means unsynced local drafts are gone.
