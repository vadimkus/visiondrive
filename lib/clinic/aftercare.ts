export type AftercareRenderContext = {
  patient: { firstName: string; lastName: string }
  procedure?: { name: string } | null
  titleOverride?: string | null
  visitAt?: Date | string | null
}

export type AftercareSnapshotSource = {
  title: string
  messageBody?: string | null
  documentName?: string | null
  documentUrl?: string | null
}

export function normalizeAftercareTitle(value: unknown) {
  return String(value ?? '').trim().slice(0, 240)
}

export function normalizeAftercareBody(value: unknown) {
  return String(value ?? '').trim().slice(0, 5000)
}

export function normalizeAftercareDocumentName(value: unknown) {
  return String(value ?? '').trim().slice(0, 240)
}

export function normalizeAftercareDocumentUrl(value: unknown) {
  const raw = String(value ?? '').trim()
  if (!raw) return ''
  if (raw.startsWith('/')) return raw.slice(0, 1000)

  try {
    const parsed = new URL(raw)
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString().slice(0, 1000)
    }
  } catch {
    return ''
  }

  return ''
}

export function renderAftercareTemplate(
  template: string,
  context: AftercareRenderContext,
  locale = 'en-GB'
) {
  const visitDate = context.visitAt ? new Date(context.visitAt) : null
  const date =
    visitDate && !Number.isNaN(visitDate.getTime())
      ? visitDate.toLocaleDateString(locale, { dateStyle: 'medium', timeZone: 'Asia/Dubai' })
      : ''
  const service = context.procedure?.name || context.titleOverride || 'treatment'

  return template
    .replaceAll('{{firstName}}', context.patient.firstName)
    .replaceAll('{{lastName}}', context.patient.lastName)
    .replaceAll('{{service}}', service)
    .replaceAll('{{date}}', date)
}

export function buildAftercareWhatsappText(snapshot: AftercareSnapshotSource) {
  const parts = [
    snapshot.title,
    snapshot.messageBody,
    snapshot.documentUrl
      ? `${snapshot.documentName || 'Aftercare document'}: ${snapshot.documentUrl}`
      : '',
  ].filter((part): part is string => Boolean(part?.trim()))

  return parts.join('\n\n')
}
