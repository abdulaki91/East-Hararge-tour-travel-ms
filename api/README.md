# Tour and Travel Management System API

A comprehensive REST API for managing tour packages, bookings, payments, and user management built with Node.js, Express.js, and MySQL.

## 🚀 Features

### Authentication & Authorization

- JWT-based authentication with refresh tokens
- Role-based access control (USER, COMPANY, ADMIN)
- Secure password hashing with bcrypt
- Protected routes with middleware

### User Management

- User registration and login
- Profile management
- Company registration for travel agencies
- Admin user management

### Package Management

- Create, read, update, delete tour packages
- Advanced search and filtering
- Image upload support
- Package availability management
- Company-specific package management

### Booking System

- Book tour packages
- Booking status management (pending, confirmed, cancelled, completed)
- Booking history and tracking
- Availability validation

### Payment System

- Multiple payment methods (Telebirr, Chapa, Bank Transfer, Cash)
- Payment processing and tracking
- Transaction reference generation
- Payment status management
- Mock payment processing for development

### Review System

- Rate and review completed bookings
- Average rating calculation
- Review management (create, update, delete)
- Package review aggregation

### Notification System

- Real-time notifications for booking updates
- Payment status notifications
- Email-ready notification templates
- Notification history and management

### Admin Dashboard

- User and company management
- Analytics and reporting
- Revenue tracking
- System statistics

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL with mysql2
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **Environment**: dotenv

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd tour-travel-api
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your configuration:

   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=tour_travel_db
   DB_PORT=3306

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
   JWT_EXPIRE=24h
   JWT_REFRESH_EXPIRE=7d

   # File Upload Configuration
   UPLOAD_PATH=uploads/
   MAX_FILE_SIZE=5242880

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Database Setup**

   Create a MySQL database:

   ```sql
   CREATE DATABASE tour_travel_db;
   ```

   The application will automatically create all required tables on first run.

5. **Start the server**

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "role": "USER"
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Profile

```http
GET /auth/profile
Authorization: Bearer <access_token>
```

#### Register Company

```http
POST /auth/company/register
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "company_name": "Travel Adventures Ltd",
  "description": "Premium travel experiences",
  "address": "123 Travel Street",
  "phone": "+1234567890",
  "email": "info@traveladventures.com",
  "website": "https://traveladventures.com",
  "license_number": "TL123456"
}
```

### Package Endpoints

#### Get All Packages

```http
GET /packages?page=1&limit=10&location=paris&min_price=100&max_price=1000
```

#### Get Package by ID

```http
GET /packages/:id
```

#### Create Package (Company only)

```http
POST /packages
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Paris City Tour",
  "description": "Explore the beautiful city of Paris",
  "location": "Paris, France",
  "duration_days": 5,
  "price": 599.99,
  "max_people": 20,
  "available_slots": 20,
  "start_date": "2024-06-01",
  "end_date": "2024-08-31",
  "includes": "Hotel, Meals, Transportation",
  "excludes": "Flight tickets",
  "itinerary": [
    {
      "day": 1,
      "title": "Arrival and City Overview",
      "description": "Airport pickup and city tour",
      "activities": ["Airport pickup", "Hotel check-in", "City tour"]
    }
  ]
}
```

#### Update Package (Company only)

```http
PUT /packages/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "price": 649.99,
  "available_slots": 15
}
```

#### Delete Package (Company only)

```http
DELETE /packages/:id
Authorization: Bearer <access_token>
```

#### Get My Packages (Company only)

```http
GET /packages/my/packages
Authorization: Bearer <access_token>
```

### Booking Endpoints

#### Create Booking (User only)

```http
POST /bookings
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "package_id": 1,
  "number_of_people": 2,
  "booking_date": "2024-06-15",
  "special_requests": "Vegetarian meals preferred"
}
```

#### Get My Bookings (User only)

```http
GET /bookings/my?status=confirmed
Authorization: Bearer <access_token>
```

#### Get Booking by ID

```http
GET /bookings/:id
Authorization: Bearer <access_token>
```

#### Cancel Booking (User only)

```http
PATCH /bookings/:id/cancel
Authorization: Bearer <access_token>
```

#### Get Company Bookings (Company only)

```http
GET /bookings/company
Authorization: Bearer <access_token>
```

#### Update Booking Status (Company only)

```http
PATCH /bookings/:id/status
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "confirmed"
}
```

### Payment Endpoints

#### Create Payment (User only)

```http
POST /payments/booking/:bookingId
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "amount": 1199.98,
  "payment_method": "telebirr"
}
```

#### Process Payment (User only)

```http
POST /payments/:id/process
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "success": true
}
```

#### Get My Payments (User only)

```http
GET /payments/my
Authorization: Bearer <access_token>
```

#### Get Payment by ID (User only)

```http
GET /payments/:id
Authorization: Bearer <access_token>
```

### Review Endpoints

#### Create Review (User only)

```http
POST /reviews
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "package_id": 1,
  "booking_id": 1,
  "rating": 5,
  "comment": "Amazing experience! Highly recommended."
}
```

#### Get Package Reviews

```http
GET /reviews/package/:packageId
```

#### Get My Reviews (User only)

```http
GET /reviews/my
Authorization: Bearer <access_token>
```

#### Update Review (User only)

```http
PUT /reviews/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "rating": 4,
  "comment": "Good experience overall."
}
```

#### Delete Review (User only)

```http
DELETE /reviews/:id
Authorization: Bearer <access_token>
```

### Notification Endpoints

#### Get My Notifications

```http
GET /notifications?is_read=false
Authorization: Bearer <access_token>
```

#### Mark Notification as Read

```http
PATCH /notifications/:id/read
Authorization: Bearer <access_token>
```

#### Mark All as Read

```http
PATCH /notifications/mark-all-read
Authorization: Bearer <access_token>
```

#### Get Unread Count

```http
GET /notifications/unread-count
Authorization: Bearer <access_token>
```

### Admin Endpoints (Admin only)

#### Get Dashboard Stats

```http
GET /admin/dashboard
Authorization: Bearer <admin_access_token>
```

#### Get All Users

```http
GET /admin/users?role=USER&search=john
Authorization: Bearer <admin_access_token>
```

#### Update User Status

```http
PATCH /admin/users/:userId/status
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "is_active": false
}
```

#### Get All Companies

```http
GET /admin/companies?verified=true
Authorization: Bearer <admin_access_token>
```

#### Verify Company

```http
PATCH /admin/companies/:companyId/verify
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "is_verified": true
}
```

## 🗄 Database Schema

### Tables Overview

- **users**: User accounts and authentication
- **roles**: User roles (USER, COMPANY, ADMIN)
- **companies**: Travel company information
- **packages**: Tour packages offered by companies
- **bookings**: User bookings for packages
- **payments**: Payment transactions
- **reviews**: User reviews and ratings
- **notifications**: System notifications

### Key Relationships

- Users have roles (many-to-one)
- Companies belong to users (one-to-one)
- Packages belong to companies (many-to-one)
- Bookings link users and packages (many-to-many)
- Payments belong to bookings (one-to-many)
- Reviews link users, packages, and bookings

## 🔒 Security Features

- JWT authentication with secure token generation
- Password hashing with bcrypt (12 rounds)
- Rate limiting to prevent abuse
- CORS configuration for cross-origin requests
- Helmet for security headers
- Input validation with Joi
- SQL injection prevention with parameterized queries
- Role-based access control

## 🧪 Testing

The API includes comprehensive error handling and validation. Test the endpoints using:

- **Postman**: Import the provided collection
- **curl**: Use the example commands above
- **Frontend Integration**: Connect with React/Vue/Angular applications

## 📝 Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information (development only)"
}
```

Common HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate resources)
- `500`: Internal Server Error

## 🚀 Deployment

### Production Checklist

1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Configure proper database credentials
4. Set up SSL/TLS certificates
5. Configure reverse proxy (nginx)
6. Set up monitoring and logging
7. Configure backup strategies

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
DB_HOST=your-production-db-host
DB_USER=your-production-db-user
DB_PASSWORD=your-strong-db-password
JWT_SECRET=your-super-strong-jwt-secret-256-bits
JWT_REFRESH_SECRET=your-super-strong-refresh-secret-256-bits
FRONTEND_URL=https://your-frontend-domain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Happy Coding! 🎉**
