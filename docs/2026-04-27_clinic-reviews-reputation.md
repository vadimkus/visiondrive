# Clinic reviews and reputation

## Context

Point 7 from the Altegio solo-practitioner backlog adds review requests after completed visits, with internal rating/reply tracking before anything is published externally.

## Shipped

- Added `ClinicPatientReview` to store review status, internal rating, private note, candidate public review text, and request/reply/publish timestamps.
- Added `REVIEW_REQUEST` reminder kind and a default WhatsApp template.
- Added `send_review_request` appointment action for completed appointments.
- Appointment drawer now has a Reputation block with a review request button and recent review status.
- Added `/api/clinic/reviews` for the reputation inbox and `/api/clinic/reviews/[id]` for rating/status/note updates.
- Added `/clinic/reputation` tab with review metrics, average internal rating, editable notes, and WhatsApp links.
- Updated Knowledge Base in English and Russian.

## Operational Notes

- Requires `npm run db:push` against the target database because the Prisma schema changed.
- WhatsApp still follows the manual-send model: the app prepares the message and opens the generated `wa.me` link; staff controls the actual send.
- Reviews remain internal until staff marks them published.
