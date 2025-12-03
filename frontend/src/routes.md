# Frontend Routes Structure

This document outlines the routing structure for the Vision Drive website.

## Primary Navigation Routes

```
/                → HomePage
/solutions       → Solutions Page (Communities/Malls & Municipalities/RTA)
/app             → The App Page (User experience and features)
/data-analytics  → Data & Analytics Page (B2B partner focus)
/about           → About Us Page (Credibility, FZ-LLC status, team)
/contact         → Contact Page (Lead generation and pilot inquiry)
```

## Route Configuration

### Public Routes

```
/                → HomePage
                 - Hero: "Guaranteed Parking. Seamless Mobility. Driven by Vision."
                 - Core Value
                 - How It Works (3 Steps)
                 - Featured Clients/Pilot Areas (20 pilot spots)
                 - CTAs: Download App / Request Pilot Demo

/solutions       → Solutions Page
                 - For Communities/Malls
                 - For Municipalities/RTA
                 - Technology Deep Dive (LW009-SM Sensors, RAK7289CV2 Gateway)

/app             → The App Page
                 - Key Features (real-time map, reservation, pricing, payment)
                 - User Benefits (guarantee, time savings, reduced stress)
                 - Screenshots/Demo
                 - Download Section

/data-analytics  → Data & Analytics Page
                 - Data Products (Demand Reports, Turnover Metrics, Violation Reports)
                 - Business Intelligence (Urban Planning, Pricing Strategy, Infrastructure)
                 - Dashboard Preview
                 - Use Cases & Case Studies

/about           → About Us Page
                 - Vision & Mission
                 - Compliance (FZ-LLC status, UAE Smart City standards)
                 - The Team
                 - Company Milestones

/contact         → Contact Page
                 - Contact Information
                 - Pilot Inquiry Form (Primary CTA)
                 - General Contact Form
                 - Partnership Inquiry Form
                 - Office Location

/blog            → Blog Listing Page
/blog/:slug      → Blog Post Page
/privacy         → Privacy Policy Page
/terms           → Terms of Service Page
/support         → Support Page
```

## Route Groups

### Solutions Routes
- `/solutions/drivers`
- `/solutions/businesses`
- `/solutions/government`

### Technology Routes
- `/technology/how-it-works`
- `/technology/sensors-gateway`
- `/technology/platform`

### App Routes
- `/app/features`
- `/app/download`
- `/app/guide`

### Partners Routes
- `/partners/commercial`
- `/partners/government`
- `/partners/become-partner`

### About Routes
- `/about/story`
- `/about/team`
- `/about/careers`
- `/about/news`

## Implementation Notes

- Use React Router, Next.js routing, or Vue Router depending on framework choice
- Implement route guards for protected content
- Add breadcrumb navigation for nested routes
- Implement 404 page for invalid routes
- Add route-based meta tags for SEO

