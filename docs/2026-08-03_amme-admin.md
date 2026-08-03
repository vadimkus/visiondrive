# AMMÉ admin on VisionDrive

Date: 2026-08-03 (updated: design + KB + reports)

## URL

- App: `/amme` → `https://visiondrive.ae/amme`
- Login: `/amme/login`
- Static HTML demo (legacy): `/amme/index.html`

## Credentials (Tasha)

Set via env / seed (`npm run db:seed-amme`):

- Email default: `tasha@amme.visiondrive.ae`
- Password default: `AmmeTasha#2026Kp`

See also `~/Desktop/Tasha/AMME-доступ.md`.

## Surfaces

| View | Purpose |
|---|---|
| Дашборд | KPIs, guests, kitchen queue, audit feed |
| Записи | bookings, import, manual create, arrive/noshow |
| Гости | POS: menu + receipt + banya strip + walk-in |
| Кухня | KDS with urgency timers |
| Отчёты | today / 7d / 30d / custom, charts, print |
| Меню | edit price/name, activate/deactivate |
| Справка | knowledge base how-to articles (RU) |

## Stack slice

- Prisma: `AmmeVenue`, `AmmeMenuItem`, `AmmeBooking`, `AmmeVisit`, `AmmeTab`, `AmmeLine`, `AmmeAuditEvent`, `AmmeStaffProfile`
- Auth: JWT + `portal=amme`
- Knowledge: `lib/amme/knowledge.ts` (static articles, no DB)

## Deploy checklist

1. Push VisionDrive
2. `npx prisma db push` on production DB
3. `npm run db:seed-amme`
4. Open `/amme/login`
