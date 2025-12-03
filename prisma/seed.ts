import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL!
const sql = postgres(connectionString, { max: 1 })
const adapter = new PrismaPg(sql)
const prisma = new PrismaClient({ adapter })

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

