# Clinic Promotions And Discount Rules

## Context

Implemented the next Altegio home-visit adaptation backlog item: simple promotions and discount rules for solo practitioners. The goal is not a full loyalty engine; it is controlled, named discounts on visits and packages, with a required reason and finance visibility.

## Shipped

- Added `ClinicDiscountRule` with percent/fixed values, active flag, and tenant scope.
- Visit payments now store discount rule ID, snapshot name, amount, and required reason when a non-zero discount is applied.
- Patient packages now store list price, discount amount, rule/name/reason snapshot, and final sale price.
- Added `GET/POST/PATCH /api/clinic/discount-rules`.
- Finance page can create/edit discount rules and shows total discounts, recent discount reasons, and procedure-level discount impact.
- Appointment drawer, patient payment form, and package sale form can apply a named or manual discount.
- Added EN/RU strings and helper tests in `lib/clinic/discount-rules.test.ts`.

## Guardrails

- Non-zero discounts are rejected unless a reason is present.
- Applied discounts snapshot the rule name, so historical payments/packages stay understandable if the rule is later renamed.
- Package payments use final sale price as collected revenue; discount metadata remains on both the package and payment snapshot.

## Next Improvements

- Add optional expiry windows and usage limits for campaign-style discounts.
- Link discount rules to booking source/UTM campaigns if promotions become a real acquisition channel.
- Add eligibility rules by patient category/tag only if practitioners actually need more control.
