import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const image = await prisma.image.findUnique({
      where: { id },
    })

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      )
    }

    // Return image as data URL
    return NextResponse.json({
      success: true,
      image: {
        id: image.id,
        type: image.type,
        name: image.name,
        mimeType: image.mimeType,
        data: image.data,
        width: image.width,
        height: image.height,
        alt: image.alt,
      },
    })
  } catch (error) {
    console.error('Image fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

