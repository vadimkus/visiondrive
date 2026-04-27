# Clinic follow-up automation

## Context

Point 6 from the Altegio solo-practitioner backlog adds repeat booking and rebooking invitations after completed appointments.

## Shipped

- Added reusable follow-up helpers in `lib/clinic/follow-up.ts` for 2/4/6/8 week windows, safe week normalization, and no-past reminder scheduling.
- Added `schedule_rebooking_follow_up` appointment action.
- The action checks for an existing future scheduled/confirmed/arrived appointment before scheduling a rebooking WhatsApp reminder.
- The reminder runner skips due `REBOOKING_FOLLOW_UP` reminders if the patient booked a future appointment after the nudge was scheduled.
- Appointment drawer now separates normal reminders from Follow-up automation:
  - repeat booking buttons for +2w, +4w, +6w, +8w
  - rebooking reminder buttons for the same windows when no future appointment exists
  - status hint when a future appointment or rebooking reminder already exists
- Knowledge Base reminder/follow-up article was updated in English and Russian.

## Operational Notes

- No database schema change.
- Rebooking reminders still follow the existing WhatsApp-first model: the runner prepares the message and staff sends it through the generated WhatsApp link.
