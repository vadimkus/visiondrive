import { Prisma } from '@prisma/client'

export const PHOTO_PROTOCOL_ITEM_IDS = [
  'same_lighting',
  'same_angle',
  'same_distance',
  'clean_background',
  'area_label',
] as const

export type PhotoProtocolItemId = (typeof PHOTO_PROTOCOL_ITEM_IDS)[number]

export type PhotoProtocolJson = {
  version: 1
  checkedItems: PhotoProtocolItemId[]
  procedureName: string | null
  note: string | null
}

const PHOTO_PROTOCOL_ITEM_SET = new Set<string>(PHOTO_PROTOCOL_ITEM_IDS)

export function normalizePhotoProtocolChecked(value: unknown): PhotoProtocolItemId[] {
  let source: unknown = value
  if (typeof value === 'string') {
    try {
      source = JSON.parse(value)
    } catch {
      source = value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    }
  }

  const arr = Array.isArray(source) ? source : []
  const seen = new Set<string>()
  return arr.filter((item): item is PhotoProtocolItemId => {
    const normalized = String(item).trim()
    if (!PHOTO_PROTOCOL_ITEM_SET.has(normalized) || seen.has(normalized)) return false
    seen.add(normalized)
    return true
  })
}

export function normalizePhotoProtocolText(value: unknown, maxLength = 160) {
  const normalized = String(value ?? '').trim()
  return normalized ? normalized.slice(0, maxLength) : null
}

export function normalizeMarketingConsent(value: unknown) {
  if (typeof value === 'boolean') return value
  const normalized = String(value ?? '').trim().toLowerCase()
  return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on'
}

export function buildPhotoProtocolJson({
  checkedItems,
  procedureName,
  note,
}: {
  checkedItems: PhotoProtocolItemId[]
  procedureName?: string | null
  note?: string | null
}): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  const normalizedProcedureName = normalizePhotoProtocolText(procedureName)
  const normalizedNote = normalizePhotoProtocolText(note, 240)

  if (checkedItems.length === 0 && !normalizedProcedureName && !normalizedNote) {
    return Prisma.JsonNull
  }

  return {
    version: 1,
    checkedItems,
    procedureName: normalizedProcedureName,
    note: normalizedNote,
  } satisfies PhotoProtocolJson
}

export function photoProtocolCompletion(checkedItems: unknown) {
  const checked = normalizePhotoProtocolChecked(checkedItems)
  return {
    checked,
    completed: checked.length,
    total: PHOTO_PROTOCOL_ITEM_IDS.length,
    complete: checked.length === PHOTO_PROTOCOL_ITEM_IDS.length,
  }
}
