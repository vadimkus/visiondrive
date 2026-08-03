# AMMÉ — код в VisionDrive

Репозиторий: `~/VisionDrive`  
Прод: деплой Vercel проекта `visiondrive`

---

## UI

| Путь | |
|---|---|
| `app/amme/page.tsx` | RSC guard |
| `app/amme/login/page.tsx` | логин |
| `app/amme/layout.tsx` | layout + fonts |
| `app/amme/AmmeApp.tsx` | основная SPA (дашборд…справка) |
| `app/amme/CrmView.tsx` | экран CRM |
| `app/amme/amme.css` | тема hospitality |

---

## API

| Путь | |
|---|---|
| `app/api/amme/auth/login/route.ts` | login |
| `app/api/amme/auth/logout/route.ts` | logout |
| `app/api/amme/me/route.ts` | me |
| `app/api/amme/state/route.ts` | state |
| `app/api/amme/action/route.ts` | все мутации |
| `app/api/amme/report/route.ts` | отчёты |
| `app/api/amme/crm/route.ts` | CRM |

---

## Lib

| Путь | |
|---|---|
| `lib/amme/service.ts` | бизнес-логика смены |
| `lib/amme/crm.ts` | CRM сервер |
| `lib/amme/crm-shared.ts` | сегменты/теги (клиент-безопасно) |
| `lib/amme/session.ts` | сессия amme |
| `lib/amme/menu.ts` | дефолт меню, SEND_DELAY |
| `lib/amme/money.ts` | IDR / day helpers |
| `lib/amme/knowledge.ts` | статьи справки |
| `lib/db-tls.ts` | TLS для Timescale |

---

## DB / scripts

| Путь / команда | |
|---|---|
| `prisma/schema.prisma` | модели Amme* |
| `npm run db:seed-amme` | сид venue + Tasha |
| `npm run db:backfill-amme-crm` | привязка старых визитов |
| `npm run test:amme-e2e` | e2e на проде |
| `scripts/seed-amme.ts` | сид |
| `scripts/backfill-amme-crm.ts` | backfill |
| `scripts/test-amme-e2e.ts` | e2e |

---

## Docs в репо

- `docs/amme/README.md` — зеркало индекса
- `docs/2026-08-03_amme-admin.md`
- `docs/2026-08-03_amme-crm.md`
- `al-futtaim/notes/2026-08-03_amme-*.md` — рабочие заметки сессий

Эта папка на Desktop (`~/Desktop/Tasha`) — **источник для Таши и передачи**.
