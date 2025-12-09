import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    // Check authentication - admin only
    const token = request.cookies.get('authToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')
    
    const decoded = verifyToken(token || '')
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Try both possible logo paths
    const logoPaths = [
      path.join(process.cwd(), 'public', 'images', 'logo', 'logo.png'),
      path.join(process.cwd(), 'public', 'logo', 'logo.png'),
    ]

    let logoPath: string | null = null
    for (const p of logoPaths) {
      if (fs.existsSync(p)) {
        logoPath = p
        break
      }
    }

    if (!logoPath) {
      return NextResponse.json(
        { success: false, error: 'Logo file not found' },
        { status: 404 }
      )
    }

    // Read and encode logo
    const logoBuffer = fs.readFileSync(logoPath)
    const base64Data = logoBuffer.toString('base64')
    const dataUrl = `data:image/png;base64,${base64Data}`

    // Upload to database
    const logo = await prisma.image.upsert({
      where: {
        type_name: {
          type: 'LOGO',
          name: 'logo',
        },
      },
      update: {
        mimeType: 'image/png',
        data: dataUrl,
        alt: 'Vision Drive Logo',
      },
      create: {
        type: 'LOGO',
        name: 'logo',
        mimeType: 'image/png',
        data: dataUrl,
        alt: 'Vision Drive Logo',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Logo seeded successfully',
      logoId: logo.id,
    })
  } catch (error) {
    console.error('Seed logo error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to seed logo',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}




