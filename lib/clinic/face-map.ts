export type FaceMapPoint = {
  x: number
  y: number
}

export type FaceMapStroke = {
  id: string
  color: string
  width: number
  points: FaceMapPoint[]
}

export type FaceMapMetadata = {
  version: 1
  source: 'template' | 'media'
  sourceMediaId: string | null
  strokes: FaceMapStroke[]
  updatedAt: string
}

const FACE_MAP_COLORS = new Set(['#dc2626', '#2563eb', '#16a34a', '#7c3aed', '#111827'])
const MAX_STROKES = 120
const MAX_POINTS_PER_STROKE = 600

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function normalizePoint(value: unknown): FaceMapPoint | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const point = value as { x?: unknown; y?: unknown }
  const x = Number(point.x)
  const y = Number(point.y)
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null
  return {
    x: clamp(x, 0, 1000),
    y: clamp(y, 0, 1000),
  }
}

function normalizeStroke(value: unknown, index: number): FaceMapStroke | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const stroke = value as { id?: unknown; color?: unknown; width?: unknown; points?: unknown }
  const pointsSource = Array.isArray(stroke.points) ? stroke.points : []
  const points = pointsSource
    .slice(0, MAX_POINTS_PER_STROKE)
    .map(normalizePoint)
    .filter((point): point is FaceMapPoint => Boolean(point))
  if (points.length < 1) return null

  const color = FACE_MAP_COLORS.has(String(stroke.color)) ? String(stroke.color) : '#dc2626'
  const width = clamp(Number(stroke.width) || 8, 2, 24)

  return {
    id: String(stroke.id || `stroke-${index}`),
    color,
    width,
    points,
  }
}

export function normalizeFaceMapMetadata(value: unknown): FaceMapMetadata | null {
  let source = value
  if (typeof value === 'string') {
    try {
      source = JSON.parse(value)
    } catch {
      return null
    }
  }

  if (!source || typeof source !== 'object' || Array.isArray(source)) return null
  const raw = source as {
    version?: unknown
    source?: unknown
    sourceMediaId?: unknown
    strokes?: unknown
    updatedAt?: unknown
  }

  const baseSource = raw.source === 'media' ? 'media' : 'template'
  const sourceMediaId = baseSource === 'media' ? String(raw.sourceMediaId || '').trim() : ''
  if (baseSource === 'media' && !sourceMediaId) return null

  const strokesSource = Array.isArray(raw.strokes) ? raw.strokes : []
  const strokes = strokesSource
    .slice(0, MAX_STROKES)
    .map(normalizeStroke)
    .filter((stroke): stroke is FaceMapStroke => Boolean(stroke))

  const updatedAtRaw = String(raw.updatedAt || '').trim()
  const updatedAt = Number.isNaN(new Date(updatedAtRaw).getTime()) ? new Date().toISOString() : updatedAtRaw

  return {
    version: 1,
    source: baseSource,
    sourceMediaId: baseSource === 'media' ? sourceMediaId : null,
    strokes,
    updatedAt,
  }
}

export function faceMapFromProtocolJson(value: unknown): FaceMapMetadata | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return normalizeFaceMapMetadata((value as { faceMap?: unknown }).faceMap)
}
