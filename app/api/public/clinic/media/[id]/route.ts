import { NextResponse } from 'next/server'

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  await context.params

  return NextResponse.json({ error: 'Public media is disabled' }, { status: 404 })
}
