import { prisma } from '@/lib/prisma'
import { addMinutes, venueDateTimeToUtc } from '@/lib/amme/time'
import { normalizePhone, resolveGuest } from '@/lib/amme/crm'
import type {
  AmmeDepositStatus,
  AmmePackageType,
  AmmePaymentMethod,
  AmmeResourceKind,
  AmmeStaffRole,
  AmmeStockMovementType,
  Prisma,
} from '@prisma/client'

async function event(
  venueId: string,
  type: string,
  aggregateType: string,
  aggregateId: string,
  actorId?: string,
  payload?: Prisma.InputJsonValue
) {
  await prisma.$transaction([
    prisma.ammeDomainEvent.create({
      data: { venueId, type, aggregateType, aggregateId, actorId, payload },
    }),
    prisma.ammeAuditEvent.create({
      data: {
        venueId,
        actorId,
        action: type,
        detail: payload ? JSON.stringify(payload) : undefined,
      },
    }),
  ])
}

export async function getManagementState(venueId: string, day: string) {
  const venue = await prisma.ammeVenue.findUniqueOrThrow({ where: { id: venueId } })
  const dayStart = venueDateTimeToUtc(day, '00:00', venue.timezone)
  const dayEnd = addMinutes(dayStart, 24 * 60)

  const [
    resources,
    resourceBookings,
    waitlist,
    stations,
    inventory,
    packages,
    shifts,
    automations,
    messages,
    payments,
  ] = await Promise.all([
    prisma.ammeResource.findMany({
      where: { venueId },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    }),
    prisma.ammeBookingResource.findMany({
      where: {
        resource: { venueId },
        startsAt: { lt: dayEnd },
        endsAt: { gt: dayStart },
      },
      include: {
        resource: true,
        booking: { select: { id: true, name: true, status: true, depositStatus: true } },
        visit: { select: { id: true, name: true, closedAt: true } },
      },
      orderBy: { startsAt: 'asc' },
    }),
    prisma.ammeWaitlistEntry.findMany({
      where: { venueId, requestedDate: new Date(`${day}T00:00:00.000Z`) },
      include: { guest: true, resource: true },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    }),
    prisma.ammeKdsStation.findMany({
      where: { venueId },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    }),
    prisma.ammeInventoryItem.findMany({
      where: { venueId },
      include: { recipes: { include: { menuItem: true } } },
      orderBy: { name: 'asc' },
    }),
    prisma.ammePackage.findMany({
      where: { venueId },
      include: { _count: { select: { guestPackages: true } } },
      orderBy: { name: 'asc' },
    }),
    prisma.ammeShift.findMany({
      where: { venueId, startsAt: { lt: dayEnd }, OR: [{ endsAt: null }, { endsAt: { gt: dayStart } }] },
      include: { notes: { orderBy: { createdAt: 'desc' } } },
      orderBy: { startsAt: 'asc' },
    }),
    prisma.ammeAutomation.findMany({ where: { venueId }, orderBy: { name: 'asc' } }),
    prisma.ammeOutboundMessage.findMany({
      where: { venueId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
    prisma.ammePayment.findMany({
      where: { venueId, paidAt: { gte: dayStart, lt: dayEnd }, status: 'PAID' },
      orderBy: { paidAt: 'desc' },
    }),
  ])

  const capacity = resources.map((resource) => {
    const allocations = resourceBookings.filter((r) => r.resourceId === resource.id)
    const peak = allocations.reduce((max, allocation) => Math.max(max, allocation.guests), 0)
    return {
      resourceId: resource.id,
      name: resource.name,
      kind: resource.kind,
      capacity: resource.capacity,
      allocated: allocations.reduce((sum, r) => sum + r.guests, 0),
      peak,
      utilizationPct: resource.capacity ? Math.round((peak / resource.capacity) * 100) : 0,
    }
  })

  return {
    venue,
    resources,
    resourceBookings,
    capacity,
    waitlist,
    stations,
    inventory: inventory.map((item) => ({
      ...item,
      onHand: Number(item.onHand),
      reorderAt: Number(item.reorderAt),
    })),
    packages,
    shifts,
    automations,
    messages,
    payments,
  }
}

export async function upsertResource(
  venueId: string,
  input: {
    id?: string
    code: string
    name: string
    kind: AmmeResourceKind
    capacity: number
    sessionMinutes?: number
    turnoverMinutes?: number
    active?: boolean
  },
  actorId?: string
) {
  const data = {
    venueId,
    code: input.code.trim().toUpperCase(),
    name: input.name.trim(),
    kind: input.kind,
    capacity: Math.max(1, Math.round(input.capacity)),
    sessionMinutes: input.sessionMinutes ? Math.max(15, input.sessionMinutes) : null,
    turnoverMinutes: input.turnoverMinutes ? Math.max(0, input.turnoverMinutes) : null,
    active: input.active ?? true,
  }
  const resource = input.id
    ? await prisma.ammeResource.updateMany({ where: { id: input.id, venueId }, data })
    : await prisma.ammeResource.upsert({
        where: { venueId_code: { venueId, code: data.code } },
        create: data,
        update: data,
      })
  await event(venueId, 'resource_upserted', 'RESOURCE', input.id || data.code, actorId, data)
  return resource
}

export async function assertAndReserveCapacity(
  venueId: string,
  input: {
    bookingId?: string
    visitId?: string
    resourceId?: string
    guests: number
    startsAt: Date
    endsAt?: Date
  }
) {
  const venue = await prisma.ammeVenue.findUniqueOrThrow({ where: { id: venueId } })
  const resource =
    (input.resourceId &&
      (await prisma.ammeResource.findFirst({
        where: { id: input.resourceId, venueId, active: true },
      }))) ||
    (await prisma.ammeResource.findFirst({
      where: { venueId, kind: 'BANYA', active: true },
      orderBy: { sortOrder: 'asc' },
    }))
  if (!resource) throw new Error('Нет активного ресурса бани')
  const endsAt =
    input.endsAt ||
    addMinutes(input.startsAt, resource.sessionMinutes || venue.sessionMinutes)
  const overlaps = await prisma.ammeBookingResource.aggregate({
    where: {
      resourceId: resource.id,
      startsAt: { lt: endsAt },
      endsAt: { gt: input.startsAt },
      ...(input.bookingId ? { bookingId: { not: input.bookingId } } : {}),
    },
    _sum: { guests: true },
  })
  const used = overlaps._sum.guests || 0
  if (used + input.guests > resource.capacity) {
    throw new Error(
      `Недостаточно мест: ${used}/${resource.capacity} занято, запрошено ${input.guests}`
    )
  }
  return prisma.ammeBookingResource.create({
    data: {
      bookingId: input.bookingId,
      visitId: input.visitId,
      resourceId: resource.id,
      guests: input.guests,
      startsAt: input.startsAt,
      endsAt,
    },
  })
}

export async function addWaitlist(
  venueId: string,
  input: {
    name: string
    phone?: string
    guests: number
    day: string
    time?: string
    resourceId?: string
    notes?: string
  },
  actorId?: string
) {
  const venue = await prisma.ammeVenue.findUniqueOrThrow({ where: { id: venueId } })
  const guest = await resolveGuest(prisma, venueId, {
    name: input.name,
    phone: input.phone,
    banya: true,
    source: 'waitlist',
  })
  const preferredFrom = input.time
    ? venueDateTimeToUtc(input.day, input.time, venue.timezone)
    : null
  const entry = await prisma.ammeWaitlistEntry.create({
    data: {
      venueId,
      guestId: guest.id,
      resourceId: input.resourceId || null,
      name: input.name.trim(),
      phone: input.phone?.trim() || null,
      guests: Math.max(1, input.guests),
      requestedDate: new Date(`${input.day}T00:00:00.000Z`),
      preferredFrom,
      preferredTo: preferredFrom ? addMinutes(preferredFrom, venue.sessionMinutes) : null,
      notes: input.notes?.trim() || null,
    },
  })
  await event(venueId, 'waitlist_added', 'WAITLIST', entry.id, actorId, {
    name: entry.name,
    guests: entry.guests,
  })
  return entry
}

export async function updateDeposit(
  venueId: string,
  bookingId: string,
  amount: number,
  status: AmmeDepositStatus,
  method: AmmePaymentMethod,
  actorId?: string
) {
  const booking = await prisma.ammeBooking.findFirst({ where: { id: bookingId, venueId } })
  if (!booking) throw new Error('Запись не найдена')
  const paidAt = status === 'PAID' ? new Date() : null
  await prisma.$transaction(async (tx) => {
    await tx.ammeBooking.update({
      where: { id: booking.id },
      data: { depositAmount: Math.max(0, Math.round(amount)), depositStatus: status },
    })
    if (status === 'PAID' && amount > 0) {
      await tx.ammePayment.create({
        data: {
          venueId,
          bookingId,
          amount: Math.round(amount),
          method,
          status: 'PAID',
          actorId,
          paidAt,
          note: 'Booking deposit',
        },
      })
    }
  })
  await event(venueId, 'deposit_updated', 'BOOKING', bookingId, actorId, {
    amount,
    status,
    method,
  })
}

export async function upsertStation(
  venueId: string,
  input: { code: string; name: string; targetMinutes: number; active?: boolean },
  actorId?: string
) {
  const code = input.code.trim().toUpperCase()
  const station = await prisma.ammeKdsStation.upsert({
    where: { venueId_code: { venueId, code } },
    create: {
      venueId,
      code,
      name: input.name.trim(),
      targetMinutes: Math.max(1, input.targetMinutes),
      active: input.active ?? true,
    },
    update: {
      name: input.name.trim(),
      targetMinutes: Math.max(1, input.targetMinutes),
      active: input.active ?? true,
    },
  })
  await event(venueId, 'kds_station_upserted', 'STATION', station.id, actorId)
  return station
}

export async function upsertInventoryItem(
  venueId: string,
  input: {
    id?: string
    sku: string
    name: string
    unit: string
    onHand: number
    reorderAt: number
    avgUnitCost: number
    supplier?: string
  },
  actorId?: string
) {
  const sku = input.sku.trim().toUpperCase()
  const existing = input.id
    ? await prisma.ammeInventoryItem.findFirst({ where: { id: input.id, venueId } })
    : await prisma.ammeInventoryItem.findUnique({ where: { venueId_sku: { venueId, sku } } })
  const prior = existing ? Number(existing.onHand) : 0
  const item = await prisma.ammeInventoryItem.upsert({
    where: { venueId_sku: { venueId, sku } },
    create: {
      venueId,
      sku,
      name: input.name.trim(),
      unit: input.unit.trim() || 'pcs',
      onHand: input.onHand,
      reorderAt: input.reorderAt,
      avgUnitCost: Math.max(0, Math.round(input.avgUnitCost)),
      supplier: input.supplier?.trim() || null,
    },
    update: {
      name: input.name.trim(),
      unit: input.unit.trim() || 'pcs',
      onHand: input.onHand,
      reorderAt: input.reorderAt,
      avgUnitCost: Math.max(0, Math.round(input.avgUnitCost)),
      supplier: input.supplier?.trim() || null,
    },
  })
  if (prior !== input.onHand) {
    await prisma.ammeStockMovement.create({
      data: {
        venueId,
        inventoryItemId: item.id,
        type: 'ADJUSTMENT',
        quantity: input.onHand - prior,
        unitCost: item.avgUnitCost,
        actorId,
        note: 'Manual stock set',
      },
    })
  }
  await event(venueId, 'inventory_item_upserted', 'INVENTORY', item.id, actorId)
  return item
}

export async function adjustInventory(
  venueId: string,
  inventoryItemId: string,
  quantity: number,
  type: AmmeStockMovementType,
  note?: string,
  actorId?: string
) {
  const item = await prisma.ammeInventoryItem.findFirst({
    where: { id: inventoryItemId, venueId },
  })
  if (!item) throw new Error('Складская позиция не найдена')
  const next = Number(item.onHand) + quantity
  if (next < 0) throw new Error('Остаток не может быть отрицательным')
  await prisma.$transaction([
    prisma.ammeInventoryItem.update({
      where: { id: item.id },
      data: { onHand: next },
    }),
    prisma.ammeStockMovement.create({
      data: {
        venueId,
        inventoryItemId,
        quantity,
        type,
        unitCost: item.avgUnitCost,
        note,
        actorId,
      },
    }),
  ])
  await event(venueId, 'stock_adjusted', 'INVENTORY', item.id, actorId, {
    quantity,
    type,
  })
}

export async function setRecipe(
  venueId: string,
  menuItemId: string,
  ingredients: { inventoryItemId: string; quantity: number }[],
  actorId?: string
) {
  const menu = await prisma.ammeMenuItem.findFirst({ where: { id: menuItemId, venueId } })
  if (!menu) throw new Error('Позиция меню не найдена')
  await prisma.$transaction(async (tx) => {
    await tx.ammeRecipeItem.deleteMany({ where: { menuItemId } })
    for (const ingredient of ingredients) {
      const item = await tx.ammeInventoryItem.findFirst({
        where: { id: ingredient.inventoryItemId, venueId },
      })
      if (!item) throw new Error('Ингредиент не найден')
      await tx.ammeRecipeItem.create({
        data: {
          menuItemId,
          inventoryItemId: ingredient.inventoryItemId,
          quantity: ingredient.quantity,
        },
      })
    }
  })
  await event(venueId, 'recipe_updated', 'MENU', menu.id, actorId, {
    ingredients: ingredients.length,
  })
}

export async function consumeRecipeForLine(venueId: string, lineId: string, actorId?: string) {
  const line = await prisma.ammeLine.findFirst({
    where: { id: lineId, tab: { visit: { venueId } } },
  })
  if (!line?.menuCode) return
  const menu = await prisma.ammeMenuItem.findFirst({
    where: { venueId, code: line.menuCode },
    include: { recipes: { include: { inventoryItem: true } } },
  })
  if (!menu?.recipes.length) return
  await prisma.$transaction(async (tx) => {
    for (const recipe of menu.recipes) {
      const qty = Number(recipe.quantity) * line.qty
      const next = Math.max(0, Number(recipe.inventoryItem.onHand) - qty)
      await tx.ammeInventoryItem.update({
        where: { id: recipe.inventoryItemId },
        data: { onHand: next },
      })
      await tx.ammeStockMovement.create({
        data: {
          venueId,
          inventoryItemId: recipe.inventoryItemId,
          type: 'CONSUMPTION',
          quantity: -qty,
          unitCost: recipe.inventoryItem.avgUnitCost,
          referenceType: 'LINE',
          referenceId: line.id,
          actorId,
        },
      })
    }
  })
}

export async function upsertPackage(
  venueId: string,
  input: {
    code: string
    name: string
    packageType: AmmePackageType
    price: number
    sessions: number
    creditValue: number
    validityDays: number
    active?: boolean
  },
  actorId?: string
) {
  const code = input.code.trim().toUpperCase()
  const data = {
    code,
    name: input.name.trim(),
    type: input.packageType,
    price: Math.max(0, Math.round(input.price)),
    sessions: Math.max(0, Math.round(input.sessions)),
    creditValue: Math.max(0, Math.round(input.creditValue)),
    validityDays: Math.max(1, Math.round(input.validityDays)),
    active: input.active ?? true,
  }
  const item = await prisma.ammePackage.upsert({
    where: { venueId_code: { venueId, code } },
    create: { venueId, ...data },
    update: data,
  })
  await event(venueId, 'package_upserted', 'PACKAGE', item.id, actorId)
  return item
}

export async function assignPackage(
  venueId: string,
  guestId: string,
  packageId: string,
  actorId?: string
) {
  const pkg = await prisma.ammePackage.findFirst({ where: { id: packageId, venueId, active: true } })
  const guest = await prisma.ammeGuest.findFirst({ where: { id: guestId, venueId } })
  if (!pkg || !guest) throw new Error('Гость или пакет не найден')
  const assigned = await prisma.ammeGuestPackage.create({
    data: {
      guestId,
      packageId,
      sessionsRemaining: pkg.sessions,
      creditRemaining: pkg.creditValue,
      expiresAt: addMinutes(new Date(), pkg.validityDays * 24 * 60),
    },
  })
  await event(venueId, 'package_assigned', 'GUEST', guestId, actorId, {
    packageId,
  })
  return assigned
}

export async function recomputeRfm(venueId: string) {
  const guests = await prisma.ammeGuest.findMany({ where: { venueId } })
  const now = Date.now()
  const money = guests.map((g) => g.lifetimeSpend).sort((a, b) => a - b)
  const freq = guests.map((g) => g.visitCount).sort((a, b) => a - b)
  const percentile = (values: number[], value: number) =>
    values.length <= 1 ? 5 : Math.max(1, Math.min(5, Math.ceil((values.filter((v) => v <= value).length / values.length) * 5)))
  for (const guest of guests) {
    const days = guest.lastVisitAt ? Math.floor((now - guest.lastVisitAt.getTime()) / 86_400_000) : 9999
    const recencyScore = days <= 14 ? 5 : days <= 30 ? 4 : days <= 60 ? 3 : days <= 120 ? 2 : 1
    const frequencyScore = percentile(freq, guest.visitCount)
    const monetaryScore = percentile(money, guest.lifetimeSpend)
    const total = recencyScore + frequencyScore + monetaryScore
    const rfmSegment =
      recencyScore >= 4 && frequencyScore >= 4 && monetaryScore >= 4
        ? 'CHAMPION'
        : frequencyScore >= 4
          ? 'LOYAL'
          : recencyScore <= 2 && (frequencyScore >= 3 || monetaryScore >= 3)
            ? 'AT_RISK'
            : recencyScore === 5 && frequencyScore <= 2
              ? 'NEW'
              : total <= 5
                ? 'HIBERNATING'
                : 'POTENTIAL'
    const tags = new Set(guest.tags)
    if (guest.visitCount >= 3) tags.add('Постоянный')
    if (guest.noshowCount >= 2) tags.add('Осторожно')
    await prisma.ammeGuest.update({
      where: { id: guest.id },
      data: {
        recencyScore,
        frequencyScore,
        monetaryScore,
        rfmSegment,
        tags: [...tags],
      },
    })
  }
  return guests.length
}

export async function upsertAutomation(
  venueId: string,
  input: { id?: string; name: string; trigger: string; conditions?: unknown; actions: unknown; active?: boolean },
  actorId?: string
) {
  const data = {
    venueId,
    name: input.name.trim(),
    trigger: input.trigger.trim(),
    conditions: input.conditions as Prisma.InputJsonValue | undefined,
    actions: input.actions as Prisma.InputJsonValue,
    active: input.active ?? true,
  }
  const automation = input.id
    ? await prisma.ammeAutomation.update({ where: { id: input.id }, data })
    : await prisma.ammeAutomation.create({ data })
  await event(venueId, 'automation_upserted', 'AUTOMATION', automation.id, actorId)
  return automation
}

export async function queueMessage(
  venueId: string,
  input: { guestId?: string; bookingId?: string; recipient: string; body: string; channel?: string },
  actorId?: string
) {
  const message = await prisma.ammeOutboundMessage.create({
    data: {
      venueId,
      guestId: input.guestId,
      bookingId: input.bookingId,
      recipient: input.recipient,
      body: input.body,
      channel: input.channel || 'WHATSAPP',
      status: 'QUEUED',
    },
  })
  await event(venueId, 'message_queued', 'MESSAGE', message.id, actorId)
  return message
}

export async function openShift(
  venueId: string,
  staffUserId: string,
  role: AmmeStaffRole,
  actorId?: string
) {
  const existing = await prisma.ammeShift.findFirst({ where: { venueId, status: 'OPEN' } })
  if (existing) return existing
  const shift = await prisma.ammeShift.create({
    data: {
      venueId,
      staffUserId,
      role,
      startsAt: new Date(),
      openedAt: new Date(),
      status: 'OPEN',
    },
  })
  await event(venueId, 'shift_opened', 'SHIFT', shift.id, actorId)
  return shift
}

export async function addShiftNote(venueId: string, shiftId: string, body: string, actorId?: string) {
  const shift = await prisma.ammeShift.findFirst({ where: { id: shiftId, venueId } })
  if (!shift) throw new Error('Смена не найдена')
  const note = await prisma.ammeShiftNote.create({
    data: { shiftId, body: body.trim(), authorId: actorId },
  })
  await event(venueId, 'shift_note_added', 'SHIFT', shift.id, actorId)
  return note
}

export async function getOwnerAnalytics(venueId: string, day: string) {
  const venue = await prisma.ammeVenue.findUniqueOrThrow({ where: { id: venueId } })
  const from = venueDateTimeToUtc(day, '00:00', venue.timezone)
  const to = addMinutes(from, 24 * 60)
  const [visits, bookings, payments, resources, guests, stock] = await Promise.all([
    prisma.ammeVisit.findMany({
      where: { venueId, openedAt: { gte: from, lt: to } },
      include: { tabs: { include: { lines: { where: { status: { not: 'CANCELLED' } } } } } },
    }),
    prisma.ammeBooking.findMany({ where: { venueId, at: { gte: from, lt: to } } }),
    prisma.ammePayment.findMany({ where: { venueId, status: 'PAID', paidAt: { gte: from, lt: to } } }),
    prisma.ammeResource.findMany({ where: { venueId, kind: 'BANYA', active: true } }),
    prisma.ammeGuest.findMany({ where: { venueId } }),
    prisma.ammeStockMovement.aggregate({
      where: { venueId, createdAt: { gte: from, lt: to }, type: 'CONSUMPTION' },
      _sum: { quantity: true },
    }),
  ])
  let revenue = 0
  let foodRevenue = 0
  let banyaRevenue = 0
  let banyaGuestMinutes = 0
  let foodAttached = 0
  for (const visit of visits) {
    let hasFood = false
    for (const tab of visit.tabs) {
      for (const line of tab.lines) {
        const value = line.qty * line.price
        revenue += value
        if (line.kind === 'BANYA') banyaRevenue += value
        else {
          foodRevenue += value
          hasFood = true
        }
      }
    }
    if (visit.banya) {
      banyaGuestMinutes += visit.guests * venue.sessionMinutes
      if (hasFood) foodAttached += 1
    }
  }
  const capacityMinutes =
    resources.reduce((sum, r) => sum + r.capacity, 0) *
    Math.max(0, venue.closeHour - venue.openHour) *
    60
  const banyaVisits = visits.filter((v) => v.banya).length
  const repeatGuests = guests.filter((g) => g.visitCount >= 2).length
  return {
    revenue,
    foodRevenue,
    banyaRevenue,
    paid: payments.reduce((sum, p) => sum + p.amount, 0),
    avgVisit: visits.length ? Math.round(revenue / visits.length) : 0,
    utilizationPct: capacityMinutes ? Math.round((banyaGuestMinutes / capacityMinutes) * 100) : 0,
    revPerAvailableHour:
      capacityMinutes > 0 ? Math.round(banyaRevenue / (capacityMinutes / 60)) : 0,
    foodAttachPct: banyaVisits ? Math.round((foodAttached / banyaVisits) * 100) : 0,
    noShowPct: bookings.length
      ? Math.round((bookings.filter((b) => b.status === 'NOSHOW').length / bookings.length) * 100)
      : 0,
    depositCaptured: bookings
      .filter((b) => b.depositStatus === 'PAID')
      .reduce((sum, b) => sum + b.depositAmount, 0),
    repeatGuestPct: guests.length ? Math.round((repeatGuests / guests.length) * 100) : 0,
    guests: visits.reduce((sum, v) => sum + v.guests, 0),
    visits: visits.length,
    bookings: bookings.length,
    stockConsumptionUnits: Math.abs(Number(stock._sum.quantity || 0)),
    rfm: Object.fromEntries(
      ['CHAMPION', 'LOYAL', 'POTENTIAL', 'NEW', 'AT_RISK', 'HIBERNATING'].map((segment) => [
        segment,
        guests.filter((g) => g.rfmSegment === segment).length,
      ])
    ),
  }
}

export function normalizedPhoneForBooking(phone?: string | null) {
  return normalizePhone(phone)
}
