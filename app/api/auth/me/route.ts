import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { sql } from '@/lib/sql'
import jwt from 'jsonwebtoken'

const KITCHEN_JWT_SECRET = process.env.KITCHEN_JWT_SECRET ?? ''

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('authToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')
    const portal = request.cookies.get('portal')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Handle Kitchen portal authentication (AWS-based)
    if (portal === 'kitchen') {
      // Handle demo admin token
      if (token.startsWith('admin_')) {
        return NextResponse.json({
          success: true,
          user: {
            id: 'admin-vadim-001',
            email: 'vadim@visiondrive.ae',
            name: 'Vadim',
            role: 'ADMIN',
            status: 'ACTIVE',
            portal: 'kitchen',
          },
        })
      }

      // Handle demo owner token
      if (token.startsWith('demo_')) {
        return NextResponse.json({
          success: true,
          user: {
            id: 'owner-abdul-001',
            email: 'abdul@kitchen.ae',
            name: 'Abdul Rahman',
            role: 'KITCHEN_OWNER',
            status: 'ACTIVE',
            portal: 'kitchen',
          },
        })
      }

      // Try JWT verification for AWS tokens
      try {
        const decoded = jwt.verify(token, KITCHEN_JWT_SECRET) as {
          userId: string
          email: string
          role: string
          kitchenId?: string
        }

        return NextResponse.json({
          success: true,
          user: {
            id: decoded.userId,
            email: decoded.email,
            name: decoded.email.split('@')[0], // Use email prefix as name
            role: decoded.role || 'CUSTOMER_ADMIN',
            status: 'ACTIVE',
            tenantId: decoded.kitchenId || null,
            portal: 'kitchen',
          },
        })
      } catch (err) {
        console.error('Kitchen token verification failed:', err)
        return NextResponse.json(
          { success: false, error: 'Invalid kitchen token' },
          { status: 401 }
        )
      }
    }

    // Handle Parking portal authentication (Timescale-based)
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
        portal: 'parking',
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




