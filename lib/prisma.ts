import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import postgres from 'postgres'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Check for Prisma Accelerate URL first, then regular Prisma URL, then fallback to DATABASE_URL
const connectionString = 
  process.env.PRISMA_DATABASE_URL?.startsWith('prisma+postgres://') 
    ? process.env.PRISMA_DATABASE_URL
    : process.env.PRISMA_DATABASE_URL 
    || process.env.POSTGRES_URL 
    || process.env.DATABASE_URL

// Prisma Accelerate URLs (prisma+postgres://) need accelerateUrl option
const isAccelerate = connectionString?.startsWith('prisma+postgres://') ?? false

// For non-Accelerate connections, use the adapter
let adapter: PrismaPg | undefined
if (connectionString && !isAccelerate) {
  try {
    // Always use adapter for non-Accelerate connections
    const sql = postgres(connectionString)
    adapter = new PrismaPg(sql)
  } catch (error) {
    console.error('Failed to create Prisma adapter:', error)
  }
}

// Prisma Client requires either adapter or accelerateUrl
const prismaConfig: {
  adapter?: PrismaPg
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

