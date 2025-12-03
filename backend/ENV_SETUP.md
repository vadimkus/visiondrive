# Environment Variables Setup

## Database Configuration

The backend requires environment variables to be set. Create a `.env` file in the `backend/` directory with the following:

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

## Important Notes

1. **Database URL**: The `DATABASE_URL` is already configured with your Prisma database credentials.
2. **Prisma Accelerate**: The `PRISMA_ACCELERATE_URL` is configured for connection pooling in production.
3. **Security**: Change `JWT_SECRET` to a secure random string in production.
4. **Environment Variables**: The `.env` file is gitignored for security. Never commit sensitive credentials.

## Next Steps

1. Create the `.env` file with the above configuration
2. Run `npm run prisma:migrate` to create the database schema
3. Run `npm run prisma:seed` to seed sample data
4. Run `npm run dev` to start the development server

