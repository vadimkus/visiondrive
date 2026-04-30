# Clinic Lite Mode

Date: 2026-04-30

## Context

Practice OS now has a large feature surface after adding booking, CRM, payments, inventory, memberships, loyalty, marketing, reputation, analytics, and portal workflows. Solo practitioners need a low-friction daily mode that hides less frequent tools without removing access to the full product.

## What Shipped

- Added a persistent Lite Mode toggle in the clinic shell.
- Stored the preference per device with `localStorage` key `visiondrive-clinic-lite-mode`.
- Lite Mode desktop navigation shows only daily essentials:
  - Dashboard
  - Appointments
  - Patients
  - Inbox
  - Finance
  - Inventory
  - Smart waitlist
- Lite Mode mobile bottom tabs show:
  - Dashboard
  - Appointments
  - Patients
  - Inbox
  - Finance
- Full Mode remains one click away from the same shell toggle.
- Direct URLs to hidden tools still work. If a user is on a hidden page while Lite Mode is active, the shell shows a banner explaining that the page is hidden from Lite navigation and provides a Full Mode switch.
- EN/RU shell strings were added for the toggle, navigation group, and hidden-page banner.

## Product Rationale

The design follows progressive disclosure: keep the root navigation focused on frequent, low-risk daily work, while preserving power-user depth through a reversible Full Mode. This avoids creating two separate products or permission models.

## Follow-Up Ideas

- Persist the setting to user preferences if Lite Mode becomes an account-level preference.
- Add an onboarding prompt for new users to start in Lite Mode.
- Track which hidden modules are opened often, then promote them into Lite Mode if usage justifies it.
