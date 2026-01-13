import { NextResponse } from 'next/server'

// AWS API Gateway endpoint in UAE region
const API_URL = process.env.SMART_KITCHEN_API_URL || 'https://w7gfk5cka2.execute-api.me-central-1.amazonaws.com/prod'

// GET /api/portal/smart-kitchen/kitchens - List all kitchens
export async function GET() {
  try {
    const response = await fetch(`${API_URL}/kitchens`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 0 } // Don't cache
    })
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch kitchens:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch kitchens' },
      { status: 500 }
    )
  }
}

// POST /api/portal/smart-kitchen/kitchens - Create a new kitchen
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const response = await fetch(`${API_URL}/kitchens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Failed to create kitchen:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create kitchen' },
      { status: 500 }
    )
  }
}
