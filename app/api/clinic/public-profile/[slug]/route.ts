import { NextResponse } from 'next/server'

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  await context.params

  return NextResponse.json({ error: 'Public practitioner profiles are disabled' }, { status: 404 })
}
