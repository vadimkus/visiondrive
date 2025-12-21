import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { sql } from '@/lib/sql'

export async function GET(request: NextRequest) {
  try {
    const token =
      request.cookies.get('authToken')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '')

    const decoded = verifyToken(token || '')
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = decoded.tenantId || null
    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'No tenant selected' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId') || null
    const q = (searchParams.get('q') || '').trim()
    const limit = Math.min(200, Math.max(10, Number(searchParams.get('limit') || 50)))
    const offset = Math.max(0, Number(searchParams.get('offset') || 0))

    const rows = await sql/*sql*/`
      SELECT
        dl.id,
        dl."fileId",
        f.filename,
        dl."rowIndex",
        dl.reason,
        dl.raw,
        dl."createdAt"
      FROM ingest_dead_letters dl
      JOIN ingest_files f ON f.id = dl."fileId"
      WHERE dl."tenantId" = ${tenantId}
        AND (${fileId}::text IS NULL OR dl."fileId" = ${fileId})
        AND (${q}::text = '' OR dl.reason ILIKE ${'%' + q + '%'})
      ORDER BY dl."createdAt" DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `

    const countRows = await sql/*sql*/`
      SELECT COUNT(*)::int AS count
      FROM ingest_dead_letters dl
      WHERE dl."tenantId" = ${tenantId}
        AND (${fileId}::text IS NULL OR dl."fileId" = ${fileId})
        AND (${q}::text = '' OR dl.reason ILIKE ${'%' + q + '%'})
    `
    const total = countRows?.[0]?.count ?? 0

    return NextResponse.json({
      success: true,
      total,
      limit,
      offset,
      items: rows || [],
    })
  } catch (error) {
    console.error('Dead letters fetch error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}


