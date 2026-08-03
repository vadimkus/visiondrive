# AMMÉ — статус продакшна

Дата: **2026-08-03**

## Вердикт

AMMÉ перестроена из shift-MVP в management platform: capacity scheduling, deposits and payment ledger, station KDS, CRM/RFM, packages, inventory/recipes/COGS foundation, staff handover, workflows and Owner BI. Additive schema applied to production Postgres without removing existing records.

Интерфейс полностью обновлён в системе **Tropical Nocturne**: тёплая Bali-inspired dark palette, editorial typography, responsive POS/KDS layouts, premium interaction states и мгновенный RU/EN i18n с сохранением выбора.

| | |
|---|---|
| URL | https://visiondrive.ae/amme |
| Login | https://visiondrive.ae/amme/login |
| Хостинг | Vercel (VisionDrive) |
| БД | Timescale Postgres (`tsdb`) |
| Ветка | `main` |
| Ключевые коммиты | `e2f8f93` admin · `1af2e3b` upgrade · `495dcea` CRM · `2a15df5` build fix |

---

## Management platform (3 Aug 2026)

- Server-side RBAC: `KITCHEN`, `ADMIN`, `OWNER` plus per-user permission overrides
- Hard capacity resources and overlap checks; old banya bookings backfilled
- Public online booking: `/amme/book`
- Waitlist and 25% deposit requirement on public bookings
- Separate payment ledger (cash, QRIS, card, transfer, package, gift card)
- Close no longer silently marks a tab paid
- Dedicated station KDS: `/amme/kitchen`, 4s fallback polling + SSE refresh + sound
- Inventory, recipe BOM, stock movements and automatic consumption on KDS DONE
- Packages/memberships and guest package assignment
- RFM scores and segments
- Shift opening and handover notes
- Workflow definitions and WhatsApp outbox
- Owner BI: utilization, RevPAH, food attach, repeat %, no-show %, deposit capture
- Bali timezone is explicit (`Asia/Makassar`)
- Append-only domain event stream plus audit trail

## Tropical Nocturne UI (3 Aug 2026)

- Design tokens: obsidian, charcoal, teak, ivory, sand, aged gold, terracotta, palm sage
- Component primitives: five button variants, cards, KPI cards, status pills, language switcher
- Cormorant Garamond display + Manrope operational body + IBM Plex Mono for time/money
- RU default and EN translation for all operational screens, CRM, management, KDS, public booking and knowledge articles
- Instant language switching without reload; persisted to `localStorage` and cookie
- Tablet POS remains two-column; mobile gets a floating bottom navigation and accessible logout
- Focus rings, pressed states, live status feedback and reduced-motion support
- Visual captures: `docs/amme/screenshots/`

## Что уже работает (operations)

### Операции смены

1. Записи на день (ручные + импорт текста)
2. Пришёл / не пришёл / вернуть
3. Walk-in без записи (с телефоном → CRM)
4. Визит → счёт → строки меню
5. Автоотправка на кухню (~6 сек) / «Сейчас»
6. Кухня: SENT → DONE, таймер срочности
7. Разделение счетов / перенос позиций
8. Оплата и закрытие счёта
9. Баня как строка + лента «баня сейчас»
10. Отчёты: сегодня / 7д / 30д / свой период, графики, печать
11. Редактор меню (цена, имя, active)
12. Справка (knowledge base на русском и английском)

### CRM (добавлено 3 авг)

- Единый профиль гостя (ключ = телефон)
- Заметки, теги, диета, ДР, VIP / осторожно
- LTV, число визитов, noshow, история
- Сегменты: VIP, постоянные, новые, спят 30д+, баня, high spend, noshow
- Бейджи на записях и счетах; алерт в чеке

---

## Проверка

Прогон `npm run test:amme-e2e`:

```
login → public availability → inventory/package/automation → capacity booking+guest
→ arrive → recipe → KDS send/done → QRIS payment ledger → close
→ CRM stats/update/history → package assignment → RFM + Owner BI
→ ok: true
```

- Production build: PASS
- TypeScript: PASS
- Unit/integration suite: **72 files / 248 tests PASS**
- Full AMMÉ E2E against local production build and production Postgres: PASS

---

## Инфра / БД

- Старый Timescale host умер (ENOTFOUND) — переключено на новый.
- Схема: `npx prisma db push`
- Сид админа: `npm run db:seed-amme`
- Backfill CRM по старым визитам: `npm run db:backfill-amme-crm` (уже гоняли: ~10 гостей)

TLS для Timescale: `lib/db-tls.ts` (relaxed SSL локально).

---

## Внешние интеграции

WhatsApp outbox and deposit records are implemented. Actual WhatsApp Cloud/Twilio credentials and payment-acquirer webhooks remain provider configuration, not an application-code gap.

---

## Локальный запуск

```bash
cd ~/VisionDrive
npx prisma db push
npm run db:seed-amme
npm run db:backfill-amme-crm   # опционально
npm run dev
# http://localhost:3000/amme/login
```

Прод-тест:

```bash
cd ~/VisionDrive
npm run test:amme-e2e
```
