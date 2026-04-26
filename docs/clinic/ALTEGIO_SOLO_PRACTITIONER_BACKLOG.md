# Altegio-Inspired Solo Practitioner Backlog

Date: 2026-04-26

Source: Altegio support documentation reviewed from https://alteg.io/en/support/.

Goal: adapt the useful parts of a mature salon/clinic platform for a solo/home practitioner product. Keep the product discreet, privacy-first, simple, and operational. Do not copy chain/location complexity or build evasion/false-license features.

## Priority 1 — Core Daily Workflow

1. Appointment command center
   - Status: mostly started.
   - Adapt from Altegio: Digital schedule, New Visit Window.
   - Solo version: one drawer with schedule, patient context, visit, payments, reminders, history.
   - Next improvements: inline payment form, inline notes editing, better mobile drawer layout.

2. Conflict-safe scheduling and buffers
   - Status: shipped first pass (appointment conflicts, service buffers, working-hours guard, blocked-time guard, minimum lead time, explicit override reason).
   - Adapt from Altegio: Technical Breaks.
   - Solo version: service duration plus hidden prep/cleanup/travel/rest buffer.
   - Next improvements: conflict analytics, override reason reporting, optional service-specific buffers.

3. Client reminder system
   - Status: shipped first pass (WhatsApp templates, manual prepare/send, 24h schedule, delivery log, daily runner, no-show follow-up).
   - Adapt from Altegio: Notifications and sending scenarios.
   - Solo version: WhatsApp-first, then email/SMS fallback.
   - Next improvements: WhatsApp Business API delivery, email fallback, reminder analytics, patient opt-out preferences.

4. Public booking link
   - Status: shipped first pass (private `/book/[slug]` link, staff on/off toggle, service picker, availability slots, DOB/contact/consent intake, online appointment creation, 24h reminder scheduling).
   - Adapt from Altegio: Online booking.
   - Solo version: private branded link, not marketplace. Choose service, time, client details, consent, optional notes.
   - Next improvements: custom booking slug/token, intake questions per service, staff approval workflow, client reschedule/cancel link.

5. Availability rules
   - Status: shipped first pass (working hours, minimum lead time, fixed slot interval, blocked time, slot preview).
   - Adapt from Altegio: fixed/optimal/dynamic slots.
   - Solo version: working hours, minimum lead time, booking interval, disabled days, manually hidden slots.
   - Next improvements: public booking flow, service-specific availability, dynamic slots, override reason on manual conflict.

## Priority 2 — Patient Retention and Revenue

6. Follow-up automation
   - Status: quick follow-up shortcuts started.
   - Adapt from Altegio: repeat booking, repeat visit invitations.
   - Solo version: after completion, suggest 2/4/6/8 week rebooking; send rebook reminder if no future appointment.

7. Reviews and reputation
   - Status: not built.
   - Adapt from Altegio: review request after visit.
   - Solo version: send WhatsApp/email review request after completed visit; track sent/replied; store rating internally first.

8. Client categories and tags
   - Status: not built.
   - Adapt from Altegio: client categories.
   - Solo version: VIP, regular, new, sensitive, high-risk, follow-up due, late payer.
   - Use tags in appointment drawer and patient list filters.

9. Client balance / debt
   - Status: partially represented by payments.
   - Adapt from Altegio: client balance and accounts.
   - Solo version: simple balance: paid, due, credit, refund. No complex loyalty accounting at first.

10. Packages / memberships
   - Status: not built.
   - Adapt from Altegio: memberships, gift cards, prepaid services.
   - Solo version: prepaid course of treatments, remaining sessions, expiry, automatic debit on completed visit.

## Priority 3 — Finance and Operations

11. Proper cash desk
   - Status: basic finance started.
   - Adapt from Altegio: accounts and cash registers.
   - Solo version: cash, card/POS, bank transfer, personal expenses, supplier purchases.
   - Build order: payment accounts, transfers, daily cash close, discrepancy notes.

12. Financial operations ledger
   - Status: basic expenses started.
   - Adapt from Altegio: financial operations.
   - Solo version: one ledger for income, expense, refund, transfer, correction.
   - Add filters by client, supplier, method, category, period.

13. P&L and daily report
   - Status: basic finance dashboard started.
   - Adapt from Altegio: P&L, daily cash report.
   - Solo version: monthly profit, daily revenue, expenses by category, unpaid appointments, inventory cost impact.

14. Supplier and counterparty tracking
   - Status: purchase orders started.
   - Adapt from Altegio: suppliers and partners.
   - Solo version: supplier profile, contacts, purchases, outstanding amount, preferred items.

15. Acquiring / payment fees
   - Status: not built.
   - Adapt from Altegio: acquiring fee.
   - Solo version: allow fee percent per payment method and show true net profit.

## Priority 4 — Inventory Depth

16. Bill of materials per procedure
   - Status: simplified consume-per-visit started.
   - Adapt from Altegio: bills of materials and automatic write-off.
   - Solo version: procedure consumes multiple items with quantities, not just one linked item.

17. Stock-taking
   - Status: not built.
   - Adapt from Altegio: stock-taking.
   - Solo version: periodic physical count, variance, write-off reason, audit trail.

18. Inventory reports
   - Status: not built.
   - Adapt from Altegio: write-off, turnover, consumable usage, product orders.
   - Solo version: usage by procedure, low-stock forecast, monthly consumables cost.

19. Product sales
   - Status: not built.
   - Adapt from Altegio: product sales using inventory operation.
   - Solo version: sell aftercare products from patient/visit screen, deduct stock, record revenue.

## Priority 5 — Patient Data and Medical Workflow

20. Custom intake fields
   - Status: structured anamnesis exists, custom fields not built.
   - Adapt from Altegio: custom fields.
   - Solo version: procedure-specific questions, contraindications, consent checkbox, home address, preferred language.

21. Consent forms
   - Status: not built.
   - Adapt from Altegio online booking personal data processing.
   - Solo version: consent templates per procedure, signed timestamp, patient-safe PDF export.

22. Treatment plans
   - Status: not built.
   - Adapt from Altegio medical card direction.
   - Solo version: plan of sessions, expected dates, before/after photo milestones, outcome notes.

23. Files and documents
   - Status: media and PDF export started.
   - Adapt from Altegio client files.
   - Solo version: attach consent, lab result, ID/passport optional, aftercare PDF, invoice/receipt.

## Priority 6 — Communication and CRM

24. Message history
   - Status: CRM log exists.
   - Adapt from Altegio chat/history.
   - Solo version: log WhatsApp/call/email manually first; later parse inbound integrations if needed.

25. Notification center
   - Status: not built.
   - Adapt from Altegio notification center.
   - Solo version: today’s changes, upcoming reminders, cancellations, unpaid visits, low stock, follow-up due.

26. Birthday and reactivation messages
   - Status: not built.
   - Adapt from Altegio personal messages.
   - Solo version: birthday greeting, dormant client reactivation, follow-up due reminder.

## Priority 7 — Analytics and Growth

27. Service analytics
   - Status: not built.
   - Adapt from Altegio service report.
   - Solo version: revenue by procedure, count, average price, material cost, profit per hour.

28. Client retention
   - Status: not built.
   - Adapt from Altegio retention reports.
   - Solo version: returning clients, lost clients, no-show rate, rebook rate after treatment.

29. Booking funnel analytics
   - Status: later, after public booking.
   - Adapt from Altegio online booking analytics.
   - Solo version: link views, service selected, slot selected, booking completed, abandoned step.

30. Revenue plan
   - Status: not built.
   - Adapt from Altegio revenue plans.
   - Solo version: monthly target, needed appointments, daily pace, gap to target.

## Priority 8 — Mobile/PWA

31. PWA practitioner mode
   - Status: basic responsive web app.
   - Adapt from Altegio employee mobile app.
   - Solo version: installable PWA, today screen, quick status, reminder buttons, offline-friendly notes draft.

32. Push notifications
   - Status: low-stock push started.
   - Adapt from Altegio mobile push.
   - Solo version: new booking, reschedule, cancellation, reminder due, low stock.

## Deprioritize / Skip

- Chain/location management.
- Multi-employee payroll and performance.
- Group classes/events unless user later wants courses/workshops.
- Marketplace integrations.
- Deep telephony integrations.
- Complex loyalty points too early.
- Power BI/export integrations before core data quality is strong.

## Recommended Implementation Order

1. Working hours + blocked time + availability engine.
2. Public booking link with fixed slots.
3. Automated reminders and no-show follow-up.
4. Inline payments and client balance.
5. Procedure bill of materials.
6. Stock-taking and inventory cost reports.
7. Consent forms and procedure-specific intake fields.
8. Packages / prepaid sessions.
9. P&L v2 with true procedure profitability.
10. Notification center.
11. Reviews and reactivation messages.
12. Booking funnel analytics.
