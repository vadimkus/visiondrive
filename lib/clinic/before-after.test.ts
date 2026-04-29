import { describe, expect, it } from 'vitest'
import { buildBeforeAfterPairs } from './before-after'

describe('before/after comparison pairs', () => {
  it('prefers same-visit before photos for after photos', () => {
    const pairs = buildBeforeAfterPairs([
      { id: 'before-old', kind: 'BEFORE', visitId: 'visit-1', createdAt: '2026-04-01T10:00:00Z' },
      { id: 'before-same', kind: 'BEFORE', visitId: 'visit-2', createdAt: '2026-04-10T10:00:00Z' },
      { id: 'after', kind: 'AFTER', visitId: 'visit-2', createdAt: '2026-04-20T10:00:00Z' },
    ])

    expect(pairs).toHaveLength(1)
    expect(pairs[0].before.id).toBe('before-same')
    expect(pairs[0].after.id).toBe('after')
  })

  it('falls back to the latest earlier before photo', () => {
    const pairs = buildBeforeAfterPairs([
      { id: 'before', kind: 'BEFORE', visitId: null, createdAt: '2026-04-10T10:00:00Z' },
      { id: 'after', kind: 'AFTER', visitId: null, createdAt: '2026-04-20T10:00:00Z' },
    ])

    expect(pairs[0].before.id).toBe('before')
  })
})
