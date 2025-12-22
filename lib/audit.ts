import { NextRequest } from 'next/server'
import { sql } from '@/lib/sql'
import type { PortalSession } from '@/lib/portal/session'
import { randomUUID } from 'crypto'

function getIp(request: NextRequest) {
  const xf = request.headers.get('x-forwarded-for') || ''
  const ip = xf.split(',')[0]?.trim()
  return ip || request.headers.get('x-real-ip') || null
}

export async function writeAuditLog(params: {
  request: NextRequest
  session?: PortalSession | null
  tenantId?: string | null
  action: string
  entityType: string
  entityId?: string | null
  before?: any
  after?: any
}) {
  const { request, session, tenantId, action, entityType, entityId, before, after } = params
  const actorUserId = session?.userId || null
  const tId = typeof tenantId !== 'undefined' ? tenantId : session?.tenantId || null
  const ip = getIp(request)
  const userAgent = request.headers.get('user-agent')

  try {
    await sql/*sql*/`
      INSERT INTO audit_logs (
        id,
        "tenantId",
        "actorUserId",
        action,
        "entityType",
        "entityId",
        before,
        after,
        ip,
        "userAgent",
        "createdAt"
      )
      VALUES (
        ${randomUUID()},
        ${tId},
        ${actorUserId},
        ${action},
        ${entityType},
        ${entityId || null},
        ${typeof before === 'undefined' ? null : (sql.json(before) as any)},
        ${typeof after === 'undefined' ? null : (sql.json(after) as any)},
        ${ip},
        ${userAgent},
        now()
      )
    `
  } catch {
    // Never block business logic on auditing.
  }
}


