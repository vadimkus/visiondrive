import { NextRequest, NextResponse } from 'next/server'
import { smartKitchenClient } from '@/lib/smart-kitchen/aws-client'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const kitchenId = searchParams.get('kitchenId') || undefined
    
    const sensors = await smartKitchenClient.listSensors(kitchenId)
    return NextResponse.json({ success: true, sensors })
  } catch (error) {
    console.error('Failed to fetch sensors:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sensors' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    // TODO: Implement sensor registration
    return NextResponse.json({ 
      success: true, 
      sensorId: body.sensorId || `sensor-${Date.now()}`,
      message: 'Sensor registered successfully' 
    })
  } catch (error) {
    console.error('Failed to register sensor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to register sensor' },
      { status: 500 }
    )
  }
}
