import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AmmeApp from './AmmeApp'

export const dynamic = 'force-dynamic'

export default async function AmmeHomePage() {
  const jar = await cookies()
  const token = jar.get('authToken')?.value
  const portal = jar.get('portal')?.value
  const decoded = token && portal === 'amme' ? verifyToken(token) : null

  if (!decoded?.userId || !decoded.tenantId) {
    redirect('/amme/login')
  }

  const venue = await prisma.ammeVenue.findUnique({ where: { tenantId: decoded.tenantId } })
  if (!venue) {
    redirect('/amme/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, email: true, name: true },
  })
  if (!user) redirect('/amme/login')

  const profile = await prisma.ammeStaffProfile.findUnique({ where: { userId: user.id } })

  return (
    <AmmeApp
      user={{
        id: user.id,
        email: user.email,
        name: user.name,
        staffRole: profile?.staffRole ?? 'ADMIN',
      }}
    />
  )
}
