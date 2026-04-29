import { whatsappUrl } from './reminders'

export type RouteModeStop = {
  startsAt: Date
  patient: { firstName: string; lastName: string; phone?: string | null }
  procedure: { name: string } | null
  titleOverride?: string | null
  locationAddress?: string | null
  locationArea?: string | null
}

export function appointmentServiceLabel(stop: RouteModeStop) {
  return stop.procedure?.name || stop.titleOverride || 'appointment'
}

export function buildSingleStopMapUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

export function buildMultiStopMapUrl(stops: Array<{ locationAddress?: string | null }>) {
  const addresses = stops
    .map((stop) => stop.locationAddress?.trim())
    .filter((address): address is string => Boolean(address))

  if (addresses.length === 0) return null
  if (addresses.length === 1) return buildSingleStopMapUrl(addresses[0])

  const destination = addresses[addresses.length - 1]
  const waypoints = addresses.slice(0, -1).join('|')
  const params = new URLSearchParams({
    api: '1',
    travelmode: 'driving',
    destination,
    waypoints,
  })
  return `https://www.google.com/maps/dir/?${params.toString()}`
}

export function buildOnMyWayMessage(stop: RouteModeStop, locale: 'en' | 'ru' = 'en') {
  const time = stop.startsAt.toLocaleTimeString(locale === 'ru' ? 'ru-RU' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Dubai',
  })
  const service = appointmentServiceLabel(stop)

  if (locale === 'ru') {
    return [
      `${stop.patient.firstName}, добрый день! Я уже выезжаю к вам на запись ${service} в ${time}.`,
      stop.locationAddress ? `Адрес: ${stop.locationAddress}` : '',
      'Пожалуйста, напишите, если нужно уточнить вход, парковку или код доступа.',
    ].filter(Boolean).join('\n')
  }

  return [
    `Hi ${stop.patient.firstName}, I am on my way for your ${service} appointment at ${time}.`,
    stop.locationAddress ? `Address: ${stop.locationAddress}` : '',
    'Please reply if I should know anything about entrance, parking, or access.',
  ].filter(Boolean).join('\n')
}

export function buildOnMyWayWhatsappUrl(stop: RouteModeStop, locale: 'en' | 'ru' = 'en') {
  return whatsappUrl(stop.patient.phone, buildOnMyWayMessage(stop, locale))
}
