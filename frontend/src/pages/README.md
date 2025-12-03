# Pages Directory

This directory contains all page components for the Vision Drive website.

## Structure

```
pages/
├── home/              # Homepage components
├── solutions/         # Solution pages
│   ├── drivers/
│   ├── businesses/
│   └── government/
├── technology/        # Technology pages
│   ├── how-it-works/
│   ├── sensors-gateway/
│   └── platform/
├── app/              # App-related pages
│   ├── features/
│   ├── download/
│   └── guide/
├── partners/         # Partner pages
│   ├── commercial/
│   ├── government/
│   └── become-partner/
├── about/            # About pages
│   ├── story/
│   ├── team/
│   ├── careers/
│   └── news/
├── contact/          # Contact page
├── blog/            # Blog pages
├── resources/       # Resources page
└── support/        # Support page
```

## Page Component Structure

Each page should follow this structure:

```typescript
// Example: pages/home/HomePage.tsx
import React from 'react';
import { HeroSection } from '@/components/sections';
import { Layout } from '@/components/layout';

export const HomePage: React.FC = () => {
  return (
    <Layout>
      <HeroSection />
      {/* Other sections */}
    </Layout>
  );
};
```

## Page Requirements

### SEO
- Each page should have unique meta tags
- Include Open Graph tags
- Add structured data (JSON-LD) where applicable

### Accessibility
- Proper heading hierarchy (h1 → h2 → h3)
- ARIA labels where needed
- Keyboard navigation support

### Performance
- Lazy load images
- Code splitting for large pages
- Optimize bundle size

### Multi-language
- Support English and Arabic
- RTL layout for Arabic
- Language switcher

