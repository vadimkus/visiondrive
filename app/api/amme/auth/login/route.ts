import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth'
import { checkRateLimit, getClientIp, loginRateLimiter } from '@/lib/rate-limit'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request)
    const rateLimit = await checkRateLimit(clientIp, loginRateLimiter)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Слишком много попыток. Подождите.' },
        { status: 429 }
      )
    }

    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email и пароль обязательны' }, { status: 400 })
    }

    const result = await authenticateUser(email, password)
    if (!result?.user.tenantId) {
      return NextResponse.json({ success: false, error: 'Неверный email или пароль' }, { status: 401 })
    }

    const venue = await prisma.ammeVenue.findUnique({ where: { tenantId: result.user.tenantId } })
    if (!venue) {
      return NextResponse.json(
        { success: false, error: 'Аккаунт не привязан к AMMÉ. Запустите seed-amme.' },
        { status: 403 }
      )
    }

    const profile = await prisma.ammeStaffProfile.findUnique({ where: { userId: result.user.id } })

    const response = NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        staffRole: profile?.staffRole ?? 'ADMIN',
        portal: 'amme',
      },
    })

    response.cookies.set('authToken', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })
    response.cookies.set('portal', 'amme', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('AMMÉ login error:', error)
    return NextResponse.json({ success: false, error: 'Ошибка входа' }, { status: 500 })
  }
}
