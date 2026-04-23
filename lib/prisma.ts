import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Keep resolution aligned with lib/sql.ts / prisma.config.ts
const connectionString =
  process.env.VISIONDRIVE_DATABASE_URL ||
  process.env.PRISMA_DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  ''

if (!connectionString) {
  throw new Error(
    'Database URL is missing. Set VISIONDRIVE_DATABASE_URL (preferred) or DATABASE_URL for Prisma.'
  )
}

const needsSsl =
  /sslmode=require/i.test(connectionString) ||
  /tsdb\.cloud\.timescale\.com/i.test(connectionString) ||
  /timescale/i.test(connectionString) ||
  /neon\.tech/i.test(connectionString) ||
  /vercel-storage\.com/i.test(connectionString) ||
  /supabase\.co/i.test(connectionString)

const isManagedDbProvider =
  /tsdb\.cloud\.timescale\.com/i.test(connectionString) ||
  /neon\.tech/i.test(connectionString) ||
  /supabase\.co/i.test(connectionString) ||
  /railway\.app/i.test(connectionString) ||
  /render\.com/i.test(connectionString) ||
  /elephantsql\.com/i.test(connectionString) ||
  /cockroachlabs\.cloud/i.test(connectionString) ||
  /digitalocean\.com/i.test(connectionString) ||
  /vercel-storage\.com/i.test(connectionString)

const isProduction = process.env.NODE_ENV === 'production'
const forceStrictSsl = process.env.STRICT_SSL_VALIDATION === 'true'
const shouldValidateCerts = forceStrictSsl || (isProduction && !isManagedDbProvider)

const pool = new Pool({
  connectionString,
  max: isProduction ? 10 : 5,
  ...(needsSsl ? { ssl: { rejectUnauthorized: shouldValidateCerts } } : {}),
})

const adapter = new PrismaPg(pool)

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
