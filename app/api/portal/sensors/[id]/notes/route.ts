import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/sql'
import { requirePortalSession } from '@/lib/portal/session'
import { randomUUID } from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePortalSession(request)
    const { id } = await params
    const body = await request.json()
    const note = String(body?.note || '').trim()
    if (!note) return NextResponse.json({ success: false, error: 'note is required' }, { status: 400 })

    // Ensure sensor belongs to tenant
    const sensorRows = await sql/*sql*/`
      SELECT id
      FROM sensors
      WHERE id = ${id} AND "tenantId" = ${session.tenantId}
      LIMIT 1
    `
    if (!sensorRows?.[0]?.id) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    const noteId = randomUUID()
    await sql/*sql*/`
      INSERT INTO maintenance_notes (id, "tenantId", "sensorId", "createdByUserId", note, "createdAt")
      VALUES (${noteId}, ${session.tenantId}, ${id}, ${session.userId}, ${note}, now())
    `

    return NextResponse.json({ success: true, id: noteId })
  } catch (e: any) {
    const msg = e?.message || 'Internal server error'
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'NO_TENANT' ? 400 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}



