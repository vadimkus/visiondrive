import { NextRequest, NextResponse } from 'next/server'
import { ClinicReviewStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'
import { reviewAverage } from '@/lib/clinic/reviews'

function rangeStart(range: string | null) {
  if (range === 'all') return null
  const days = range === '30d' ? 30 : 90
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
}

function serviceLabel(review: {
  appointment: { procedure: { name: string } | null; titleOverride: string | null } | null
}) {
  return review.appointment?.procedure?.name || review.appointment?.titleOverride || 'Appointment'
}

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const range = searchParams.get('range') === '30d' || searchParams.get('range') === 'all'
    ? searchParams.get('range')
    : '90d'
  const start = rangeStart(range)

  const reviews = await prisma.clinicPatientReview.findMany({
    where: {
      tenantId: session.tenantId,
      ...(start
        ? {
            OR: [
              { requestedAt: { gte: start } },
              { repliedAt: { gte: start } },
              { publishedAt: { gte: start } },
              { createdAt: { gte: start } },
            ],
          }
        : {}),
    },
    include: {
      patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
      appointment: {
        select: {
          id: true,
          startsAt: true,
          procedure: { select: { name: true } },
          titleOverride: true,
        },
      },
    },
    orderBy: [{ requestedAt: 'desc' }, { createdAt: 'desc' }],
    take: 500,
  })

  const statusCounts = {
    requested: reviews.filter((review) => review.status === ClinicReviewStatus.REQUESTED).length,
    replied: reviews.filter((review) => review.status === ClinicReviewStatus.REPLIED).length,
    published: reviews.filter((review) => review.status === ClinicReviewStatus.PUBLISHED).length,
    archived: reviews.filter((review) => review.status === ClinicReviewStatus.ARCHIVED).length,
  }
  const ratings = reviews.map((review) => review.rating)
  const rated = reviews.filter((review) => typeof review.rating === 'number')
  const negativeQueue = reviews
    .filter(
      (review) =>
        typeof review.rating === 'number' &&
        review.rating <= 3 &&
        review.status !== ClinicReviewStatus.ARCHIVED
    )
    .slice(0, 12)
    .map((review) => ({
      id: review.id,
      status: review.status,
      rating: review.rating,
      privateNote: review.privateNote,
      publicComment: review.publicComment,
      requestedAt: review.requestedAt?.toISOString() ?? null,
      repliedAt: review.repliedAt?.toISOString() ?? null,
      publishedAt: review.publishedAt?.toISOString() ?? null,
      patient: review.patient,
      serviceName: serviceLabel(review),
      visitAt: review.appointment?.startsAt?.toISOString() ?? null,
    }))

  return NextResponse.json({
    range,
    totals: {
      total: reviews.length,
      ...statusCounts,
      rated: rated.length,
      averageRating: reviewAverage(ratings),
      replyRatePct:
        reviews.length > 0
          ? Number((((statusCounts.replied + statusCounts.published) / reviews.length) * 100).toFixed(1))
          : 0,
      publishRatePct:
        reviews.length > 0 ? Number(((statusCounts.published / reviews.length) * 100).toFixed(1)) : 0,
      negativeCount: reviews.filter((review) => typeof review.rating === 'number' && review.rating <= 3)
        .length,
    },
    ratingDistribution: [1, 2, 3, 4, 5].map((rating) => ({
      rating,
      count: reviews.filter((review) => review.rating === rating).length,
    })),
    negativeQueue,
  })
}
