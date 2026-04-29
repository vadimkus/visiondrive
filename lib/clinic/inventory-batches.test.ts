import { describe, expect, it } from 'vitest'
import {
  injectableExpiryStatus,
  notesWithoutInjectableBatchMetadata,
  parseInjectableBatchMetadata,
  withInjectableBatchMetadata,
} from './inventory-batches'

describe('injectable inventory batch metadata', () => {
  it('stores batch metadata inside notes without losing free text', () => {
    const notes = withInjectableBatchMetadata('Keep refrigerated.', {
      batchNumber: 'A123',
      expiresAt: '2026-06-30',
    })

    expect(notes).toContain('Keep refrigerated.')
    expect(parseInjectableBatchMetadata(notes)).toEqual({
      batchNumber: 'A123',
      expiresAt: '2026-06-30',
    })
    expect(notesWithoutInjectableBatchMetadata(notes)).toBe('Keep refrigerated.')
  })

  it('classifies expiry status', () => {
    const now = new Date('2026-04-29T00:00:00.000Z')

    expect(injectableExpiryStatus(null, now)).toBe('none')
    expect(injectableExpiryStatus('2026-04-01', now)).toBe('expired')
    expect(injectableExpiryStatus('2026-05-15', now)).toBe('expiring')
    expect(injectableExpiryStatus('2026-12-15', now)).toBe('valid')
  })
})
