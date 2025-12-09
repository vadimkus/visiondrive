import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable is not set!')
  console.error('Please create a .env file with DATABASE_URL')
  throw new Error('DATABASE_URL environment variable is required')
}

// Prisma Accelerate URLs (prisma+postgres://) need accelerateUrl option
const isAccelerate = connectionString.startsWith('prisma+postgres://')

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    accelerateUrl: isAccelerate ? connectionString : undefined,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

