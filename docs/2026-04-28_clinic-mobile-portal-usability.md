# Clinic Mobile Portal Usability

Date: 2026-04-28

## Context

Solo practitioners are likely to run the practice console from an iPhone or iPad rather than a laptop. The shared portal shell needed another mobile-first pass before adding more backlog items.

## Shipped

- Reworked the clinic shell header into a compact mobile top row plus a full-width horizontal navigation row.
- Preserved the desktop sidebar at large breakpoints.
- Added mobile-safe bottom padding to the main console area so iPhone safe-area controls do not cover actions.
- Updated dashboard quick actions to behave better on phone widths while still wrapping on desktop.

## Limits

- This is a focused layout pass, not a full visual redesign of every clinic screen.
- Reports with dense tables still use horizontal scroll where compact card views are not yet built.
