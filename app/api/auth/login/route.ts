import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth'
import { checkRateLimit, getClientIp, loginRateLimiter } from '@/lib/rate-limit'

// AWS Smart Kitchen API URL (UAE Region)
const KITCHEN_API_URL = process.env.SMART_KITCHEN_API_URL || 'https://w7gfk5cka2.execute-api.me-central-1.amazonaws.com/prod'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - prevent brute force attacks
    const clientIp = getClientIp(request)
    const rateLimit = await checkRateLimit(clientIp, loginRateLimiter)

    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil(rateLimit.resetAt - Date.now() / 1000)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many login attempts. Please try again later.',
          retryAfter,
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(loginRateLimiter.maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimit.resetAt),
          },
        }
      )
    }

    const { email, password, portal } = await request.json()

    // Handle Kitchen portal login via AWS API (UAE data residency)
    if (portal === 'kitchen') {
      const awsResponse = await fetch(`${KITCHEN_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const awsData = await awsResponse.json()

      if (!awsResponse.ok || !awsData.success) {
        return NextResponse.json(
          { success: false, error: awsData.error || 'Invalid credentials' },
          { status: 401 }
        )
      }

      // Determine if user is kitchen owner or admin
      const isOwner = awsData.user?.role === 'KITCHEN_OWNER'
      
      const response = NextResponse.json({
        success: true,
        user: awsData.user,
        token: awsData.token,
        portal: 'kitchen',
        isOwner,
      })

      // Set HTTP-only cookie
      response.cookies.set('authToken', awsData.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      response.cookies.set('portal', 'kitchen', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
      })

      return response
    }

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const result = await authenticateUser(email, password)

    if (!result) {
      // Include rate limit info in failed login response
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email or password',
          attemptsRemaining: rateLimit.remaining,
        },
        { 
          status: 401,
          headers: {
            'X-RateLimit-Limit': String(loginRateLimiter.maxRequests),
            'X-RateLimit-Remaining': String(rateLimit.remaining),
            'X-RateLimit-Reset': String(rateLimit.resetAt),
          },
        }
      )
    }

    const response = NextResponse.json({
      success: true,
      user: result.user,
      token: result.token,
    })

    // Set HTTP-only cookie for security
    response.cookies.set('authToken', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    const errorDetails = error instanceof Error ? error.stack : String(error)
    console.error('Login error details:', errorDetails)
    
    // Provide more helpful error messages
    let statusCode = 500
    let userMessage = errorMessage
    
    if (errorMessage.includes('Database connection failed')) {
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




