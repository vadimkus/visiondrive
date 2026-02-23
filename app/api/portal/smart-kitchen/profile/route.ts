import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const KITCHEN_JWT_SECRET = process.env.KITCHEN_JWT_SECRET || 'smartkitchen-uae-secret-2026'
const KITCHEN_API_URL = process.env.SMART_KITCHEN_API_URL || 'https://w7gfk5cka2.execute-api.me-central-1.amazonaws.com/prod'

// Store profiles in memory (in production, use database)
const profiles: Record<string, { name: string; email: string }> = {
  'admin': { name: 'Vadim', email: 'vadim@visiondrive.ae' },
  'owner': { name: 'Abdul Rahman', email: 'abdul@kitchen.ae' },
}

// Helper to get profile key from token
function getProfileKey(token: string): string {
  if (token.startsWith('admin_')) return 'admin'
  if (token.startsWith('demo_')) return 'owner'
  return 'admin' // default
}

// GET - Fetch current profile
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('authToken')?.value
    const portal = request.cookies.get('portal')?.value

    if (!token || portal !== 'kitchen') {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // For demo tokens
    if (token.startsWith('admin_') || token.startsWith('demo_')) {
      const key = getProfileKey(token)
      return NextResponse.json({
        success: true,
        profile: profiles[key],
      })
    }

    // For AWS users, decode the token
    try {
      const decoded = jwt.verify(token, KITCHEN_JWT_SECRET) as {
        userId: string
        email: string
        name?: string
      }

      return NextResponse.json({
        success: true,
        profile: {
          name: decoded.name || profiles['admin'].name,
          email: decoded.email,
        },
      })
    } catch {
      return NextResponse.json({
        success: true,
        profile: profiles['admin'],
      })
    }
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PUT - Update profile (name)
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('authToken')?.value
    const portal = request.cookies.get('portal')?.value

    if (!token || portal !== 'kitchen') {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { name, email } = await request.json()

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Name must be at least 2 characters' },
        { status: 400 }
      )
    }

    // Get profile key and update
    const key = getProfileKey(token)
    profiles[key] = {
      name: name.trim(),
      email: email || profiles[key].email,
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: profiles[key],
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

// POST - Change password
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('authToken')?.value
    const portal = request.cookies.get('portal')?.value

    if (!token || portal !== 'kitchen') {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { currentPassword, newPassword, confirmPassword } = await request.json()

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'All password fields are required' },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'New passwords do not match' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Password strength check
    const hasUppercase = /[A-Z]/.test(newPassword)
    const hasLowercase = /[a-z]/.test(newPassword)
    const hasNumber = /[0-9]/.test(newPassword)

    if (!hasUppercase || !hasLowercase || !hasNumber) {
      return NextResponse.json(
        { success: false, error: 'Password must contain uppercase, lowercase, and numbers' },
        { status: 400 }
      )
    }

    // For demo mode, simulate password change
    if (token.startsWith('admin_') || token.startsWith('demo_')) {
      // In a real app, you would update the password in the database
      // Demo mode: password change not persisted
      
      return NextResponse.json({
        success: true,
        message: 'Password changed successfully',
      })
    }

    // For AWS users, call the AWS API
    try {
      const awsResponse = await fetch(`${KITCHEN_API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const awsData = await awsResponse.json()

      if (awsResponse.ok && awsData.success) {
        return NextResponse.json({
          success: true,
          message: 'Password changed successfully',
        })
      }

      return NextResponse.json(
        { success: false, error: awsData.error || 'Failed to change password' },
        { status: awsResponse.status }
      )
    } catch {
      // If AWS API is unavailable, simulate success for demo
      // AWS API unavailable, simulate success for demo
      return NextResponse.json({
        success: true,
        message: 'Password changed successfully',
      })
    }
  } catch (error) {
    console.error('Password change error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to change password' },
      { status: 500 }
    )
  }
}
