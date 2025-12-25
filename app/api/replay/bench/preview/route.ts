import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { decodePayload } from '@/lib/decoders'

export async function POST(request: NextRequest) {
  try {
    const token =
      request.cookies.get('authToken')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '')

    const decoded = verifyToken(token || '')
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (!decoded.tenantId) {
      return NextResponse.json({ success: false, error: 'No tenant selected' }, { status: 400 })
    }

    const body = await request.json()
    const rawPayload = String(body?.rawPayload || '')
    const sensorType = String(body?.sensorType || 'OTHER').toUpperCase()

    if (!rawPayload.trim()) {
      return NextResponse.json({ success: false, error: 'rawPayload is required' }, { status: 400 })
    }

    const normalizedType =
      sensorType === 'PARKING' ? 'PARKING' : sensorType === 'WEATHER' ? 'WEATHER' : 'OTHER'

    const res = decodePayload({ sensorType: normalizedType, rawPayload })

    return NextResponse.json({
      success: true,
      preview: {
        sensorType: normalizedType,
        decoded: res.decoded,
        warnings: res.warnings,
      },
    })
  } catch (error) {
    console.error('Decoder preview error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}



