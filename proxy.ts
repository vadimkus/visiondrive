import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/clinic']
const publicRoutes = ['/login', '/api/auth/login', '/api/auth/logout']

function isRoute(pathname: string, routes: string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/portal' || pathname.startsWith('/portal/')) {
    const clinicUrl = new URL('/clinic', request.url)
    return NextResponse.redirect(clinicUrl, 308)
  }

  if (pathname === '/api/portal' || pathname.startsWith('/api/portal/')) {
    return NextResponse.json({ error: 'Legacy portal API disabled' }, { status: 410 })
  }

  if (isRoute(pathname, publicRoutes)) {
    return NextResponse.next()
  }

  if (isRoute(pathname, protectedRoutes)) {
    const authToken = request.cookies.get('authToken')?.value

    if (!authToken) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/clinic/:path*', '/portal/:path*', '/api/portal/:path*'],
}
