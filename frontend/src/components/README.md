# Components Directory

Reusable components for the Vision Drive website.

## Structure

```
components/
├── layout/          # Layout components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Navigation.tsx
│   └── Layout.tsx
├── common/          # Common UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   ├── Form.tsx
│   └── ...
├── features/        # Feature-specific components
│   ├── ParkingMap.tsx
│   ├── OccupancyDisplay.tsx
│   ├── AppPreview.tsx
│   └── ...
└── sections/        # Page sections
    ├── HeroSection.tsx
    ├── TrustIndicators.tsx
    ├── FeaturesGrid.tsx
    ├── Testimonials.tsx
    ├── CTASection.tsx
    └── ...
```

## Component Categories

### Layout Components
- **Header**: Main navigation and header
- **Footer**: Footer with links and contact info
- **Navigation**: Main navigation menu
- **Layout**: Wrapper component for pages

### Common Components
- **Button**: Reusable button component
- **Card**: Card container component
- **Modal**: Modal/dialog component
- **Form**: Form components and inputs
- **Loading**: Loading states
- **Error**: Error display components

### Feature Components
- **ParkingMap**: Interactive parking map
- **OccupancyDisplay**: Real-time occupancy display
- **AppPreview**: App screenshot/preview component
- **SensorVisualization**: Sensor technology visualization
- **GatewayDiagram**: Gateway system diagram

### Section Components
- **HeroSection**: Hero banner sections
- **TrustIndicators**: Partner logos, stats
- **FeaturesGrid**: Feature showcase grid
- **Testimonials**: Testimonial carousel
- **CTASection**: Call-to-action sections
- **TechnologySection**: Technology explanation sections
- **PartnersSection**: Partner showcase sections

## Component Guidelines

### Naming Convention
- Use PascalCase for component names
- Match file name to component name
- Use descriptive names

### Props
- Define TypeScript interfaces for props
- Use default props where appropriate
- Document complex props

### Styling
- Use CSS Modules or styled-components
- Follow design system tokens
- Ensure responsive design
- Support RTL for Arabic

### Accessibility
- Include ARIA labels
- Support keyboard navigation
- Ensure color contrast
- Test with screen readers

