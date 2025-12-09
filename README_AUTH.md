# Authentication Setup

## Overview

The authentication system is now fully database-driven. All user data is stored in PostgreSQL using Prisma ORM.

## Admin Credentials

- **Username**: `admin`
- **Password**: `admin5`

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/visiondrive?schema=public"
JWT_SECRET="your-secret-key-change-in-production"
NODE_ENV="development"
```

### 2. Database Setup

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with admin user
npm run db:seed
```

### 3. Start Development Server

```bash
npm run dev
```

## Features

✅ **Database-driven authentication** - All user data stored in PostgreSQL
✅ **Secure password hashing** - Using bcryptjs
✅ **JWT tokens** - Stored in HTTP-only cookies
✅ **Session management** - API routes for login/logout/session check
✅ **No localStorage** - All auth data comes from database/API

## API Endpoints

- `POST /api/auth/login` - Authenticate user
- `GET /api/auth/me` - Get current user session
- `POST /api/auth/logout` - Logout user

## Database Schema

The `User` model includes:
- `id` - Unique identifier (CUID)
- `email` - Unique username/email
- `passwordHash` - Bcrypt hashed password
- `name` - Display name (optional)
- `role` - ADMIN, USER, or PARTNER
- `status` - ACTIVE, INACTIVE, or SUSPENDED
- `createdAt` / `updatedAt` - Timestamps





