import { NextResponse } from 'next/server'

// AWS API Gateway endpoint in UAE region
const API_URL = process.env.SMART_KITCHEN_API_URL || 'https://w7gfk5cka2.execute-api.me-central-1.amazonaws.com/prod'

// GET /api/portal/smart-kitchen/kitchens/[id] - Get single kitchen with details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const response = await fetch(`${API_URL}/kitchens/${id}`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 0 }
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Failed to fetch kitchen:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch kitchen' },
      { status: 500 }
    )
  }
}

// PUT /api/portal/smart-kitchen/kitchens/[id] - Update kitchen
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const response = await fetch(`${API_URL}/kitchens/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Failed to update kitchen:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update kitchen' },
      { status: 500 }
    )
  }
}

// DELETE /api/portal/smart-kitchen/kitchens/[id] - Delete kitchen
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const response = await fetch(`${API_URL}/kitchens/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Failed to delete kitchen:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete kitchen' },
      { status: 500 }
    )
  }
}
