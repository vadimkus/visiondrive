# Clinic Competitive Feature Scan

## Context

Quick web scan for features missing from Practice OS after the Altegio adaptation backlog. Sources reviewed include Fresha, Jane App, SimplePractice, Boulevard, Acuity Scheduling, SchedulingKit, and solo-practice legal software benchmarks.

## Sources

- Fresha: marketplace, no-show protection, deposits, payments, marketing automation, memberships, reviews.
- Jane App: charting templates, AI scribe, waitlist, online booking, card-on-file, client self-service.
- SimplePractice: client portal, secure messaging, waitlist, intake/document reminders, voice/text/email reminders.
- Boulevard: medspa charting, photo markup, memberships, AI booking/marketing/support, HIPAA-oriented forms.
- Acuity: intake forms/agreements, packages/subscriptions, coupon codes, waitlist workarounds, self-service reschedule/cancel.
- SchedulingKit / legal solo tools: AI client communication, billing automation, lead intake, document generation, task automation.

## Killer Feature Gaps

1. Smart waitlist / cancellation fill.
2. Deposit, cancellation-policy, and no-show protection.
3. Client self-service reschedule/cancel with policy windows.
4. AI front-desk assistant for FAQs, triage, booking intent, and quote follow-up.
5. AI clinical/admin summarizer from visit notes and CRM history.
6. Photo markup for treatment points and outcome comparison.
7. Outcome tracking across visits with before/after milestones.
8. Subscription or membership-lite recurring care plans.
9. Secure patient messaging inside Patient Portal Lite.
10. Calendar sync with Google/Apple/Outlook.
11. Document/intake completion reminders before appointments.
12. Import/migration assistant and day-one setup wizard.

## Recommendation

The highest-value next build is waitlist + cancellation-fill, followed by deposits/no-show policy. These are directly revenue-protective for solo practitioners and fit the existing scheduling, reminders, patient portal, and payment architecture.

## Follow-up

- 2026-04-29: Smart waitlist + cancellation fill shipped as `/clinic/waitlist`. See [clinic-smart-waitlist-cancellation-fill](./2026-04-29_clinic-smart-waitlist-cancellation-fill.md).
