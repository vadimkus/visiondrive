# Iryna — iPad-first practice flows

This document describes the intended **staff** workflows on a tablet (Safari / Chrome on iPad). Arabic UI is available via the **language toggle** in the practice sidebar (English / العربية).

## Returning patient

1. Open **Patients**.
2. Use the **search** field (name, phone, or email).
3. Tap the patient row → **patient record**.
4. Read **What to do next** (scheduled appointment, last visit **next steps**, internal staff notes).
5. Switch to **Timeline** to see appointments, visits, payments, and CRM in one chronological list; use **filter chips** (All / Appointments / Visits / Payments / CRM) to narrow.

## Same-day visit

1. On the patient record → **Overview** → **Log a visit** (time, complaint, procedure summary, **next steps**, staff notes).
2. Open **Photos** → choose **Before** or **After** → link to today’s visit if needed → **take or choose photo** (rear camera via `capture="environment"` where the browser allows).
3. Open **Payments** to record amount, method, and optional link to the visit.
4. Open **CRM** to log WhatsApp / call / note for future reference.

## Schedule or reschedule

1. **Appointments** → week **calendar** (Mon–Sun). Use **previous / next week** or **Today**.
2. Tap a block → **edit** status, time, procedure, internal notes.
3. **New appointment** from the list header or dashboard quick actions.

## Account

- **Account** in the sidebar: display name and **change password** (requires current password).

## Accessibility / touch

- Primary nav and filters aim for **≥44px** touch targets (`min-h-11` patterns).
- Loading states use `role="status"` / `aria-live` where appropriate on shared spinners.

## Limitations (current)

- Photo storage is **in-database** (Postgres `BYTEA`); large galleries may eventually move to object storage.
- Full **RTL** layout for every sub-screen may still need polish; shell and key flows respect `dir="rtl"` when Arabic is selected.
