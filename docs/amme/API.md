# AMMÉ — бизнес-цепочка и API

Дата: 2026-08-03

## Цепочка

```
Запись (WAITING)
  → Пришёл → Visit + Tab (+ строка бани если banya)
  → Меню → Line DRAFT → (6с / Сейчас) → SENT
  → Кухня «Отдано» → DONE
  → Оплатить → paidAt
  → Закрыть счёт → closedAt (визит закрывается, когда все счета закрыты)
  → Отчёт / CRM stats
```

Walk-in пропускает шаг записи.

---

## Auth

| Route | |
|---|---|
| `POST /api/amme/auth/login` | email + password → cookies `authToken` + `portal=amme` |
| `POST /api/amme/auth/logout` | сброс cookies |
| `GET /api/amme/me` | текущий staff |

---

## State / Report / CRM

| Route | |
|---|---|
| `GET /api/amme/state?day=YYYY-MM-DD` | venue, menu, bookings, visits, kitchen, audits, guests |
| `GET /api/amme/report?day=&range=today\|7d\|30d\|custom&from=&to=` | выручка, avg, food/banya, top, daily, hourly, noshow |
| `GET/POST /api/amme/crm` | см. AMME-CRM.md |
| `GET/POST /api/amme/manage` | capacity, waitlist, deposits, KDS stations, inventory, recipes, packages, RFM, shifts, workflows, BI |
| `GET /api/amme/events` | SSE domain-event stream for KDS and live operations |
| `GET/POST /api/amme/public/booking` | public availability and capacity-safe booking |

---

## Actions (`POST /api/amme/action`)

Всегда возвращает свежий state (кроме ошибок).

| type | Поля | Эффект |
|---|---|---|
| booking_create | time, name, guests, banya, phone?, note?, resourceId?, depositAmount?, depositStatus?, day | capacity-safe запись + CRM guest |
| import | text, mode append\|replace, day | парсинг списка |
| arrive | bookingId | визит + счёт |
| noshow / unmark | bookingId | неявка / вернуть |
| toggle_banya | bookingId | только WAITING |
| walkin | name, guests, banya, phone? | визит без записи |
| add_dish | tabId, menuCode | строка DRAFT (цена копируется) |
| bump | lineId, delta | qty / cancel |
| send | tabId | DRAFT → SENT |
| done | lineId | SENT → DONE |
| move | lineIds, targetTabId? / newTabForVisitId? | перенос / новый счёт |
| pay | tabId, paymentMethod | payment ledger + paidAt + CRM stats |
| close | tabId | closedAt; неоплаченный счёт закрыть нельзя |
| end_banya | visitId | banyaEndedAt |
| menu_update | menuCode, price?, name?, active? | меню |

---

## Пять правил учёта (не ломать)

1. Цена копируется в строку при заказе.
2. Перенос = смена tabId + audit.
3. Soft-delete (статусы), не hard delete.
4. Готовность на строке.
5. Баня — обычная строка в том же счёте.

---

## RBAC

- `KITCHEN`: state + KDS send/done only
- `ADMIN`: bookings, visits, payments, CRM, report, inventory
- `OWNER`: full control including menu, settings, stations, packages, workflows and staff
- `AmmeStaffProfile.permissions` supports explicit overrides.

## Prisma models

Core: `AmmeVenue` · `AmmeGuest` · `AmmeMenuItem` · `AmmeBooking` · `AmmeVisit` · `AmmeTab` · `AmmeLine`.

Management: `AmmeResource` · `AmmeBookingResource` · `AmmeWaitlistEntry` · `AmmePayment` · `AmmeKdsStation` · `AmmeInventoryItem` · `AmmeRecipeItem` · `AmmeStockMovement` · `AmmePackage` · `AmmeGuestPackage` · `AmmeGiftCard` · `AmmeShift` · `AmmeShiftNote` · `AmmeOutboundMessage` · `AmmeAutomation` · `AmmeDomainEvent`.
