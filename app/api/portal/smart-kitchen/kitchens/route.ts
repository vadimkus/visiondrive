import { NextResponse } from 'next/server'
import { smartKitchenClient } from '@/lib/smart-kitchen/aws-client'

export async function GET() {
  try {
    const kitchens = await smartKitchenClient.listKitchens()
    return NextResponse.json({ success: true, kitchens })
  } catch (error) {
    console.error('Failed to fetch kitchens:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch kitchens' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    // TODO: Implement kitchen creation
    return NextResponse.json({ 
      success: true, 
      kitchenId: `kitchen-${Date.now()}`,
      message: 'Kitchen created successfully' 
    })
  } catch (error) {
    console.error('Failed to create kitchen:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create kitchen' },
      { status: 500 }
    )
  }
}
