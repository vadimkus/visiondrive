# Clinic Client Wallet

## Context

The next P0 build for home doctors is a patient-facing client wallet: one private place where a patient can review their financial relationship with the practice without seeing staff-only notes or internal finance details.

## Decision

Implement the wallet inside the existing token-based patient portal instead of adding a second public surface. The patient already receives one private portal link, and the link is tenant-scoped, hashed, expiring, and revocable.

## What Shipped

- Added a `wallet` object to `GET /api/patient-portal/[token]`.
- Wallet includes client balance, pending payment requests, patient-visible quotes, package balances, gift cards, gift-card redemptions, saved payment method metadata, and recent receipts.
- Draft/declined quotes stay hidden from the patient portal.
- Saved payment methods are masked only: provider/brand, last 4, expiry, status, and consent timestamp.
- Raw card data, processor fees, internal notes, draft quotes, CRM history, and staff-only fields remain excluded.
- Reworked the patient portal UI so wallet is the first financial section, replacing separate package/receipt blocks with a unified view.
- Added EN/RU knowledge-base guidance for practitioners.

## Validation

- `npm run type-check`
- `npm test -- --run lib/clinic/client-wallet.test.ts`
