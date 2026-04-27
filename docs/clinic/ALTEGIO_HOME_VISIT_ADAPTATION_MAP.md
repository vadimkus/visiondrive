# Altegio Home-Visit Practitioner Adaptation Map

Date: 2026-04-27

Source reviewed:

- Altegio support index: https://alteg.io/en/support/
- Altegio feature overview: https://alteg.io/en/support/knowledge-base/4829477329181-altegio-features/
- Online booking overview: https://alteg.io/en/support/knowledge-base/291505/
- Notifications overview: https://alteg.io/en/support/knowledge-base/291100/
- Client base overview: https://alteg.io/en/support/knowledge-base/283537/
- Finance and analytics overview: https://alteg.io/en/support/knowledge-base/291094/
- Inventory overview: https://alteg.io/en/support/knowledge-base/285658/
- Memberships overview: https://alteg.io/en/support/knowledge-base/310453/
- Main dashboard overview: https://alteg.io/en/support/knowledge-base/4904066445085/
- Personal account overview: https://alteg.io/en/support/knowledge-base/5070518429597/

## Product Lens

Altegio is broad salon/spa/clinic infrastructure. For VisionDrive Practice OS, the useful product is narrower: a mobile-first operating system for a solo practitioner who treats patients at home.

Adapt the workflow, not the enterprise weight. The practitioner needs fewer screens, fewer roles, and stronger field-visit support: address, travel buffer, consent, clinical notes, photos, consumables, WhatsApp, payments, repeat treatments, and patient retention.

## Already Adapted

1. Appointment command center
   - Source inspiration: digital schedule and visit window.
   - Shipped: appointment drawer with patient context, actions, reminders, follow-up, review actions, and history.

2. Conflict-safe scheduling and buffers
   - Source inspiration: technical breaks and schedule protection.
   - Shipped: overlap guard, blocked time, working-hours guard, minimum lead time, buffer handling, override reason.

3. Client reminder system
   - Source inspiration: notifications and sending scenarios.
   - Shipped: WhatsApp-first templates, delivery log, runner, appointment reminders, no-show follow-up.

4. Public booking link
   - Source inspiration: online booking widget and private specialist links.
   - Shipped: private `/book/[slug]`, on/off toggle, service picker, slots, contact/DOB/consent intake.

5. Availability rules
   - Source inspiration: configurable online booking slots.
   - Shipped: working hours, fixed/dynamic slot modes, service-specific overrides, blocked times.

6. Follow-up automation
   - Source inspiration: repeat visit invitations.
   - Shipped: 2/4/6/8 week shortcuts and rebooking nudges skipped if a future appointment exists.

7. Reviews and reputation
   - Source inspiration: review request after visit.
   - Shipped: review request action, internal rating/reply/publish workflow, reputation page.

8. Client categories and tags
   - Source inspiration: client categories and segmentation.
   - Shipped: category/tags on patients, filters, chips, and appointment drawer context.

## Best Next Build Candidates

9. Client balance and debt
   - Status: shipped first pass.
   - Altegio source: client balance, deposits, refunds.
   - Solo version: every patient has a clear financial state: paid, unpaid, partial, credit, refund, package balance.
   - Why it matters: home practitioners often collect cash/card/bank transfer later. Debt must be visible before the next appointment.
   - Shipped: computed balance summary on patient list, patient chart, payments tab, and appointment drawer. Uses completed/arrived procedure prices, linked payments, refunds, pending payments, and standalone deposits.
   - Next improvements: inline payment closure from appointment drawer, receipt PDF, partial refund workflow, and manual opening balance import.

10. Prepaid treatment packages
   - Status: shipped first pass.
   - Altegio source: memberships, automatic membership debit, expiry notifications.
   - Solo version: sell courses like 3/5/10 visits for skin, laser, massage, physiotherapy, injections, etc.
   - Why it matters: strongest revenue stabilizer for repeat care.
   - Shipped: patient Packages tab, package sale form, package payment row, remaining sessions/expiry display, one-session-left visual warning, and automatic one-session debit on completed visits with matching service.
   - Next improvements: reusable package templates, expiry reminder delivery, manual cancel/adjust actions, package receipt PDF, and analytics for package revenue versus delivered sessions.

11. Home visit route and travel buffer
   - Status: shipped first pass.
   - Altegio source: schedule, resources, technical breaks.
   - Solo version: address-aware schedule: home address, area, parking/access notes, travel buffer before/after, daily route view.
   - Why it matters: home visits fail when travel time is ignored. This is more important than salon-style room/resource booking.
   - Shipped: patient default address/area/access notes, appointment location snapshot, travel buffer before/after fields, conflict-safe occupied time using travel buffers, day route card with ordered map links, and drawer visibility.
   - Next improvements: area-based default travel times, multi-stop map link, route optimization, patient geocoding, and route reminders.

12. Consent and contraindication forms
   - Altegio source: personal data processing, booking fields, custom fields.
   - Solo version: procedure-specific consent, contraindications, medication/allergy confirmation, aftercare acknowledgement.
   - Why it matters: protects practitioner and patient, especially for home aesthetic/medical-adjacent procedures.
   - Build shape: consent template library, patient signature/checkbox timestamp, form snapshot attached to visit, patient-safe export.
   - Shipped: tenant consent template library, procedure-specific optional template links, signed patient consent records with immutable template snapshots, reviewed contraindication checklist, aftercare acknowledgement, optional visit/appointment links, patient chart Consents tab, and EN/RU Knowledge Base article.
   - Next improvements: public pre-visit signing link, drawn signature capture, consent expiry/renewal reminders, and dedicated consent PDF export.

13. Inline payments and receipts
   - Altegio source: financial operations, cash registers, refunds, payment methods.
   - Solo version: complete the visit and payment in one drawer.
   - Why it matters: the visit is not truly closed until payment, receipt, and balance are correct.
   - Build shape: payment form in appointment/visit drawer, payment method, fee, discount, receipt PDF, refund action.
   - Shipped: appointment-linked payment rows, discount/fee fields, client balance math that accounts for discounts and patient-facing fees, inline payment form in the appointment drawer, receipt PDF endpoint, and refund/void status actions.
   - Next improvements: branded receipt numbering sequence, WhatsApp receipt send, partial refund amounts, Stripe/payment-terminal integration, and practitioner expense recognition for processor fees.

14. Treatment plans
   - Altegio source: client history and service packages.
   - Solo version: planned course of care with expected number of sessions, target cadence, photos, outcomes, and next steps.
   - Why it matters: repeat treatment becomes structured care, not ad hoc rebooking.
   - Build shape: plan rows under patient, link visits to a plan, target dates, planned procedure, status, photo milestones.
   - Shipped: patient treatment-plan tab, plan rows with expected sessions/cadence/target dates/service/goals/next steps/photo milestones, status actions, visit linking from the visit log, and automatic progress from completed linked visits.
   - Next improvements: dedicated before/after milestone comparison view, plan-level outcome scoring, generated next appointment schedule, and WhatsApp progress summaries.

15. Notification center
   - Altegio source: notification center, schedule event notifications.
   - Solo version: one practitioner inbox for new bookings, reschedules, cancellations, reminders due, reviews due, unpaid visits, low stock.
   - Why it matters: solo practitioner has no receptionist. The app must surface what needs action today.
   - Build shape: `/clinic/inbox` or dashboard panel backed by reminders, appointments, payments, low-stock signals.
   - Shipped: `/clinic/inbox` aggregates due reminders, new online bookings, recent reschedules, pending review requests, unpaid billable appointments, and low-stock inventory with severity, filters, counts, and action links.
   - Next improvements: persistent read/dismiss state, push/email digest, cancellation signals, owner-specific assignment, and SLA aging.

16. Bill of materials per procedure
   - Altegio source: bills of materials and automatic consumable write-off.
   - Solo version: a procedure consumes multiple items with quantities, not just one simple stock item.
   - Why it matters: true profitability requires material cost per treatment.
   - Build shape: procedure material list, automatic multi-item consumption on visit complete, override actual quantity when needed.
   - Shipped: procedure-level material rows with stock item, quantity per visit, unit cost, notes, material cost summary, automatic multi-item deduction on completed linked visits, and legacy single-item fallback when no BOM exists.
   - Next improvements: per-visit quantity override, procedure profitability report using material cost, material templates, and low-stock forecast from future appointments.

17. Stock-taking and variance
   - Altegio source: stock-taking, write-offs, inventory operations.
   - Solo version: count physical bag/clinic stock monthly, adjust differences, record expired/damaged/lost reasons.
   - Why it matters: home practitioners carry inventory in bags/cases; small missing items quietly destroy margin.
   - Build shape: stock count session, expected vs counted, variance movements, reason codes, audit trail.
   - Shipped: stock-taking sessions snapshot all active inventory items, capture counted quantities, require reasons for variances, and finalize into audited adjustment stock movements that set on-hand stock to physical counts.
   - Next improvements: partial-cycle counts by bag/location, printable count sheet, expiry-date batches, and variance report in finance/P&L.

18. Product sales from visit
   - Altegio source: product sales and inventory operation.
   - Solo version: sell aftercare products from the visit screen.
   - Why it matters: aftercare retail can raise average check and improve clinical outcome.
   - Build shape: add product sale lines to visit, deduct stock, add revenue, show in patient history.
   - Shipped: appointment drawer can sell aftercare products after a visit starts/completes, deduct stock via consumption movements, create finance revenue payments, and show retail sales in patient payment history without converting them into client balance credit.
   - Next improvements: multi-line sale UI, suggested products by procedure/BOM, receipt section for product sales, and retail margin reporting.

19. P&L v2 with true procedure profitability
   - Altegio source: P&L, financial report, service analytics.
   - Solo version: revenue minus payment fees, materials, direct expenses, and refunds by procedure.
   - Why it matters: revenue is vanity if material-heavy procedures are underpriced.
   - Build shape: finance dashboard v2 with gross/net revenue, material cost, margin, profit per hour, expense categories.
   - Shipped: Finance now separates net revenue, product sales, direct material/product costs, gross profit, operating expenses, operating profit, and procedure-level profitability with visits, expected revenue, paid/refunded revenue, material cost, margin, and profit per hour.
   - Next improvements: capture processor fees separately from patient-facing fees, snapshot BOM cost at visit completion, and add exportable monthly P&L reports.

20. Retention analytics
   - Altegio source: client retention, lost clients, returning clients.
   - Solo version: rebook rate, lost patients, no-show rate, follow-up conversion, repeat interval by procedure.
   - Why it matters: home treatment growth comes from repeat care, not only new clients.
   - Build shape: retention report with clickable patient lists and WhatsApp reactivation actions.

## Strong Medium-Term Candidates

21. Booking funnel analytics
   - Source: online booking analytics and widget events.
   - Solo version: track public link views, service selected, slot selected, form submitted, booking completed.
   - Build after public booking has enough usage.

22. Private patient portal lite
   - Source: client app, online booking, personal account.
   - Solo version: secure patient link for upcoming appointment, intake forms, aftercare, receipts, package balance, reschedule/cancel request.
   - Keep it link-based first; do not require patients to install an app.

23. Custom intake fields per service
   - Source: custom fields and booking step settings.
   - Solo version: service-specific questions for allergies, contraindications, pregnancy, recent procedures, photos, address/access notes.

24. Client import from Excel
   - Source: client import.
   - Solo version: import existing client spreadsheet into patients with tags/categories and duplicate detection.

25. Product import from Excel
   - Source: product import.
   - Solo version: import stock catalog, supplier, cost, barcode, reorder point.

26. Supplier profiles and settlement history
   - Source: suppliers and counterparties.
   - Solo version: supplier contact, ordered items, purchase history, unpaid supplier amounts, preferred reorder quantity.

27. Payment fee rules
   - Source: acquiring fees.
   - Solo version: method-level fee percent for card/POS/Stripe/bank, so reports show net profit.

28. Daily close
   - Source: daily cash desk report.
   - Solo version: close day with cash/card/bank totals, unpaid visits, discrepancies, and notes.

29. Refund and correction workflow
   - Source: client refunds and financial corrections.
   - Solo version: refund a payment without corrupting visit history; record reason and method.

30. Dormant patient reactivation
   - Source: personal messages and lost-client filters.
   - Solo version: "not visited in 60/90/120 days" lists with WhatsApp templates.

31. Birthday and personal occasion messages
   - Source: birthday greeting.
   - Solo version: optional low-pressure birthday message or yearly check-in, localized EN/RU.

32. Referral tracking
   - Source: referral program.
   - Solo version: "referred by" field, referral reward note, simple report. Avoid complex points early.

33. Promotions and discount rules
   - Source: promotions and discounts.
   - Solo version: simple named discount on visit/package, reason required, visible in margin report.

34. Gift cards
   - Source: gift cards.
   - Solo version: prepaid voucher sold to a buyer and redeemed by patient. Lower priority than packages.

35. Before/after photo protocol
   - Source: client card files and visit history.
   - Solo version: photo checklist by procedure, same lighting/angle prompts, consent to use in marketing.

36. Aftercare document library
   - Source: files/documents and notifications.
   - Solo version: attach/send aftercare PDF or message template after visit based on procedure.

37. Patient-safe exports
   - Source: data export and documents.
   - Solo version: export treatment summary, receipts, consent, aftercare; never include internal notes.

38. Data export and deletion request
   - Source: personal data management.
   - Solo version: admin tools to export patient data and mark/delete/anonymize where legally appropriate.

39. Account and notification preferences
   - Source: personal account.
   - Solo version: practitioner profile, language, notification preferences, password reset, push settings.

40. PWA practitioner mode
   - Source: employee mobile app.
   - Solo version: installable mobile app feel: today screen, quick actions, reminders, offline note draft.

41. Practitioner push notifications
   - Source: mobile push notifications.
   - Solo version: new booking, cancellation, reschedule, reminder due, unpaid visit, low stock, package expiring.

42. Offline-safe visit draft
   - Source: mobile app pattern, adapted for field work.
   - Solo version: draft clinical notes/photos locally if connectivity is bad, then sync when online.

43. WhatsApp bot intake
   - Source: chatbot integrations.
   - Solo version: later-stage bot for FAQs, booking link, appointment status, intake link, and reminder replies.

44. Message history
   - Source: chat features and sent messages history.
   - Solo version: manual log first, integration later. Attach message history to patient profile.

45. Call log
   - Source: call logs and telephony.
   - Solo version: manual call note with outcome and next action. Skip deep telephony integration for now.

46. Service analytics
   - Source: service reports and main dashboard.
   - Solo version: revenue, count, average price, material cost, profit per hour per procedure.

47. Revenue plan
   - Source: revenue plans.
   - Solo version: monthly target, required visits, achieved revenue, daily pace, gap.

48. Occupancy and free-slot report
   - Source: occupancy analytics.
   - Solo version: how much planned working time is booked, where free slots exist, and whether travel buffers are excessive.

49. Review analytics
   - Source: reviews overview.
   - Solo version: requested, replied, published, average rating, negative-private-feedback queue.

50. Knowledge base expansion
   - Source: Altegio support knowledge base format.
   - Solo version: in-app help articles for each Practice OS feature in EN/RU, written around home-visit workflows.

## Deprioritize Or Skip

1. Chain/location management
   - Not relevant to a solo practitioner.

2. Multi-employee payroll
   - Replace with owner income, assistant cost if needed, and simple expense tracking.

3. Group classes and events
   - Skip unless the product later supports courses/workshops.

4. Multi-staff "any professional" assignment
   - Not useful for a one-practitioner practice.

5. Deep IP telephony integrations
   - Too heavy. Manual call log and WhatsApp links are enough.

6. Marketplace placement
   - Wrong direction. The product should protect direct client relationship and private booking.

7. Complex loyalty points/cashback
   - Packages, referrals, and simple discounts are more practical.

8. Power BI integration
   - Premature. Build reliable native analytics first.

9. White-label client mobile app
   - Too much surface area. Use private patient links before app-store apps.

10. Complex multi-warehouse inventory
   - For home practice, use simple locations: main stock, treatment bag, retail stock.

## Recommended Implementation Order From Here

1. Client balance and debt.
2. Inline payment form and receipt from appointment/visit drawer.
3. Prepaid treatment packages with automatic visit deduction.
4. Home address, travel buffer, and daily route view.
5. Consent forms and service-specific intake fields.
6. Treatment plans tied to visits, photos, and follow-ups.
7. Procedure bill of materials with multi-item stock consumption.
8. Stock-taking and variance workflow.
9. Product sales from visit drawer.
10. P&L v2 with material cost, payment fees, and profit per hour.
11. Notification center for all practitioner tasks.
12. Retention analytics and dormant patient reactivation.
13. Patient portal lite with forms, aftercare, receipts, and package balance.
14. Booking funnel analytics.
15. Data export/deletion tools.

## Recommendation

The next point should be client balance plus inline payment closure, then prepaid treatment packages. That sequence is better than jumping into more marketing or analytics because it fixes the core operating loop: appointment -> visit -> payment -> balance -> repeat package -> follow-up.

