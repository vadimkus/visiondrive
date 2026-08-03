import type { Metadata } from 'next'
import { Bricolage_Grotesque, IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google'
import './amme.css'

const display = Bricolage_Grotesque({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-amme-display',
  weight: ['500', '700'],
})

const body = IBM_Plex_Sans({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-amme-body',
  weight: ['400', '500', '600'],
})

const mono = IBM_Plex_Mono({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-amme-mono',
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: 'AMMÉ · учёт',
  description: 'Учёт гостей: баня и кухня',
  robots: { index: false, follow: false },
}

export default function AmmeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`amme-root ${display.variable} ${body.variable} ${mono.variable}`}
      style={
        {
          ['--amme-display' as string]: 'var(--font-amme-display), system-ui, sans-serif',
          ['--amme-body' as string]: 'var(--font-amme-body), system-ui, sans-serif',
          ['--amme-mono' as string]: 'var(--font-amme-mono), ui-monospace, monospace',
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  )
}
