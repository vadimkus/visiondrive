import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { sql } from '@/lib/sql'
import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

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

    // Try common logo paths (prefer jpg)
    const logoPaths = [
      path.join(process.cwd(), 'public', 'images', 'logo', 'logo.jpg'),
      path.join(process.cwd(), 'public', 'images', 'logo', 'logo.png'),
      path.join(process.cwd(), 'public', 'logo', 'logo.jpg'),
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
    const extension = path.extname(logoPath).toLowerCase()
    const mimeType = extension === '.jpg' || extension === '.jpeg' ? 'image/jpeg' : 'image/png'
    const dataUrl = `data:${mimeType};base64,${base64Data}`

    // Upload to database
    const id = randomUUID()
    const rows = await sql/*sql*/`
      INSERT INTO images (id, type, name, "mimeType", data, alt, "createdAt", "updatedAt")
      VALUES (${id}, 'LOGO', 'logo', ${mimeType}, ${dataUrl}, 'Vision Drive Logo', now(), now())
      ON CONFLICT (type, name) DO UPDATE
        SET "mimeType" = EXCLUDED."mimeType",
            data = EXCLUDED.data,
            alt = EXCLUDED.alt,
            "updatedAt" = now()
      RETURNING id
    `
    const logoId = rows?.[0]?.id

    return NextResponse.json({
      success: true,
      message: 'Logo seeded successfully',
      logoId,
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





