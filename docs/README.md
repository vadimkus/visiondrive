# VisionDrive Documentation

This folder contains **implementation documentation** aligned with `/notes` → **Section 11 (Action Plan)**.

## How to use these docs

- Each phase (e.g. **11.1**) has its own markdown file:
  - what we built
  - which files changed
  - how to apply/run it locally
  - verification steps
  - follow-ups / known limitations

## Documents

- `11-action-plan.md`: Working copy of Section 11, used as the delivery checklist.
- `11.1-foundation.md`: Phase 11.1 (multi-tenant + data model) implementation notes.
- `11.2-simulated-ingestion.md`: Phase 11.2 (simulated ingestion / decoder bench / dead letters) implementation notes.
- `11.3-operator-portal-mvp.md`: Phase 11.3 (operator portal MVP) implementation notes.
- `11.3.1-zone-selector-and-demo-seed.md`: Follow-up improvements: zone selector + zone filtering + deterministic demo seed + KPI clarity.
- `11.3.2-mapbox-portal-map.md`: Map rendering: Mapbox GL JS (bays/sensors/zones) + clustering + layer toggles.
- `11.3.3-map-interactions-filters-selection.md`: Map UX: click-to-select bay + highlight + auto-scroll details + filters.
- `11.3.4-dubai-pulse-zones-import.md`: Dubai Pulse static parking zones import (GeoJSON + tariff) + Mapbox overlay.
- `11.3.5-map-calibration-sensors.md`: Manual sensor placement correction page (drag & save) with 3D + satellite toggles.
- `11.3.6-calibration-ux-all-sensors-installed-only.md`: Calibration UX upgrades (all sensors overlay, installed-only=40, map doesn’t disappear, portal map uses sensor coords).


