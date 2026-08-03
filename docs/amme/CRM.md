# AMMÉ — CRM

Дата: 2026-08-03

Опора на hospitality CRM-паттерны (unified guest profile, сегменты, заметки для фронт-деска), адаптировано под баню + кухню. Без email/SMS-автоматизации в v1.

---

## Зачем

Раньше «гость» = просто строка имени на визите.  
Теперь один человек = одна карточка на все визиты.

На смене видно: VIP, повторный гость, заметка, «осторожно», диета.

---

## Модель

`AmmeGuest` связан с `AmmeBooking` и `AmmeVisit` через `guestId`.

| Поле | Смысл |
|---|---|
| name, phone, phoneNorm | Идентичность (телефон = сильный ключ) |
| notes, preferences, dietary | Для смены |
| tags[] | VIP, Постоянный, Аллергия, Веган, … |
| birthday, source, language | Опционально |
| visitCount, noshowCount | Поведение |
| lifetimeSpend, avgSpend | Деньги |
| firstVisitAt, lastVisitAt | Даты |
| banyaPref, vip, blocked | Флаги |

Авто-VIP: **5+ визитов** или **LTV ≥ 5 000 000 IDR**.

---

## Сегменты в UI

| id | Условие |
|---|---|
| all | вся база |
| vip | vip / тег VIP |
| regular | visitCount ≥ 3 |
| new | visitCount ≤ 1 |
| dormant | был визит, lastVisit > 30 дней назад |
| banya | banyaPref |
| high | lifetimeSpend ≥ 2M IDR |
| noshow | noshowCount ≥ 1 |
| blocked | blocked / тег «Осторожно» |

---

## Когда создаётся профиль

- Ручная запись (`booking_create`)
- Импорт списка
- Приход (`arrive`), если ещё не привязан
- Walk-in (лучше с телефоном)
- Ручное «+ Гость» в CRM

Без телефона каждый walk-in может создать отдельную карточку — телефон обязателен для склейки.

---

## API

`GET /api/amme/crm?q=&segment=` — список + summary  
`GET /api/amme/crm?id=` — карточка + история визитов  
`POST /api/amme/crm` body:

```json
{ "type": "create", "name": "…", "phone": "…", "notes": "…", "vip": false }
```

```json
{ "type": "update", "guestId": "…", "notes": "…", "tags": ["VIP"], "vip": true, "blocked": false, "dietary": "…" }
```

Stats пересчитываются на `pay` / `close`.

---

## UI

- Сайдбар: **CRM**
- На записях / счетах: бейджи VIP, N×, осторожно, 📝
- В чеке: LTV, визиты, заметка, кнопка «CRM →»
- Walk-in: поле телефона

Справка в приложении: статья «CRM: профили гостей».

---

## Скрипты

```bash
npm run db:backfill-amme-crm   # привязать старые записи
npm run test:amme-e2e          # цепочка + CRM на проде
```

Код: `lib/amme/crm.ts`, `lib/amme/crm-shared.ts`, `app/amme/CrmView.tsx`, `app/api/amme/crm/route.ts`
