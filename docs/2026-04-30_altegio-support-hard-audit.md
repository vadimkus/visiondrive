# Altegio Support Hard Audit

Date: 2026-04-30

## Source

Reviewed captured Altegio support index from:

`https://alteg.io/en/support/`

Local capture:

`/Users/vadimkus/.cursor/projects/Users-vadimkus-VisionDrive/uploads/support-0.md`

## Conclusion

Do not clone Altegio.

Altegio is a broad chain/marketplace/integration platform. Practice OS is already strong for the solo-practitioner wedge: scheduling, patient cards, notes, photos, booking links, deposits, no-show policies, inventory, finance, packages, gift cards, marketing, loyalty, memberships, patient portal, PWA, reminders, and analytics.

The features worth taking from Altegio are mostly automation and payment completion layers. Public profile, custom domain, and widget-style identity surfaces are not the right fit for the current solo-practitioner thesis.

## Build Next

1. **Private solo-practitioner identity**
   - Practitioner display name.
   - Professional title.
   - Specialty.
   - Practitioner-controlled message signature.
   - Private workspace personalization only, not a public profile/domain.

2. **Real payment provider integration**
   - Real deposit checkout.
   - Apple Pay / Google Pay where supported.
   - Provider-tokenized card-on-file.
   - Webhook reconciliation.
   - Public payment completion for deposits, memberships, gift cards, and outstanding balances.

3. **WhatsApp Business / SMS provider automation**
   - Template sending.
   - Delivery status.
   - Sent message history.
   - Abandoned booking recovery.
   - Appointment confirmation/reschedule/cancel automation.

4. **Pre-visit client completion center**
   - Intake refresh.
   - Consent signing.
   - Patient-uploaded photos/documents.
   - Reminders for incomplete pre-visit tasks.

5. **Client wallet / patient portal expansion**
   - Quotes.
   - Receipts.
   - Package balances.
   - Gift-card balance.
   - Membership status.
   - Payment requests.
   - Aftercare and policy terms.

6. **Duplicate merge + data hygiene**
   - Imports already detect duplicates.
   - Add patient merge, phone normalization, and cleanup queue before scale.

7. **Booking-link analytics**
   - Source/UTM conversion tracking.
   - Service-specific link performance.
   - Abandoned booking follow-up.

## Defer / Avoid

- Full staff payroll, commissions, receptionist payroll.
- Rooms/resources/equipment as first-class booking entities.
- Group bookings/classes.
- Multi-location chain settings.
- Chain inventory/client database/analytics.
- IP telephony integrations.
- Integration marketplace.
- Client native mobile app.
- Public practitioner profile pages, custom domains, and public media galleries.

## Reasoning

The solo practitioner does not need Altegio's enterprise surface. They need:

- More bookings.
- Fewer no-shows.
- Faster payment collection.
- Less WhatsApp/admin work.
- Clean patient history.
- Mobile-first daily workflow.

Practice OS should therefore prioritize private identity, real payments, and WhatsApp automation before adding more back-office parity or public-profile infrastructure.

## Canvas

Visual matrix:

`/Users/vadimkus/.cursor/projects/Users-vadimkus-VisionDrive/canvases/altegio-support-gap-audit.canvas.tsx`
