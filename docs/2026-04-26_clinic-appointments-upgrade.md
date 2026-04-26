# Clinic Appointments Upgrade

Date: 2026-04-26

Context: Practice OS appointments were upgraded after reviewing Altegio appointment-calendar documentation. The target user is a solo/home practitioner who needs fast internal scheduling, patient context, reminders, visit completion, and no double-booking.

Sources reviewed:
- Altegio Digital schedule: https://alteg.io/en/support/knowledge-base/282679/
- Altegio New Visit Window: https://alteg.io/en/support/knowledge-base/24496357742749-new-visit-window/
- Altegio Technical Breaks: https://alteg.io/en/support/knowledge-base/171382/
- Altegio Notifications: https://alteg.io/en/support/knowledge-base/291100/
- Altegio online slots: https://alteg.io/en/support/knowledge-base/16898106582429-configuring-available-time-slots-for-online-booking-in-the-new-interface/

Shipped:
- Appointment statuses now include `CONFIRMED` and `ARRIVED`.
- Procedures and appointments support `bufferAfterMinutes` for hidden prep, cleanup, travel, or rest time.
- Appointment create/update APIs block conflicts by default using appointment duration plus buffer.
- Appointment event history records creation, rescheduling, status changes, reminders, visit starts/completions, payments, and follow-ups.
- `/clinic/appointments` now has day agenda, week, and month modes.
- Month cells open the day agenda; appointment cards open a right-side appointment drawer.
- Appointment drawer shows patient context, schedule details, buffer, status actions, visit actions, payment snapshot, reminders, follow-up shortcuts, and history.
- Manual WhatsApp reminder action creates a CRM log and appointment event.
- Start/complete visit actions keep appointment status and linked inventory consumption aligned.

Notes:
- Public booking is intentionally left for a later phase. Internal scheduling is now safer and more useful before exposing availability to patients.
- No evasion or false-license features were added. The system stays privacy-first and operational.
