import { ClinicReviewStatus } from '@prisma/client'

export function normalizeReviewRating(value: unknown) {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return null
  return Math.min(5, Math.max(1, Math.round(parsed)))
}

export function normalizeReviewStatus(
  value: unknown,
  fallback: ClinicReviewStatus = ClinicReviewStatus.REQUESTED
) {
  const status = String(value || '').trim().toUpperCase()
  return Object.values(ClinicReviewStatus).includes(status as ClinicReviewStatus)
    ? (status as ClinicReviewStatus)
    : fallback
}

export function reviewStatusPatch(
  status: ClinicReviewStatus,
  now = new Date()
): { repliedAt?: Date | null; publishedAt?: Date | null } {
  if (status === ClinicReviewStatus.REPLIED) return { repliedAt: now }
  if (status === ClinicReviewStatus.PUBLISHED) return { publishedAt: now }
  return {}
}

export function reviewAverage(ratings: Array<number | null | undefined>) {
  const valid = ratings.filter((rating): rating is number => typeof rating === 'number')
  if (valid.length === 0) return null
  return Math.round((valid.reduce((sum, rating) => sum + rating, 0) / valid.length) * 10) / 10
}
