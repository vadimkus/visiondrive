# Image Storage in Database

## Overview

All images (logo, favicons, etc.) are now stored in the PostgreSQL database instead of the file system.

## Database Schema

The `Image` model stores:
- `id` - Unique identifier
- `type` - Image type (LOGO, FAVICON, HERO, PARTNER, APP_SCREENSHOT, OTHER)
- `name` - Image name (e.g., "logo", "favicon-16x16")
- `mimeType` - MIME type (e.g., "image/png")
- `data` - Base64 encoded image data
- `width` / `height` - Image dimensions (optional)
- `alt` - Alt text for accessibility

## API Endpoints

### Upload Image
```
POST /api/images/upload
Content-Type: multipart/form-data

Form fields:
- file: Image file
- type: Image type (LOGO, FAVICON, etc.)
- name: Image name
- alt: Alt text (optional)
```

**Authentication**: Requires ADMIN role

### Get Logo
```
GET /api/images/logo
```

Returns the main logo image.

### Get Image by ID
```
GET /api/images/[id]
```

### Get Images by Type
```
GET /api/images/type/[type]
```

Returns all images of a specific type.

## Setup

1. **Run database migrations**:
```bash
npm run db:generate
npm run db:push
npm run db:seed  # This will upload the existing logo
```

2. **Upload additional images** via the admin portal (to be implemented) or directly via API.

## Components

- `Logo` component (`app/components/common/Logo.tsx`) - Fetches logo from database
- Header and Footer automatically use the database-stored logo

## Benefits

✅ **Centralized storage** - All images in one place
✅ **Version control** - Track image changes via database
✅ **Dynamic updates** - Change images without redeploying
✅ **Access control** - Admin-only uploads
✅ **Metadata storage** - Store dimensions, alt text, etc.

