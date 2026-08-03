/**
 * Seed AMMÉ venue + Tasha admin user.
 * Usage: npx tsx --env-file=.env scripts/seed-amme.ts
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import { AMME_DEFAULT_MENU, BANYA_PRICE_DEFAULT } from '../lib/amme/menu'
import {
  pgRejectUnauthorized,
  postgresUrlForNodePgWhenRelaxedTls,
  postgresUrlNeedsTls,
} from '../lib/db-tls'

const raw =
  process.env.VISIONDRIVE_DATABASE_URL ||
  process.env.PRISMA_DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  ''

if (!raw) throw new Error('Missing DATABASE_URL / VISIONDRIVE_DATABASE_URL')

const email = (process.env.AMME_TASHA_EMAIL || 'tasha@amme.visiondrive.ae').trim().toLowerCase()
const password = process.env.AMME_TASHA_PASSWORD || 'AmmeTasha#2026Kp'
const name = process.env.AMME_TASHA_NAME || 'Tasha'

async function main() {
  // Local seed against Timescale Cloud: match lib/prisma.ts TLS handling
  process.env.NODE_ENV = process.env.NODE_ENV || 'development'
  const connectionString = postgresUrlForNodePgWhenRelaxedTls(raw)
  const useSsl = postgresUrlNeedsTls(connectionString)
  const rejectUnauthorized = pgRejectUnauthorized(connectionString)
  const pool = new Pool({
    connectionString,
    max: 2,
    ...(useSsl ? { ssl: { rejectUnauthorized } } : {}),
  })
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'amme' },
    update: { name: 'AMMÉ Bali', status: 'ACTIVE' },
    create: { name: 'AMMÉ Bali', slug: 'amme', status: 'ACTIVE' },
  })

  const hash = await bcrypt.hash(password, 12)

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash: hash,
      status: 'ACTIVE',
      role: 'ADMIN',
      defaultTenantId: tenant.id,
    },
    create: {
      email,
      name,
      passwordHash: hash,
      status: 'ACTIVE',
      role: 'ADMIN',
      defaultTenantId: tenant.id,
    },
  })

  await prisma.tenantMembership.upsert({
    where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } },
    update: { role: 'ADMIN', status: 'ACTIVE' },
    create: { tenantId: tenant.id, userId: user.id, role: 'ADMIN', status: 'ACTIVE' },
  })

  await prisma.ammeStaffProfile.upsert({
    where: { userId: user.id },
    update: { tenantId: tenant.id, staffRole: 'ADMIN' },
    create: { userId: user.id, tenantId: tenant.id, staffRole: 'ADMIN' },
  })

  const venue = await prisma.ammeVenue.upsert({
    where: { tenantId: tenant.id },
    update: { name: 'AMMÉ', banyaPrice: BANYA_PRICE_DEFAULT, currency: 'IDR' },
    create: {
      tenantId: tenant.id,
      name: 'AMMÉ',
      banyaPrice: BANYA_PRICE_DEFAULT,
      currency: 'IDR',
    },
  })

  for (const [i, item] of AMME_DEFAULT_MENU.entries()) {
    await prisma.ammeMenuItem.upsert({
      where: { venueId_code: { venueId: venue.id, code: item.code } },
      update: {
        name: item.name,
        price: item.price,
        category: item.category,
        station: item.station,
        vegFlag: 'vegFlag' in item ? item.vegFlag : null,
        active: true,
        sortOrder: i,
      },
      create: {
        venueId: venue.id,
        code: item.code,
        name: item.name,
        price: item.price,
        category: item.category,
        station: item.station,
        vegFlag: 'vegFlag' in item ? item.vegFlag : null,
        sortOrder: i,
      },
    })
  }

  // Seed today's bookings if empty
  const today = new Date()
  const day = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()))
  const existing = await prisma.ammeBooking.count({ where: { venueId: venue.id, date: day } })
  if (existing === 0) {
    const slots = [
      { h: 10, m: 0, name: 'Игорь Ковальчук', guests: 2, banya: true, phone: '+62 812 3344 551' },
      { h: 11, m: 30, name: 'Настя', guests: 3, banya: true, phone: null },
      { h: 13, m: 0, name: 'Дима и Лена', guests: 2, banya: false, phone: null },
      { h: 14, m: 0, name: 'Марина', guests: 4, banya: true, phone: '+62 819 7712 004' },
      { h: 16, m: 0, name: 'Алексей', guests: 2, banya: true, phone: null },
      { h: 17, m: 30, name: 'Оля', guests: 2, banya: false, phone: null },
      { h: 19, m: 0, name: 'Тимур', guests: 5, banya: true, phone: null },
      { h: 20, m: 30, name: 'Ксения', guests: 2, banya: false, phone: null },
    ]
    for (const s of slots) {
      const at = new Date(today)
      at.setHours(s.h, s.m, 0, 0)
      await prisma.ammeBooking.create({
        data: {
          venueId: venue.id,
          date: day,
          at,
          name: s.name,
          guests: s.guests,
          banya: s.banya,
          phone: s.phone,
          status: 'WAITING',
        },
      })
    }
  }

  console.log('AMMÉ seed OK')
  console.log(`  tenant: ${tenant.slug} (${tenant.id})`)
  console.log(`  venue:  ${venue.name} (${venue.id})`)
  console.log(`  login:  ${email}`)
  console.log(`  pass:   ${password}`)

  await prisma.$disconnect()
  await pool.end()
}

main().catch(async (e) => {
  console.error(e)
  process.exit(1)
})
