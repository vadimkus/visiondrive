import { NextRequest, NextResponse } from 'next/server'
import { ClinicReviewStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'
import { reviewAverage } from '@/lib/clinic/reviews'

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')?.trim().toUpperCase()
  const statusFilter = Object.values(ClinicReviewStatus).includes(status as ClinicReviewStatus)
    ? (status as ClinicReviewStatus)
    : null

  const reviews = await prisma.clinicPatientReview.findMany({
    where: {
      tenantId: session.tenantId,
      ...(statusFilter ? { status: statusFilter } : {}),
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
      reminderDelivery: {
        select: { id: true, status: true, whatsappUrl: true, error: true },
      },
    },
    orderBy: [{ requestedAt: 'desc' }, { createdAt: 'desc' }],
    take: 100,
  })

  const allReviews = statusFilter
    ? await prisma.clinicPatientReview.findMany({
        where: { tenantId: session.tenantId },
        select: { status: true, rating: true },
      })
    : reviews

  const overview = {
    total: allReviews.length,
    requested: allReviews.filter((review) => review.status === ClinicReviewStatus.REQUESTED).length,
    replied: allReviews.filter((review) => review.status === ClinicReviewStatus.REPLIED).length,
    published: allReviews.filter((review) => review.status === ClinicReviewStatus.PUBLISHED).length,
    averageRating: reviewAverage(allReviews.map((review) => review.rating)),
  }

  return NextResponse.json({ reviews, overview })
}
