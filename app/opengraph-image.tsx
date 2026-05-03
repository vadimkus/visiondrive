import { ImageResponse } from 'next/og'
import { corePositioning, siteName } from '@/lib/seo'

export const alt = 'VisionDrive Practice OS - a professional system for solo practitioners'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#111827',
          color: '#fff',
          padding: 72,
          fontFamily: 'Inter, Arial, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: '#f97316',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              fontWeight: 800,
            }}
          >
            VD
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 34, fontWeight: 800 }}>{siteName}</span>
            <span style={{ color: '#fdba74', fontSize: 22 }}>
              {corePositioning.slogan}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h1
            style={{
              margin: 0,
              maxWidth: 900,
              fontSize: 74,
              lineHeight: 0.98,
              letterSpacing: '-0.05em',
              fontWeight: 850,
            }}
          >
            {corePositioning.headline}
          </h1>
          <p
            style={{
              margin: 0,
              maxWidth: 920,
              color: '#d1d5db',
              fontSize: 30,
              lineHeight: 1.32,
            }}
          >
            Bookings, patient records, treatment notes, photos, inventory,
            payments, reminders, and reporting from one private workspace.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 14,
            color: '#111827',
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          {['Solo practitioners', 'Independent clinics', 'UAE data residency'].map((label) => (
            <span
              key={label}
              style={{
                borderRadius: 999,
                background: '#fff7ed',
                padding: '12px 20px',
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    ),
    size,
  )
}
