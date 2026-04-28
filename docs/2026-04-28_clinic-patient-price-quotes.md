# Clinic patient price quotes

## Context

Solo practitioners get repeated daily questions about treatment prices. The fastest useful workflow is not a bot first; it is a saved, good-looking quote that can be sent as PDF or text in seconds.

## Shipped

- Added `ClinicPriceQuote` and `ClinicPriceQuoteLine` for patient treatment estimates.
- Added patient quote APIs for list/create/status update and PDF download.
- Added a patient-card Quotes tab with procedure catalog selection, custom rows, quantity, unit price, discount, validity date, note, and terms.
- Saved quotes show total, status, lines, and sharing actions.
- Sharing options:
  - PDF treatment estimate.
  - Copy WhatsApp-ready text.
  - Open WhatsApp with the generated text.
  - Open email draft with the generated text.
- Added EN/RU strings and Knowledge Base guidance.

## Operational notes

- Run `npx prisma db push` before using against a database because this adds quote tables.
- WhatsApp/file attachment remains browser-limited: the app prepares the text and PDF, but the practitioner attaches the downloaded PDF manually if needed.
- Public quote acceptance and deposit requests are future improvements.
