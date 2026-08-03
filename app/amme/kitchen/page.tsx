import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import KdsClient from './KdsClient'

export const dynamic = 'force-dynamic'

export default async function AmmeKitchenPage() {
  const jar = await cookies()
  const token = jar.get('authToken')?.value
  const portal = jar.get('portal')?.value
  const decoded = token && portal === 'amme' ? verifyToken(token) : null
  if (!decoded?.userId || !decoded.tenantId) redirect('/amme/login')
  const [venue, profile] = await Promise.all([
    prisma.ammeVenue.findUnique({ where: { tenantId: decoded.tenantId } }),
    prisma.ammeStaffProfile.findUnique({ where: { userId: decoded.userId } }),
  ])
  if (!venue || profile?.active === false) redirect('/amme/login')
  return <KdsClient venueName={venue.name} />
}
