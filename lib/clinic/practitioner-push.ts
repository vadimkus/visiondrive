import webpush from 'web-push'
import type { ClinicAccountNotificationKey, ClinicAccountPreferences } from '@/lib/clinic/account-preferences'
import { DEFAULT_CLINIC_ACCOUNT_PREFERENCES } from '@/lib/clinic/account-preferences'
import type { NotificationCenterItem, NotificationCenterKind } from '@/lib/clinic/notification-center'
import { prisma } from '@/lib/prisma'

const preferenceKeyByKind: Record<NotificationCenterKind, ClinicAccountNotificationKey> = {
  REMINDER_DUE: 'notifyReminderDue',
  NEW_BOOKING: 'notifyNewBooking',
  CANCELLED: 'notifyCancelled',
  RESCHEDULED: 'notifyRescheduled',
  REVIEW_REQUEST: 'notifyReviewRequest',
  UNPAID_VISIT: 'notifyUnpaidVisit',
  LOW_STOCK: 'notifyLowStock',
  PACKAGE_EXPIRING: 'notifyPackageExpiry',
}

function vapidConfigured(): boolean {
  return !!(
    process.env.VAPID_PUBLIC_KEY &&
    process.env.VAPID_PRIVATE_KEY &&
    process.env.VAPID_SUBJECT
  )
}

export function preferenceKeyForPushKind(kind: NotificationCenterKind) {
  return preferenceKeyByKind[kind]
}

export function practitionerPushPayloadForItem(item: NotificationCenterItem) {
  const title = item.subject || 'Practice OS alert'
  const details = [
    item.patientName,
    item.serviceName,
    item.detail,
    item.amountCents != null && item.currency
      ? `${(item.amountCents / 100).toFixed(2)} ${item.currency}`
      : null,
  ].filter(Boolean)
  return {
    title,
    body: details.join(' · ') || item.kind.replaceAll('_', ' '),
    url: item.actionHref || '/clinic/inbox',
    sourceKey: item.id,
  }
}

function mergedPreferences(
  row: Partial<ClinicAccountPreferences> | null | undefined
): ClinicAccountPreferences {
  return { ...DEFAULT_CLINIC_ACCOUNT_PREFERENCES, ...(row ?? {}) }
}

export async function sendPractitionerPushForItems(tenantId: string, items: NotificationCenterItem[]) {
  if (!vapidConfigured() || items.length === 0) {
    return { configured: vapidConfigured(), sent: 0, skipped: items.length, staleDeleted: 0 }
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )

  const subscriptions = await prisma.clinicWebPushSubscription.findMany({
    where: { tenantId },
    include: {
      user: {
        select: {
          id: true,
          status: true,
          clinicUserPreferences: {
            where: { tenantId },
            take: 1,
            select: {
              notifyPush: true,
              notifyNewBooking: true,
              notifyCancelled: true,
              notifyRescheduled: true,
              notifyReminderDue: true,
              notifyReviewRequest: true,
              notifyUnpaidVisit: true,
              notifyLowStock: true,
              notifyPackageExpiry: true,
            },
          },
        },
      },
    },
  })

  const byUser = new Map<string, typeof subscriptions>()
  for (const sub of subscriptions) {
    if (sub.user.status !== 'ACTIVE') continue
    const list = byUser.get(sub.userId) ?? []
    list.push(sub)
    byUser.set(sub.userId, list)
  }

  let sent = 0
  let skipped = 0
  let staleDeleted = 0

  for (const item of items) {
    const prefKey = preferenceKeyForPushKind(item.kind)
    const payload = practitionerPushPayloadForItem(item)
    for (const [userId, userSubscriptions] of byUser) {
      const prefs = mergedPreferences(userSubscriptions[0]?.user.clinicUserPreferences[0])
      if (!prefs.notifyPush || !prefs[prefKey]) {
        skipped += 1
        continue
      }

      const alreadySent = await prisma.clinicPractitionerPushDelivery.findUnique({
        where: {
          userId_tenantId_kind_sourceKey: {
            userId,
            tenantId,
            kind: item.kind,
            sourceKey: payload.sourceKey,
          },
        },
      })
      if (alreadySent) {
        skipped += 1
        continue
      }

      let deliveredToUser = false
      const notification = JSON.stringify(payload)
      for (const sub of userSubscriptions) {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            notification
          )
          deliveredToUser = true
        } catch (e) {
          const code = (e as { statusCode?: number })?.statusCode
          if (code === 404 || code === 410) {
            await prisma.clinicWebPushSubscription.delete({ where: { id: sub.id } }).catch(() => {})
            staleDeleted += 1
          } else {
            console.error('Practitioner push failed:', e)
          }
        }
      }

      if (deliveredToUser) {
        await prisma.clinicPractitionerPushDelivery.create({
          data: {
            userId,
            tenantId,
            kind: item.kind,
            sourceKey: payload.sourceKey,
            title: payload.title,
            body: payload.body,
            url: payload.url,
          },
        })
        sent += 1
      }
    }
  }

  return { configured: true, sent, skipped, staleDeleted }
}
