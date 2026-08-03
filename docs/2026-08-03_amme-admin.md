# AMMÉ admin on VisionDrive

Date: 2026-08-03

## URL

- App: `/amme` → `https://visiondrive.ae/amme`
- Login: `/amme/login`
- Static HTML demo (legacy): `/amme/index.html`

## Credentials (Tasha)

Set via env / seed (`npm run db:seed-amme`):

- Email default: `tasha@amme.visiondrive.ae`
- Password default: `AmmeTasha#2026Kp`

See also `~/Desktop/Tasha/AMME-доступ.md`.

## Deploy checklist

1. Merge/push VisionDrive
2. `npx prisma db push` against production DB (reachable host)
3. `npm run db:seed-amme` with production env
4. Open `/amme/login`

## Stack slice

- Prisma models: `AmmeVenue`, `AmmeMenuItem`, `AmmeBooking`, `AmmeVisit`, `AmmeTab`, `AmmeLine`, `AmmeAuditEvent`, `AmmeStaffProfile`
- Auth: JWT cookie + `portal=amme` (same pattern as clinic)
- UI: dark hospitality shell (slate / ember / sage), dashboard + bookings + guests/POS + kitchen + report
