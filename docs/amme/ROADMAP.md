# AMMÉ — Product Architecture & Roadmap to Spa+F&B Control Platform

**Date:** 2026-08-03  
**Authors:** Product / systems audit against VisionDrive codebase + hospitality benchmarks (Zenoti, Mangomint, Boulevard, Book4Time/Trybe patterns, Toast/Square KDS+POS, Mindbody)  
**Live product:** https://visiondrive.ae/amme  
**Code root:** `~/VisionDrive` (`app/amme`, `lib/amme`, `app/api/amme`, Prisma `Amme*`)

---

## 1. Executive summary (1 page)

AMMÉ today is a **strong Layer-A shift OS**: booking list → arrive → visit/tab → kitchen send → pay/close → owner report, plus a **phone-keyed CRM** with LTV, tags, notes, and segments. The end-to-end ops chain is proven on production (`npm run test:amme-e2e`).

It is **not yet** a management platform. Best-in-class spa + hybrid F&B systems (Zenoti / Mangomint / Boulevard + restaurant KDS) win on:

1. **Resource-based capacity** (banya zones, heat/turnover, hard caps) — AMMÉ has only `banya: boolean`
2. **Real-time ops** — AMMÉ polls every **20s**; kitchen sees orders late
3. **Guaranteed money** — deposits, no-show fees, prepaid packages — **absent**
4. **Role-safe multi-staff** — `AmmeStaffRole` is stored but **not enforced** on API
5. **Owner BI** — utilization, RevPAH, RFM/cohorts, staff productivity — **absent** (have revenue / avg tab / food-per-banya-guest)
6. **Automation** — WhatsApp/SMS reminders, waitlist fill — deferred Layer B

**6–12 month vision:** AMMÉ becomes the single system of record for Sunday banya + weekday restaurant: predictable occupancy, CRM-driven retention, kitchen that never loses a ticket, and an owner dashboard that answers “are we full, making money, and bringing guests back?” without spreadsheets.

**North-star product bet (do not dilute):** keep the five accounting rules and the unique metric **food Rp per banya guest**. Expand around capacity + CRM + real-time + owner control — do not become a generic hotel PMS.

**Immediate P0 (1–2 sprints):** role gates, kitchen poll ≤5s or SSE, station-split KDS, capacity model for banya sessions, fix avg-check / close-auto-pay / Bali timezone, deposit flag on booking, RFM score fields, owner “utilization today” strip.

---

## 2. Current architecture & functional map

### 2.1 Runtime topology

```
Browser PWA (/amme)
  └─ AmmeApp.tsx (monolith SPA, ~2k LOC) + CrmView.tsx
       │  poll GET /api/amme/state every 20s
       │  mutate POST /api/amme/action → full state echo
       │  CRM GET/POST /api/amme/crm
       │  report GET /api/amme/report
       ▼
JWT cookie authToken + portal=amme
  └─ getAmmeSession() → User + AmmeVenue(tenantId) + AmmeStaffProfile
       ▼
Postgres (Timescale) via Prisma
  AmmeVenue 1──* Booking / Visit / Guest / Menu / Audit
  Booking 1──0..1 Visit 1──* Tab 1──* Line
  Guest 1──* Booking, Visit
```

**Key files**

| Layer | Path |
|---|---|
| UI shell | `app/amme/AmmeApp.tsx`, `app/amme/CrmView.tsx`, `app/amme/amme.css` |
| Action bus | `app/api/amme/action/route.ts` → `lib/amme/service.ts` |
| CRM | `lib/amme/crm.ts`, `app/api/amme/crm/route.ts` |
| Session | `lib/amme/session.ts` |
| Schema | `prisma/schema.prisma` (`Amme*` ~2472+) |
| Knowledge | `lib/amme/knowledge.ts` |

### 2.2 End-to-end flow (as implemented)

```
WAITING booking (date + at + name + guests + banya + phone?)
  → resolveGuest(phoneNorm)  [crm.ts]
  → arrive → Visit + Tab(+ BANYA line DONE if banya)
  → add_dish → Line DRAFT (price copied)
  → send (6s UI timer or Сейчас) → SENT + sentAt
  → kitchen done → DONE + doneAt
  → pay → paidAt + recomputeGuestStats
  → close → closedAt (+ silently sets paidAt if missing)
  → if all tabs closed → Visit.closedAt
```

Walk-in skips booking. Import parses free text into WAITING rows.

### 2.3 Surfaces vs reality

| UI label | Reality |
|---|---|
| Дашборд | KPI cards + open visits + last 12 audits |
| Записи | Day booking list, import, manual create |
| Счета (sidebar “Счета”, was “Гости”) | Active visits POS + menu + receipt |
| CRM | Profiles, segments, notes, history |
| Кухня | Unified SENT queue + urgency colors |
| Отчёт | Paid-tab aggregates, charts, print |
| Меню | Price/name/active editor |
| Справка | Static RU articles |

### 2.4 What already matches industry (keep)

- Price copied into line at order time (POS correctness)
- Soft cancel + audit trail (partial)
- Split tabs / move lines
- Banya as billable line in same check (hybrid spa+F&B differentiator)
- Guest profile with LTV / visitCount / tags / dietary / notes (CRM v1)
- Food-per-banya-guest metric (`perGuest` in `getReport`)

---

## 3. Gap analysis vs best practices 2025–2026

Benchmarks: Zenoti (resource scheduling, multi-location BI), Mangomint (boutique UX + packages), Boulevard (memberships, SMS), Toast/Square (KDS stations, COGS), Mindbody/Book4Time (capacity, waitlist).

| Capability | Best practice | AMMÉ now | Gap severity |
|---|---|---|---|
| Resource scheduling | Book provider **and** room/zone with turnover | `banya` boolean only | **P0** |
| Capacity / occupancy | Hard cap + live occupancy | No max; open book | **P0** |
| Real-time KDS | Push / ≤3–5s; station screens | 20s poll; one queue | **P0** |
| Role permissions | Kitchen ≠ can close cash | Role decorative | **P0** |
| Deposits / no-show fee | Hold or prepaid to protect Sunday | None | **P0** |
| Online booking + waitlist | Public book + auto-fill cancel | Manual/import only | **P1** |
| Reminders WA/SMS | T-24h / T-2h | None | **P1** |
| CRM 360° + RFM | Composite score + automations | Segments only | **P1** |
| Packages / memberships | Prepaid sessions | None | **P1** |
| Inventory / COGS | Recipe + stock | None | **P2** |
| Advanced BI | Utilization, RevPAH, cohorts | Revenue / avg tab | **P1** |
| Staff scheduling | Demand-led shifts | None | **P2** |
| Multi-location | Shared CRM + rollup | `tenantId` **@unique** = 1 venue | **P2** |
| Workflow automation | Event → action | Audit log only | **P1** |
| Gift cards | Balance ledger | None | **P2** |
| Tablet/kitchen UX | Dedicated layouts, sound | Shared SPA | **P1** |

### 3.1 Technical debt that blocks “management grade” (cite)

1. **No role enforcement** — `app/api/amme/action/route.ts` switch has zero `staffRole` checks; kitchen JWT can `pay`/`menu_update`.
2. **20s poll** — `AmmeApp.tsx` `setInterval(..., 20000)`; unacceptable for KDS.
3. **Avg check misleading** — `getReport` `avg = rev / tabsPaid` (per tab, not per visit).
4. **`closeTab` auto-pays** — `paidAt: tab.paidAt ?? new Date()` inflates “paid” revenue.
5. **Bali timezone** — `createManualBooking` / `importBookings` use server-local `setHours` (Vercel ≈ UTC) → slots shift.
6. **Station unused in UI** — `AmmeLine.station` exists; Kitchen ignores it.
7. **Audit holes** — `toggle_banya`, `bump` write no audit.
8. **No capacity conflict check** on booking create/import.
9. **CRM summary full scan** — `listGuests` loads all guests for segment counts.
10. **Monolith UI** — `AmmeApp.tsx` hard to evolve tablet kitchen vs admin.
11. **`AmmeStaffProfile` / `actorId` without Prisma FK** — orphan risk.
12. **Multi-venue blocked** by `AmmeVenue.tenantId @unique`.

---

## 4. Vision (6–12 months)

**For the admin (Таша):** one tablet for the door — see who is coming, who is late, whether the banya is full, open the bill in one tap, never lose a kitchen ticket, see VIP/allergy before greeting.

**For the kitchen:** station screen (Кухня / Бар) with sound on new ticket, timers, clear Done; no need to scroll guest POS.

**For the owner:** Sunday utilization %, Rev per available banya-hour, no-show rate with deposit recovery, repeat guest %, food attach rate, cohort of “came once / came back in 30d”.

**Product name positioning:** not “another POS” — **Banya + Kitchen Control System** with CRM that pays for itself via fewer no-shows and higher food attach.

---

## 5. Prioritized roadmap

### P0 — Control & trust (1–2 sprints) · High effect / Medium effort

| # | Feature | Concrete change | Effort | Business effect |
|---|---|---|---|---|
| P0.1 | **RBAC on API** | Gate actions: KITCHEN=`done`/`send` read-only others; ADMIN=ops; OWNER=report+CRM+menu. In `action/route.ts` + `crm/route.ts` | S | Prevent cash/menu accidents |
| P0.2 | **KDS freshness** | SSE `GET /api/amme/events` or poll 3–5s on kitchen view only; optional Web Audio beep on new SENT | M | Kitchen reliability |
| P0.3 | **Station routing** | Filter Kitchen by `station`; seed stations Кухня/Бар; optional `?station=` | S | Parallel stations |
| P0.4 | **Banya capacity model** | New `AmmeResource` + `AmmeSlot` OR fields on Venue: `banyaCapacity`, `sessionMinutes`, `turnoverMinutes`; reject booking when Σguests in window > capacity | M | Stop overbooking |
| P0.5 | **Live occupancy strip** | Dashboard: `inBanyaNow / capacity`, `waiting`, `eta next free` | S | Manager control |
| P0.6 | **Deposit on booking** | `AmmeBooking.depositAmount`, `depositStatus` ENUM NONE/HELD/PAID/FORFEIT/REFUNDED; UI + report | M | No-show protection |
| P0.7 | **Fix money truth** | Separate close vs pay; avg = rev/visitsPaid; Bali TZ via `Asia/Makassar` helper | S | Trust reports |
| P0.8 | **Audit completeness** | Audit `bump`, `toggle_banya`, `cancel`; store actor display name | S | Handover / dispute |

### P1 — Growth engine (1–3 months)

| # | Feature | Concrete change | Effort | Effect |
|---|---|---|---|---|
| P1.1 | **Public booking + waitlist** | `/amme/book` public page; `AmmeWaitlistEntry`; promote on cancel | L | Fill Sundays |
| P1.2 | **WhatsApp reminders** | Outbox table `AmmeMessage`; provider (Twilio/WA Cloud); triggers T-24h, T-2h | L | ↓ noshow |
| P1.3 | **RFM + auto-tags** | Persist `rScore,fScore,mScore,rfmSegment`; nightly job; segments in CRM | M | Retention targeting |
| P1.4 | **Packages / prepaid** | `AmmePackage`, `AmmeGuestCredit`; redeem on arrive | L | Cashflow + loyalty |
| P1.5 | **Owner BI pack** | Utilization %, RevPAH, attach rate, retention 30/60/90, by weekday | M | Decisions without Excel |
| P1.6 | **Workflow engine v0** | `AmmeAutomation`: on `noshow` → tag; on `close` → ask review WA; on birthday → VIP note | M | Ops leverage |
| P1.7 | **Split admin / kitchen apps** | Routes `/amme` vs `/amme/kitchen` dedicated layouts | M | Tablet UX |
| P1.8 | **Payment methods** | `AmmePayment` rows (cash/QRIS/card/transfer); tip; partial pay | M | Reconciliation |

### P2 — Scale & depth (3–12 months)

| # | Feature | Notes |
|---|---|---|
| P2.1 | Inventory + COGS | `AmmeIngredient`, recipe on menu, deduct on DONE |
| P2.2 | Staff roster + utilization | Link shifts to demand report |
| P2.3 | Multi-venue | Drop `@unique` on tenantId; venue picker |
| P2.4 | Gift cards | Ledger balances |
| P2.5 | Event sourcing projection | Append-only `AmmeDomainEvent` + read models |
| P2.6 | Thermoprinter / ESC-POS | Kitchen ticket print |
| P2.7 | Offline PWA queue | IndexedDB outbox for flaky Wi‑Fi |

---

## 6. Feature blocks — exact proposals

### 6.1 Записи + capacity

**New models**

```prisma
model AmmeResource {
  id        String @id @default(cuid())
  venueId   String
  code      String   // "BANYA_MAIN", "BANYA_PRIVATE"
  name      String
  kind      String   // BANYA | TABLE | ROOM
  capacity  Int
  active    Boolean @default(true)
  @@unique([venueId, code])
}

model AmmeBookingResource {
  bookingId  String
  resourceId String
  guests     Int
  startsAt   DateTime @db.Timestamptz(6)
  endsAt     DateTime @db.Timestamptz(6)
  @@id([bookingId, resourceId])
}
```

**Service rule:** before `booking_create` / `import` / `arrive` for banya — query overlapping resource bookings; if `Σguests + new > capacity` → 409 with alternatives (waitlist).

**UI:** Записи calendar density bar; red when ≥90% capacity; Sunday session mode toggle (`Venue.banyaMode = SESSION | SLOT`).

### 6.2 Гости + CRM

**Add to `AmmeGuest`:** `rScore Int`, `fScore Int`, `mScore Int`, `rfmSegment String?`, `lastContactAt`, `consentWa Boolean`, `marketingOptIn Boolean`.

**RFM job (nightly):** Recency buckets on `lastVisitAt`, Frequency on `visitCount`, Monetary on `lifetimeSpend` percentiles within venue → segment `Champions|Loyal|AtRisk|Hibernating|New`.

**360° CRM screen sections:** Profile · Visits timeline · Spend chart · Preferences · Messages · Packages balance · Risk flags.

**Auto-tags:** `noshow≥2` → tag Осторожно; `visitCount≥3` → Постоянный; birthday within 7d → badge on booking row.

### 6.3 Операционный флоу смены

**Dashboard v2 widgets**

1. Occupancy: `inBanya / capacity` + progress
2. Pipeline: Waiting | In house | Kitchen open | Unpaid
3. Alerts: late >15m, kitchen hot ≥10m, blocked guest arriving
4. Shift journal with actor **names** (join User), filter by action
5. Handover note: `AmmeShiftNote` per day (text + author)

**Events to add:** `deposit_paid`, `capacity_block`, `waitlist_promoted`, `reminder_sent`, `shift_handover`.

### 6.4 Кухня и заказы

- Route `/amme/kitchen?station=Кухня` full-bleed, large Done buttons
- SSE channel `kitchen:{venueId}` payload `{type:'line_sent', line}`
- Priority: VIP visit lines sort first; then sentAt
- Statuses: keep DRAFT/SENT/DONE; add `HELD` (fire later) optional
- Bump qty after SENT → send `delta` ticket (new line or audit “qty_mod”)

### 6.5 Отчётность владельца

New `getOwnerReport()` metrics:

| KPI | Formula |
|---|---|
| Banya utilization | `banyaGuestMinutes / (capacity × openMinutes)` |
| RevPAH | `banyaRev / availableBanyaHours` |
| Attach rate | `% banya visits with ≥1 FOOD line` |
| No-show rate | `bkNo / bkAll` |
| Deposit recovery | `forfeit / held` |
| Repeat 30d | guests with ≥2 visits in 30d / guests with ≥1 |
| Avg check (visit) | `rev / visitsPaid` |
| Segment ARPU | LTV / count by rfmSegment |

Export CSV for accountant.

### 6.6 Автоматизации

Table `AmmeAutomation { trigger, conditions Json, actions Json, active }`.

v1 triggers: `booking_create`, `noshow`, `close_tab`, `guest_birthday`.  
v1 actions: `send_wa_template`, `add_tag`, `create_task` (shift note).

Outbox: `AmmeOutboundMessage { channel, to, body, status, providerId }`.

### 6.7 Техническая архитектура

**Short term (keep action bus):**  
`POST /action` + **SSE fanout** after mutation; clients subscribe.

**Medium term:** introduce `AmmeDomainEvent` append-only:

```
{ id, venueId, type, aggregateType, aggregateId, payload Json, actorId, createdAt }
```

Projectors update Visit/Tab/Guest read models. Audit UI reads from domain events (single taxonomy).

**Real-time:** Vercel-friendly path = SSE on Node route or Ably/Pusher if scale; avoid WS sticky sessions first.

**Data quality:** `lib/amme/time.ts` with `TZ=Asia/Makassar`; never `setHours` on bare `Date` in UTC runtime.

---

## 7. Quick wins (1–2 sprints) — ship order

1. RBAC middleware on action/crm/report  
2. Kitchen poll 4s + station tabs  
3. Venue fields: `banyaCapacity`, `timezone`  
4. Occupancy on dashboard  
5. Fix avg check + forbid silent pay-on-close (require explicit pay or `comp` reason)  
6. Bali timezone helper  
7. Deposit amount + status on booking form  
8. Audit bump/toggle  
9. Split `/amme/kitchen` route (reuse state)  
10. Owner report tile: utilization + noshow %

---

## 8. Success metrics (prove the upgrade)

| KPI | Baseline (define week 0) | 90-day target |
|---|---|---|
| No-show rate (Sunday) | measure | −30% relative with deposits+reminders |
| Banya utilization (peak window) | measure | 75–85% (Zenoti staff util analogy adapted to seats) |
| Food attach rate on banya visits | measure | +15 pp |
| Kitchen ticket >10m (hot) share | measure | <10% of tickets |
| Repeat guest rate 30d | measure | +20% relative |
| Time-to-open-bill after arrive | qualitative | <15s |
| Owner weekly decisions without Excel | 0 | 1 dashboard review |

---

## 9. UI/UX recommendations (screen-level)

### Записи
- Density heat strip by hour  
- Capacity chip `12/20`  
- Deposit badge  
- Drag to reschedule (with conflict check)  
- Late auto-suggest “Call / WhatsApp / Noshow”

### Счета / чек
- Larger VIP / allergy banner (already partial)  
- Suggested upsell chips from CRM prefs (“пельмени”, “чай”)  
- Payment method picker before pay  
- Disable close until pay or explicit “comp”

### Кухня
- Full-bleed dark; 2 columns; sound toggle  
- Filter station chips  
- Tap-anywhere Done  

### CRM
- RFM matrix view (not only list filters)  
- “Win-back” list = dormant + high LTV  
- One-click WhatsApp deep link `https://wa.me/{phoneNorm}`

### Дашборд
- Replace vanity with control: occupancy, unpaid total, kitchen hot count, today’s Rev vs last Sunday  

### Отчёт
- Toggle Visit vs Tab average  
- Utilization chart  
- Print “Owner pack” (1 page)

---

## 10. Risks & dependencies

| Risk | Mitigation |
|---|---|
| Admin refuses extra clicks (deposit, capacity) | Defaults + import still works; capacity soft-warn then hard-block |
| WhatsApp ToS / cost | Start with manual wa.me links; automate later |
| Overbuilding inventory before ops solid | Keep P2 |
| Timescale/TLS quirks | Keep `lib/db-tls.ts`; document in runbook |
| Single monolith file growth | Extract Kitchen/Bookings/Reports modules before P1.7 |
| Owner wants Telegram Layer B early | Only after P0 capacity + deposits |
| Legal guest data (PDPA/privacy) | consent flags + export/delete on Guest |

**Dependencies to close with owner (from original TZ):** Sunday SESSION vs SLOT; weekday restaurant lists; pilot price; admin adoption (stop parallel Notes).

---

## 11. Recommended sequencing diagram

```
Sprint 1–2 (P0): RBAC · KDS freshness/stations · capacity+occupancy · money truth · deposits · audit
Sprint 3–4 (P1 start): public book/waitlist · WA reminders · RFM · owner BI
Sprint 5–8: packages · automations · payment methods · kitchen route polish
Q2–Q3: inventory · multi-venue · event sourcing · gift cards
```

---

## 12. Appendix — audit action taxonomy (current)

`arrive` · `noshow` · `unmark_noshow` · `walkin` · `add_line` · `send_kitchen` · `line_done` · `move_lines` · `pay` · `close_tab` · `end_banya` · `import_bookings` · `booking_create` · `menu_update` · `guest_update`  
**Missing audits:** `bump`, `toggle_banya`

---

*Canonical copy: `~/Desktop/Tasha/AMME-roadmap-spa-fb-2026.md` · mirror: `VisionDrive/docs/amme/ROADMAP.md`*
