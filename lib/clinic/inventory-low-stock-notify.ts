import webpush from 'web-push'
import { prisma } from '@/lib/prisma'
import { isClinicStockLow } from '@/lib/clinic/inventory'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const RESEND_FROM =
  process.env.RESEND_ALERTS_FROM || 'VisionDrive Alerts <onboarding@resend.dev>'
const COOLDOWN_MS = 24 * 60 * 60 * 1000

function fallbackAlertRecipients(): string[] {
  const raw =
    process.env.CLINIC_LOW_STOCK_EMAIL || process.env.CONTACT_EMAIL || 'tech@visiondrive.ae'
  return raw
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

async function lowStockPreferenceRecipients(tenantId: string) {
  const rows = await prisma.clinicUserPreference.findMany({
    where: { tenantId },
    select: {
      userId: true,
      notifyEmail: true,
      notifyPush: true,
      notifyLowStock: true,
      user: { select: { email: true, status: true } },
    },
  })
  return {
    rows,
    emailTo: rows
      .filter((row) => row.notifyEmail && row.notifyLowStock && row.user.status === 'ACTIVE')
      .map((row) => row.user.email)
      .filter(Boolean),
    pushUserIds: new Set(
      rows
        .filter((row) => row.notifyPush && row.notifyLowStock && row.user.status === 'ACTIVE')
        .map((row) => row.userId)
    ),
  }
}

function vapidConfigured(): boolean {
  return !!(
    process.env.VAPID_PUBLIC_KEY &&
    process.env.VAPID_PRIVATE_KEY &&
    process.env.VAPID_SUBJECT
  )
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

async function sendResendHtml(to: string[], subject: string, html: string): Promise<boolean> {
  if (!RESEND_API_KEY || to.length === 0) return false
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({ from: RESEND_FROM, to, subject, html }),
  })
  if (!res.ok) {
    console.error('Low-stock Resend error:', await res.text())
    return false
  }
  return true
}

/**
 * After any stock quantity change: clear notify timestamp when recovered;
 * send email + web push when newly low or cooldown elapsed.
 */
export async function handleLowStockNotificationsForItem(stockItemId: string): Promise<void> {
  const item = await prisma.clinicStockItem.findFirst({
    where: { id: stockItemId },
    include: { tenant: { select: { name: true } } },
  })
  if (!item || !item.active) return

  const low = isClinicStockLow(item)

  if (!low) {
    if (item.lowStockNotifiedAt != null) {
      await prisma.clinicStockItem.update({
        where: { id: stockItemId },
        data: { lowStockNotifiedAt: null },
      })
    }
    return
  }

  const now = Date.now()
  const last = item.lowStockNotifiedAt?.getTime() ?? 0
  if (last > 0 && now - last < COOLDOWN_MS) {
    return
  }

  const preferenceRecipients = await lowStockPreferenceRecipients(item.tenantId)
  const recipients =
    preferenceRecipients.rows.length > 0
      ? preferenceRecipients.emailTo
      : fallbackAlertRecipients()
  const subject = `[Practice OS] Low stock: ${item.name}`
  const html = `
    <h2>Low stock alert</h2>
    <p><strong>Practice:</strong> ${escapeHtml(item.tenant.name)}</p>
    <p><strong>Item:</strong> ${escapeHtml(item.name)}</p>
    <p><strong>On hand:</strong> ${item.quantityOnHand} ${escapeHtml(item.unit)}</p>
    <p><strong>Reorder at:</strong> ${item.reorderPoint}</p>
    <p><a href="${escapeHtml(process.env.NEXT_PUBLIC_APP_URL || 'https://visiondrive.ae')}/clinic/inventory/${escapeHtml(item.id)}">Open in Practice OS</a></p>
  `

  let delivered = await sendResendHtml(recipients, subject, html)

  if (vapidConfigured()) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT!,
      process.env.VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    )
    const payload = JSON.stringify({
      title: 'Low stock',
      body: `${item.name}: ${item.quantityOnHand} ${item.unit} (reorder <= ${item.reorderPoint})`,
      url: `/clinic/inventory/${item.id}`,
    })
    const subs = await prisma.clinicWebPushSubscription.findMany({
      where: {
        tenantId: item.tenantId,
        ...(preferenceRecipients.rows.length > 0
          ? { userId: { in: [...preferenceRecipients.pushUserIds] } }
          : {}),
      },
    })
    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload
        )
        delivered = true
      } catch (e) {
        const code = (e as { statusCode?: number })?.statusCode
        if (code === 404 || code === 410) {
          await prisma.clinicWebPushSubscription.delete({ where: { id: sub.id } }).catch(() => {})
        } else {
          console.error('Web push low-stock failed:', e)
        }
      }
    }
  }

  if (delivered) {
    await prisma.clinicStockItem.update({
      where: { id: stockItemId },
      data: { lowStockNotifiedAt: new Date() },
    })
  }
}
