# Clinic Message History

Date: 2026-04-28

## Context

Point 45 in the Altegio adaptation backlog asks for message history attached to the patient profile. For a solo practitioner, the first pass should capture reviewed outgoing messages and manual communication notes without adding full WhatsApp Business API complexity.

## Shipped

- WhatsApp Assistant now supports saving a generated reply to the selected patient history.
- `Open WhatsApp + save` records the reviewed outgoing text before handing off to `wa.me`.
- Saved assistant messages use the existing `ClinicCrmActivity` table with type `WHATSAPP`.
- Patient CRM now has a dedicated Message history section for WhatsApp and email touchpoints above the full CRM log.
- Manual WhatsApp/email history remains available through the existing Log interaction form.

## Limits

- No inbound WhatsApp capture yet.
- No delivery/read status yet.
- No reusable message-template library yet.
- Final send stays manual; browser WhatsApp links cannot guarantee delivery.
