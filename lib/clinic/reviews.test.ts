import { ClinicReviewStatus } from '@prisma/client'
import { describe, expect, it } from 'vitest'
import {
  normalizeReviewRating,
  normalizeReviewStatus,
  reviewAverage,
  reviewStatusPatch,
} from './reviews'

describe('clinic reviews', () => {
  it('normalizes private review ratings to a 1-5 range', () => {
    expect(normalizeReviewRating(5)).toBe(5)
    expect(normalizeReviewRating('4.4')).toBe(4)
    expect(normalizeReviewRating(10)).toBe(5)
    expect(normalizeReviewRating(0)).toBe(1)
    expect(normalizeReviewRating('')).toBeNull()
    expect(normalizeReviewRating('bad')).toBeNull()
  })

  it('normalizes review statuses with a fallback', () => {
    expect(normalizeReviewStatus('replied')).toBe(ClinicReviewStatus.REPLIED)
    expect(normalizeReviewStatus('wrong')).toBe(ClinicReviewStatus.REQUESTED)
  })

  it('sets lifecycle timestamps from status transitions', () => {
    const now = new Date('2026-04-27T05:00:00.000Z')
    expect(reviewStatusPatch(ClinicReviewStatus.REPLIED, now)).toEqual({ repliedAt: now })
    expect(reviewStatusPatch(ClinicReviewStatus.PUBLISHED, now)).toEqual({ publishedAt: now })
    expect(reviewStatusPatch(ClinicReviewStatus.REQUESTED, now)).toEqual({})
  })

  it('calculates average rating from internal replies', () => {
    expect(reviewAverage([5, 4, null, undefined, 3])).toBe(4)
    expect(reviewAverage([null, undefined])).toBeNull()
  })
})
