import { NextResponse } from 'next/server'

// AWS API Gateway endpoint in UAE region
const API_URL = process.env.SMART_KITCHEN_API_URL || 'https://w7gfk5cka2.execute-api.me-central-1.amazonaws.com/prod'

// PUT /api/portal/smart-kitchen/kitchens/[id]/owners/[ownerId]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; ownerId: string }> }
) {
  try {
    const { id: kitchenId, ownerId } = await params
    const body = await request.json()

    const response = await fetch(`${API_URL}/kitchens/${kitchenId}/owners/${ownerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Failed to update owner:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update owner' },
      { status: 500 }
    )
  }
}

// DELETE /api/portal/smart-kitchen/kitchens/[id]/owners/[ownerId]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; ownerId: string }> }
) {
  try {
    const { id: kitchenId, ownerId } = await params

    const response = await fetch(`${API_URL}/kitchens/${kitchenId}/owners/${ownerId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Failed to delete owner:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete owner' },
      { status: 500 }
    )
  }
}
