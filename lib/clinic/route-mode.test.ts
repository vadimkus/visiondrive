import { describe, expect, it } from 'vitest'
import {
  buildMultiStopMapUrl,
  buildOnMyWayMessage,
  buildOnMyWayWhatsappUrl,
  buildSingleStopMapUrl,
} from './route-mode'

const stop = {
  startsAt: new Date('2026-04-29T10:30:00.000Z'),
  patient: { firstName: 'Ladi', lastName: 'Patient', phone: '+971 50 123 4567' },
  procedure: { name: 'Botox follow-up' },
  locationAddress: 'Dubai Marina, Dubai',
}

describe('route mode helpers', () => {
  it('builds single-stop and multi-stop Google Maps links', () => {
    expect(buildSingleStopMapUrl('Dubai Marina')).toContain('query=Dubai%20Marina')

    const url = buildMultiStopMapUrl([
      { locationAddress: 'Dubai Marina' },
      { locationAddress: 'Jumeirah Beach Road' },
    ])

    expect(url).toContain('https://www.google.com/maps/dir/?')
    expect(url).toContain('destination=Jumeirah+Beach+Road')
    expect(url).toContain('waypoints=Dubai+Marina')
  })

  it('renders localized on-my-way copy and WhatsApp URL', () => {
    expect(buildOnMyWayMessage(stop, 'en')).toContain('I am on my way')
    expect(buildOnMyWayMessage(stop, 'ru')).toContain('Я уже выезжаю')

    const url = buildOnMyWayWhatsappUrl(stop, 'en')
    expect(url).toContain('https://wa.me/971501234567')
    expect(url).toContain('I%20am%20on%20my%20way')
  })
})
