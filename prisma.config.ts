import 'dotenv/config'
import { defineConfig } from '@prisma/config'

// Check for PRISMA_DATABASE_URL first, then fallback to DATABASE_URL
const databaseUrl = process.env.PRISMA_DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: databaseUrl!,
  },
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
})

