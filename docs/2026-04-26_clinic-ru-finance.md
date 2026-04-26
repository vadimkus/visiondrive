# Clinic RU Locale and Finance Module

Date: 2026-04-26

Context: Practice OS needed Russian as the second language instead of Arabic, plus a finance area for profitability and expenses.

Changes:
- Replaced the active clinic secondary locale with `ru` in the shell, locale storage reader, date formatting, and primary Practice OS strings.
- Added `/clinic/finance` navigation and page.
- Added clinic finance APIs:
  - `GET /api/clinic/finance/overview`
  - `GET /api/clinic/finance/expenses`
  - `POST /api/clinic/finance/expenses`
- Finance overview uses tenant-scoped `ClinicPatientPayment` as revenue:
  - `PAID` payments count as paid revenue.
  - `REFUNDED` payments reduce net revenue.
  - `PENDING` payments are reported separately.
- Expenses use the existing tenant-scoped `Expense` ledger instead of duplicating a second clinic expense table.
- UI includes current month / last 30 days filters, KPI cards, expense category breakdown, recent expenses, and expense entry.

Validation:
- `npm run type-check`
- `npm test`
- `npm run build`

Notes:
- No schema push is required for this finance pass because it reuses the existing `expenses` table and `ExpenseCategory` enum.
- A later finance pass can add invoice numbering, receivables aging, staff cost allocation, tax/VAT reporting, and export to CSV/PDF.
