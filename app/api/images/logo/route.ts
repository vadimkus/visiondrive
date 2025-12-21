import { NextResponse } from 'next/server'
import { sql } from '@/lib/sql'

export async function GET() {
  try {
    const rows = await sql/*sql*/`
      SELECT id, type, name, "mimeType", data, width, height, alt
      FROM images
      WHERE type = 'LOGO' AND name = 'logo'
      LIMIT 1
    `
    const logo = rows?.[0] || null

    if (!logo) {
      return NextResponse.json(
        { success: false, error: 'Logo not found' },
        { 
          status: 404,
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        }
      )
    }

    return NextResponse.json({
      success: true,
      image: {
        id: logo.id,
        type: logo.type,
        name: logo.name,
        mimeType: logo.mimeType,
        data: logo.data,
        width: logo.width,
        height: logo.height,
        alt: logo.alt,
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Logo fetch error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: process.env.NODE_ENV === 'development' ? errorMessage : undefined },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    )
  }
}


