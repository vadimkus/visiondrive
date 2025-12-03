import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { ImageType } from '@prisma/client'

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

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Data = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64Data}`

    // Get image dimensions if possible
    let width: number | null = null
    let height: number | null = null

    // Create or update image
    const imageType = type.toUpperCase() as ImageType
    const image = await prisma.image.upsert({
      where: {
        type_name: {
          type: imageType,
          name,
        },
      },
      update: {
        mimeType: file.type,
        data: dataUrl,
        width,
        height,
        alt: alt || null,
      },
      create: {
        type: imageType,
        name,
        mimeType: file.type,
        data: dataUrl,
        width,
        height,
        alt: alt || null,
      },
    })

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

