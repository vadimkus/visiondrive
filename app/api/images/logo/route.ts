import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import postgres from 'postgres'

// Fallback: direct postgres connection for logo fetching
async function getLogoDirect() {
  // For direct connection, use non-Accelerate URL (skip prisma+postgres://)
  const connectionString = 
    (process.env.VISIONDRIVE_DATABASE_URL?.startsWith('prisma+postgres://')
      ? undefined // Skip Accelerate URLs for direct connection
      : process.env.VISIONDRIVE_DATABASE_URL
      || (process.env.PRISMA_DATABASE_URL?.startsWith('prisma+postgres://')
      ? undefined // Skip Accelerate URLs for direct connection
      : process.env.PRISMA_DATABASE_URL 
      || process.env.POSTGRES_URL 
      || process.env.DATABASE_URL))!
  const sql = postgres(connectionString, { 
    max: 1,
    ssl: { rejectUnauthorized: false },
    connect_timeout: 5,
  })
  
  try {
    const result = await sql`
      SELECT id, type, name, "mimeType", data, width, height, alt
      FROM images
      WHERE type = 'LOGO' AND name = 'logo'
      LIMIT 1
    `
    
    await sql.end()
    return result[0] || null
  } catch (error) {
    await sql.end()
    throw error
  }
}

export async function GET() {
  try {
    let logo
    
    // Try Prisma first, fallback to direct SQL if adapter fails
    try {
      logo = await prisma.image.findFirst({
        where: { type: 'LOGO', name: 'logo' },
      })
    } catch (prismaError) {
      // If Prisma adapter fails, use direct SQL connection
      console.warn('Prisma adapter failed, using direct SQL:', prismaError)
      logo = await getLogoDirect()
    }

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


