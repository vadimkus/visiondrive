/**
 * Lists users (no password hashes). Uses .env / VISIONDRIVE_DATABASE_URL chain like the app.
 *
 *   npx tsx scripts/list-users.ts
 */
import 'dotenv/config'
import postgres from 'postgres'
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

if (!raw) {
  console.error('Set VISIONDRIVE_DATABASE_URL or DATABASE_URL')
  process.exit(1)
}

const connectionString = postgresUrlForNodePgWhenRelaxedTls(raw)
const useSsl = postgresUrlNeedsTls(connectionString)
const rejectUnauthorized = pgRejectUnauthorized(connectionString)

async function main() {
  const sql = postgres(connectionString, {
    max: 1,
    connect_timeout: 10,
    ...(useSsl ? { ssl: { rejectUnauthorized } } : {}),
  })

  const rows = await sql`
    SELECT email, name, role, status,
           "defaultTenantId" IS NOT NULL AS has_default_tenant
    FROM users
    ORDER BY email
  `
  console.table(rows)

  const tenants = await sql`
    SELECT u.email, t.slug AS tenant_slug, tm.role AS membership_role, tm.status AS membership_status
    FROM tenant_memberships tm
    JOIN users u ON u.id = tm."userId"
    JOIN tenants t ON t.id = tm."tenantId"
    ORDER BY u.email, t.slug
  `
  console.log('\nMemberships:')
  console.table(tenants)

  await sql.end({ timeout: 2 })
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
