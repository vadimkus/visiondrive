import { NextRequest, NextResponse } from 'next/server'
import { ClinicPaymentMethod, ClinicPaymentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  asMembershipSettings,
  buildMembershipPlan,
  buildMembershipSubscription,
  dueMembershipSubscriptions,
  membershipDataFromThresholds,
  membershipPaymentReference,
  nextMonthlyBillingDate,
  normalizeSubscriptionStatus,
  summarizeMemberships,
  type MembershipPlan,
  type MembershipSubscription,
} from '@/lib/clinic/memberships'
import { getClinicSession } from '@/lib/clinic/session'

function paymentMethod(value: string) {
  const method = value.trim().toUpperCase()
  return method in ClinicPaymentMethod ? (method as ClinicPaymentMethod) : ClinicPaymentMethod.CARD
}

function patientName(patient: { firstName: string; lastName: string }) {
  return `${patient.lastName}, ${patient.firstName}`.trim()
}

async function readMembershipContext(tenantId: string) {
  const [settings, patients] = await Promise.all([
    prisma.tenantSetting.findUnique({
      where: { tenantId },
      select: { thresholds: true },
    }),
    prisma.clinicPatient.findMany({
      where: { tenantId },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      take: 5000,
      select: { id: true, firstName: true, lastName: true, phone: true },
    }),
  ])
  const data = membershipDataFromThresholds(settings?.thresholds)
  const patientById = new Map(patients.map((patient) => [patient.id, patient]))
  const planById = new Map(data.plans.map((plan) => [plan.id, plan]))
  const rows = data.subscriptions.map((subscription) => {
    const patient = patientById.get(subscription.patientId)
    const plan = planById.get(subscription.planId)
    return {
      ...subscription,
      patientName: patient ? patientName(patient) : 'Unknown patient',
      patientPhone: patient?.phone ?? null,
      planName: plan?.name ?? 'Unknown plan',
      monthlyPriceCents: plan?.monthlyPriceCents ?? 0,
      currency: plan?.currency ?? 'AED',
      includedSessions: plan?.includedSessions ?? 0,
    }
  })

  return {
    thresholds: asMembershipSettings(settings?.thresholds),
    data,
    patients: patients.map((patient) => ({ ...patient, name: patientName(patient) })),
    rows,
    dueSubscriptions: rows.filter((row) =>
      dueMembershipSubscriptions([row], new Date()).some((due) => due.id === row.id)
    ),
    summary: summarizeMemberships(data),
  }
}

async function saveMembershipData(
  tenantId: string,
  thresholds: ReturnType<typeof asMembershipSettings>,
  data: { plans: MembershipPlan[]; subscriptions: MembershipSubscription[] }
) {
  const next = {
    ...thresholds,
    memberships: data,
  }

  await prisma.tenantSetting.upsert({
    where: { tenantId },
    create: { tenantId, thresholds: next },
    update: { thresholds: next },
  })
}

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const context = await readMembershipContext(session.tenantId)
  return NextResponse.json({
    plans: context.data.plans,
    subscriptions: context.rows,
    dueSubscriptions: context.dueSubscriptions,
    patients: context.patients,
    summary: context.summary,
  })
}

export async function POST(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const action = String(body.action ?? '').trim()
  const context = await readMembershipContext(session.tenantId)
  const data = {
    plans: [...context.data.plans],
    subscriptions: [...context.data.subscriptions],
  }

  try {
    if (action === 'create_plan') {
      data.plans.unshift(
        buildMembershipPlan({
          name: body.name,
          monthlyPriceCents: body.monthlyPriceCents,
          includedSessions: body.includedSessions,
          description: body.description,
        })
      )
      await saveMembershipData(session.tenantId, context.thresholds, data)
      return NextResponse.json(await readMembershipContext(session.tenantId), { status: 201 })
    }

    if (action === 'create_subscription') {
      const plan = data.plans.find((item) => item.id === String(body.planId ?? '').trim() && item.active)
      if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 400 })
      const patient = context.patients.find((item) => item.id === String(body.patientId ?? '').trim())
      if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 400 })
      data.subscriptions.unshift(
        buildMembershipSubscription({
          patientId: body.patientId,
          planId: body.planId,
          nextBillingAt: body.nextBillingAt,
          autopayEnabled: body.autopayEnabled,
          paymentMethod: body.paymentMethod,
          note: body.note,
        })
      )
      await saveMembershipData(session.tenantId, context.thresholds, data)
      return NextResponse.json(await readMembershipContext(session.tenantId), { status: 201 })
    }

    if (action === 'update_subscription_status') {
      const subscriptionId = String(body.subscriptionId ?? '').trim()
      const status = normalizeSubscriptionStatus(body.status)
      data.subscriptions = data.subscriptions.map((subscription) =>
        subscription.id === subscriptionId ? { ...subscription, status } : subscription
      )
      await saveMembershipData(session.tenantId, context.thresholds, data)
      return NextResponse.json(await readMembershipContext(session.tenantId))
    }

    if (action === 'prepare_charge') {
      const subscriptionId = String(body.subscriptionId ?? '').trim()
      const subscription = data.subscriptions.find((item) => item.id === subscriptionId)
      if (!subscription) return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
      if (subscription.status !== 'ACTIVE') {
        return NextResponse.json({ error: 'Subscription is not active' }, { status: 400 })
      }
      const plan = data.plans.find((item) => item.id === subscription.planId && item.active)
      if (!plan || plan.monthlyPriceCents <= 0) {
        return NextResponse.json({ error: 'Plan has no billable price' }, { status: 400 })
      }
      const billingDate = new Date(subscription.nextBillingAt)
      if (Number.isNaN(billingDate.getTime())) {
        return NextResponse.json({ error: 'Invalid next billing date' }, { status: 400 })
      }
      const reference = membershipPaymentReference(subscription.id, billingDate)
      const existing = await prisma.clinicPatientPayment.findFirst({
        where: { tenantId: session.tenantId, patientId: subscription.patientId, reference },
        select: { id: true },
      })
      const payment =
        existing ??
        (await prisma.clinicPatientPayment.create({
          data: {
            tenantId: session.tenantId,
            patientId: subscription.patientId,
            amountCents: plan.monthlyPriceCents,
            currency: plan.currency,
            method: paymentMethod(subscription.paymentMethod),
            status: ClinicPaymentStatus.PENDING,
            reference,
            note: `Membership charge prepared for ${plan.name}. Review before collecting or confirming autopay.`,
            paidAt: new Date(),
            createdByUserId: session.userId,
          },
          select: { id: true },
        }))

      data.subscriptions = data.subscriptions.map((item) =>
        item.id === subscription.id
          ? {
              ...item,
              lastChargePreparedAt: new Date().toISOString(),
              nextBillingAt: nextMonthlyBillingDate(billingDate).toISOString(),
            }
          : item
      )
      await saveMembershipData(session.tenantId, context.thresholds, data)
      return NextResponse.json({ ...(await readMembershipContext(session.tenantId)), paymentId: payment.id })
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Membership action failed' }, { status: 400 })
  }

  return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
}
