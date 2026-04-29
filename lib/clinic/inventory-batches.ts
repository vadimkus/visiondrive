const BATCH_START = '[Injectable batch]'
const BATCH_END = '[/Injectable batch]'

export type InjectableBatchMetadata = {
  batchNumber: string | null
  expiresAt: string | null
}

export type InjectableExpiryStatus = 'none' | 'valid' | 'expiring' | 'expired'

export function parseInjectableBatchMetadata(notes: string | null | undefined): InjectableBatchMetadata {
  const text = notes || ''
  const start = text.indexOf(BATCH_START)
  const end = text.indexOf(BATCH_END)
  if (start === -1 || end === -1 || end <= start) {
    return { batchNumber: null, expiresAt: null }
  }

  const block = text.slice(start + BATCH_START.length, end)
  const batchNumber = block.match(/Batch:\s*(.+)/)?.[1]?.trim() || null
  const expiresAt = normalizeExpiryDate(block.match(/Expiry:\s*(.+)/)?.[1]?.trim() || null)
  return { batchNumber, expiresAt }
}

export function withInjectableBatchMetadata(
  notes: string | null | undefined,
  metadata: InjectableBatchMetadata
) {
  const text = notes || ''
  const start = text.indexOf(BATCH_START)
  const end = text.indexOf(BATCH_END)
  const before = start >= 0 ? text.slice(0, start).trim() : text.trim()
  const after = start >= 0 && end >= 0 ? text.slice(end + BATCH_END.length).trim() : ''
  const batchNumber = metadata.batchNumber?.trim() || ''
  const expiresAt = normalizeExpiryDate(metadata.expiresAt)

  const blocks = [before]
  if (batchNumber || expiresAt) {
    blocks.push(
      [
        BATCH_START,
        batchNumber ? `Batch: ${batchNumber}` : null,
        expiresAt ? `Expiry: ${expiresAt}` : null,
        BATCH_END,
      ]
        .filter(Boolean)
        .join('\n')
    )
  }
  if (after) blocks.push(after)

  return blocks.filter(Boolean).join('\n\n') || null
}

export function notesWithoutInjectableBatchMetadata(notes: string | null | undefined) {
  const text = notes || ''
  const start = text.indexOf(BATCH_START)
  const end = text.indexOf(BATCH_END)
  if (start === -1 || end === -1 || end <= start) return text.trim() || null
  const before = text.slice(0, start).trim()
  const after = text.slice(end + BATCH_END.length).trim()
  return [before, after].filter(Boolean).join('\n\n') || null
}

export function normalizeExpiryDate(value: string | null | undefined) {
  if (!value) return null
  const trimmed = value.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null
  const date = new Date(`${trimmed}T00:00:00.000Z`)
  return Number.isNaN(date.getTime()) ? null : trimmed
}

export function injectableExpiryStatus(
  expiresAt: string | null | undefined,
  now = new Date()
): InjectableExpiryStatus {
  const normalized = normalizeExpiryDate(expiresAt)
  if (!normalized) return 'none'

  const expiry = new Date(`${normalized}T23:59:59.999Z`)
  if (expiry.getTime() < now.getTime()) return 'expired'

  const days = Math.ceil((expiry.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
  return days <= 60 ? 'expiring' : 'valid'
}
