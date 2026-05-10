# Practice OS Capability Index

Date: 2026-05-10

## Context

Vadim asked for `/clinic/knowledge-base` to show a clear list of what Practice OS can do, so any signed-in user opening the Knowledge Base can immediately understand the system scope.

## Implementation

The in-app Knowledge Base now includes a default-visible `What Practice OS can do` / `Возможности Practice OS` capability section in both EN and RU.

The section summarizes Practice OS across:

- Growth and acquisition.
- Booking and calendar.
- Patient CRM and records.
- Clinical and treatment workflow.
- Communication and retention.
- Finance, payments, and revenue.
- Inventory, retail, and suppliers.
- Mobile, portal, and patient experience.
- Analytics and management.
- Security, admin, and data safety.

## Product Decision

The capability list belongs inside the Knowledge Base rather than as a separate public marketing page for this step because `/clinic/knowledge-base` is the page the user referenced. It is visible by default, with a button to hide or show it, and the existing article search/category system remains below it.

## Key File

- `app/clinic/knowledge-base/page.tsx` — EN/RU capability arrays, show/hide button, and capability cards.
