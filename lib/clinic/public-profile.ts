import {
  ClinicMediaKind,
  ClinicReviewStatus,
  ClinicBookingPolicyType,
  TenantStatus,
} from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { buildBeforeAfterPairs } from '@/lib/clinic/before-after'
import { reviewAverage } from '@/lib/clinic/reviews'
import {
  publicMediaUrl,
  publicReviewName,
  publicServicePolicyLabel,
  publicServicePrice,
} from '@/lib/clinic/public-profile-format'

type PublicProcedure = {
  id: string
  name: string
  defaultDurationMin: number
  basePriceCents: number
  currency: string
  bookingPolicyType: ClinicBookingPolicyType
  depositAmountCents: number
  depositPercent: number
  cancellationWindowHours: number
  lateCancelFeeCents: number
  noShowFeeCents: number
  bookingPolicyText: string | null
}

type PublicReview = {
  id: string
  rating: number | null
  publicComment: string | null
  publishedAt: Date | null
  patient: { firstName: string; lastName: string }
  appointment: { procedure: { name: string } | null; titleOverride: string | null } | null
}

type PublicMedia = {
  id: string
  kind: ClinicMediaKind
  visitId: string | null
  createdAt: Date
}

function serviceLabel(review: PublicReview) {
  return review.appointment?.procedure?.name || review.appointment?.titleOverride || 'Appointment'
}

export async function getPublicClinicProfile(slug: string) {
  const tenant = await prisma.tenant.findFirst({
    where: { slug, status: TenantStatus.ACTIVE },
    select: { id: true, name: true, slug: true },
  })

  if (!tenant) return null

  const [procedures, reviews, media] = await Promise.all([
    prisma.clinicProcedure.findMany({
      where: { tenantId: tenant.id, active: true },
      select: {
        id: true,
        name: true,
        defaultDurationMin: true,
        basePriceCents: true,
        currency: true,
        bookingPolicyType: true,
        depositAmountCents: true,
        depositPercent: true,
        cancellationWindowHours: true,
        lateCancelFeeCents: true,
        noShowFeeCents: true,
        bookingPolicyText: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      take: 12,
    }),
    prisma.clinicPatientReview.findMany({
      where: {
        tenantId: tenant.id,
        status: ClinicReviewStatus.PUBLISHED,
        publishedAt: { not: null },
      },
      select: {
        id: true,
        rating: true,
        publicComment: true,
        publishedAt: true,
        patient: { select: { firstName: true, lastName: true } },
        appointment: {
          select: {
            titleOverride: true,
            procedure: { select: { name: true } },
          },
        },
      },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 12,
    }),
    prisma.clinicPatientMedia.findMany({
      where: {
        tenantId: tenant.id,
        marketingConsent: true,
        kind: { in: [ClinicMediaKind.BEFORE, ClinicMediaKind.AFTER] },
        mimeType: { startsWith: 'image/' },
      },
      select: { id: true, kind: true, visitId: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 80,
    }),
  ])

  const galleryPairs = buildBeforeAfterPairs(media as PublicMedia[])
    .slice(0, 6)
    .map((pair) => ({
      id: pair.id,
      before: { id: pair.before.id, url: publicMediaUrl(pair.before.id) },
      after: { id: pair.after.id, url: publicMediaUrl(pair.after.id) },
    }))

  const publicReviews = reviews.map((review) => ({
    id: review.id,
    rating: review.rating,
    publicComment: review.publicComment,
    clientName: publicReviewName(review.patient),
    serviceName: serviceLabel(review),
    publishedAt: review.publishedAt?.toISOString() ?? null,
  }))

  return {
    tenant: { name: tenant.name, slug: tenant.slug },
    bookingUrl: `/book/${tenant.slug}`,
    profileUrl: `/profile/${tenant.slug}`,
    procedures: procedures.map((procedure) => ({
      ...procedure,
      priceLabel: publicServicePrice(procedure.basePriceCents, procedure.currency),
      policyLabel: publicServicePolicyLabel(procedure),
    })),
    reviews: publicReviews,
    galleryPairs,
    summary: {
      serviceCount: procedures.length,
      reviewCount: reviews.length,
      averageRating: reviewAverage(reviews.map((review) => review.rating)),
      galleryPairCount: galleryPairs.length,
    },
  }
}
