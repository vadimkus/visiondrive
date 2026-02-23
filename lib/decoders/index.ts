export type DecodeInput = {
  sensorType: 'TEMPERATURE' | 'PARKING' | 'WEATHER' | 'OTHER'
  rawPayload: string
}

export type DecodeResult = {
  decoded: unknown
  warnings: string[]
}

function tryParseJson(text: string): unknown | null {
  const trimmed = text.trim()
  if (!trimmed) return null
  if (!(trimmed.startsWith('{') || trimmed.startsWith('['))) return null
  try {
    return JSON.parse(trimmed)
  } catch {
    return null
  }
}

function isHex(text: string) {
  const t = text.trim()
  return /^[0-9a-fA-F]+$/.test(t) && t.length % 2 === 0
}

function hexToBytes(hex: string): number[] {
  const out: number[] = []
  for (let i = 0; i < hex.length; i += 2) out.push(parseInt(hex.slice(i, i + 2), 16))
  return out
}

/**
 * MVP decoders:
 * - If payload is JSON, we return parsed JSON.
 * - If payload is HEX:
 *   - PARKING: byte0 occupancy (0=free,1=occupied), byte1 battery% (0-100) if present
 *   - WEATHER: placeholder (returns bytes array) until we implement device-specific decoders
 */
export function decodePayload(input: DecodeInput): DecodeResult {
  const warnings: string[] = []
  const raw = String(input.rawPayload || '')

  const json = tryParseJson(raw)
  if (json !== null) {
    return { decoded: json, warnings }
  }

  if (isHex(raw)) {
    const bytes = hexToBytes(raw)
    if (input.sensorType === 'TEMPERATURE' || input.sensorType === 'PARKING') {
      const occupied = bytes[0] === 1
      const batteryPct = typeof bytes[1] === 'number' ? bytes[1] : null
      if (batteryPct !== null && (batteryPct < 0 || batteryPct > 100)) {
        warnings.push('batteryPct out of expected range 0-100')
      }
      return { decoded: { occupied, batteryPct }, warnings }
    }

    if (input.sensorType === 'WEATHER') {
      warnings.push('WEATHER HEX decoder is a placeholder (device-specific decoder pending)')
      return { decoded: { bytes }, warnings }
    }

    warnings.push('OTHER HEX decoder returns raw bytes only')
    return { decoded: { bytes }, warnings }
  }

  warnings.push('Unrecognized payload format (expected JSON or HEX); returning raw string')
  return { decoded: { raw }, warnings }
}



