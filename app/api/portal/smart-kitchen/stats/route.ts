import { NextResponse } from 'next/server'
import { smartKitchenClient } from '@/lib/smart-kitchen/aws-client'

export async function GET() {
  try {
    const stats = await smartKitchenClient.getDashboardStats()
    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
