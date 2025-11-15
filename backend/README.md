# Healthcare Portal - Admin Backend

Separate admin service for managing users, doctors, and patients in the healthcare portal system.

## Features

- **Admin Authentication**: JWT-based authentication for admin users
- **User Management**: Create, read, update, and delete users (patients, doctors, admins)
- **Doctor Management**: Manage doctor profiles via API proxy to main service
- **Patient Management**: Manage patient profiles via API proxy to main service
- **API Key Authentication**: Secure service-to-service communication

## Architecture

This admin service communicates with the main healthcare portal backend using API keys for authentication. It shares the same PostgreSQL database but runs as an independent service.

```
Admin Frontend (Port 5174)
        ↓
Admin Backend (Port 4000)
        ↓ (API Keys)
Main Backend (Port 3000)
        ↓
PostgreSQL Database
```

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (shared with main backend)
- Main healthcare portal backend running on port 3000

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Generate API Keys

```bash
npm run generate-api-key
```

This will generate two API keys:
- `DOCTOR_SERVICE_API_KEY`
- `PATIENT_SERVICE_API_KEY`

### 3. Configure Environment Variables

Update the `.env` file with the generated API keys:

```env
# API Keys (generated from step 2)
DOCTOR_SERVICE_API_KEY=b24691bf5dd3e8cf77c6d214ba879261b977dd553cd822e23f87f5381acf9f8e
PATIENT_SERVICE_API_KEY=7e18e0e623a07f51c9ed9bd63d7dcef91e6c7c4f5f380430e3eae1b6ee644f3a
```

### 4. Add API Key to Main Backend

Add the generated API key to the main backend's `.env` file:

```env
# In capstone-helath-care-portal-latest/backend/.env
ADMIN_SERVICE_API_KEY=b24691bf5dd3e8cf77c6d214ba879261b977dd553cd822e23f87f5381acf9f8e
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Create Admin User

First, start the server:

```bash
npm run dev
```

Then create an admin user (one-time setup):

```bash
curl -X POST http://localhost:4000/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@healthcare.com",
    "password": "Admin@123",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

Or use the database to create an admin user directly.

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm run generate-api-key` - Generate new API keys

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/create-admin` - Create new admin (requires admin token)
- `GET /api/auth/verify` - Verify admin token

### User Management
- `GET /api/users` - Get all users
- `GET /api/users/stats` - Get user statistics
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Doctor Management (Proxied to Main Service)
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/stats` - Get doctor statistics
- `GET /api/doctors/:id` - Get doctor by ID
- `POST /api/doctors` - Create new doctor
- `PUT /api/doctors/:id` - Update doctor
- `DELETE /api/doctors/:id` - Delete doctor

### Patient Management (Proxied to Main Service)
- `GET /api/patients` - Get all patients
- `GET /api/patients/stats` - Get patient statistics
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

## Authentication

### Admin Authentication (JWT)
Admin users authenticate with email/password and receive a JWT token:

```bash
# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@healthcare.com", "password": "Admin@123"}'

# Use token in requests
curl -X GET http://localhost:4000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Service Authentication (API Keys)
The admin service uses API keys to communicate with the main backend:

```bash
# Admin service automatically includes the API key in requests
# Example: GET /api/doctors (proxied to main backend with API key)
```

## Database

This service uses the same PostgreSQL database as the main healthcare portal:

```
postgresql://healthcare_admin:HealthCare2024!@20.42.48.79:5432/healthcare_portal
```

The Prisma schema is shared between both services.

## Security

- **JWT Authentication**: Admin users must authenticate to access endpoints
- **API Key Authentication**: Service-to-service communication uses API keys
- **Password Hashing**: Bcrypt with 10 salt rounds
- **CORS**: Configured for admin frontend only
- **Environment Variables**: Sensitive data stored in `.env` file

## Deployment

### Separate Deployment
This admin service can be deployed independently from the main healthcare portal:

1. Deploy admin backend to port 4000
2. Deploy admin frontend to port 5174
3. Configure API keys and service URLs in environment variables
4. Ensure both services can communicate (network connectivity)

### Docker Deployment
```bash
# Build image
docker build -t healthcare-admin-backend .

# Run container
docker run -p 4000:4000 \
  -e DATABASE_URL="postgresql://..." \
  -e DOCTOR_SERVICE_URL="http://main-backend:3000/api" \
  healthcare-admin-backend
```

## Troubleshooting

### Service Connection Issues
- Ensure main backend is running on port 3000
- Verify API keys match in both `.env` files
- Check network connectivity between services

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running and accessible
- Check database credentials

### Authentication Issues
- Verify JWT_SECRET is set
- Check token expiration (8 hours)
- Ensure admin user role is 'ADMIN'

## Generated API Keys

**DOCTOR_SERVICE_API_KEY:**
```
b24691bf5dd3e8cf77c6d214ba879261b977dd553cd822e23f87f5381acf9f8e
```

**PATIENT_SERVICE_API_KEY:**
```
7e18e0e623a07f51c9ed9bd63d7dcef91e6c7c4f5f380430e3eae1b6ee644f3a
```

**Important:** Add these keys to your `.env` files before starting the servers.

## Tech Stack

- **Express.js** - Web framework
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Axios** - HTTP client for service communication
- **CORS** - Cross-origin resource sharing

## License

MIT

## Support

For issues or questions, contact the development team.
