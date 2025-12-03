import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const logo = await prisma.image.findFirst({
      where: { type: 'LOGO', name: 'logo' },
    })

    if (!logo) {
      return NextResponse.json(
        { success: false, error: 'Logo not found' },
        { status: 404 }
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
    })
  } catch (error) {
    console.error('Logo fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

