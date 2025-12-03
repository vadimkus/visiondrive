# Vision Drive Backend API

Backend API for Vision Drive smart parking solution.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (via Prisma)
- **ORM**: Prisma
- **Language**: TypeScript

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database (configured via Prisma)

## Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Generate Prisma Client**:
```bash
npm run prisma:generate
```

4. **Run database migrations**:
```bash
npm run prisma:migrate
```

5. **Start development server**:
```bash
npm run dev
```

## Database Schema

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

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:seed` - Seed database with sample data

## API Endpoints

### Health Check
- `GET /health` - Check API and database status

### API Info
- `GET /api` - API information and available endpoints

## Database Connection

The backend uses Prisma with PostgreSQL. The database URL is configured in `.env`:

```env
DATABASE_URL="postgres://..."
```

For production, consider using Prisma Accelerate for connection pooling:
```env
PRISMA_ACCELERATE_URL="prisma+postgres://..."
```

## Project Structure

```
backend/
├── src/
│   ├── lib/
│   │   └── prisma.ts      # Prisma client instance
│   ├── api/               # API routes
│   ├── services/          # Business logic
│   ├── models/            # Data models (Prisma schema)
│   ├── utils/            # Utility functions
│   └── index.ts          # Entry point
├── prisma/
│   └── schema.prisma     # Database schema
├── .env                  # Environment variables
└── package.json
```

## Development

The server runs on `http://localhost:3000` by default.

## License

MIT

