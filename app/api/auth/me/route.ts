import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { sql } from '@/lib/sql'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('authToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    const activeTenantId = decoded.tenantId || null

    const rows = await sql/*sql*/`
      SELECT
        u.id,
        u.email,
        u.name,
        u.role,
        u.status,
        u."defaultTenantId",
        tm.role AS "tenantRole",
        tm.status AS "membershipStatus"
      FROM users u
      LEFT JOIN tenant_memberships tm
        ON tm."userId" = u.id
       AND tm."tenantId" = COALESCE(${activeTenantId}::text, u."defaultTenantId")
      WHERE u.id = ${decoded.userId}
      LIMIT 1
    `
    const user = rows?.[0] || null

    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'User not found or inactive' },
        { status: 401 }
      )
    }

    const effectiveRole =
      decoded.role === 'MASTER_ADMIN'
        ? 'MASTER_ADMIN'
        : (user.membershipStatus === 'ACTIVE' && user.tenantRole ? user.tenantRole : user.role)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: effectiveRole,
        status: user.status,
        tenantId: activeTenantId || user.defaultTenantId || null,
      },
    })
  } catch (error) {
    console.error('Auth check error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorDetails = error instanceof Error ? error.stack : String(error)
    console.error('Auth check error details:', errorDetails)
    
    // Check if it's a database connection error
    let statusCode = 500
    let userMessage = 'Internal server error'
    
    if (errorMessage.includes('connect') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('timeout')) {
      userMessage = 'Database connection failed. Please check your database configuration.'
      statusCode = 503 // Service Unavailable
    } else if (errorMessage.includes('DATABASE_URL')) {
      userMessage = 'Database configuration error. Please check your environment variables.'
      statusCode = 500
    }
    
    return NextResponse.json(
      { success: false, error: userMessage },
      { status: statusCode }
    )
  }
}




