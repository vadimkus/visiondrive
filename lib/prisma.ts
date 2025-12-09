import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'postgres'
import { PrismaPostgres } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const connectionString = process.env.DATABASE_URL

// Prisma Accelerate URLs (prisma+postgres://) need accelerateUrl option
const isAccelerate = connectionString?.startsWith('prisma+postgres://') ?? false

// For non-Accelerate connections, use the adapter
let adapter: PrismaPostgres | undefined
if (connectionString && !isAccelerate) {
  try {
    // Always use adapter for non-Accelerate connections
    const pool = new Pool({ connectionString })
    adapter = new PrismaPostgres(pool)
  } catch (error) {
    console.error('Failed to create Prisma adapter:', error)
  }
}

// Prisma Client requires either adapter or accelerateUrl
const prismaConfig: {
  adapter?: PrismaPostgres
  accelerateUrl?: string
  log?: ('error' | 'warn')[]
} = {
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
}

if (isAccelerate && connectionString) {
  prismaConfig.accelerateUrl = connectionString
} else if (adapter) {
  prismaConfig.adapter = adapter
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(prismaConfig)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

