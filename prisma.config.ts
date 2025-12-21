import 'dotenv/config'
import { defineConfig } from '@prisma/config'

// Prefer an explicit app-specific env var so Vercel-managed DB vars can remain locked.
// Fallbacks keep local/dev setups working.
const databaseUrl =
  process.env.VISIONDRIVE_DATABASE_URL ||
  process.env.PRISMA_DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: databaseUrl!,
  },
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
})

