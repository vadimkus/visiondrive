import { NextResponse } from 'next/server'
import { getPublicClinicProfile } from '@/lib/clinic/public-profile'

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  const profile = await getPublicClinicProfile(slug)

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  return NextResponse.json({ profile })
}
