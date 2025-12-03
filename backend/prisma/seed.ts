import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@visiondrive.ae' },
    update: {},
    create: {
      email: 'admin@visiondrive.ae',
      name: 'Admin User',
      phone: '+971501234567',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create sample partner
  const partner = await prisma.partner.upsert({
    where: { email: 'partner@mall.ae' },
    update: {},
    create: {
      name: 'Dubai Mall',
      email: 'partner@mall.ae',
      phone: '+97141234567',
      type: 'MALL',
      status: 'ACTIVE',
      companyName: 'Dubai Mall Management',
    },
  });
  console.log('✅ Created partner:', partner.name);

  // Create sample parking location
  const location = await prisma.parkingLocation.create({
    data: {
      name: 'Dubai Mall - Main Parking',
      address: 'Financial Centre Road, Downtown Dubai',
      city: 'Dubai',
      latitude: 25.1972,
      longitude: 55.2794,
      description: 'Main parking facility for Dubai Mall',
      type: 'MALL',
      isActive: true,
      isPublic: true,
      partnerId: partner.id,
    },
  });
  console.log('✅ Created parking location:', location.name);

  // Create sample parking spaces
  const spaces = [];
  for (let i = 1; i <= 20; i++) {
    const space = await prisma.parkingSpace.create({
      data: {
        locationId: location.id,
        spaceNumber: `A-${i.toString().padStart(3, '0')}`,
        floor: 1,
        zone: 'A',
        isAvailable: i % 3 !== 0, // Make some spaces occupied
        basePrice: 10.0,
        pricePerHour: 5.0,
        currency: 'AED',
      },
    });
    spaces.push(space);
  }
  console.log(`✅ Created ${spaces.length} parking spaces`);

  // Create sample gateway
  const gateway = await prisma.gateway.create({
    data: {
      locationId: location.id,
      serialNumber: `GW-${Date.now()}`,
      macAddress: `00:1B:44:11:3A:B${Math.floor(Math.random() * 10)}`,
      gatewayType: 'RAK7289CV2',
      lteEnabled: true,
      lorawanEnabled: true,
      isOnline: true,
      lastSeen: new Date(),
      firmwareVersion: '1.0.0',
    },
  });
  console.log('✅ Created gateway:', gateway.serialNumber);

  // Create sample sensors
  for (let i = 0; i < 5; i++) {
    const sensor = await prisma.sensor.create({
      data: {
        locationId: location.id,
        spaceId: spaces[i].id,
        gatewayId: gateway.id,
        sensorType: 'LW009-SM',
        macAddress: `00:1A:2B:3C:4D:${i.toString(16).toUpperCase()}`,
        isActive: true,
        batteryLevel: 85 + i,
        lastSeen: new Date(),
        detectionMode: 'DUAL',
        sensitivity: 5,
      },
    });
    console.log(`✅ Created sensor ${i + 1}:`, sensor.macAddress);
  }

  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
