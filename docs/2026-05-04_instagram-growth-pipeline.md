# Instagram Growth Pipeline MVP

Date: 2026-05-04

## Context

Vadim chose to implement the Beauty Growth OS wedge inside Solo Practitioner / Practice OS as a manual-first Instagram growth workflow:

`Instagram follower -> DM/reply -> booking -> appointment -> aftercare -> rebooking -> package/membership`

## Implementation Direction

The first version intentionally avoids official Instagram DM API integration. Practitioners review/copy messages manually and the OS stores the durable business workflow:

- Instagram lead capture.
- Interested service and campaign.
- Reviewed DM/reply activity.
- Tracked booking link with `lead` attribution.
- Automatic conversion when the public booking link creates an appointment.
- Follow-on package and membership opportunity logging.

## Shipped Workflow

1. Staff opens `/clinic/growth` and creates a lead from an Instagram DM, comment, WhatsApp message, referral, Google inquiry, website form, or other online source.
2. The lead stores source, stage, display name, Instagram handle, phone/email, interested service, campaign, tracking code, and notes.
3. Staff generates reviewed reply copy or a tracked booking link. The system prepares the text, but the final send remains manual.
4. The lead moves through `NEW`, `REPLIED`, `BOOKING_LINK_SENT`, `BOOKED`, `COMPLETED`, `REBOOKING_DUE`, `PACKAGE_OPPORTUNITY`, `MEMBERSHIP_OPPORTUNITY`, or `LOST`.
5. Public booking receives `lead` or `ref` attribution, creates the patient and appointment, links the matching lead, and marks the patient referral as Instagram.
6. Growth overview derives daily work: new lead replies, booking-link follow-up, aftercare after booked appointments, and package/membership opportunity prompts.

## Data Model

- `ClinicLead` is the pre-patient acquisition record. It is tenant-scoped and can later link to `ClinicPatient` and `ClinicAppointment`.
- `ClinicLeadActivity` is the lead timeline for reviewed DMs, WhatsApp replies, booking-link sends, stage changes, conversion notes, package offers, and membership offers.
- Lead source/stage/activity enums keep the pipeline queryable without turning free-text notes into the source of truth.
- Existing `ClinicBookingFunnelEvent` metadata preserves `lead` for funnel analytics.

## API Surface

- `GET/POST /api/clinic/leads` lists and creates leads.
- `GET/PATCH /api/clinic/leads/[id]` reads and updates a lead, including stage changes.
- `POST /api/clinic/leads/[id]/activities` logs reviewed communication and notes.
- `POST /api/clinic/leads/[id]/actions` prepares booking replies/links, marks replied/lost, converts, and logs package or membership offers.
- `GET /api/clinic/growth/overview` returns pipeline metrics, leads, generated tasks, public booking context, and conversion signals.
- `POST /api/clinic/public-booking/[slug]` links completed bookings back to matching lead tracking codes.

## Key Files

- `prisma/schema.prisma` — `ClinicLead`, `ClinicLeadActivity`, lead enums.
- `lib/clinic/instagram-growth.ts` — lead normalization, tracked booking URL, reply copy, task derivation.
- `app/api/clinic/leads/*` — lead CRUD, activities, and actions.
- `app/api/clinic/growth/overview/route.ts` — pipeline overview.
- `app/clinic/growth/page.tsx` — practitioner workspace.
- `app/book/[slug]/page.tsx` — preserves `lead` attribution in public booking submissions.
- `app/api/clinic/public-booking/[slug]/route.ts` — links completed bookings back to leads.
- `app/clinic/knowledge-base/page.tsx` — user-facing EN/RU guidance for the Growth workflow.
- `docs/clinic/CHUNKS.md`, `docs/clinic/ARCHITECTURE.md`, `docs/clinic/DATA_MODEL.md`, and `docs/CODEBASE_REFERENCE.md` — permanent product and builder documentation.

## Product Notes

This turns Practice OS from an operations tool into a growth loop for solo beauty/wellness operators. The product now has a clear competitive wedge against separate booking tools and social schedulers: it connects Instagram demand to patient records, appointments, aftercare, rebooking, packages, and memberships.

## Non-Goals For V1

- No official Instagram DM API integration.
- No inbound Instagram webhook storage.
- No automatic DM or WhatsApp sending.
- No generic social content calendar.
- No public marketplace. The booking link remains the practitioner’s private branded link.
