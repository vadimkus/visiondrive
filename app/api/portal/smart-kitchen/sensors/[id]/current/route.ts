import { NextRequest, NextResponse } from 'next/server'
import { smartKitchenClient } from '@/lib/smart-kitchen/aws-client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const reading = await smartKitchenClient.getCurrentReading(id)
    
    if (!reading) {
      return NextResponse.json(
        { success: false, error: 'Sensor not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, reading })
  } catch (error) {
    console.error('Failed to fetch current reading:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reading' },
      { status: 500 }
    )
  }
}
