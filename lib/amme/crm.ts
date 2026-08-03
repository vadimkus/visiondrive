import { prisma } from '@/lib/prisma'
import type { AmmeGuest, Prisma } from '@prisma/client'
import { type CrmSegment } from '@/lib/amme/crm-shared'

export type { CrmSegment } from '@/lib/amme/crm-shared'
export { CRM_TAG_PRESETS } from '@/lib/amme/crm-shared'

export type GuestPatch = {
  name?: string
  phone?: string | null
  email?: string | null
  notes?: string | null
  tags?: string[]
  preferences?: string | null
  dietary?: string | null
  birthday?: string | null
  source?: string | null
  language?: string | null
  banyaPref?: boolean
  blocked?: boolean
  vip?: boolean
}

type Db = Prisma.TransactionClient | typeof prisma

export function normalizePhone(phone?: string | null): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 8) return null
  return digits
}

export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ')
}

function tagsWithFlags(tags: string[], vip: boolean, blocked: boolean): string[] {
  const set = new Set(tags.map((t) => t.trim()).filter(Boolean))
  if (vip) set.add('VIP')
  else set.delete('VIP')
  if (blocked) set.add('Осторожно')
  return [...set]
}

/** Find or create a guest profile. Phone is the strong identity; name-only creates a new card. */
export async function resolveGuest(
  db: Db,
  venueId: string,
  input: { name: string; phone?: string | null; banya?: boolean; source?: string }
): Promise<AmmeGuest> {
  const name = normalizeName(input.name)
  if (!name) throw new Error('Имя гостя обязательно')
  const phoneNorm = normalizePhone(input.phone)
  const phone = input.phone?.trim() || null

  if (phoneNorm) {
    const existing = await db.ammeGuest.findUnique({
      where: { venueId_phoneNorm: { venueId, phoneNorm } },
    })
    if (existing) {
      return db.ammeGuest.update({
        where: { id: existing.id },
        data: {
          name: existing.name || name,
          phone: phone || existing.phone,
          ...(input.banya ? { banyaPref: true } : {}),
        },
      })
    }
  }

  return db.ammeGuest.create({
    data: {
      venueId,
      name,
      phone,
      phoneNorm,
      banyaPref: !!input.banya,
      source: input.source || null,
      tags: [],
    },
  })
}

export async function recomputeGuestStats(venueId: string, guestId: string) {
  const [visits, noshows] = await Promise.all([
    prisma.ammeVisit.findMany({
      where: { venueId, guestId },
      include: {
        tabs: {
          where: { paidAt: { not: null } },
          include: { lines: { where: { status: { not: 'CANCELLED' } } } },
        },
      },
      orderBy: { openedAt: 'asc' },
    }),
    prisma.ammeBooking.count({ where: { venueId, guestId, status: 'NOSHOW' } }),
  ])

  let lifetimeSpend = 0
  let paidVisits = 0
  for (const v of visits) {
    const paidTabs = v.tabs.filter((t) => t.paidAt)
    if (!paidTabs.length) continue
    paidVisits += 1
    for (const t of paidTabs) {
      for (const l of t.lines) lifetimeSpend += l.qty * l.price
    }
  }

  const first = visits[0]?.openedAt || null
  const last = visits.length ? visits[visits.length - 1]?.openedAt || null : null
  const banyaPref = visits.some((v) => v.banya)

  return prisma.ammeGuest.update({
    where: { id: guestId },
    data: {
      visitCount: visits.length,
      noshowCount: noshows,
      lifetimeSpend,
      avgSpend: paidVisits ? Math.round(lifetimeSpend / paidVisits) : 0,
      firstVisitAt: first,
      lastVisitAt: last,
      banyaPref,
      vip: visits.length >= 5 || lifetimeSpend >= 5_000_000,
    },
  })
}

export async function bumpNoshow(venueId: string, guestId: string | null | undefined) {
  if (!guestId) return
  await prisma.ammeGuest.update({
    where: { id: guestId },
    data: { noshowCount: { increment: 1 } },
  })
  await recomputeGuestStats(venueId, guestId)
}

function segmentWhere(segment: CrmSegment): Prisma.AmmeGuestWhereInput {
  const now = Date.now()
  const d30 = new Date(now - 30 * 86400000)
  switch (segment) {
    case 'vip':
      return { OR: [{ vip: true }, { tags: { has: 'VIP' } }] }
    case 'regular':
      return { visitCount: { gte: 3 } }
    case 'new':
      return { visitCount: { lte: 1 } }
    case 'dormant':
      return {
        visitCount: { gte: 1 },
        OR: [{ lastVisitAt: { lt: d30 } }, { lastVisitAt: null }],
      }
    case 'banya':
      return { banyaPref: true }
    case 'high':
      return { lifetimeSpend: { gte: 2_000_000 } }
    case 'blocked':
      return { OR: [{ blocked: true }, { tags: { has: 'Осторожно' } }] }
    case 'noshow':
      return { noshowCount: { gte: 1 } }
    default:
      return {}
  }
}

export async function listGuests(
  venueId: string,
  opts: { q?: string; segment?: CrmSegment; take?: number } = {}
) {
  const q = opts.q?.trim() || ''
  const segment = opts.segment || 'all'
  const phoneQ = normalizePhone(q)
  const where: Prisma.AmmeGuestWhereInput = {
    venueId,
    ...segmentWhere(segment),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q } },
            ...(phoneQ ? [{ phoneNorm: { contains: phoneQ } }] : []),
            { notes: { contains: q, mode: 'insensitive' } },
            { tags: { has: q } },
          ],
        }
      : {}),
  }

  const [guests, total, summaryRaw] = await Promise.all([
    prisma.ammeGuest.findMany({
      where,
      orderBy: [{ vip: 'desc' }, { lastVisitAt: 'desc' }, { name: 'asc' }],
      take: Math.min(200, opts.take || 80),
    }),
    prisma.ammeGuest.count({ where }),
    prisma.ammeGuest.findMany({
      where: { venueId },
      select: {
        vip: true,
        blocked: true,
        visitCount: true,
        noshowCount: true,
        lifetimeSpend: true,
        banyaPref: true,
        lastVisitAt: true,
        tags: true,
      },
    }),
  ])

  const d30 = new Date(Date.now() - 30 * 86400000)
  const summary = {
    all: summaryRaw.length,
    vip: summaryRaw.filter((g) => g.vip || g.tags.includes('VIP')).length,
    regular: summaryRaw.filter((g) => g.visitCount >= 3).length,
    new: summaryRaw.filter((g) => g.visitCount <= 1).length,
    dormant: summaryRaw.filter(
      (g) => g.visitCount >= 1 && (!g.lastVisitAt || g.lastVisitAt < d30)
    ).length,
    banya: summaryRaw.filter((g) => g.banyaPref).length,
    high: summaryRaw.filter((g) => g.lifetimeSpend >= 2_000_000).length,
    blocked: summaryRaw.filter((g) => g.blocked || g.tags.includes('Осторожно')).length,
    noshow: summaryRaw.filter((g) => g.noshowCount >= 1).length,
  }

  return { guests, total, summary, segment, q }
}

export async function getGuestDetail(venueId: string, guestId: string) {
  const guest = await prisma.ammeGuest.findFirst({ where: { id: guestId, venueId } })
  if (!guest) throw new Error('Гость не найден')

  const [visits, bookings] = await Promise.all([
    prisma.ammeVisit.findMany({
      where: { venueId, guestId },
      include: {
        tabs: {
          include: { lines: { where: { status: { not: 'CANCELLED' } } } },
          orderBy: { openedAt: 'asc' },
        },
      },
      orderBy: { openedAt: 'desc' },
      take: 40,
    }),
    prisma.ammeBooking.findMany({
      where: { venueId, guestId },
      orderBy: { at: 'desc' },
      take: 40,
    }),
  ])

  const history = visits.map((v) => {
    const spend = v.tabs.reduce(
      (s, t) => s + t.lines.reduce((a, l) => a + l.qty * l.price, 0),
      0
    )
    return {
      id: v.id,
      name: v.name,
      guests: v.guests,
      banya: v.banya,
      openedAt: v.openedAt.toISOString(),
      closedAt: v.closedAt?.toISOString() || null,
      spend,
      paid: v.tabs.some((t) => t.paidAt),
      topItems: v.tabs
        .flatMap((t) => t.lines)
        .filter((l) => l.kind !== 'BANYA')
        .slice(0, 6)
        .map((l) => `${l.name}×${l.qty}`),
    }
  })

  return {
    guest,
    history,
    bookings: bookings.map((b) => ({
      id: b.id,
      at: b.at.toISOString(),
      status: b.status,
      guests: b.guests,
      banya: b.banya,
      note: b.note,
    })),
  }
}

export async function updateGuest(venueId: string, guestId: string, patch: GuestPatch, actorId?: string) {
  const guest = await prisma.ammeGuest.findFirst({ where: { id: guestId, venueId } })
  if (!guest) throw new Error('Гость не найден')

  const nextVip = patch.vip ?? guest.vip
  const nextBlocked = patch.blocked ?? guest.blocked
  const nextTags = tagsWithFlags(patch.tags ?? guest.tags, nextVip, nextBlocked)
  const phone = patch.phone !== undefined ? patch.phone?.trim() || null : guest.phone
  const phoneNorm = patch.phone !== undefined ? normalizePhone(patch.phone) : guest.phoneNorm

  if (phoneNorm && phoneNorm !== guest.phoneNorm) {
    const clash = await prisma.ammeGuest.findUnique({
      where: { venueId_phoneNorm: { venueId, phoneNorm } },
    })
    if (clash && clash.id !== guestId) throw new Error('Телефон уже есть у другого гостя')
  }

  const updated = await prisma.ammeGuest.update({
    where: { id: guestId },
    data: {
      ...(patch.name != null ? { name: normalizeName(patch.name) } : {}),
      ...(patch.phone !== undefined ? { phone, phoneNorm } : {}),
      ...(patch.email !== undefined ? { email: patch.email?.trim() || null } : {}),
      ...(patch.notes !== undefined ? { notes: patch.notes?.trim() || null } : {}),
      ...(patch.preferences !== undefined ? { preferences: patch.preferences?.trim() || null } : {}),
      ...(patch.dietary !== undefined ? { dietary: patch.dietary?.trim() || null } : {}),
      ...(patch.source !== undefined ? { source: patch.source?.trim() || null } : {}),
      ...(patch.language !== undefined ? { language: patch.language?.trim() || null } : {}),
      ...(patch.banyaPref !== undefined ? { banyaPref: patch.banyaPref } : {}),
      vip: nextVip,
      blocked: nextBlocked,
      tags: nextTags,
      ...(patch.birthday !== undefined
        ? {
            birthday: patch.birthday
              ? new Date(`${patch.birthday.slice(0, 10)}T00:00:00.000Z`)
              : null,
          }
        : {}),
    },
  })

  await prisma.ammeAuditEvent.create({
    data: {
      venueId,
      actorId,
      action: 'guest_update',
      detail: `${updated.name}: ${JSON.stringify(Object.keys(patch))}`,
    },
  })

  return updated
}

export async function createGuestManual(
  venueId: string,
  input: { name: string; phone?: string; notes?: string; vip?: boolean; tags?: string[]; source?: string },
  actorId?: string
) {
  const guest = await resolveGuest(prisma, venueId, {
    name: input.name,
    phone: input.phone,
    source: input.source || 'manual',
  })
  const patched = await updateGuest(
    venueId,
    guest.id,
    {
      notes: input.notes,
      vip: input.vip,
      tags: input.tags,
      source: input.source || 'manual',
    },
    actorId
  )
  return patched
}

/** Lightweight guest cards attached to state for badges on bookings/visits. */
export async function guestCardsForIds(venueId: string, ids: string[]) {
  const unique = [...new Set(ids.filter(Boolean))]
  if (!unique.length) return [] as AmmeGuest[]
  return prisma.ammeGuest.findMany({
    where: { venueId, id: { in: unique } },
  })
}

export function serializeGuest(g: AmmeGuest) {
  return {
    id: g.id,
    name: g.name,
    phone: g.phone,
    email: g.email,
    notes: g.notes,
    tags: g.tags,
    preferences: g.preferences,
    dietary: g.dietary,
    birthday: g.birthday ? g.birthday.toISOString().slice(0, 10) : null,
    source: g.source,
    language: g.language,
    visitCount: g.visitCount,
    noshowCount: g.noshowCount,
    lifetimeSpend: g.lifetimeSpend,
    avgSpend: g.avgSpend,
    firstVisitAt: g.firstVisitAt?.toISOString() || null,
    lastVisitAt: g.lastVisitAt?.toISOString() || null,
    banyaPref: g.banyaPref,
    blocked: g.blocked,
    vip: g.vip,
    recencyScore: g.recencyScore,
    frequencyScore: g.frequencyScore,
    monetaryScore: g.monetaryScore,
    rfmSegment: g.rfmSegment,
    consentWhatsApp: g.consentWhatsApp,
    marketingOptIn: g.marketingOptIn,
    lastContactAt: g.lastContactAt?.toISOString() || null,
  }
}
