export type PriceQuoteLineInput = {
  description: string
  quantity: number
  unitPriceCents: number
  procedureId?: string | null
}

export type PriceQuoteMessageLine = {
  description: string
  quantity: number
  totalCents: number
}

export type PriceQuoteMessageInput = {
  practiceName: string
  patientName: string
  quoteNumber: string
  title: string
  currency: string
  subtotalCents: number
  discountCents: number
  totalCents: number
  validUntil?: Date | string | null
  lines: PriceQuoteMessageLine[]
}

export function normalizeQuoteLine(input: PriceQuoteLineInput) {
  const description = String(input.description ?? '').trim()
  const quantity = Math.max(1, Math.round(Number(input.quantity) || 1))
  const unitPriceCents = Math.max(0, Math.round(Number(input.unitPriceCents) || 0))
  return {
    description,
    quantity,
    unitPriceCents,
    totalCents: quantity * unitPriceCents,
    procedureId: input.procedureId?.trim() || null,
  }
}

export function money(cents: number, currency: string) {
  return `${(Math.max(0, cents) / 100).toFixed(2)} ${currency}`
}

export function quoteValidUntilLabel(value: Date | string | null | undefined, locale = 'en-AE') {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function buildPriceQuoteMessage(input: PriceQuoteMessageInput) {
  const validUntil = quoteValidUntilLabel(input.validUntil)
  const lines = input.lines
    .map((line) => {
      const qty = line.quantity > 1 ? ` x${line.quantity}` : ''
      return `• ${line.description}${qty}: ${money(line.totalCents, input.currency)}`
    })
    .join('\n')

  return [
    `Hi ${input.patientName}, here is your treatment estimate from ${input.practiceName}.`,
    '',
    `${input.title} (${input.quoteNumber})`,
    lines,
    input.discountCents > 0
      ? `Subtotal: ${money(input.subtotalCents, input.currency)}\nDiscount: ${money(input.discountCents, input.currency)}`
      : '',
    `Estimated total: ${money(input.totalCents, input.currency)}`,
    validUntil ? `Valid until: ${validUntil}` : '',
    '',
    'Please reply here if you would like to book this treatment plan.',
  ]
    .filter(Boolean)
    .join('\n')
}
