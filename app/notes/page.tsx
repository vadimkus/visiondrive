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
      '• Backend: Ingest LoRaWAN data (Bun/Rust Service) via MQTT',
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
      '• Routing: Expo Router v4 (File-based routing)',
      '• Graphics: React Native Skia (High-performance UI for weather overlays)',
      '• Maps: Mapbox GL JS v3 or Google Maps Platform',
      '',
      '3.2. Backend & API (Serverless + Edge)',
      '• API Logic: Hono framework running on Vercel Edge Functions',
      '• IoT Listener: Bun or Rust service (Hosted on Railway/Fly.io) for persistent MQTT subscription',
      '• Database: Supabase (PostgreSQL)',
      '• Storage: TimescaleDB extension (for sensor logs)',
      '• AI: pgvector extension (for future usage pattern matching)',
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
      '8.1. Database Schema (Supabase)',
      '• users: standard auth profile',
      '• sensors: id, lat, long, type (parking/weather), zone_id',
      '• sensor_logs (TimescaleDB): time, sensor_id, value (occupied/temp/pm25), raw_payload',
      '• parking_sessions: user_id, sensor_id, start_time, end_time, photo_proof',
      '',
      '8.2. Payload Decoders',
      '• Parking (MokoSmart): Decode Hex to { status: boolean, battery: int }',
      '• Weather (RAK7431): Decode Modbus Register array to { temp: float, humidity: float, wind_speed: float, rain: boolean }',
      '',
      '8.3. Realtime',
      '• Use supabase.channel(\'parking_updates\') to broadcast sensor changes to the frontend client instantly',
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

