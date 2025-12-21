'use client'

import { useState } from 'react'
import Section from '../components/common/Section'
import { ChevronRight, ChevronDown } from 'lucide-react'

interface NoteSection {
  id: string
  title: string
  content: string[]
}

const noteSections: NoteSection[] = [
  {
    id: 'executive',
    title: '1. Executive Summary',
    content: [
      'Parksense is a dual-purpose urban intelligence platform:',
      '• For Drivers: A real-time parking finder, payment wallet, and "Smart Commuter" tool.',
      '• For Property: A weather station network and asset management system for skyscrapers.',
      'The system utilizes a Freemium consumer model while unlocking B2B revenue through building management and environmental data sales.',
    ],
  },
  {
    id: 'roadmap',
    title: '2. Project Roadmap (Phased Delivery)',
    content: [
      'Phase 1: The "Connected Asphalt" MVP (Months 1-2)',
      '• Deploy Test Site: 1 Gateway + 5 Parking Sensors + 1 Weather Station',
      '• Backend: LORIOT NS → Webhook → /api/iot/uplink → Kafka → consumers → Tiger Cloud (Timescale)',
      '• App (Alpha): Live Map showing Green/Red dots',
      '• Feature: "Manual Pin" Car Finder (Level A)',
      '',
      'Phase 2: The "Dubai Driver" Update (Months 3-4)',
      '• Unified Payments: Aggregation of RTA (Dubai), Mawaqif (Abu Dhabi), and Sharjah payments',
      '• "Summer Mode": Routing algorithm prioritizing covered/shaded parking',
      '• Car Finder Level B: Implement "Smart Handshake" logic',
      '• App (Beta): Release to TestFlight',
      '',
      'Phase 3: Monetization & Intelligence (Months 5-6)',
      '• Weather Layer: Frontend toggle for Heatmaps & Air Quality overlays',
      '• Subscription Gate: Stripe/Apple Pay integration for "Pro" upgrades',
      '• Alerts Engine: Push notifications (e.g., Sandstorm Warnings)',
      '• Merchant Validation: QR Code scanning logic for retail partners',
      '',
      'Phase 4: Skyscrapers & Ecosystem (Month 7+)',
      '• "Spot Guard": Security alerts for private residential bays',
      '• "Spot Share": Airbnb-style subletting of private parking spots',
      '• 3rd Party Integration: CAFU (Fuel) and Car Wash API connections',
    ],
  },
  {
    id: 'techstack',
    title: '3. Tech Stack ("Bleeding Edge" 2025 Architecture)',
    content: [
      '3.1. Mobile App (Performance First)',
      '• Framework: Expo SDK 52+ (React Native)',
      '• Routing: Expo Router (file-based routing)',
      '• Graphics: React Native Skia (High-performance UI for weather overlays)',
      '• Maps: Mapbox (mobile SDK) or Google Maps SDK (routing + traffic)',
      '• Driving UX: CarPlay first (UAE reality), then in-app map as secondary',
      '',
      '3.2. Backend & API (Vercel + Services + Event Bus)',
      '• Portal/Web: Next.js hosted on Vercel',
      '• Backend: NestJS (TypeScript) services for IoT, routing, payments, ads, analytics',
      '• LoRaWAN NS: LORIOT (enterprise/private)',
      '• Ingestion: LORIOT Webhook → /api/iot/uplink (store raw + decoded payloads)',
      '• Event bus: Kafka (managed) for scalable ingestion + replay + decoupled processing',
      '• Database: ✅ Tiger Cloud (Timescale) — managed PostgreSQL with TimescaleDB + vector support (LIVE / PROD)',
      '• Time-series: TimescaleDB hypertables (sensor logs, events, analytics)',
      '• AI: pgvector extension (future pattern matching / personalization)',
    ],
  },
  {
    id: 'enterprise-stack',
    title: '3.3. Enterprise Day-1 Reference Architecture (Recommended Default)',
    content: [
      'Recommended “enterprise day 1” combo (practical)',
      'If you want a single coherent default:',
      '• LORIOT (enterprise/private) as NS',
      '• Backend: NestJS + Postgres + Timescale',
      '• Event bus: Kafka (managed)',
      '• Infra: AWS (or GCP) with proper networking, WAF, IAM, monitoring',
      '• Portal: Next.js',
      '',
      'Enterprise data flow (sensor → iPhone app):',
      '1) Sensor sends LoRaWAN uplink (occupancy/weather).',
      '2) Gateway receives RF and forwards packets over IP backhaul.',
      '3) LORIOT NS authenticates + decrypts + deduplicates + attaches metadata (RSSI/SNR/gateway/time).',
      '4) LORIOT Integration forwards event to Backend Ingest (HTTP webhook).',
      '5) NestJS validates + normalizes + assigns internal IDs (tenant/site/sensor).',
      '6) NestJS publishes to Kafka topics (raw uplinks + normalized sensor events).',
      '7) Kafka consumers decode payloads, run rules/alerts, compute current state.',
      '8) Write storage:',
      '   • Postgres: users/orgs/sensors/current state/config',
      '   • TimescaleDB: time-series sensor logs/events for analytics',
      '9) NestJS API serves both:',
      '   • Commercial iPhone app (map, availability, history)',
      '   • Portal (Next.js) dashboards + ops tools',
      '10) Realtime (optional): WebSockets/SSE + push notifications for alerts.',
      '',
      'Effort estimate (solo developer + AI, single-tenant MVP):',
      '• MVP Pilot (payments + subscriptions + occupancy + weather): ~7–10 weeks full-time',
      '• Enterprise-ready v1 (multi-site + hardening + ops): ~3–4 months total from start',
      '',
      'What “multiple operators” means (multi-tenant):',
      '• An operator is a separate organization that manages its own parking assets and needs its own portal + data.',
      '• Examples: municipality authority, mall operator, property/tower management company, or a private parking operator.',
      '• Multi-tenant requirement: strict separation so Operator A cannot see Operator B sensors, events, dashboards, or billing.',
    ],
  },
  {
    id: 'hardware',
    title: '4. Hardware Architecture',
    content: [
      '4.1. Parking Sensors (Occupancy)',
      '• Device: MokoSmart LW009 (LoRaWAN)',
      '• Mounting: Surface-mounted (Asphalt/Concrete)',
      '• Trigger: Magnetic/Radar event (Car Enters/Leaves)',
      '',
      '4.2. Weather Stations (Environmental)',
      '• Device: Seeed Studio SenseCAP ONE S900 (or Rika RK900)',
      '• Metrics: PM2.5, PM10, Temp, Humidity, Wind Speed, Rain',
      '• Bridge: RAK7431 (RS485 to LoRa Bridge)',
      '• Logic: Weather station is wired to RAK7431 on the gateway pole; transmits wirelessly to the network',
      '',
      '4.3. Tower Connectivity (Vertical Scale)',
      '• Infrastructure: 1 Gateway on Podium/Ground + LoRa Repeaters every 3-4 floors to ensure signal reaches B3 basements and P10 podiums',
    ],
  },
  {
    id: 'modules',
    title: '5. Functional Modules',
    content: [
      '5.1. Smart Car Finder & Wayfinding (3 Levels)',
      '• Level A (Manual): User taps "Park Here" on map',
      '• Level B (Smart Handshake): Backend auto-pins location when sensor status = Occupied AND user GPS = <15m from Sensor AND phone activity = Driving → Walking',
      '• Level C (Offline): User snaps photo of pillar; image saved locally (No Internet required)',
      '',
      '5.2. Hyper-Local Weather Intelligence',
      '• Visuals: Map toggles for "Heatmap" (Real-feel temp) and "Air Quality" (PM2.5)',
      '• Car Wash Rule: If Rain Probability > 50% in next 4 hours → Disable "Order Wash" button',
      '• Health Rule: If PM2.5 > High → Suggest "Indoor Parking" for walking routes',
      '',
      '5.3. "Tower Mode" (Skyscraper Management)',
      '• Spot Guard: Resident sets status to "Away". If sensor detects car, alert sent',
      '• Spot Share: Resident lists spot availability (e.g., 09:00-18:00). Visitors book and pay via app',
      '• Guest Pass: QR code for visitors guides them to specific "Green" visitor bays only',
      '',
      '5.4. Unified Payments',
      '• Geo-Fencing: Auto-detects zone (Dubai Zone A vs. Abu Dhabi)',
      '• One-Tap Pay: Aggregates SMS/API gateways for RTA, Mawaqif, and Private barriers',
    ],
  },
  {
    id: 'business',
    title: '6. Business Model (Tiers)',
    content: [
      'Free Tier ("The Daily Driver")',
      '• Real-Time Green/Red Map',
      '• Unified Payment Gateway',
      '• Manual Car Finder',
      '• Basic Navigation',
      '',
      'Pro Tier (~29 AED/Month)',
      '• Summer Mode: Routing to shaded/basement spots',
      '• Smart Handshake: Auto-car pinning',
      '• Weather Intelligence: Full Air Quality/Heat maps',
      '• Smart Alerts: Sandstorm/Rain warnings',
      '• Discounts: 10-15% off Valet & Car Wash',
    ],
  },
  {
    id: 'userstories',
    title: '7. User Stories',
    content: [
      'US-01: The One-Tap Payment',
      'As a Daily Commuter, I want to pay for parking in any RTA or Mawaqif zone instantly so that I don\'t have to remember different zone codes.',
      '',
      'US-02: Summer Mode (Heat Avoidance)',
      'As an Executive with a leather-interior car, I want to be routed to covered parking during the afternoon so that my car doesn\'t get dangerously hot.',
      '',
      'US-03: Smart Handshake (Car Finder)',
      'As a Shopper at Dubai Mall, I want to have my parking spot automatically saved when I walk away.',
      '',
      'US-04: The Spot Guard (Security)',
      'As a JLT Resident, I want to receive an alert if my private parking spot is occupied while I am away.',
      '',
      'US-05: The Spot Share (Monetization)',
      'As a Landlord in Marina, I want to list my empty parking spot for rent during working hours.',
      '',
      'US-06: Weather-Aware Services',
      'As a Car Owner, I want to be warned if I try to order a car wash when rain is predicted.',
      '',
      'US-07: Offline Photo Log',
      'As a Tourist in a deep basement (No Signal), I want to take a photo of the parking pillar number inside the app.',
      '',
      'US-08: Health & Air Quality',
      'As an Asthmatic user, I want to see the real-time air quality (PM2.5) of a neighborhood on the map.',
      '',
      'US-09: EV Charging Availability',
      'As an EV Owner, I want to see the real-time availability of charging stations.',
      '',
      'US-10: Seamless Visitor Access',
      'As a Guest visiting a residential tower, I want to scan a digital pass at the barrier.',
    ],
  },
  {
    id: 'technical',
    title: '8. Technical Requirements (Backend)',
    content: [
      '8.1. Database Schema (Tiger Cloud / PostgreSQL + TimescaleDB)',
      '• users: standard auth profile + roles',
      '• sites/zones/bays: map configuration and hierarchy',
      '• sensors: id, devEUI, lat, long, type (parking/weather), zone_id, status, last_seen, battery',
      '• sensor_events (Timescale hypertable): time, sensor_id, decoded_json, raw_payload, rssi/snr, gateway_id',
      '• parking_sessions: user_id, bay_id/sensor_id, start_time, end_time, payment_state, proof (optional)',
      '',
      '8.2. Payload Decoders',
      '• Parking (MokoSmart): Decode Hex to { status: boolean, battery: int }',
      '• Weather (RAK7431): Decode Modbus Register array to { temp: float, humidity: float, wind_speed: float, rain: boolean }',
      '',
      '8.3. Realtime',
      '• Publish state changes via WebSockets/SSE (app + portal) and push notifications for alerts',
      '• Optional: use Kafka topics as the internal event backbone for realtime fan-out',
    ],
  },
  {
    id: 'parksense-functional',
    title: '9. ParkSense App Functionality (Sensor-First Competitive Moat)',
    content: [
      'Key insight: competitors estimate occupancy from payments per zone. ParkSense uses per-bay sensors → “We don’t guess. We see.”',
      '',
      '9.1. Core App Screens (MVP)',
      '• Home (Map-first): live parking availability + “Navigate to best spot”',
      '• Search/Destination: address/POI search → choose destination',
      '• Results: ranked parking options near destination (free first, then paid)',
      '• Parking Result: selected bay/cluster with drive ETA + walk ETA + confidence',
      '• Navigation View: simplified last-300m UI (safe driving)',
      '• Parked: car finder (auto + manual) + timer + pay/extend actions',
      '• Wallet/Payments: parking payments + subscriptions + receipts',
      '• Profile: account, vehicles (optional), preferences, privacy',
      '',
      '9.2. Map & Availability UX (Bay-level where sensors exist)',
      '• Bay colors: Green = free, Red = occupied, Gray = unknown/unreliable',
      '• Each bay shows: last update + confidence score',
      '• Filters: closest, cheapest, shaded/covered (“Summer Mode”), EV, accessible, height limit',
      '• Fallback hierarchy: Bay → Cluster → Zone (still useful with partial sensor coverage)',
      '',
      'Destination-first ranking logic (key UX):',
      '• User sets destination pin → app prioritizes Free parking bays closest to destination first',
      '• After free options: show Paid parking options (RTA/operator) as the next tier',
      '• Provide a clear toggle/segment: Free | Paid | All (so users trust the ranking)',
      '',
      '9.3. Best-Spot Routing (the WOW feature)',
      '• “Navigate to best spot” routes to a specific bay (or best cluster) near destination',
      '• Re-route instantly if the chosen bay becomes occupied while the user is approaching',
      '• “Will it still be free when I arrive?” uses: live sensor trends + historical patterns',
      '',
      '9.3.1. Glance Surfaces (Supported, High-Impact Driving UX)',
      'CarPlay-first strategy (UAE reality): most drivers use CarPlay for navigation; treat CarPlay as the primary driving UI.',
      '• CarPlay (priority #1): show a simplified “Best Spot” card + occupancy confidence + re-route prompts while driving',
      '• Android Auto (priority #2): same concepts for Android drivers',
      '• Widgets: “Nearby Free Spots” + “Best Spot to Destination” quick actions from Home Screen',
      '• Live Activities (iOS): lock-screen / dynamic island updates for: driving → parking → payment timer → extend reminders',
      '• In-app map (secondary): planning, exploration, walking guidance, payments, and detailed bay-level view when parked',
      '• Bikers/phone navigation: support in-app navigation as a fallback when CarPlay is not available',
      '',
      '9.4. Payments & Reservations (MVP + Enterprise)',
      'MVP (fast, compliant): Assisted payment',
      '• Detect zone via geofence + bay location',
      '• Prepare correct payment payload (duration/zone) and launch official flow (deep link / SMS compose)',
      '• ParkSense tracks timer, reminders, and “extend now” prompts',
      '',
      'Enterprise (best): Direct payment session (via partner/operator APIs)',
      '• Start/extend/stop sessions inside ParkSense',
      '• Optional auto-extend rules (user-controlled)',
      '',
      'Reservations:',
      '• Private inventory first (malls/towers) where VisionDrive controls access + sensors',
      '• Public inventory later (requires operator integration/permission)',
      '',
      '9.5. Car Finder (Level A/B/C)',
      '• Level A: manual “Park here” pin',
      '• Level B: smart handshake (sensor occupied + phone nearby + motion shift driving→walking) auto-saves bay',
      '• Level C: offline photo log (pillar/floor) for deep basements',
      '',
      '9.6. Weather / Comfort Intelligence',
      '• Map overlay: heat/shade + air quality (where sensors exist)',
      '• Summer Mode routing: prefer shaded/covered parking and cooler walking routes',
      '',
      '9.7. Operator Portal (must-have for enterprise sales)',
      '• Sensor fleet health: uptime, last seen, battery, false-positive detection',
      '• Live occupancy dashboard + heatmaps + exports',
      '• Audit logs + role-based access',
      '',
      '9.7.1. Business Ads / Sponsored Map Pins (B2B revenue)',
      '• Businesses can pay ParkSense to appear on the map (sponsored pins) near relevant destinations/parking areas',
      '• Pricing model (MVP): pay-per-action (tap/call/directions) or pay-per-redemption (QR/offer)',
      '• Rules to protect UX: ads never override “best spot” routing; they appear as a separate “Sponsored” layer',
      '• Portal: self-serve ad campaign creation, geo-radius targeting, budget caps, analytics dashboard',
      '',
      '9.8. Monetization (subscription)',
      '• Free: zone-level + limited bay-level, basic navigation, manual car finder',
      '• Pro: bay-level “high confidence mode”, Summer Mode, smart handshake, alerts, weather overlays',
      '',
      '9.9. Technical Requirements (Refined Spec)',
      'Goal: real-time per-bay truth + best-spot routing + payments + monetization (ads + subscription).',
      '',
      '9.9.1. Core Parking Management & Visualization',
      '• Real-time occupancy UI: display individual bays on map (where sensors exist)',
      '• Color coding: Green (Available) / Red (Occupied) / Gray (Unknown or low-confidence)',
      '• Confidence model: show last update + confidence score; hide/deprioritize unhealthy sensors',
      '• EV charging: dedicated bay markers and real-time availability (via API, where possible)',
      '• Free parking zones: digital mapping of non-paid/public areas; integrate sensors to show true availability',
      '• Paid parking zones: RTA/operator zones with tariffs (per hour / per zone) visible pre-arrival',
      '',
      '9.9.2. Navigation & Smart Routing',
      '• Destination-first UX: user drops destination → app ranks Free options first (closest), then Paid options',
      '• Best-spot routing: navigate to a specific bay/cluster when possible (fallback to zone entrance/centroid)',
      '• “Metro-style / last-mile” guidance: simplified linear UI for last 300–800m into parking area',
      '• Instant re-route: if target bay flips to occupied while approaching → auto-switch to next best bay',
      '• Recommendation engine inputs: proximity, cost (free vs paid), confidence, shade/covered, EV/accessibility',
      '• Glance-first driving UX: CarPlay first, then Android Auto; iOS Live Activities for safe, low-distraction updates',
      '',
      '9.9.3. Booking, Payments & Validation',
      'Reservations:',
      '• Private inventory first (malls/towers/paid lots we control) → reserve a bay in advance',
      '• Public inventory later (requires operator integration/permission)',
      '',
      'Payments:',
      '• MVP (fast): assisted payment for RTA/operator (zone detect + deep link/SMS compose + timer + extend prompts)',
      '• Enterprise: direct payment session via partner APIs (start/extend/stop inside ParkSense)',
      '• Methods: Apple Pay / Google Pay / credit card for subscriptions + private reservation payments',
      '',
      'Parking validation (“Spend X get free parking”):',
      '• Merchant list on map + in destination screen (participating cafes/shops)',
      '• Validation mechanism: QR scanning (MVP) → POS/API integration later',
      '• Rules engine applies discount/free-time to the parking session',
      '',
      '9.9.4. Predictive Analytics & AI (after baseline truth works)',
      '• Occupancy forecasting per zone/cluster/bay using historical sensor data',
      '• User warnings: “High occupancy expected at 18:00” + best time windows',
      '• Visuals: peak-hour graphs and reliability/confidence charts for operators',
      '',
      '9.9.5. Third-Party O2O Services (partner monetization)',
      '• Car wash to parked location (partner API) + “disable if rain soon” logic',
      '• Fuel delivery (CAFU-like) to parked location (partner API)',
      '• Hyper-local recommendations: geo-fenced “what’s nearby” cards after parking',
      '',
      '9.9.6. Ads Platform (LBS monetization)',
      '• Sponsored pins/ads on map (separate Sponsored layer; never overrides best-spot routing)',
      '• Pricing: pay-per-action (tap/call/directions) or pay-per-redemption (QR/offer)',
      '• Portal tooling: campaign creation, geo-radius targeting, budget caps, analytics',
      '',
      '9.9.7. Premium Hardware Add-on (Vehicle Tracking)',
      '• Optional OBDII/GPS tracker subscription for car location tracking',
      '• Vehicle map view + trip logs + parking history (“personal cabinet” in portal/app)',
    ],
  },
]

function CollapsibleNote({ section, isOpen, onToggle }: { section: NoteSection; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 text-left">{section.title}</h3>
        {isOpen ? (
          <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-500 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2">
          <div className="space-y-2 text-sm sm:text-base text-gray-700">
            {section.content.map((line, idx) => (
              <p key={idx} className={line === '' ? 'h-2' : line.startsWith('•') ? 'ml-2 sm:ml-4' : ''}>
                {line}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function NotesPage() {
  const [openSections, setOpenSections] = useState<string[]>(['executive'])

  const toggleSection = (id: string) => {
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    )
  }

  return (
    <div className="pt-20 sm:pt-24 pb-8 sm:pb-12">
      <Section background="white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
              Technical Notes
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Master Technical Specification: ParkSense (UAE Ecosystem)
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Version: 3.1 | Date: December 19, 2025
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              Scope: Smart Parking, Hyper-Local Weather, Lifestyle Services & Residential Management
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {noteSections.map((section) => (
              <CollapsibleNote
                key={section.id}
                section={section}
                isOpen={openSections.includes(section.id)}
                onToggle={() => toggleSection(section.id)}
              />
            ))}
          </div>
        </div>
      </Section>
    </div>
  )
}


