# Clinic Home Visit Route And Travel Buffer

Date: 2026-04-27

Context: implemented Altegio adaptation point 11 for solo practitioners who treat patients at home. The goal is to protect travel time and make the daily route visible from the schedule.

## What Shipped

- Patient records now store home address, area, and access/parking notes.
- Appointments snapshot visit location, area, notes, travel-before minutes, and travel-after minutes.
- Scheduling conflicts now use the expanded occupied window: travel before + clinical slot + service buffer + travel after.
- Appointment Day view shows a home-visit route card with ordered stops and Google Maps links.
- Patient create/edit, appointment create/edit, and appointment drawer expose the new fields in EN/RU.

## Validation

- `npm run db:generate`
- `npm run type-check`
- `npm run test`
- `npm run lint` (passes with existing `app/login/page.tsx` `<img>` warning)
- `npm run build` (passes with existing legacy metadata warnings)

Remaining before production: run `npm run db:push` against the target database because this adds patient and appointment columns.
