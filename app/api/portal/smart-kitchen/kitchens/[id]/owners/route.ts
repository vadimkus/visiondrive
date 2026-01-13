import { NextResponse } from 'next/server'

// AWS API Gateway endpoint in UAE region
const API_URL = process.env.SMART_KITCHEN_API_URL || 'https://w7gfk5cka2.execute-api.me-central-1.amazonaws.com/prod'

// GET /api/portal/smart-kitchen/kitchens/[id]/owners - List owners for a kitchen
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: kitchenId } = await params

    const response = await fetch(`${API_URL}/kitchens/${kitchenId}/owners`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 0 }
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Failed to fetch owners:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch owners' },
      { status: 500 }
    )
  }
}

// POST /api/portal/smart-kitchen/kitchens/[id]/owners - Add owner to a kitchen
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: kitchenId } = await params
    const body = await request.json()

    const response = await fetch(`${API_URL}/kitchens/${kitchenId}/owners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Failed to add owner:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add owner' },
      { status: 500 }
    )
  }
}
