# Clinic Availability + Knowledge Base

Date: 2026-04-26

Context: Implemented the first Altegio-inspired solo-practitioner follow-up: working hours, blocked time, and an availability engine. Also added a populated in-panel knowledge base for Practice OS users.

## Shipped

- Tenant-scoped availability rules:
  - weekday open/closed state
  - start/end working minutes
  - fixed booking interval
  - minimum lead time
- Tenant-scoped blocked time:
  - lunch/private/leave/training blocks
  - blocks are excluded from generated slots
- Availability slot engine:
  - combines working rules, blocked time, existing active appointments, service duration, and hidden buffers
  - returns candidate slots only; final booking still uses conflict-safe appointment creation
- Staff UI:
  - `/clinic/appointments/availability`
  - linked from `/clinic/appointments`
  - working-hour editor, blocked-time form/list, next-14-days slot preview
- Knowledge base:
  - `/clinic/knowledge-base`
  - new side-panel navigation tab
  - EN/RU article set covering appointments, availability, patients, photos/PDF, inventory, purchase orders, finance, reminders, and follow-ups

## Operational Notes

- Prisma schema changed. Run `npx prisma generate` and `npx prisma db push` on the target database before/with deployment.
- Slot generation currently assumes the clinic operational timezone is `Asia/Dubai`.
- Public booking is not exposed yet. This chunk creates the internal availability foundation needed for it.

## Next Best Follow-Up

- Build the private public-booking link on top of `GET /api/clinic/availability/slots`.
- Add service-specific availability windows only if Iryna needs different days/times per procedure.
