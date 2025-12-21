# 11. Action Plan (Build Order + Deliverables)

This is the actionable execution plan for the VisionDrive portal and services.

**Principle:** ship a working operator portal early using simulated data, then swap in real LoRaWAN uplinks when gateways arrive.

## 11.1 Phase A — Foundation (multi-tenant + data model) [Week 1]

- ✅ Add tenant model: tenants, memberships, roles (MASTER_ADMIN, CUSTOMER_ADMIN, CUSTOMER_OPS, CUSTOMER_ANALYST)
- ✅ Add core entities: sites, zones, bays, sensors, gateways, weather via SensorType.WEATHER
- ✅ Add timeseries: sensor_events hypertable (Timescale) + indexes for time + tenant/site
- ✅ Tenant groundwork: include `tenantId` in auth responses/token payload so APIs can enforce tenant scope
- ✅ Audit log table: record admin/operator changes (bindings, thresholds, overrides, users)

See: `11.1-foundation.md`

## 11.2 Phase B — Simulated Data Ingestion (gateway not required) [Week 1–2]

- [ ] Build `/api/replay/upload`: upload JSON/CSV “uplink logs” → validate → store in `sensor_events`
- [ ] Build `/api/replay/run`: replay by time range + speed (1x/10x/100x) → publish realtime updates
- [ ] Build decoder bench: paste payload → decode preview → save event
- [ ] Add dead-letter view for invalid payloads/decoding failures

## 11.3 Phase C — Operator Portal MVP (customer view) [Week 2–3]

- [x] `/portal` dashboard: KPI cards + trends + alerts summary (tenant-scoped)
- [x] `/portal/map`: live bay colors (Green/Red/Gray) + last update + confidence
- [x] `/portal/sensors`: list + details page (health + events + maintenance notes)
- [x] `/portal/events`: timeseries viewer with filters + export (CSV)
- [x] `/portal/admin`: user management (customer admin) + tenant settings (thresholds)
- [x] Map rendering (Portal): Mapbox GL JS with bay polygons/markers + clustering + layer toggles (bays/sensors/zones)

See: `11.3-operator-portal-mvp.md`

## 11.4 Phase D — Hardware Health + Alerts System [Week 3–4]

- [ ] Implement health score + days-in-use + battery drain + signal quality (RSSI/SNR)
- [ ] Alerts pipeline: generate alerts (offline, low battery, poor signal, flapping, decode errors)
- [ ] Alerts UI: queue + acknowledge/assign/resolve + SLA timers + audit trail

## 11.5 Phase E — Master Admin Portal (global view + drilldown) [Week 4–5]

- [ ] Global map: all sites, status clusters, filters (tenant/city/health)
- [ ] Cross-tenant KPIs: sensors online/offline, events/min, top failing sites/sensors
- [ ] Drilldown: tenant → site → zone → bay → sensor (same customer UI, enhanced)
- [ ] `/portal/admin/tenants`: create/disable tenants, manage customer admins

## 11.6 Phase F — Analytics/Reporting (hardware + occupancy) [Week 5–6]

- [ ] Sensor performance reports (rankings + trends + period comparisons)
- [ ] Gateway units overview + coverage panels
- [ ] Network overview graph (nodes + edges) + map pinning (optional, after MVP)
- [ ] Exports + scheduled reports (weekly/monthly)

## 11.7 Phase G — Finance (Master Admin) [Week 6+]

- [ ] Integrate app billing metrics (subscriptions, payments, churn, MRR/ARR) via Stripe
- [ ] Add expenses tracking (cloud + vendors + hardware ops) → net margin + unit economics

## 11.8 Phase H — Swap Simulation → Real LoRaWAN [When gateway arrives]

- [ ] Implement `/api/iot/uplink` webhook + decoder pipeline + validation
- [ ] Keep replay tools for demos, QA, and disaster recovery (rebuild state from raw events)


