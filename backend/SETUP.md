# Vision Drive Backend Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database (already configured via Prisma)

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

## Step 2: Configure Environment Variables

Create a `.env` file in the `backend/` directory with the following content:

```env
# Database Configuration
DATABASE_URL="postgres://a1262423802eca3697465bc828c5c1fe5404e3c9b673f86cbff6fb2e933f1dd4:sk_KvF-QtyqpiFrHMiKb8jWQ@db.prisma.io:5432/postgres?sslmode=require"

# Prisma Accelerate (for connection pooling)
PRISMA_ACCELERATE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19LdkYtUXR5cXBpRnJITWlLYjhqV1EiLCJhcGlfa2V5IjoiMDFLQkpEQUVHRjFTMUdaS1dBQ1JKOVlRQUsiLCJ0ZW5hbnRfaWQiOiJhMTI2MjQyMzgwMmVjYTM2OTc0NjViYzgyOGM1YzFmZTU0MDRlM2M5YjY3M2Y4NmNiZmY2ZmIyZTkzM2YxZGQ0IiwiaW50ZXJuYWxfc2VjcmV0IjoiZWJiNTZhMzYtNDYzNC00NWViLWE3NDItZjgzN2U4ZTM3ZDI4In0.vwfiUSzfG2e8EuzWmdFXLABrsDhoG5E2v0C3wzzpi34"

# Application
NODE_ENV=development
PORT=3000
API_BASE_URL=http://localhost:3000/api

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRES_IN=24h

# Frontend
FRONTEND_URL=http://localhost:3001

# External Services
MAPS_API_KEY=your_maps_api_key
SMS_API_KEY=your_sms_api_key
SMS_API_SECRET=your_sms_api_secret

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

**Important**: The `.env` file is gitignored for security. Never commit it to version control.

## Step 3: Generate Prisma Client

```bash
npm run prisma:generate
```

This generates the Prisma Client based on your schema.

## Step 4: Create Database Schema

Run the migration to create all database tables:

```bash
npm run prisma:migrate
```

This will:
- Create all tables in your PostgreSQL database
- Set up relationships and indexes
- Create an initial migration file

## Step 5: Seed Database (Optional)

Populate the database with sample data:

```bash
npm run prisma:seed
```

This creates:
- Admin user (email: admin@visiondrive.ae, password: admin123)
- Sample partner (Dubai Mall)
- Sample parking location with 20 spaces
- Sample gateway (RAK7289CV2)
- Sample sensors (LW009-SM)

## Step 6: Start Development Server

```bash
npm run dev
```

The API server will start on `http://localhost:3000`

## Verify Setup

1. **Health Check**: Visit `http://localhost:3000/health` to verify the server and database connection
2. **API Info**: Visit `http://localhost:3000/api` for API information

## Database Schema Overview

The Prisma schema includes models for:

- **Users**: Drivers, admins, and partner admins
- **Parking Locations**: Parking facilities and areas
- **Parking Spaces**: Individual parking spots
- **Sensors**: LW009-SM sensor devices
- **Gateways**: RAK7289CV2 gateway devices
- **Reservations**: User parking reservations
- **Payments**: Payment transactions
- **Analytics**: Location-level analytics data
- **Partners**: B2B partner relationships

## Useful Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:seed` - Seed database with sample data

## Troubleshooting

### Database Connection Issues

If you encounter connection errors:
1. Verify your `DATABASE_URL` is correct in `.env`
2. Check that the database is accessible
3. Ensure SSL mode is set correctly (`sslmode=require`)

### Migration Issues

If migrations fail:
1. Check database connection
2. Verify schema syntax is correct
3. Check for existing tables that might conflict

### Prisma Client Issues

If Prisma Client is not found:
1. Run `npm run prisma:generate`
2. Restart your development server
3. Check that `node_modules/@prisma/client` exists

## Next Steps

After setup:
1. Create API routes in `src/api/`
2. Implement services in `src/services/`
3. Add authentication middleware
4. Create API endpoints for parking management

