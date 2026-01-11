import { NextRequest, NextResponse } from 'next/server'
import { smartKitchenClient } from '@/lib/smart-kitchen/aws-client'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const kitchenId = searchParams.get('kitchenId') || undefined
    const activeOnly = searchParams.get('active') === 'true'
    
    const alerts = await smartKitchenClient.listAlerts({
      kitchenId,
      active: activeOnly
    })
    
    return NextResponse.json({ success: true, alerts })
  } catch (error) {
    console.error('Failed to fetch alerts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}
