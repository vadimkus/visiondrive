# Mobile Pre-Login UI Refresh

## Intent

Make the public mobile web path into Practice OS feel minimal and app-like before login.

## Changes

- Shortened the mobile homepage hero copy to one compact line.
- Added a direct mobile `Open workspace` action beside `Request demo`.
- Kept the longer product explanation for desktop only.
- Removed long portal-card body copy on mobile.
- Simplified `/login` into a minimal Practice OS sign-in screen with fewer labels and no marketing footer.
- Reused the shared `Logo` component on login, removing the raw `<img>` warning.
- Reduced mobile header/footer visible text.

## Verification

- `npm run type-check`: passed.
- `npm run lint`: passed. Only the existing module-type warning remains.
