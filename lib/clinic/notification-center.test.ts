import { describe, expect, it } from 'vitest'
import {
  appointmentDueCents,
  buildNotificationCenter,
  buildNotificationSummary,
  type NotificationCenterItem,
} from './notification-center'

describe('notification center', () => {
  it('computes unpaid appointment due with discounts, fees, refunds, pending rows, and dedupe', () => {
    expect(
      appointmentDueCents(50000, [
        { id: 'p1', amountCents: 30000, status: 'PAID', discountCents: 5000, feeCents: 1000 },
        { id: 'p1', amountCents: 30000, status: 'PAID', discountCents: 5000, feeCents: 1000 },
        { id: 'p2', amountCents: 5000, status: 'REFUNDED' },
      ])
    ).toBe(21000)

    expect(appointmentDueCents(50000, [{ amountCents: 60000, status: 'PENDING' }])).toBe(60000)
  })

  it('summarizes and sorts notifications by severity then recency', () => {
    const items: NotificationCenterItem[] = [
      {
        id: 'normal',
        kind: 'NEW_BOOKING',
        severity: 'normal',
        subject: 'New booking',
        occurredAt: '2026-04-27T09:00:00.000Z',
        actionHref: '/clinic/appointments',
      },
      {
        id: 'urgent-old',
        kind: 'LOW_STOCK',
        severity: 'urgent',
        subject: 'Low stock',
        occurredAt: '2026-04-26T09:00:00.000Z',
        actionHref: '/clinic/inventory',
      },
      {
        id: 'urgent-new',
        kind: 'REMINDER_DUE',
        severity: 'urgent',
        subject: 'Reminder due',
        dueAt: '2026-04-27T10:00:00.000Z',
        actionHref: '/clinic/reminders',
      },
    ]

    const center = buildNotificationCenter(items)
    expect(center.items.map((item) => item.id)).toEqual(['urgent-new', 'urgent-old', 'normal'])
    expect(center.summary).toMatchObject({ total: 3, urgent: 2, high: 0, normal: 1 })
  })

  it('initializes all kind counters', () => {
    const summary = buildNotificationSummary([])
    expect(summary.byKind.REMINDER_DUE).toBe(0)
    expect(summary.byKind.UNPAID_VISIT).toBe(0)
  })
})
