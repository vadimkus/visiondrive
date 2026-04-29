# Clinic Retail Add-Ons And AI Note Assistant

Date: 2026-04-29

## Context

This chunk adds two solo-practitioner speed features after the booking and policy work:

- retail checkout add-on recommendations during a visit,
- an AI note assistant that turns rough practitioner notes into structured visit fields.

## Shipped

### Retail Checkout Add-Ons

- Added `lib/clinic/retail-recommendations.ts` to rank in-stock retail items by:
  - service/procedure match,
  - this patient’s repeat purchases,
  - recent product-sale popularity.
- Added `GET /api/clinic/product-recommendations`.
- Appointment drawer product-sales checkout now shows add-on recommendation chips.
- Selecting a chip pre-fills the product and, when available, the last unit sale price.
- EN/RU copy added for recommendation labels and reasons.

### AI Note Assistant

- Added `lib/clinic/note-assistant.ts` to build a structured draft from rough notes/dictation.
- Added `POST /api/clinic/notes/assist`.
- Patient visit form now has an AI note assistant panel:
  - paste rough note,
  - draft visit note,
  - review generated chief complaint, summary, next steps, and staff notes before saving.
- EN/RU copy added for all assistant UI and guardrails.

## Safety Notes

- The note assistant is a review-first local drafting pass, not autonomous charting.
- It does not save anything automatically.
- Practitioner must verify facts, contraindications, and aftercare instructions before saving.
- No external LLM provider is required in this pass; future provider integration can replace the helper behind the API.

## Verification

- `npm test -- --run lib/clinic/retail-recommendations.test.ts lib/clinic/note-assistant.test.ts`
- `npm run type-check`
- `npm run lint`
- `npm run test:clinic-flow`
