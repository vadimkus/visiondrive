/**
 * Link existing AMMÉ bookings/visits to CRM guest profiles.
 * Usage: npx tsx --env-file=.env scripts/backfill-amme-crm.ts
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { postgresUrlForNodePgWhenRelaxedTls, postgresUrlNeedsTls } from '../lib/db-tls'
import { normalizePhone, resolveGuest, recomputeGuestStats } from '../lib/amme/crm'

const raw =
  process.env.VISIONDRIVE_DATABASE_URL ||
  process.env.PRISMA_DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  ''

if (!raw) throw new Error('Missing DATABASE_URL')

async function main() {
  const connectionString = postgresUrlForNodePgWhenRelaxedTls(raw)
  const useSsl = postgresUrlNeedsTls(raw)
  const pool = new Pool({
    connectionString,
    max: 2,
    ...(useSsl ? { ssl: { rejectUnauthorized: process.env.STRICT_SSL_VALIDATION === 'true' } } : {}),
  })
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

  const venues = await prisma.ammeVenue.findMany()
  let linked = 0

  for (const venue of venues) {
    const bookings = await prisma.ammeBooking.findMany({
      where: { venueId: venue.id, guestId: null },
    })
    for (const b of bookings) {
      const guest = await resolveGuest(prisma, venue.id, {
        name: b.name,
        phone: b.phone,
        banya: b.banya,
        source: 'backfill',
      })
      await prisma.ammeBooking.update({
        where: { id: b.id },
        data: { guestId: guest.id, phone: b.phone || guest.phone },
      })
      if (b.visitId) {
        await prisma.ammeVisit.update({
          where: { id: b.visitId },
          data: { guestId: guest.id },
        })
      }
      linked += 1
    }

    const visits = await prisma.ammeVisit.findMany({
      where: { venueId: venue.id, guestId: null },
    })
    for (const v of visits) {
      const booking = await prisma.ammeBooking.findFirst({ where: { visitId: v.id } })
      const guest = await resolveGuest(prisma, venue.id, {
        name: v.name,
        phone: booking?.phone || null,
        banya: v.banya,
        source: 'backfill',
      })
      await prisma.ammeVisit.update({
        where: { id: v.id },
        data: { guestId: guest.id },
      })
      linked += 1
    }

    const guests = await prisma.ammeGuest.findMany({ where: { venueId: venue.id } })
    for (const g of guests) {
      await recomputeGuestStats(venue.id, g.id)
    }

    console.log(
      `venue ${venue.name}: bookings/visits linked≈${linked}, guests=${guests.length}, phones=${guests.filter((g) => normalizePhone(g.phone)).length}`
    )
  }

  await prisma.$disconnect()
  await pool.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
