import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import postgres from 'postgres'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

// Check for Prisma Accelerate URL first, then regular Prisma URL, then fallback to DATABASE_URL
const connectionString = 
  (process.env.PRISMA_DATABASE_URL?.startsWith('prisma+postgres://') 
    ? process.env.PRISMA_DATABASE_URL
    : process.env.PRISMA_DATABASE_URL 
    || process.env.POSTGRES_URL 
    || process.env.DATABASE_URL)!

const isAccelerate = connectionString.startsWith('prisma+postgres://')

// For non-Accelerate connections, use the adapter
let adapter: PrismaPg | undefined
if (!isAccelerate) {
  // Always use adapter for non-Accelerate connections
  const sql = postgres(connectionString)
  adapter = new PrismaPg(sql)
}

// Prisma Accelerate URLs need accelerateUrl option
const prisma = new PrismaClient({
  adapter: adapter,
  accelerateUrl: isAccelerate ? connectionString : undefined,
})

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin5', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin' },
    update: {},
    create: {
      email: 'admin',
      passwordHash: adminPassword,
      name: 'Administrator',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })

  console.log('✅ Created admin user:', admin.email)

  // Upload logo to database if it exists
  const logoPath = path.join(process.cwd(), 'public', 'images', 'logo', 'logo.png')
  if (fs.existsSync(logoPath)) {
    try {
      const logoBuffer = fs.readFileSync(logoPath)
      const base64Data = logoBuffer.toString('base64')
      const dataUrl = `data:image/png;base64,${base64Data}`

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

      console.log('✅ Uploaded logo to database:', logo.id)
    } catch (error) {
      console.error('Failed to upload logo:', error)
    }
  } else {
    console.log('⚠️  Logo file not found at:', logoPath)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

