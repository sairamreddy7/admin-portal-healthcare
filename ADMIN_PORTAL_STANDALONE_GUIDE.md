# Admin Portal - Standalone Setup Guide

## Overview

The **Healthcare Admin Portal** is a complete administrative management system for healthcare organizations. This guide will help you set up and run the Admin Portal as a standalone application.

---

## What is the Admin Portal?

The Admin Portal provides comprehensive administrative oversight and management capabilities:

### Core Features

1. **Admin User Management**
   - Create, update, delete admin users
   - Role-based access control (SUPER_ADMIN, ADMIN, VIEWER)
   - User activation/deactivation
   - Secure password management

2. **Department Management**
   - Hospital/clinic department organization
   - Department head assignment
   - Location and contact management
   - Department statistics

3. **Audit Logging (HIPAA Compliant)**
   - Complete activity tracking
   - 7-year data retention
   - Filter by user, action, resource
   - Statistics and reporting

4. **Security Features**
   - JWT-based authentication
   - Rate limiting (prevent brute force)
   - Input validation
   - Session timeout management
   - Password reset functionality
   - Email notifications

5. **Reporting**
   - User statistics
   - PDF report generation
   - System analytics
   - Audit log reports

6. **System Integration** (Optional)
   - Can integrate with external Doctor/Patient Portal
   - RESTful API for third-party integrations
   - Health monitoring endpoints

---

## Prerequisites

- **Node.js** v18 or higher
- **PostgreSQL** v14 or higher
- **npm** (comes with Node.js)
- **Git**

### Verify Installation

```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher
psql --version    # Should show PostgreSQL 14.x or higher
```

---

## Database Setup

### Your Database Credentials

```
Host: 20.42.48.79
Port: 5432
Database: healthcare_portal
Username: healthcare_admin
Password: HealthCare2024!
```

### Verify Database Connection

```bash
# Test connection
psql -h 20.42.48.79 -U healthcare_admin -d healthcare_portal

# If successful, you should see:
healthcare_portal=>

# Exit with:
\q
```

---

## Installation Steps

### Step 1: Navigate to Project

```bash
cd /home/user/admin-portal-healthcare
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 3: Configure Environment

The `.env` file is already configured with your database:

```env
DATABASE_URL="postgresql://healthcare_admin:HealthCare2024!@20.42.48.79:5432/healthcare_portal?schema=public"
```

**Verify the configuration**:

```bash
cat backend/.env | grep DATABASE_URL
```

### Step 4: Generate Prisma Client (If network allows)

```bash
cd backend

# Try to generate Prisma client
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate

# If this fails due to network restrictions, the engines may need to be pre-installed
```

### Step 5: Run Database Migrations

```bash
cd backend

# Apply all migrations to create database tables
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma migrate deploy

# Or in development
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma migrate dev
```

This creates the following tables:
- `Admin` - Admin users
- `PasswordResetToken` - Password reset tokens
- `AuditLog` - Activity logs (HIPAA compliance)
- `Department` - Hospital departments

### Step 6: Create Initial Admin User

```bash
cd backend
node scripts/createAdmin.js
```

**Default credentials**:
- Email: `admin@healthcare.com`
- Password: `Admin@123`

⚠️ **IMPORTANT**: Change this password after first login!

### Step 7: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

## Running the Admin Portal

### Option 1: Using the Start Script

```bash
cd /home/user/admin-portal-healthcare

# Make script executable
chmod +x start-admin.sh

# Start both backend and frontend
./start-admin.sh
```

### Option 2: Manual Start

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
```

Expected output:
```
🚀 Server running on port 4000
✅ Database connected successfully
📋 Audit logging enabled
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

Expected output:
```
➜  Local:   http://localhost:5174/
```

---

## Accessing the Application

### URLs

- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:4000
- **Health Check**: http://localhost:4000/health
- **API Documentation**: http://localhost:4000/

### Default Login

```
Email: admin@healthcare.com
Password: Admin@123
```

---

## Admin Portal Features Guide

### 1. Dashboard

After login, you'll see:
- Total users count
- Active users
- Recent activity
- System statistics

### 2. User Management

**Location**: Navigation → Users

**Features**:
- View all admin users
- Create new admin users
- Update user information
- Activate/deactivate users
- Delete users
- Assign roles (SUPER_ADMIN, ADMIN, VIEWER)

**Creating a User**:
1. Click "Add User" or "Create User"
2. Fill in:
   - Username (unique)
   - Email (valid email format)
   - Password (min 8 characters, must include uppercase, lowercase, number, special char)
   - Role (SUPER_ADMIN, ADMIN, or VIEWER)
3. Click "Create"

### 3. Department Management

**Location**: Navigation → Departments

**Features**:
- Create hospital/clinic departments
- Assign department heads
- Set location and contact information
- View department statistics
- Search and filter departments

**Creating a Department**:
1. Click "Add Department"
2. Fill in:
   - Name (required, unique)
   - Description
   - Head Name
   - Location
   - Phone Number
   - Email
3. Click "Create"

### 4. Audit Logs

**Location**: Navigation → Audit Logs

**Features**:
- View all system activities
- Filter by:
  - User
  - Action (LOGIN, CREATE, UPDATE, DELETE, etc.)
  - Resource (User, Department, etc.)
  - Date range
- Search by username, IP address, endpoint
- View detailed request/response data
- Export audit reports

**HIPAA Compliance**:
- All actions are automatically logged
- 7-year retention period
- Cannot be modified (append-only)
- Includes IP address and user agent

### 5. Reports

**Location**: Navigation → Reports

**Available Reports**:
- User List PDF
- User Statistics
- Department Statistics
- Audit Log Reports
- System Analytics

**Generating a Report**:
1. Select report type
2. Choose date range (if applicable)
3. Click "Generate"
4. Download PDF

### 6. Password Reset

**For Users**:
1. Click "Forgot Password" on login page
2. Enter email address
3. Check email for reset link
4. Click link and enter new password

**Email Configuration**:
Update `backend/.env` with your SMTP settings:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
```

### 7. Profile Management

**Location**: Click your name in top right

**Features**:
- View your profile
- Change password
- Update email
- Logout

---

## API Endpoints

### Authentication

```bash
# Login
POST /api/auth/login
{
  "email": "admin@healthcare.com",
  "password": "Admin@123"
}

# Get current user profile
GET /api/auth/profile
Headers: Authorization: Bearer <token>
```

### User Management

```bash
# Get all users
GET /api/users
Headers: Authorization: Bearer <token>

# Create user
POST /api/users
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "ADMIN"
}

# Update user
PUT /api/users/:id
{
  "email": "newemail@example.com"
}

# Delete user
DELETE /api/users/:id
```

### Department Management

```bash
# Get all departments
GET /api/departments

# Create department
POST /api/departments
{
  "name": "Cardiology",
  "description": "Heart and cardiovascular care",
  "headName": "Dr. John Smith",
  "location": "Building A, Floor 3",
  "phoneNumber": "+1-555-0123",
  "email": "cardiology@hospital.com"
}

# Update department
PUT /api/departments/:id

# Delete department
DELETE /api/departments/:id

# Get statistics
GET /api/departments/statistics
```

### Audit Logs

```bash
# Get audit logs
GET /api/audit-logs?page=1&limit=50

# Filter by action
GET /api/audit-logs?action=LOGIN

# Filter by user
GET /api/audit-logs?userId=<user-id>

# Get statistics
GET /api/audit-logs/statistics

# Get user activity
GET /api/audit-logs/users/:userId
```

### Reports

```bash
# Generate user list PDF
POST /api/reports/users/pdf

# Get system statistics
GET /api/reports/statistics
```

---

## Testing the Application

### 1. Test Database Connection

```bash
curl http://localhost:4000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-15T...",
  "uptime": 123.45,
  "database": "connected"
}
```

### 2. Test Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@healthcare.com",
    "password": "Admin@123"
  }'
```

Save the returned token:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": { ... }
}
```

### 3. Test Protected Endpoint

```bash
TOKEN="<your-token-from-login>"

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4000/api/auth/profile
```

### 4. Test User Creation

```bash
curl -X POST http://localhost:4000/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123!",
    "role": "ADMIN"
  }'
```

---

## Security Best Practices

### 1. Change Default Password

After first login:
1. Go to Profile
2. Click "Change Password"
3. Enter strong password

### 2. Generate Strong JWT Secret

```bash
# Generate new secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Update backend/.env
JWT_SECRET=<generated-secret>
```

### 3. Configure Email

Update SMTP settings in `backend/.env` for:
- Password reset emails
- Account creation notifications
- System alerts

For Gmail:
1. Enable 2FA on your account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use App Password in `.env`

### 4. Enable HTTPS (Production)

For production deployment:
- Use reverse proxy (nginx/Apache)
- Enable SSL/TLS certificates
- Update `ALLOWED_ORIGINS` and `FRONTEND_URL`

### 5. Regular Backups

```bash
# Backup database
pg_dump -h 20.42.48.79 -U healthcare_admin healthcare_portal > backup.sql

# Restore database
psql -h 20.42.48.79 -U healthcare_admin healthcare_portal < backup.sql
```

---

## Maintenance Tasks

### Data Retention (HIPAA Compliance)

Run the data retention script to clean old data:

```bash
cd backend
npm run data-retention
```

This will:
- Delete password reset tokens older than 7 days
- Archive audit logs older than 7 years (2555 days)
- Log all cleanup activities

**Schedule with cron** (production):
```bash
# Run daily at 2 AM
0 2 * * * cd /path/to/backend && npm run data-retention >> /var/log/data-retention.log 2>&1
```

### View Logs

```bash
# Backend logs (if using PM2 or similar)
pm2 logs admin-backend

# Or check console output
cd backend
npm run dev 2>&1 | tee server.log
```

### Database Inspection

```bash
# Connect to database
psql -h 20.42.48.79 -U healthcare_admin healthcare_portal

# View tables
\dt

# Count admin users
SELECT COUNT(*) FROM "Admin";

# View recent audit logs
SELECT * FROM "AuditLog" ORDER BY timestamp DESC LIMIT 10;

# View departments
SELECT * FROM "Department";
```

---

## Troubleshooting

### Cannot Connect to Database

**Error**: `Database connection failed`

**Solutions**:
1. Verify database credentials in `.env`
2. Check network connectivity to database server
3. Verify PostgreSQL is running on 20.42.48.79:5432
4. Check firewall rules

```bash
# Test connection
psql -h 20.42.48.79 -U healthcare_admin -d healthcare_portal
```

### Port Already in Use

**Error**: `Port 4000 is already in use`

**Solutions**:
```bash
# Find process
lsof -ti:4000

# Kill process
kill -9 $(lsof -ti:4000)

# Or change port in backend/.env
PORT=4001
```

### Prisma Client Not Generated

**Error**: `Cannot find module '@prisma/client'`

**Solutions**:
```bash
cd backend
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
```

If network restrictions prevent this, Prisma engines need to be pre-installed or downloaded on a machine with internet access.

### Login Fails

**Error**: `Invalid credentials`

**Solutions**:
1. Verify admin user exists in database:
   ```bash
   psql -h 20.42.48.79 -U healthcare_admin healthcare_portal
   SELECT * FROM "Admin";
   ```

2. Reset admin password:
   ```bash
   cd backend
   node scripts/createAdmin.js
   ```

### CORS Errors

**Error**: `Access blocked by CORS policy`

**Solutions**:
1. Update `ALLOWED_ORIGINS` in `backend/.env`
2. Restart backend server
3. Clear browser cache

---

## Production Deployment

### Environment Setup

1. **Set NODE_ENV to production**:
   ```env
   NODE_ENV=production
   ```

2. **Use strong secrets**:
   ```bash
   JWT_SECRET=<64-character-random-string>
   ```

3. **Configure production database**:
   ```env
   DATABASE_URL="postgresql://user:pass@prod-db:5432/healthcare_portal"
   ```

4. **Update CORS origins**:
   ```env
   ALLOWED_ORIGINS=https://admin.yourdomain.com
   FRONTEND_URL=https://admin.yourdomain.com
   ```

### Build Frontend

```bash
cd frontend
npm run build

# Serve with nginx or Apache
# Built files are in frontend/dist/
```

### Run Backend with PM2

```bash
npm install -g pm2

cd backend
pm2 start server.js --name admin-backend
pm2 save
pm2 startup
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name admin.yourdomain.com;

    # Frontend
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Support & Documentation

### Key Files

- `LOCAL_SETUP_GUIDE.md` - Detailed local setup guide
- `PHASE1_SECURITY_FIXES.md` - Security implementation details
- `PHASE2_ESSENTIAL_FEATURES.md` - Feature documentation
- `PHASE3_COMPLIANCE_POLISH.md` - HIPAA compliance features
- `INTEGRATION_GUIDE.md` - External service integration (optional)

### Admin Portal Architecture

```
admin-portal-healthcare/
├── backend/
│   ├── controllers/        # Business logic
│   ├── middleware/         # Auth, validation, rate limiting
│   ├── routes/            # API routes
│   ├── utils/             # Helpers (JWT, email, PDF)
│   ├── scripts/           # Maintenance scripts
│   ├── prisma/            # Database schema & migrations
│   └── server.js          # Express app entry point
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/        # Page components
│   │   ├── utils/        # Frontend utilities
│   │   └── App.jsx       # Main app component
│   └── public/           # Static assets
└── documentation/        # All guides and docs
```

---

## Quick Reference

### Start Application
```bash
./start-admin.sh
# or
cd backend && npm run dev &
cd frontend && npm run dev
```

### Stop Application
```bash
./stop-admin.sh
# or
pkill -f "node.*server.js"
pkill -f "vite"
```

### Database Connection
```bash
psql -h 20.42.48.79 -U healthcare_admin healthcare_portal
```

### View Health
```bash
curl http://localhost:4000/health
```

### Login
- URL: http://localhost:5174
- Email: admin@healthcare.com
- Password: Admin@123

### Generate API Key
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Summary

The Healthcare Admin Portal is a comprehensive administrative system with:

- ✅ Complete user management (CRUD operations)
- ✅ Department management
- ✅ HIPAA-compliant audit logging
- ✅ Secure authentication with JWT
- ✅ Rate limiting and input validation
- ✅ Session timeout management
- ✅ Password reset functionality
- ✅ Email notifications
- ✅ PDF report generation
- ✅ Health monitoring
- ✅ Data retention automation
- ✅ Toast notifications (UX)
- ✅ Loading states (UX)
- ✅ Mobile-responsive design

**All features work standalone without requiring external services!**
