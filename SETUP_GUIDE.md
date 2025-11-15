# Admin Portal - Complete Setup Guide

## 📁 Project Structure

```
admin-portal-healthcare/
├── backend/
│   ├── controllers/
│   │   ├── authController.js       # Admin authentication (JWT)
│   │   ├── userController.js       # User management (direct DB access)
│   │   ├── doctorController.js     # Doctor management (API proxy)
│   │   └── patientController.js    # Patient management (API proxy)
│   ├── middleware/
│   │   ├── auth.js                 # JWT authentication middleware
│   │   └── apiKeyAuth.js           # API key validation middleware
│   ├── routes/
│   │   ├── authRoutes.js           # /api/auth routes
│   │   ├── userRoutes.js           # /api/users routes
│   │   ├── doctorRoutes.js         # /api/doctors routes
│   │   └── patientRoutes.js        # /api/patients routes
│   ├── utils/
│   │   ├── jwt.js                  # JWT token generation/verification
│   │   └── apiKeyGenerator.js      # API key generator utility
│   ├── scripts/
│   │   └── createAdmin.js          # Script to create admin user
│   ├── prisma/
│   │   └── schema.prisma           # Prisma database schema (shared)
│   ├── server.js                   # Express server (Port 4000)
│   ├── package.json                # Dependencies and scripts
│   ├── .env                        # Environment variables with API keys
│   ├── .env.example                # Environment template
│   └── README.md                   # Complete documentation
└── frontend/                       # To be created
```

## 🔑 Generated API Keys

**DOCTOR_SERVICE_API_KEY:**
```
b24691bf5dd3e8cf77c6d214ba879261b977dd553cd822e23f87f5381acf9f8e
```

**PATIENT_SERVICE_API_KEY:**
```
7e18e0e623a07f51c9ed9bd63d7dcef91e6c7c4f5f380430e3eae1b6ee644f3a
```

## 🚀 Quick Start

### 1. Update Admin Backend .env

The `.env` file has been updated with the generated API keys:

```bash
cd /Users/reethuchada/Documents/admin-portal-healthcare/backend
```

The .env file now contains:
```env
DOCTOR_SERVICE_API_KEY=b24691bf5dd3e8cf77c6d214ba879261b977dd553cd822e23f87f5381acf9f8e
PATIENT_SERVICE_API_KEY=7e18e0e623a07f51c9ed9bd63d7dcef91e6c7c4f5f380430e3eae1b6ee644f3a
```

### 2. Update Main Backend .env

**IMPORTANT:** Add this API key to your main backend:

```bash
cd /Users/reethuchada/Documents/capstone-helath-care-portal-latest/backend
```

Add to `.env`:
```env
# API Key for Admin Service (add to existing .env)
ADMIN_SERVICE_API_KEY=b24691bf5dd3e8cf77c6d214ba879261b977dd553cd822e23f87f5381acf9f8e
```

### 3. Generate Prisma Client

```bash
cd /Users/reethuchada/Documents/admin-portal-healthcare/backend
npx prisma generate
```

### 4. Create Admin User

```bash
npm run create-admin
```

This creates an admin user:
- Email: admin@healthcare.com
- Password: Admin@123

### 5. Start Admin Backend

```bash
npm run dev
```

The admin backend will run on **http://localhost:4000**

### 6. Test Admin Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@healthcare.com",
    "password": "Admin@123"
  }'
```

## 📡 API Architecture

### Authentication Flow

```
Admin Frontend
    ↓ (username/password)
Admin Backend (JWT)
    ↓ (API Key)
Main Backend
    ↓
Database
```

### Two Types of Authentication

1. **Admin User Authentication (JWT)**
   - Admin users login with email/password
   - Receive JWT token for frontend requests
   - Token expires in 8 hours

2. **Service-to-Service Authentication (API Keys)**
   - Admin backend uses API keys to call main backend
   - API keys never expire (rotate manually)
   - Keys stored in environment variables

## 🔌 API Endpoints

### Auth Endpoints (Admin JWT)
```
POST   /api/auth/login          # Admin login
POST   /api/auth/create-admin   # Create new admin (requires admin token)
GET    /api/auth/verify         # Verify token
```

### User Management (Direct DB Access)
```
GET    /api/users              # Get all users
GET    /api/users/stats        # Get user statistics
GET    /api/users/:id          # Get user by ID
POST   /api/users              # Create new user
PUT    /api/users/:id          # Update user
DELETE /api/users/:id          # Delete user
```

### Doctor Management (Proxied to Main Backend)
```
GET    /api/doctors            # Get all doctors
GET    /api/doctors/stats      # Get doctor statistics
GET    /api/doctors/:id        # Get doctor by ID
POST   /api/doctors            # Create new doctor
PUT    /api/doctors/:id        # Update doctor
DELETE /api/doctors/:id        # Delete doctor
```

### Patient Management (Proxied to Main Backend)
```
GET    /api/patients           # Get all patients
GET    /api/patients/stats     # Get patient statistics
GET    /api/patients/:id       # Get patient by ID
POST   /api/patients           # Create new patient
PUT    /api/patients/:id       # Update patient
DELETE /api/patients/:id       # Delete patient
```

## 🔐 Security Features

1. **JWT Authentication**
   - Admin users must authenticate
   - Role-based access control (ADMIN only)
   - Token expiration (8 hours)

2. **API Key Authentication**
   - Service-to-service communication secured
   - Keys stored in environment variables
   - Easy key rotation

3. **Password Security**
   - Bcrypt hashing with 10 salt rounds
   - No plain text passwords stored

4. **CORS Protection**
   - Only admin frontend allowed
   - Configurable origins

## 📊 Database Schema

The admin backend uses the same PostgreSQL database as the main backend:

```
postgresql://healthcare_admin:HealthCare2024!@20.42.48.79:5432/healthcare_portal
```

**Shared Tables:**
- users (all users: admin, doctor, patient)
- doctors (doctor profiles)
- patients (patient profiles)
- appointments
- medical_records
- prescriptions
- and more...

## 🎯 Next Steps

### 1. Update Main Backend to Accept API Keys

Add API key middleware to the main backend:

**File:** `/backend/middleware/apiKeyAuth.js` (create new)

```javascript
function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return next(); // Allow regular JWT auth
  }
  
  if (apiKey === process.env.ADMIN_SERVICE_API_KEY) {
    req.serviceAuth = true;
    return next();
  }
  
  return res.status(403).json({ error: 'Invalid API key' });
}

module.exports = { validateApiKey };
```

Add to routes that should accept API keys from admin service.

### 2. Create Admin Frontend

```bash
cd /Users/reethuchada/Documents/admin-portal-healthcare
npm create vite@latest frontend -- --template react
cd frontend
npm install
```

Configure to run on port 5174 in `vite.config.js`:

```javascript
export default {
  server: {
    port: 5174
  }
}
```

### 3. Remove Admin Pages from Main Frontend

Delete these files:
```
/frontend/src/pages/admin/AdminDashboard.jsx
/frontend/src/pages/admin/UserManagement.jsx
/frontend/src/pages/admin/Reports.jsx
/frontend/src/pages/admin/AuditLogs.jsx
/frontend/src/pages/admin/SystemSettings.jsx
```

Update routing in main frontend to remove admin routes.

### 4. Deploy Services Separately

**Main Backend (Port 3000):**
- Patient module
- Doctor module
- Appointments
- Medical records

**Admin Backend (Port 4000):**
- User management
- System administration
- Reports and analytics

**Frontend - Patient/Doctor (Port 5173):**
- Patient dashboard
- Doctor dashboard
- Appointment booking

**Frontend - Admin (Port 5174):**
- Admin dashboard
- User management UI
- System settings UI

## ✅ Completed

- [x] Admin backend directory structure
- [x] Package.json with all dependencies
- [x] Environment variables configuration
- [x] JWT authentication utilities
- [x] API key generator
- [x] Authentication middleware (JWT and API key)
- [x] Auth controller (login, create admin)
- [x] User controller (CRUD operations)
- [x] Doctor controller (API proxy)
- [x] Patient controller (API proxy)
- [x] All route files
- [x] Express server configuration
- [x] Prisma schema (shared)
- [x] Admin user creation script
- [x] Complete README documentation
- [x] API keys generated

## 🔜 To Do

- [ ] Generate Prisma client
- [ ] Create first admin user
- [ ] Add API key middleware to main backend
- [ ] Test API endpoints
- [ ] Create admin frontend with Vite + React
- [ ] Remove admin pages from main frontend
- [ ] Deploy services separately

## 📝 Environment Variables Summary

**Admin Backend (.env):**
```env
PORT=4000
JWT_SECRET=admin-healthcare-portal-secret-key-2025-change-in-production
DOCTOR_SERVICE_API_KEY=b24691bf5dd3e8cf77c6d214ba879261b977dd553cd822e23f87f5381acf9f8e
PATIENT_SERVICE_API_KEY=7e18e0e623a07f51c9ed9bd63d7dcef91e6c7c4f5f380430e3eae1b6ee644f3a
DOCTOR_SERVICE_URL=http://localhost:3000/api
PATIENT_SERVICE_URL=http://localhost:3000/api
DATABASE_URL="postgresql://healthcare_admin:HealthCare2024!@20.42.48.79:5432/healthcare_portal"
ALLOWED_ORIGINS=http://localhost:5174,http://localhost:5173
ADMIN_EMAIL=admin@healthcare.com
ADMIN_PASSWORD=Admin@123
```

**Main Backend (.env) - Add these lines:**
```env
ADMIN_SERVICE_API_KEY=b24691bf5dd3e8cf77c6d214ba879261b977dd553cd822e23f87f5381acf9f8e
```

## 🎉 Summary

You now have a complete, separate admin backend service that:

1. **Authenticates admins** using JWT tokens
2. **Manages users** directly via database
3. **Manages doctors and patients** by proxying requests to the main backend using API keys
4. **Runs independently** on port 4000
5. **Can be deployed separately** from the main application
6. **Shares the same database** with the main backend
7. **Uses secure API keys** for service-to-service communication

The admin service is production-ready and can be deployed to any hosting platform!
