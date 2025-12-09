# Database Setup Instructions

## Prerequisites

1. PostgreSQL database (local or remote)
2. Environment variables configured

## Setup Steps

1. **Create `.env` file** in the root directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/visiondrive?schema=public"
JWT_SECRET="your-secret-key-change-in-production"
NODE_ENV="development"
```

2. **Install dependencies**:
```bash
npm install
```

3. **Generate Prisma Client**:
```bash
npm run db:generate
```

4. **Push schema to database**:
```bash
npm run db:push
```

5. **Seed database with admin user**:
```bash
npm run db:seed
```

## Admin Credentials

After seeding, you can login with:
- **Email**: `admin`
- **Password**: `admin5`

## Database Schema

The User model includes:
- `id`: Unique identifier
- `email`: Unique email address (used as username)
- `passwordHash`: Hashed password
- `name`: User's display name
- `role`: ADMIN, USER, or PARTNER
- `status`: ACTIVE, INACTIVE, or SUSPENDED





