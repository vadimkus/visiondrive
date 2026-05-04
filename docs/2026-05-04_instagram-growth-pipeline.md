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

## Key Files

- `prisma/schema.prisma` — `ClinicLead`, `ClinicLeadActivity`, lead enums.
- `lib/clinic/instagram-growth.ts` — lead normalization, tracked booking URL, reply copy, task derivation.
- `app/api/clinic/leads/*` — lead CRUD, activities, and actions.
- `app/api/clinic/growth/overview/route.ts` — pipeline overview.
- `app/clinic/growth/page.tsx` — practitioner workspace.
- `app/book/[slug]/page.tsx` — preserves `lead` attribution in public booking submissions.
- `app/api/clinic/public-booking/[slug]/route.ts` — links completed bookings back to leads.

## Product Notes

This turns Practice OS from an operations tool into a growth loop for solo beauty/wellness operators. The product now has a clear competitive wedge against separate booking tools and social schedulers: it connects Instagram demand to patient records, appointments, aftercare, rebooking, packages, and memberships.
