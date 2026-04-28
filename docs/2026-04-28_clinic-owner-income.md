# Clinic Owner Income

## Context

The next Altegio adaptation item was multi-employee payroll. For a solo home-visit practice, payroll is the wrong abstraction. The useful replacement is a simple owner-income view plus optional assistant/helper cost tracking through expenses.

## Shipped

- Added an Owner income panel to `/clinic/finance`.
- Reused existing finance overview data; no API or schema change.
- Relabeled `SUPPORT` expense category in the UI as Assistant / support.
- Added EN/RU copy and a Knowledge Base article.
- Updated backlog, architecture, data model, chunks, and docs index.

## Behavior

The panel shows:

- owner take-home estimate: current operating profit,
- assistant / support cost: expenses in the `SUPPORT` category,
- owner income per completed visit,
- assistant cost share of gross profit.

Assistant, freelancer, or helper payments should be recorded as normal expenses in the Assistant / support category. This keeps Finance useful for solo practitioners without introducing employee records, salary runs, taxes, or payroll tables.

## Next Improvements

- Optional monthly owner draw target.
- Trend chart for owner income by month.
- Expense quick-add preset for assistant/helper payments.
- Split assistant support into recurring and one-off costs if needed later.
