import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/sql'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params
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

    const images = await sql/*sql*/`
      SELECT id, type, name, "mimeType", data, width, height, alt
      FROM images
      WHERE type = ${imageType}
      ORDER BY name ASC
    `

    return NextResponse.json({
      success: true,
      images: (Array.isArray(images) ? images : []).map((img: any) => ({
        id: img.id,
        type: img.type,
        name: img.name,
        mimeType: img.mimeType,
        data: img.data,
        width: img.width,
        height: img.height,
        alt: img.alt,
      })),
    })
  } catch (error) {
    console.error('Images fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

