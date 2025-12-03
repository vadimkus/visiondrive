# API Documentation

## Overview

Vision Drive API provides endpoints for managing parking spaces, real-time occupancy, user management, and analytics.

## Base URL

```
Development: http://localhost:3000/api
Production: https://api.visiondrive.ae/api
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### Parking Spaces

#### Get Available Parking Spaces
```
GET /parking/spaces
```

#### Get Real-time Occupancy
```
GET /parking/occupancy/:locationId
```

#### Reserve Parking Space
```
POST /parking/reserve
```

### User Management

#### Register User
```
POST /users/register
```

#### Login
```
POST /users/login
```

### Analytics

#### Get Occupancy Analytics
```
GET /analytics/occupancy
```

#### Get Revenue Reports
```
GET /analytics/revenue
```

## Response Format

All API responses follow a standard format:

```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "timestamp": "2025-01-XX"
}
```

## Error Handling

Errors are returned in the following format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": {}
  },
  "timestamp": "2025-01-XX"
}
```

## Rate Limiting

API requests are rate-limited to prevent abuse. Limits will be documented per endpoint.

## Versioning

API versioning will be implemented using URL versioning:
- `/api/v1/...`

