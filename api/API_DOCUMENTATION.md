# 🌍 East Hararghe Tour & Travel Management System API Documentation

## 📋 Overview

This API provides comprehensive endpoints for managing the East Hararghe Tour & Travel Management System, designed to promote and facilitate tourism in East Hararghe Zone, Ethiopia. The system supports three user roles: Users (travelers), Companies (tour operators), and Admins (system administrators).

## 🏔️ About East Hararghe Tourism

This system focuses on promoting tourism in East Hararghe Zone, featuring:

- **Cultural Heritage Tours** - Harar UNESCO World Heritage Site
- **Adventure Tourism** - Cave explorations and nature adventures
- **Wildlife Tourism** - Babille Elephant Sanctuary
- **Agricultural Tourism** - Coffee origin experiences
- **Historical Tours** - Ancient settlements and archaeological sites

## 🔐 Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 📊 Base URL

```
http://localhost:5000/api
```

## 🚀 API Endpoints

### 🔑 Authentication Endpoints

#### Register User

```http
POST /auth/register
```

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "USER" // USER, COMPANY
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "name": "John Doe",
      "role": "USER"
    },
    "tokens": {
      "accessToken": "jwt_token_here",
      "refreshToken": "refresh_token_here"
    }
  }
}
```

#### Login

```http
POST /auth/login
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile

```http
GET /auth/profile
```

_Requires authentication_

#### Register Company

```http
POST /auth/company/register
```

_Requires authentication (COMPANY role)_

**Request Body:**

```json
{
  "company_name": "Amazing Tours Ltd",
  "description": "We provide amazing travel experiences",
  "address": "123 Travel Street, City",
  "phone": "+1234567890",
  "email": "info@amazingtours.com",
  "website": "https://amazingtours.com",
  "license_number": "TL-2024-001"
}
```

---

### 📦 Package Endpoints

#### Get All Packages

```http
GET /packages
```

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search in title, description, location
- `location` (string): Filter by location
- `min_price` (number): Minimum price filter
- `max_price` (number): Maximum price filter
- `min_duration` (number): Minimum duration in days
- `max_duration` (number): Maximum duration in days
- `sort_by` (string): Sort field (price, rating, duration, created_at)
- `sort_order` (string): Sort order (asc, desc)

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "title": "7-Day Bali Cultural Adventure",
        "description": "Immerse yourself in Bali culture...",
        "location": "Bali, Indonesia",
        "duration_days": 7,
        "price": 1299.00,
        "max_people": 12,
        "available_slots": 8,
        "company_name": "Bali Adventures Co.",
        "average_rating": 4.5,
        "review_count": 23,
        "images": ["url1", "url2"],
        "itinerary": [...]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### Get Package by ID

```http
GET /packages/:id
```

#### Create Package

```http
POST /packages
```

_Requires authentication (COMPANY role)_
_Supports multipart/form-data for image uploads_

**Request Body (multipart/form-data):**

```
title: "Amazing Safari Adventure"
description: "Experience wildlife like never before"
location: "Kenya"
duration_days: 5
price: 2500
max_people: 8
available_slots: 8
start_date: "2024-06-01"
end_date: "2024-12-31"
includes: "All meals, accommodation, game drives"
excludes: "International flights, personal expenses"
itinerary: [{"day": 1, "title": "Arrival", "description": "..."}]
images: [file1, file2, file3] // Image files
```

#### Update Package

```http
PUT /packages/:id
```

_Requires authentication (COMPANY role)_

#### Delete Package

```http
DELETE /packages/:id
```

_Requires authentication (COMPANY role)_

#### Get My Packages

```http
GET /packages/my/packages
```

_Requires authentication (COMPANY role)_

#### Toggle Package Status

```http
PATCH /packages/:id/toggle-status
```

_Requires authentication (COMPANY role)_

---

### 📅 Booking Endpoints

#### Create Booking

```http
POST /bookings
```

_Requires authentication (USER role)_

**Request Body:**

```json
{
  "package_id": 1,
  "number_of_people": 2,
  "booking_date": "2024-08-15",
  "special_requests": "Vegetarian meals please"
}
```

#### Get My Bookings

```http
GET /bookings/my
```

_Requires authentication (USER role)_

#### Get Booking by ID

```http
GET /bookings/:id
```

_Requires authentication_

#### Cancel Booking

```http
PATCH /bookings/:id/cancel
```

_Requires authentication (USER role)_

#### Get Company Bookings

```http
GET /bookings/company
```

_Requires authentication (COMPANY role)_

#### Update Booking Status

```http
PATCH /bookings/:id/status
```

_Requires authentication (COMPANY role)_

**Request Body:**

```json
{
  "status": "confirmed" // pending, confirmed, cancelled, completed
}
```

---

### 💳 Payment Endpoints

#### Create Payment

```http
POST /payments/booking/:bookingId
```

_Requires authentication (USER role)_

**Request Body:**

```json
{
  "amount": 2598.0,
  "payment_method": "CARD" // CARD, PAYPAL, BANK_TRANSFER
}
```

#### Process Payment

```http
POST /payments/:id/process
```

_Requires authentication (USER role)_

**Request Body:**

```json
{
  "success": true // Mock parameter for testing
}
```

#### Get My Payments

```http
GET /payments/my
```

_Requires authentication (USER role)_

#### Get Payment by ID

```http
GET /payments/:id
```

_Requires authentication (USER role)_

#### Get Booking Payments

```http
GET /payments/booking/:bookingId
```

_Requires authentication (USER role)_

---

### ⭐ Review Endpoints

#### Create Review

```http
POST /reviews
```

_Requires authentication (USER role)_

**Request Body:**

```json
{
  "package_id": 1,
  "booking_id": 1,
  "rating": 5,
  "comment": "Amazing experience! Highly recommended."
}
```

#### Get My Reviews

```http
GET /reviews/my
```

_Requires authentication (USER role)_

#### Update Review

```http
PUT /reviews/:id
```

_Requires authentication (USER role)_

#### Delete Review

```http
DELETE /reviews/:id
```

_Requires authentication (USER role)_

#### Get Package Reviews

```http
GET /reviews/package/:packageId
```

---

### 👨‍💼 Admin Endpoints

#### Get Dashboard Stats

```http
GET /admin/dashboard
```

_Requires authentication (ADMIN role)_

**Response:**

```json
{
  "success": true,
  "data": {
    "overview": {
      "total_users": 150,
      "total_companies": 25,
      "total_packages": 75,
      "total_bookings": 300,
      "total_revenue": 125000.00
    },
    "monthly_revenue": [...],
    "booking_status_distribution": [...],
    "top_packages": [...]
  }
}
```

#### Get All Users

```http
GET /admin/users
```

_Requires authentication (ADMIN role)_

#### Update User Status

```http
PATCH /admin/users/:userId/status
```

_Requires authentication (ADMIN role)_

#### Delete User

```http
DELETE /admin/users/:userId
```

_Requires authentication (ADMIN role)_

#### Get All Companies

```http
GET /admin/companies
```

_Requires authentication (ADMIN role)_

#### Verify Company

```http
PATCH /admin/companies/:companyId/verify
```

_Requires authentication (ADMIN role)_

---

### 🔔 Notification Endpoints

#### Get My Notifications

```http
GET /notifications
```

_Requires authentication_

#### Get Unread Count

```http
GET /notifications/unread-count
```

_Requires authentication_

#### Mark as Read

```http
PATCH /notifications/:id/read
```

_Requires authentication_

#### Mark All as Read

```http
PATCH /notifications/mark-all-read
```

_Requires authentication_

#### Delete Notification

```http
DELETE /notifications/:id
```

_Requires authentication_

---

## 📝 Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": ["Validation error message"]
  }
}
```

## 🔒 HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## 🧪 Testing

### Default Test Accounts

**Admin:**

- Email: `admin@tourtravel.com`
- Password: `password123`

**Company:**

- Email: `bali@adventures.com`
- Password: `password123`

**User:**

- Email: `john.doe@email.com`
- Password: `password123`

### Sample API Calls

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get packages
curl -X GET "http://localhost:5000/api/packages?limit=5&location=Bali"

# Create booking (with auth token)
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"package_id":1,"number_of_people":2,"booking_date":"2024-08-15"}'
```

## 📚 Additional Resources

- [Postman Collection](./postman_collection.json)
- [Database Schema](./src/config/database.js)
- [Seed Data](./src/seeders/completeSeedData.js)
