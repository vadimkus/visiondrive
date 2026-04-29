# Clinic Workspace Layout Alignment

Date: 2026-04-29

## Context

The dashboard felt left-positioned compared with centered pages such as Patients and Knowledge Base. The issue was the dashboard desktop wrapper using a max width without horizontal auto margins.

## Change

- Updated `app/clinic/page.tsx` desktop dashboard wrapper from left-aligned `max-w-[92rem]` to the shared centered rail: `mx-auto w-full max-w-6xl`.
- This aligns Dashboard with the current Patients and Knowledge Base content width.

## Validation

- `npm run type-check` passed.
- `ReadLints` reported no issues for `app/clinic/page.tsx`.
