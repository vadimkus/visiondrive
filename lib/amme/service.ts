import { prisma } from '@/lib/prisma'
import { parseDayKey, dayKey } from '@/lib/amme/money'
import { addMinutes, venueDateTimeToUtc, venueDayKey } from '@/lib/amme/time'
import { assertAndReserveCapacity, consumeRecipeForLine } from '@/lib/amme/management'
import {
  bumpNoshow,
  guestCardsForIds,
  recomputeGuestStats,
  resolveGuest,
  serializeGuest,
} from '@/lib/amme/crm'
import type { AmmeLineKind, AmmeLineStatus, Prisma } from '@prisma/client'

async function audit(
  venueId: string,
  action: string,
  opts: { visitId?: string; tabId?: string; lineId?: string; actorId?: string; detail?: string } = {}
) {
  await prisma.$transaction([
    prisma.ammeAuditEvent.create({
      data: {
        venueId,
        action,
        visitId: opts.visitId,
        tabId: opts.tabId,
        lineId: opts.lineId,
        actorId: opts.actorId,
        detail: opts.detail,
      },
    }),
    prisma.ammeDomainEvent.create({
      data: {
        venueId,
        type: action,
        aggregateType: opts.lineId ? 'LINE' : opts.tabId ? 'TAB' : opts.visitId ? 'VISIT' : 'VENUE',
        aggregateId: opts.lineId || opts.tabId || opts.visitId || venueId,
        actorId: opts.actorId,
        payload: opts.detail ? { detail: opts.detail } : undefined,
      },
    }),
  ])
}

export async function getVenueState(venueId: string, day?: string | null) {
  const date = parseDayKey(day)
  const venue = await prisma.ammeVenue.findUniqueOrThrow({ where: { id: venueId } })

  const [menu, bookings, openVisits, recentClosed] = await Promise.all([
    prisma.ammeMenuItem.findMany({
      where: { venueId },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    }),
    prisma.ammeBooking.findMany({
      where: { venueId, date },
      orderBy: { at: 'asc' },
    }),
    prisma.ammeVisit.findMany({
      where: { venueId, closedAt: null },
      include: {
        tabs: {
          include: { lines: { where: { status: { not: 'CANCELLED' } }, orderBy: { createdAt: 'asc' } } },
          orderBy: { openedAt: 'asc' },
        },
      },
      orderBy: { openedAt: 'asc' },
    }),
    prisma.ammeVisit.findMany({
      where: {
        venueId,
        closedAt: { not: null },
        openedAt: { gte: new Date(date.getTime() - 7 * 86400000) },
      },
      include: {
        tabs: {
          include: { lines: { where: { status: { not: 'CANCELLED' } } } },
        },
      },
      orderBy: { closedAt: 'desc' },
      take: 40,
    }),
  ])

  const [kitchenLines, audits] = await Promise.all([
    prisma.ammeLine.findMany({
      where: {
        status: { in: ['SENT', 'DONE'] },
        sentAt: { not: null },
        tab: { visit: { venueId, closedAt: null } },
      },
      include: {
        tab: { include: { visit: true } },
      },
      orderBy: { sentAt: 'asc' },
    }),
    prisma.ammeAuditEvent.findMany({
      where: { venueId },
      orderBy: { createdAt: 'desc' },
      take: 12,
    }),
  ])

  const guestIds = [
    ...bookings.map((b) => b.guestId),
    ...openVisits.map((v) => v.guestId),
    ...recentClosed.map((v) => v.guestId),
  ].filter((id): id is string => !!id)
  const guestCards = await guestCardsForIds(venueId, guestIds)

  return {
    venue: {
      id: venue.id,
      name: venue.name,
      banyaPrice: venue.banyaPrice,
      currency: venue.currency,
    },
    day: dayKey(date),
    menu,
    bookings,
    visits: openVisits,
    history: recentClosed,
    guests: guestCards.map(serializeGuest),
    kitchen: kitchenLines.map((l) => ({
      id: l.id,
      name: l.name,
      qty: l.qty,
      status: l.status,
      sentAt: l.sentAt,
      doneAt: l.doneAt,
      guestName: l.tab.visit.name,
      visitId: l.tab.visitId,
      tabId: l.tabId,
      station: l.station,
      priority: l.priority,
    })),
    audits: audits.map((a) => ({
      id: a.id,
      action: a.action,
      detail: a.detail,
      createdAt: a.createdAt.toISOString(),
    })),
  }
}

export async function arriveBooking(venueId: string, bookingId: string, actorId?: string) {
  const venue = await prisma.ammeVenue.findUniqueOrThrow({ where: { id: venueId } })
  const booking = await prisma.ammeBooking.findFirst({ where: { id: bookingId, venueId } })
  if (!booking) throw new Error('Запись не найдена')
  if (booking.status === 'ARRIVED' && booking.visitId) {
    return prisma.ammeVisit.findUniqueOrThrow({
      where: { id: booking.visitId },
      include: { tabs: { include: { lines: true } } },
    })
  }

  return prisma.$transaction(async (tx) => {
    let guestId = booking.guestId
    if (!guestId) {
      const guest = await resolveGuest(tx, venueId, {
        name: booking.name,
        phone: booking.phone,
        banya: booking.banya,
        source: 'arrive',
      })
      guestId = guest.id
    }

    const visit = await tx.ammeVisit.create({
      data: {
        venueId,
        guestId,
        name: booking.name,
        guests: booking.guests,
        banya: booking.banya,
      },
    })
    const tab = await tx.ammeTab.create({
      data: { visitId: visit.id, label: 'Счёт 1' },
    })
    if (booking.banya) {
      await tx.ammeLine.create({
        data: {
          tabId: tab.id,
          name: 'Баня, сеанс',
          qty: booking.guests,
          price: venue.banyaPrice,
          kind: 'BANYA',
          station: 'Баня',
          status: 'DONE',
          doneAt: new Date(),
        },
      })
    }
    await tx.ammeBooking.update({
      where: { id: booking.id },
      data: { status: 'ARRIVED', visitId: visit.id, guestId },
    })
    await tx.ammeAuditEvent.create({
      data: {
        venueId,
        visitId: visit.id,
        tabId: tab.id,
        actorId,
        action: 'arrive',
        detail: booking.banya
          ? `Пришёл, баня — ${booking.guests} чел.`
          : `Пришёл в ресторан, ${booking.guests} чел.`,
      },
    })
    return tx.ammeVisit.findUniqueOrThrow({
      where: { id: visit.id },
      include: { tabs: { include: { lines: true } } },
    })
  })
}

export async function markNoshow(venueId: string, bookingId: string, actorId?: string) {
  const booking = await prisma.ammeBooking.findFirst({ where: { id: bookingId, venueId } })
  if (!booking) throw new Error('Запись не найдена')
  await prisma.ammeBooking.update({
    where: { id: bookingId },
    data: { status: 'NOSHOW' },
  })
  await bumpNoshow(venueId, booking.guestId)
  await audit(venueId, 'noshow', { actorId, detail: booking.name })
}

export async function unmarkNoshow(venueId: string, bookingId: string, actorId?: string) {
  await prisma.ammeBooking.updateMany({
    where: { id: bookingId, venueId, status: 'NOSHOW' },
    data: { status: 'WAITING' },
  })
  await audit(venueId, 'unmark_noshow', { actorId, detail: bookingId })
}

export async function toggleBookingBanya(venueId: string, bookingId: string, actorId?: string) {
  const booking = await prisma.ammeBooking.findFirst({ where: { id: bookingId, venueId } })
  if (!booking || booking.status !== 'WAITING') throw new Error('Нельзя переключить')
  await prisma.ammeBooking.update({
    where: { id: bookingId },
    data: { banya: !booking.banya },
  })
  await audit(venueId, 'booking_banya_toggled', {
    actorId,
    detail: `${booking.name}: ${!booking.banya ? 'баня' : 'кухня'}`,
  })
}

export async function walkIn(
  venueId: string,
  input: { name: string; guests: number; banya: boolean; phone?: string },
  actorId?: string
) {
  const venue = await prisma.ammeVenue.findUniqueOrThrow({ where: { id: venueId } })
  const name = input.name.trim()
  if (!name) throw new Error('Имя обязательно')
  const guests = Math.max(1, Math.min(20, Number(input.guests) || 1))

  return prisma.$transaction(async (tx) => {
    const guest = await resolveGuest(tx, venueId, {
      name,
      phone: input.phone,
      banya: !!input.banya,
      source: 'walkin',
    })
    const visit = await tx.ammeVisit.create({
      data: { venueId, guestId: guest.id, name, guests, banya: !!input.banya },
    })
    const tab = await tx.ammeTab.create({
      data: { visitId: visit.id, label: 'Счёт 1' },
    })
    if (input.banya) {
      await tx.ammeLine.create({
        data: {
          tabId: tab.id,
          name: 'Баня, сеанс',
          qty: guests,
          price: venue.banyaPrice,
          kind: 'BANYA',
          station: 'Баня',
          status: 'DONE',
          doneAt: new Date(),
        },
      })
    }
    await tx.ammeAuditEvent.create({
      data: {
        venueId,
        visitId: visit.id,
        actorId,
        action: 'walkin',
        detail: `${name}, ${guests} чел.${input.banya ? ', баня' : ''}`,
      },
    })
    return tx.ammeVisit.findUniqueOrThrow({
      where: { id: visit.id },
      include: { tabs: { include: { lines: true } } },
    })
  })
}

export async function addMenuLine(venueId: string, tabId: string, menuCode: string, actorId?: string) {
  const tab = await prisma.ammeTab.findFirst({
    where: { id: tabId, closedAt: null, visit: { venueId } },
    include: { visit: true },
  })
  if (!tab) throw new Error('Счёт не найден или закрыт')
  const item = await prisma.ammeMenuItem.findFirst({
    where: { venueId, code: menuCode, active: true },
  })
  if (!item) throw new Error('Позиция меню не найдена')

  const kind: AmmeLineKind =
    item.category === 'Drinks' ? 'DRINK' : item.category === 'Desserts' ? 'FOOD' : 'FOOD'

  const existing = await prisma.ammeLine.findFirst({
    where: { tabId, menuCode, status: 'DRAFT' },
  })
  if (existing) {
    return prisma.ammeLine.update({
      where: { id: existing.id },
      data: { qty: existing.qty + 1 },
    })
  }

  const line = await prisma.ammeLine.create({
    data: {
      tabId,
      name: item.name,
      qty: 1,
      price: item.price,
      kind,
      station: item.station,
      status: 'DRAFT',
      menuCode: item.code,
    },
  })
  await audit(venueId, 'add_line', {
    visitId: tab.visitId,
    tabId,
    lineId: line.id,
    actorId,
    detail: item.name,
  })
  return line
}

export async function bumpLineQty(venueId: string, lineId: string, delta: number, actorId?: string) {
  if (!Number.isInteger(delta) || Math.abs(delta) > 50) {
    throw new Error('Изменение количества должно быть целым числом от -50 до 50')
  }
  const line = await prisma.ammeLine.findFirst({
    where: { id: lineId, status: 'DRAFT', tab: { visit: { venueId } } },
  })
  if (!line) throw new Error('Строка не найдена')
  if (line.status === 'DONE') return
  if (line.status !== 'SENT') throw new Error('Позиция ещё не отправлена на станцию')
  const qty = line.qty + delta
  if (qty <= 0) {
    await prisma.ammeLine.update({
      where: { id: lineId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelReason: 'qty_zero',
        cancelledById: actorId,
      },
    })
    await audit(venueId, 'line_cancelled', {
      lineId,
      tabId: line.tabId,
      actorId,
      detail: `${line.name}: qty_zero`,
    })
    return null
  }
  const updated = await prisma.ammeLine.update({ where: { id: lineId }, data: { qty } })
  await audit(venueId, 'line_qty_changed', {
    lineId,
    tabId: line.tabId,
    actorId,
    detail: `${line.name}: ${line.qty} → ${qty}`,
  })
  return updated
}

export async function sendDraftLines(venueId: string, tabId: string, actorId?: string) {
  const result = await prisma.ammeLine.updateMany({
    where: { tabId, status: 'DRAFT', tab: { visit: { venueId } } },
    data: { status: 'SENT', sentAt: new Date() },
  })
  if (result.count > 0) {
    await audit(venueId, 'send_kitchen', { tabId, actorId, detail: `${result.count} поз.` })
  }
  return result.count
}

export async function markLineDone(venueId: string, lineId: string, actorId?: string) {
  const line = await prisma.ammeLine.findFirst({
    where: { id: lineId, tab: { visit: { venueId } } },
  })
  if (!line) throw new Error('Строка не найдена')
  await prisma.ammeLine.update({
    where: { id: lineId },
    data: { status: 'DONE', doneAt: new Date() },
  })
  await audit(venueId, 'line_done', { lineId, tabId: line.tabId, actorId })
  await consumeRecipeForLine(venueId, lineId, actorId)
}

export async function moveLines(
  venueId: string,
  lineIds: string[],
  target: { newTabForVisitId?: string; tabId?: string },
  actorId?: string
) {
  if (!lineIds.length) throw new Error('Нет позиций')
  const lines = await prisma.ammeLine.findMany({
    where: { id: { in: lineIds }, tab: { visit: { venueId } } },
  })
  if (lines.length !== lineIds.length) throw new Error('Часть позиций не найдена')

  let targetTabId = target.tabId
  if (target.newTabForVisitId) {
    const count = await prisma.ammeTab.count({ where: { visitId: target.newTabForVisitId } })
    const tab = await prisma.ammeTab.create({
      data: { visitId: target.newTabForVisitId, label: `Счёт ${count + 1}` },
    })
    targetTabId = tab.id
  }
  if (!targetTabId) throw new Error('Цель не указана')

  const dest = await prisma.ammeTab.findFirst({
    where: { id: targetTabId, visit: { venueId } },
  })
  if (!dest) throw new Error('Целевой счёт не найден')

  await prisma.$transaction(
    lines.map((l) =>
      prisma.ammeLine.update({
        where: { id: l.id },
        data: { tabId: targetTabId! },
      })
    )
  )
  await audit(venueId, 'move_lines', {
    tabId: targetTabId,
    actorId,
    detail: JSON.stringify({ from: lines.map((l) => l.tabId), lineIds }),
  })
}

export async function payTab(
  venueId: string,
  tabId: string,
  actorId?: string,
  method: 'CASH' | 'QRIS' | 'CARD' | 'TRANSFER' | 'PACKAGE' | 'GIFT_CARD' | 'OTHER' = 'CASH'
) {
  const tab = await prisma.ammeTab.findFirst({
    where: { id: tabId, visit: { venueId } },
    include: { visit: true, lines: { where: { status: { not: 'CANCELLED' } } } },
  })
  if (!tab) throw new Error('Счёт не найден')
  if (tab.paidAt) throw new Error('Счёт уже оплачен')
  const amount = tab.lines.reduce((sum, line) => sum + line.price * line.qty, 0)
  const paidAt = new Date()
  await prisma.$transaction([
    prisma.ammeTab.update({ where: { id: tabId }, data: { paidAt } }),
    prisma.ammePayment.create({
      data: { venueId, tabId, amount, method, status: 'PAID', actorId, paidAt },
    }),
  ])
  await audit(venueId, 'pay', { tabId, visitId: tab.visitId, actorId })
  if (tab.visit.guestId) {
    await recomputeGuestStats(venueId, tab.visit.guestId)
  }
}

export async function closeTab(venueId: string, tabId: string, actorId?: string) {
  const tab = await prisma.ammeTab.findFirst({
    where: { id: tabId, visit: { venueId } },
    include: { lines: true, visit: { include: { tabs: true } } },
  })
  if (!tab) throw new Error('Счёт не найден')
  const openKitchen = tab.lines.some((l) => l.status === 'SENT' || l.status === 'DRAFT')
  if (openKitchen) throw new Error('Есть позиции не отданные с кухни')
  if (!tab.paidAt) throw new Error('Сначала зафиксируйте оплату')

  await prisma.ammeTab.update({
    where: { id: tabId },
    data: { closedAt: new Date() },
  })

  const siblings = await prisma.ammeTab.findMany({ where: { visitId: tab.visitId } })
  if (siblings.every((t) => t.id === tabId || t.closedAt)) {
    await prisma.ammeVisit.update({
      where: { id: tab.visitId },
      data: { closedAt: new Date() },
    })
  }
  await audit(venueId, 'close_tab', { tabId, visitId: tab.visitId, actorId })
  if (tab.visit.guestId) {
    await recomputeGuestStats(venueId, tab.visit.guestId)
  }
}

export async function endBanya(venueId: string, visitId: string, actorId?: string) {
  await prisma.ammeVisit.updateMany({
    where: { id: visitId, venueId, banya: true, banyaEndedAt: null },
    data: { banyaEndedAt: new Date() },
  })
  await audit(venueId, 'end_banya', { visitId, actorId })
}

export async function importBookings(
  venueId: string,
  text: string,
  mode: 'append' | 'replace',
  day?: string | null,
  actorId?: string
) {
  const date = parseDayKey(day)
  const lines = text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean)
  const parsed: Prisma.AmmeBookingCreateManyInput[] = []

  for (const line of lines) {
    const timeMatch = line.match(/(\d{1,2})[:.](\d{2})/)
    if (!timeMatch) continue
    const venue = await prisma.ammeVenue.findUniqueOrThrow({ where: { id: venueId } })
    const dayString = dayKey(date)
    const local = venueDateTimeToUtc(dayString, `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`, venue.timezone)

    const banya = /бан/i.test(line)
    const guestsMatch = line.match(/(\d+)\s*(чел|гост|pax|people)/i) || line.match(/x\s*(\d+)/i)
    const guests = guestsMatch ? Number(guestsMatch[1]) : 2
    const phoneMatch = line.match(/(\+?\d[\d\s-]{7,}\d)/)
    let name = line
      .replace(timeMatch[0], '')
      .replace(phoneMatch?.[0] || '', '')
      .replace(/бан[яи].*/i, '')
      .replace(/\d+\s*(чел|гост|pax|people).*/i, '')
      .replace(/[–—|-].*$/, '')
      .trim()
    name = name.replace(/^[,.\s]+|[,.\s]+$/g, '') || 'Гость'

    parsed.push({
      venueId,
      date,
      at: local,
      name,
      guests: Math.max(1, guests),
      banya,
      phone: phoneMatch?.[0]?.trim() || null,
      status: 'WAITING',
    })
  }

  if (!parsed.length) throw new Error('Не удалось распознать строки (нужно время HH:MM)')

  if (mode === 'replace') {
    await prisma.ammeBooking.deleteMany({
      where: { venueId, date, status: 'WAITING' },
    })
  }

  for (const row of parsed) {
    const guest = await resolveGuest(prisma, venueId, {
      name: row.name,
      phone: row.phone,
      banya: row.banya,
      source: 'import',
    })
    await prisma.ammeBooking.create({
      data: { ...row, guestId: guest.id },
    })
  }

  await audit(venueId, 'import_bookings', {
    actorId,
    detail: `${parsed.length} записей (${mode}) на ${dayKey(date)}`,
  })
  return parsed.length
}

export type ReportRange = 'today' | '7d' | '30d' | 'custom'

function rangeBounds(
  range: ReportRange,
  timezone: string,
  day?: string | null,
  fromDay?: string | null,
  toDay?: string | null
) {
  const anchorKey = day || venueDayKey(new Date(), timezone)
  const anchor = venueDateTimeToUtc(anchorKey, '00:00', timezone)
  const endExclusive = addMinutes(anchor, 24 * 60)
  if (range === 'today') {
    return { from: anchor, to: endExclusive, label: anchorKey }
  }
  if (range === '30d') {
    return { from: new Date(endExclusive.getTime() - 30 * 86400000), to: endExclusive, label: '30 дней' }
  }
  if (range === 'custom' && fromDay && toDay) {
    const from = venueDateTimeToUtc(fromDay, '00:00', timezone)
    const to = addMinutes(venueDateTimeToUtc(toDay, '00:00', timezone), 24 * 60)
    return { from, to, label: `${fromDay} → ${toDay}` }
  }
  return { from: new Date(endExclusive.getTime() - 7 * 86400000), to: endExclusive, label: '7 дней' }
}

export async function getReport(
  venueId: string,
  day?: string | null,
  range: ReportRange = '7d',
  fromDay?: string | null,
  toDay?: string | null
) {
  const venue = await prisma.ammeVenue.findUniqueOrThrow({ where: { id: venueId } })
  const date = parseDayKey(day)
  const { from, to, label } = rangeBounds(range, venue.timezone, day, fromDay, toDay)

  const [tabs, bookings, audits] = await Promise.all([
    prisma.ammeTab.findMany({
      where: {
        paidAt: { gte: from, lt: to },
        visit: { venueId },
      },
      include: {
        lines: { where: { status: { not: 'CANCELLED' } } },
        visit: true,
      },
    }),
    prisma.ammeBooking.findMany({
      where: { venueId, date: { gte: from, lt: to } },
    }),
    prisma.ammeAuditEvent.findMany({
      where: { venueId, createdAt: { gte: from, lt: to } },
      orderBy: { createdAt: 'desc' },
      take: 40,
    }),
  ])

  let rev = 0
  let food = 0
  let banyaRev = 0
  let bGuests = 0
  let guestsServed = 0
  const byName = new Map<string, number>()
  const byDay = new Map<string, { rev: number; tabs: number; food: number; banya: number }>()
  const byHour = new Map<number, number>()
  const visitSeen = new Set<string>()

  for (const tab of tabs) {
    if (!visitSeen.has(tab.visitId)) {
      visitSeen.add(tab.visitId)
      guestsServed += tab.visit.guests
    }
    const paidAt = tab.paidAt || tab.openedAt
    const dk = venueDayKey(paidAt, venue.timezone)
    const hour = Number(
      new Intl.DateTimeFormat('en-US', {
        timeZone: venue.timezone,
        hour: '2-digit',
        hourCycle: 'h23',
      }).format(paidAt)
    )
    if (!byDay.has(dk)) byDay.set(dk, { rev: 0, tabs: 0, food: 0, banya: 0 })
    const dayBucket = byDay.get(dk)!
    dayBucket.tabs += 1
    byHour.set(hour, (byHour.get(hour) || 0) + 1)

    for (const l of tab.lines) {
      const sum = l.qty * l.price
      rev += sum
      dayBucket.rev += sum
      if (l.kind === 'BANYA') {
        banyaRev += sum
        bGuests += l.qty
        dayBucket.banya += sum
      } else {
        food += sum
        dayBucket.food += sum
      }
      byName.set(l.name, (byName.get(l.name) || 0) + sum)
    }
  }

  const paidVisitCount = visitSeen.size || 1
  const top = [...byName.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15)
  const daily = [...byDay.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([d, v]) => ({ day: d, ...v }))
  const hourly = Array.from({ length: 24 }, (_, h) => ({ hour: h, tabs: byHour.get(h) || 0 }))
  const bkNo = bookings.filter((b) => b.status === 'NOSHOW').length
  const bkArrived = bookings.filter((b) => b.status === 'ARRIVED').length

  return {
    rev,
    food,
    banyaRev,
    avg: Math.round(rev / paidVisitCount),
    bGuests,
    guestsServed,
    perGuest: bGuests ? Math.round(food / bGuests) : 0,
    foodShare: rev ? Math.round((food / rev) * 100) : 0,
    banyaShare: rev ? Math.round((banyaRev / rev) * 100) : 0,
    bkAll: bookings.length,
    bkNo,
    bkArrived,
    top,
    daily,
    hourly,
    tabsPaid: tabs.length,
    visitsPaid: visitSeen.size,
    day: dayKey(date),
    range,
    rangeLabel: label,
    audits: audits.map((a) => ({
      id: a.id,
      action: a.action,
      detail: a.detail,
      createdAt: a.createdAt.toISOString(),
    })),
  }
}

export async function updateMenuItem(
  venueId: string,
  code: string,
  patch: { price?: number; active?: boolean; name?: string },
  actorId?: string
) {
  const item = await prisma.ammeMenuItem.findFirst({ where: { venueId, code } })
  if (!item) throw new Error('Позиция не найдена')
  const updated = await prisma.ammeMenuItem.update({
    where: { id: item.id },
    data: {
      ...(patch.price != null ? { price: Math.max(0, Math.round(patch.price)) } : {}),
      ...(patch.active != null ? { active: patch.active } : {}),
      ...(patch.name != null && patch.name.trim() ? { name: patch.name.trim() } : {}),
    },
  })
  await audit(venueId, 'menu_update', {
    actorId,
    detail: `${code}: ${JSON.stringify(patch)}`,
  })
  return updated
}

export async function createManualBooking(
  venueId: string,
  input: {
    day?: string | null
    time: string
    name: string
    guests: number
    banya: boolean
    phone?: string
    note?: string
    resourceId?: string
    depositAmount?: number
    depositStatus?: 'NONE' | 'REQUIRED' | 'PENDING' | 'PAID' | 'FORFEITED' | 'REFUNDED' | 'WAIVED'
  },
  actorId?: string
) {
  const date = parseDayKey(input.day)
  const tm = input.time.match(/^(\d{1,2}):(\d{2})$/)
  if (!tm) throw new Error('Время в формате HH:MM')
  const venue = await prisma.ammeVenue.findUniqueOrThrow({ where: { id: venueId } })
  const local = venueDateTimeToUtc(dayKey(date), input.time, venue.timezone)
  const endsAt = addMinutes(local, venue.sessionMinutes)
  const name = input.name.trim()
  if (!name) throw new Error('Имя обязательно')

  const guest = await resolveGuest(prisma, venueId, {
    name,
    phone: input.phone,
    banya: !!input.banya,
    source: 'booking',
  })

  const booking = await prisma.ammeBooking.create({
    data: {
      venueId,
      guestId: guest.id,
      date,
      at: local,
      endsAt,
      name,
      guests: Math.max(1, Math.min(20, Number(input.guests) || 1)),
      banya: !!input.banya,
      phone: input.phone?.trim() || guest.phone,
      note: input.note?.trim() || null,
      depositAmount: Math.max(0, Math.round(input.depositAmount || 0)),
      depositStatus: input.depositStatus || (input.depositAmount ? 'REQUIRED' : 'NONE'),
      status: 'WAITING',
    },
  })
  if (input.banya) {
    try {
      await assertAndReserveCapacity(venueId, {
        bookingId: booking.id,
        resourceId: input.resourceId,
        guests: booking.guests,
        startsAt: local,
        endsAt,
      })
    } catch (error) {
      await prisma.ammeBooking.delete({ where: { id: booking.id } })
      throw error
    }
  }
  await audit(venueId, 'booking_create', { actorId, detail: `${name} ${input.time}` })
  return booking
}

export async function getRecentAudit(venueId: string, take = 20) {
  return prisma.ammeAuditEvent.findMany({
    where: { venueId },
    orderBy: { createdAt: 'desc' },
    take,
  })
}

export type { AmmeLineStatus }
