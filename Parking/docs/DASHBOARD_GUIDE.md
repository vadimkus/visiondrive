# VisionDrive Parking Dashboard - User Guide

## Accessing the Dashboard

### URL
```
https://your-domain.vercel.app/portal/parking
```

### Navigation

The dashboard is accessible from the main VisionDrive portal sidebar under "IoT Monitoring" → "Parking".

---

## Dashboard Overview

### Main Dashboard (`/portal/parking`)

The main dashboard provides an at-a-glance view of the entire parking system.

#### Stats Cards
- **Total Zones** - Number of configured parking zones
- **Parking Bays** - Total bays with occupied count
- **Active Sensors** - Number of online sensors
- **Occupancy Rate** - Overall percentage occupied

#### Zones List
Shows top zones with:
- Zone name
- Occupancy percentage
- Occupied/total count
- Color-coded status

#### Recent Events
Live feed of parking activity:
- Arrivals (green arrow)
- Departures (red arrow)
- Time since event
- Duration (for departures)

#### Sensor Health
Quick summary of sensor status:
- Online count
- Low battery warnings
- Offline sensors

---

## Page Reference

### Live Map (`/portal/parking/map`)

Interactive map showing all parking zones.

**Features:**
- Zone markers with occupancy colors
- Click zone for details
- Side panel with zone list
- Real-time updates

**Color Legend:**
- 🟢 Green: < 40% occupied
- 🟡 Amber: 40-80% occupied
- 🔴 Red: > 80% occupied

---

### Zones (`/portal/parking/zones`)

List of all parking zones with filtering.

**Columns:**
- Zone name
- Type (Paid/Free)
- Total bays
- Occupied/Vacant counts
- Occupancy percentage
- Operating hours
- Price per hour

**Filters:**
- Search by name/address
- Filter by occupancy level

**Actions:**
- Click zone to view details
- Add new zone (admin only)

---

### Zone Detail (`/portal/parking/zones/{id}`)

Detailed view of a single zone.

**Information:**
- Zone header with stats
- Bay grid visualization
- Recent activity log
- Sensor health

**Bay Grid:**
- Each square = one bay
- Color indicates status
- Click for bay details

**Color Legend:**
- 🟢 Green: Occupied
- ⬜ Gray: Vacant
- 🟡 Amber: Unknown/Offline

---

### Sensors (`/portal/parking/sensors`)

Manage and monitor all parking sensors.

**Columns:**
- Sensor ID
- Model
- Zone / Bay assignment
- Status (Active/Inactive)
- Battery level
- Signal strength
- Last seen

**Filters:**
- Search by ID, DevEUI, model
- Filter by status
- Filter by battery level

**Alerts:**
- Low battery (< 20%)
- Offline (no report in 60 min)

---

### Events (`/portal/parking/events`)

Complete log of parking events.

**Columns:**
- Event type (Arrive/Leave)
- Zone
- Bay
- Duration (for departures)
- Revenue (calculated)
- Timestamp

**Filters:**
- Event type filter
- Time range
- Result limit (25/50/100/200)

**Export:**
- Download as CSV/JSON

---

### Analytics (`/portal/parking/analytics`)

Usage statistics and insights.

**KPIs:**
- Average occupancy
- Total events
- Average duration
- Estimated revenue

**Charts:**
- Zone performance comparison
- Hourly activity distribution
- Revenue breakdown

**Time Periods:**
- Today
- This Week
- This Month

---

### Alerts (`/portal/parking/alerts`)

System alerts and notifications.

**Alert Types:**
- 🔋 Low Battery
- 📡 Sensor Offline
- ⚠️ Detection Issues

**Severity Levels:**
- Critical (red)
- Warning (amber)

**Actions:**
- Acknowledge
- Resolve
- View history

---

### Settings (`/portal/parking/settings`)

Configure system preferences.

**Alert Settings:**
- Low battery threshold (%)
- Offline timeout (minutes)
- Email alerts toggle
- SMS alerts toggle

**System Settings:**
- Dashboard refresh interval
- Timezone selection

**API Configuration:**
- View API endpoint
- View IoT endpoint
- Connection status

---

## Common Tasks

### Finding a Specific Zone

1. Navigate to Zones page
2. Use search box to filter
3. Click zone card for details

### Checking Sensor Battery

1. Navigate to Sensors page
2. Sort by battery level
3. Filter "Low Battery" to see warnings

### Viewing Recent Activity

1. Go to Events page
2. Set limit to desired amount
3. Filter by event type if needed

### Checking Occupancy Trends

1. Navigate to Analytics page
2. Select time period
3. Review hourly activity chart

### Responding to Alerts

1. Go to Alerts page
2. Review open alerts
3. Click "Acknowledge" to mark as seen
4. Click "Resolve" when fixed

---

## Mobile Access

The dashboard is fully responsive:
- Works on tablets and phones
- Touch-friendly controls
- Collapsible sidebar on mobile

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `R` | Refresh data |
| `Esc` | Close modal |
| `/` | Focus search |

---

## Data Refresh

- Dashboard auto-refreshes every 30 seconds
- Manual refresh: Click reload or press `R`
- Settings can change refresh interval

---

## Troubleshooting

### Data Not Loading

1. Check internet connection
2. Verify API endpoint is accessible
3. Check browser console for errors
4. Try hard refresh (Ctrl+F5)

### Outdated Data

1. Check last refresh time
2. Verify API is responding
3. Check for system alerts

### Missing Zones/Sensors

1. Verify registration in database
2. Check tenant/zone associations
3. Review API permissions

---

## Support

For dashboard issues, check:
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Browser developer console
- API response errors
