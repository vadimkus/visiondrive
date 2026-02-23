import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { sql } from '@/lib/sql'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('authToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')
    
    const decoded = verifyToken(token || '')
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string
    const name = formData.get('name') as string
    const alt = formData.get('alt') as string | null

    if (!file || !type || !name) {
      return NextResponse.json(
        { success: false, error: 'File, type, and name are required' },
        { status: 400 }
      )
    }

    const imageType = String(type || '').trim().toUpperCase()
    const allowedTypes = new Set([
      'LOGO',
      'FAVICON',
      'HERO',
      'PARTNER',
      'APP_SCREENSHOT',
      'OTHER',
    ])
    if (!allowedTypes.has(imageType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid image type' },
        { status: 400 }
      )
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Data = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64Data}`

    // Get image dimensions if possible
    let width: number | null = null
    let height: number | null = null

    const id = randomUUID()
    const rows = await sql/*sql*/`
      INSERT INTO images (id, type, name, "mimeType", data, width, height, alt, "createdAt", "updatedAt")
      VALUES (${id}, ${imageType}, ${name}, ${file.type}, ${dataUrl}, ${width}, ${height}, ${alt || null}, now(), now())
      ON CONFLICT (type, name) DO UPDATE
        SET "mimeType" = EXCLUDED."mimeType",
            data = EXCLUDED.data,
            width = EXCLUDED.width,
            height = EXCLUDED.height,
            alt = EXCLUDED.alt,
            "updatedAt" = now()
      RETURNING id, type, name, "mimeType"
    `
    const image = rows?.[0]
    if (!image) {
      return NextResponse.json(
        { success: false, error: 'Failed to save image' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      image: {
        id: image.id,
        type: image.type,
        name: image.name,
        mimeType: image.mimeType,
      },
    })
  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

