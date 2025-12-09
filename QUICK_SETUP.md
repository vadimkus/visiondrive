# Quick Database Setup

## Step 1: Create .env file

Create a `.env` file in the root directory with your database connection:

```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
JWT_SECRET="your-secret-key-change-in-production"
NODE_ENV="development"
```

**Note**: If you're using Prisma Accelerate or Prisma Data Platform, use the connection string format they provide.

## Step 2: Run migrations

```bash
npm run db:generate  # Already done ✅
npm run db:push      # Creates tables
npm run db:seed      # Creates admin user and uploads logo
```

## Admin Credentials

After seeding:
- **Username**: `admin`
- **Password**: `admin5`





