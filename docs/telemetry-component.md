# HeaderTelemetry Component

## Overview
A sci-fi/industrial style HUD telemetry bar for the Vision Drive IoT portal, displaying real-time environmental sensor data.

## Features

### Visual Design
- **Dark slate gradient background** with translucency and backdrop blur
- **Monospace typography** for technical readability
- **Color-coded status indicators** for quick visual scanning
- **Pulse animations** on live data indicators
- **Responsive layout** that adapts from desktop to mobile

### Data Points Displayed

1. **Live Indicator**
   - Pulsing radio icon showing real-time connection status
   - Green color indicates active telemetry

2. **Temperature & Humidity**
   - Temperature in Celsius (blue themed)
   - Relative Humidity percentage (cyan themed)
   - Grouped together with thermometer and droplet icons

3. **Wind Data**
   - Direction (N, NE, E, SE, S, SW, W, NW)
   - Speed in km/h
   - Animated wind icon that rotates based on direction
   - Smooth 500ms transition between direction changes

4. **Air Quality (Particulate Matter)**
   - **PM2.5** - Fine particulate matter
   - **PM10** - Coarse particulate matter
   - Color-coded status:
     - **GREEN**: Good (PM2.5 ≤ 12 µg/m³)
     - **YELLOW**: Moderate (PM2.5 ≤ 35 µg/m³)
     - **ORANGE**: Unhealthy (PM2.5 ≤ 55 µg/m³)
     - **RED**: Hazardous (PM2.5 > 55 µg/m³)
   - Pulsing status indicator dot
   - Text label showing status (GOOD/MODERATE/UNHEALTHY/HAZARDOUS)

5. **CO₂ Levels**
   - Carbon dioxide concentration in ppm
   - Color-coded thresholds:
     - **GREEN**: ≤ 450 ppm (excellent)
     - **YELLOW**: ≤ 700 ppm (acceptable)
     - **ORANGE**: > 700 ppm (poor ventilation)

6. **System Status**
   - "ALL SYSTEMS NOMINAL" indicator
   - Pulsing activity icon

## Technical Implementation

### Mock Data Simulation
Currently uses simulated data that updates every 5 seconds with realistic fluctuations:
- Temperature: ±0.25°C variation
- Humidity: ±1% variation
- Wind speed: ±1 km/h variation
- Wind direction: Random changes between 8 compass points
- PM2.5/PM10: ±1.5-2 µg/m³ variation
- CO₂: ±5 ppm variation

### Responsive Behavior
- **Desktop (≥1024px)**: Full labels and all text visible
- **Tablet (768-1023px)**: Some labels hidden, core data visible
- **Mobile (<768px)**: Condensed to icons and numbers only
- Horizontal scroll enabled for very small screens

### Integration
Located in: `/app/components/portal/HeaderTelemetry.tsx`

Integrated into: `/app/portal/layout.tsx` below `PortalNavigation`

### Future Enhancements
To connect real data:
1. Replace mock data state with API calls to your sensor network
2. Add WebSocket connection for true real-time updates
3. Implement data point selection (user chooses which metrics to display)
4. Add historical trend mini-charts on hover
5. Implement threshold configuration per tenant
6. Add alert indicators when values exceed configured thresholds

## Usage

The component is automatically included in all portal pages via the portal layout.

### Customization Props (Future)
```typescript
interface HeaderTelemetryProps {
  dataSource?: 'mock' | 'api' | 'websocket'
  updateInterval?: number // milliseconds
  visibleMetrics?: string[] // allow users to show/hide specific metrics
  thresholds?: {
    pm25?: { good: number, moderate: number, unhealthy: number }
    co2?: { good: number, moderate: number }
    temperature?: { min: number, max: number }
  }
}
```

## Styling
Uses Tailwind CSS with custom animations:
- `animate-ping`: Pulsing effect on live indicator
- `animate-pulse`: Breathing effect on status dots
- Smooth transitions on wind direction icon rotation

## Accessibility
- Clear visual hierarchy with appropriate contrast ratios
- Color-coding supplemented with text labels
- Responsive font sizing for readability
- Icons from lucide-react for consistency


