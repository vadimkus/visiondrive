export type BookingChannel = 'google' | 'instagram' | 'whatsapp'

export type BookingChannelLinkInput = {
  baseUrl: string
  channel: BookingChannel
  procedureId?: string | null
  campaign?: string | null
}

const CHANNEL_MEDIUM: Record<BookingChannel, string> = {
  google: 'profile',
  instagram: 'bio',
  whatsapp: 'chat',
}

export function bookingChannelLabel(channel: BookingChannel) {
  if (channel === 'google') return 'Google'
  if (channel === 'instagram') return 'Instagram'
  return 'WhatsApp'
}

export function buildBookingChannelUrl({
  baseUrl,
  channel,
  procedureId,
  campaign = 'direct_booking',
}: BookingChannelLinkInput) {
  const url = new URL(baseUrl, 'https://visiondrive.local')
  url.searchParams.set('source', channel)
  url.searchParams.set('utm_source', channel)
  url.searchParams.set('utm_medium', CHANNEL_MEDIUM[channel])
  url.searchParams.set('utm_campaign', campaign || 'direct_booking')
  if (procedureId?.trim()) url.searchParams.set('procedureId', procedureId.trim())

  if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) {
    return url.toString()
  }

  return `${url.pathname}${url.search}`
}

export function bookingChannelWhatsappText(url: string, practiceName?: string | null) {
  const practice = practiceName?.trim() || 'my practice'
  return `Book your appointment with ${practice}: ${url}`
}
