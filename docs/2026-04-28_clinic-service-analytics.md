# Clinic Service Analytics

Date: 2026-04-28

## Context

Point 47 in the Altegio adaptation backlog asks for service analytics: revenue, count, average price, material cost, and profit per hour per procedure. The project already had procedure profitability inside Finance / P&L v2, so the right first pass was a focused reporting surface rather than a second calculation system.

## Shipped

- Added `/clinic/service-analytics`.
- Added sidebar navigation and dashboard quick action.
- Reuses `GET /api/clinic/finance/overview` and `lib/clinic/profitability.ts`.
- Shows overall service revenue, completed visits, average price, material cost, booked time, and weighted profit per hour.
- Shows procedure rows with visits, average price, net revenue, material cost, gross profit, margin, profit per hour, and total booked time.
- Supports sorting by gross profit, profit per hour, or completed visit count.

## Limits

- Uses the same fixed ranges as Finance first pass: this month and last 30 days.
- No CSV export yet.
- No service trend chart yet.
- No automated pricing recommendation yet.
