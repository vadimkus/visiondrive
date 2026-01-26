# Mobile Kitchen Owner Portal Design

**Date:** January 26, 2026  
**URL:** https://www.visiondrive.ae/kitchen-owner

## Overview

The Kitchen Owner Portal has been redesigned with an Apple-like mobile-first experience, enabling kitchen owners to monitor their temperature sensors via mobile web browser with a native app feel.

## Design Philosophy

- **Apple iOS Design Language**: Clean, minimal interface with rounded corners (2xl/3xl), subtle shadows, and smooth transitions
- **Mobile-First**: Designed for phone screens first, then scales up for desktop
- **Touch-Optimized**: All interactive elements have 44px+ tap targets (Apple HIG standard)
- **Native Feel**: Bottom tab navigation, slide-out menus, haptic-ready animations

## Components

### 1. Mobile Bottom Navigation (`MobileNav.tsx`)

iOS-style tab bar with 5 main sections:
- **Home** - Dashboard overview
- **Sensors** - Equipment monitoring
- **Alerts** - Alert management (with badge count)
- **Reports** - Compliance reports
- **Profile** - Settings & preferences

Features:
- Fixed at bottom of screen
- Backdrop blur effect
- Active state indicator dot
- Badge support for unread alerts
- Safe area support for iPhone notch

### 2. Mobile Header (`MobileHeader.tsx`)

Contextual header with hamburger menu:
- Dynamic page title based on route
- VisionDrive logo
- Menu button opens slide-out panel

Slide-out Menu:
- User profile card with avatar
- Dubai Municipality compliance badge
- Navigation to secondary pages (Compliance, Subscription, Terms, Privacy, Help)
- Dark/Light mode toggle
- Sign out button

### 3. Dashboard Page (`page.tsx`)

Apple-like card-based UI:

**Greeting Section**
- Personalized welcome message
- Current date display

**Status Card**
- Gradient background (emerald/amber/red based on status)
- Overall compliance status
- Stats row: Compliance %, Online sensors, Active alerts
- Glassmorphism effect with backdrop blur

**Quick Actions**
- 3-column grid of action buttons
- Gradient icon backgrounds with colored shadows
- Reports, History, Compliance shortcuts

**Sensor Cards**
- Horizontal scrollable carousel
- Snap-to-card scrolling behavior
- Temperature display with status color
- Battery indicator
- Online/offline status

**Alerts Section**
- List view with severity icons
- Acknowledge button for active alerts
- Time stamps

### 4. Login Page (`login/page.tsx`)

Mobile-optimized authentication:
- Gradient header with logo
- Decorative background circles
- Feature pills (Live Monitoring, DM Compliant)
- Large input fields with icons
- Animated loading state
- Touch-friendly checkbox and links

## Responsive Behavior

| Screen Size | Navigation | Header | Layout |
|-------------|------------|--------|--------|
| Mobile (<768px) | Bottom tab bar | Mobile header with hamburger | Single column, horizontal scroll |
| Desktop (≥768px) | Left sidebar | Weather header | Multi-column grid |

## CSS Utilities Added

```css
/* Safe area for iPhone notch/home indicator */
.safe-area-inset-top { padding-top: env(safe-area-inset-top); }
.safe-area-inset-bottom { padding-bottom: env(safe-area-inset-bottom); }
.h-safe-area-inset-bottom { height: env(safe-area-inset-bottom); }

/* Hide scrollbar but keep scroll functionality */
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

/* iOS momentum scrolling */
.scroll-touch { -webkit-overflow-scrolling: touch; }
```

## Color Scheme

### Light Mode
- Background: `#f5f5f7` (Apple gray)
- Cards: `#ffffff`
- Primary: Orange/Amber gradients

### Dark Mode
- Background: `#000000` (Pure black for OLED)
- Cards: `#1c1c1e` (iOS dark gray)
- Text: White with gray variants

## Animations

- **Scale on tap**: `active:scale-95` for buttons
- **Smooth transitions**: 200ms duration
- **Slide-in menu**: 300ms ease-out transform
- **Pulse**: Alert icons animate when status is warning/critical

## Testing

To test the mobile design:

1. Open https://www.visiondrive.ae/kitchen-owner on mobile browser
2. Or use Chrome DevTools mobile emulation (iPhone 14 Pro recommended)
3. Test touch interactions, scrolling, and menu navigation

## Files Modified/Created

| File | Type | Description |
|------|------|-------------|
| `app/kitchen-owner/components/MobileNav.tsx` | New | Bottom tab navigation |
| `app/kitchen-owner/components/MobileHeader.tsx` | New | Mobile header with menu |
| `app/kitchen-owner/layout.tsx` | Modified | Responsive layout switching |
| `app/kitchen-owner/page.tsx` | Modified | Mobile-first dashboard |
| `app/login/page.tsx` | Modified | Mobile-optimized login |
| `app/globals.css` | Modified | Safe area utilities |

## Future Enhancements

- [ ] Add to Home Screen (PWA manifest)
- [ ] Push notifications for alerts
- [ ] Offline support with service worker
- [ ] Pull-to-refresh gesture
- [ ] Swipe gestures for card dismissal
