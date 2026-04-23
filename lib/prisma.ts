import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { pgRejectUnauthorized, postgresUrlNeedsTls } from '@/lib/db-tls'

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

const useSsl = postgresUrlNeedsTls(connectionString)
const isProduction = process.env.NODE_ENV === 'production'
const rejectUnauthorized = pgRejectUnauthorized(connectionString)

const pool = new Pool({
  connectionString,
  max: isProduction ? 10 : 5,
  ...(useSsl ? { ssl: { rejectUnauthorized } } : {}),
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
