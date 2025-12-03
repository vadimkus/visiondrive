import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params
    const images = await prisma.image.findMany({
      where: { type: type.toUpperCase() as any },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({
      success: true,
      images: images.map(img => ({
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

