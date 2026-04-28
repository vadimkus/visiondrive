# Clinic Solo Practitioner Assignment

## Context

The next Altegio adaptation item was multi-staff "any professional" assignment. For the current solo home-visit product, this should not become a staff-routing system. The signed-in practitioner is the operational owner.

## Shipped

- Added a Solo practitioner mode panel to `/clinic/account`.
- Added EN/RU Knowledge Base guidance.
- Updated backlog, architecture, data model, chunks, and docs index.

## Behavior

The Account page now makes the operating model explicit:

- one signed-in practitioner owns appointments, visits, reminders, and follow-ups,
- assistant/admin help is represented as Assistant / support cost in Finance,
- availability and blocked time protect capacity,
- no "any professional" assignment or routing table is created.

## Deferred Until Needed

- Staff records for service delivery.
- Appointment assignee selection.
- "Any professional" slot search.
- Per-staff availability and calendars.
- Commission/payroll linkage.
