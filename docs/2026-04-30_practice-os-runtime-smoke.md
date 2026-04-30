# Practice OS Runtime Smoke

Date: 2026-04-30

## Scope

Executed post-localization runtime checks on the local dev app at `http://127.0.0.1:3000` / `http://localhost:3000` using seeded clinic credentials `admin` / `admin5`.

## Results

- Clean-restarted the Next.js dev server after detecting a stale Turbopack cache panic that caused `/api/auth/me` to return 500.
- Confirmed `/api/auth/me` returns 401 when unauthenticated after the clean restart.
- Ran `npm run test:clinic-flow` successfully end-to-end:
  - clinic login
  - stats and current user
  - patient, procedure, inventory, and appointment creation
  - booking policy enforcement
  - deposit payment link and mark-paid workflow
  - no-show fee workflow
  - card-on-file workflow
  - patient chart, anamnesis, AI note assistant, summary PDF
  - completed visit with inventory auto-deduct
  - media, payment, CRM activity, reschedule
  - inventory lookup, purchase order, and stock receipt
- Admin tools API smoke passed:
  - listed users and stats
  - created a temporary smoke user with generated password
  - reset/generated password successfully
  - soft-removed the temporary smoke user
  - confirmed invalid role/password inputs correctly return 400
- Public/patient-facing pages checked:
  - `/book/visiondrive` returns 200
  - `/api/clinic/public-booking/visiondrive` returns 200
  - generated patient portal link returns 200
  - generated deposit payment link returns 200
  - `/profile/demo` returns 308 to `/`
  - `/portal` initially still existed and redirected unauthenticated users to login
- Push VAPID endpoint returns 200 with `{ configured: false }`, which is expected when keys are not configured locally.

## Mobile RU UI Smoke

Browser automation ran at a 390 x 844 viewport.

Passed surfaces:

- Public homepage in RU
- Login page in RU
- Authenticated dashboard after switching workspace locale to RU
- Appointments page
- Patients page
- Inbox
- Admin tools

Observed:

- No visible clipping or overlap on tested mobile surfaces.
- Labels, navigation, buttons, tabs, placeholders, and admin tool controls rendered in Russian after locale switch.
- Login with `admin` / `admin5` worked.
- No test data was deleted through the browser pass.

Console:

- No critical application errors observed.
- Non-blocking dev warnings were present: Vercel analytics CSP blocks in local dev, HMR messages, and one hydration mismatch warning.

## Caveats

- The first run failed because the dev server had a corrupted Turbopack cache from earlier build/dev overlap. Clean restart fixed it.
- Follow-up cleanup quarantined `/portal` at `proxy.ts`: `/portal/*` redirects to `/clinic`, and `/api/portal/*` returns `410`.
- Follow-up cleanup migrated the deprecated `middleware.ts` convention to `proxy.ts`.
