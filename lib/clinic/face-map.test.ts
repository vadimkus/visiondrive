import { describe, expect, it } from 'vitest'
import { faceMapFromProtocolJson, normalizeFaceMapMetadata } from './face-map'

describe('face map metadata', () => {
  it('normalizes template face-map strokes', () => {
    const meta = normalizeFaceMapMetadata({
      version: 1,
      source: 'template',
      sourceMediaId: 'ignored',
      updatedAt: '2026-04-29T12:00:00.000Z',
      strokes: [
        {
          id: 'a',
          color: '#dc2626',
          width: 12,
          points: [
            { x: 100, y: 200 },
            { x: 1100, y: -50 },
          ],
        },
      ],
    })

    expect(meta).toMatchObject({
      source: 'template',
      sourceMediaId: null,
      strokes: [
        {
          color: '#dc2626',
          width: 12,
          points: [
            { x: 100, y: 200 },
            { x: 1000, y: 0 },
          ],
        },
      ],
    })
  })

  it('requires a media id when source is media', () => {
    expect(normalizeFaceMapMetadata({ source: 'media', strokes: [] })).toBeNull()
  })

  it('extracts face-map metadata from photo protocol json', () => {
    const meta = faceMapFromProtocolJson({
      version: 1,
      checkedItems: [],
      faceMap: {
        source: 'media',
        sourceMediaId: 'media_123',
        strokes: [{ points: [{ x: 10, y: 20 }] }],
      },
    })

    expect(meta?.source).toBe('media')
    expect(meta?.sourceMediaId).toBe('media_123')
  })
})
