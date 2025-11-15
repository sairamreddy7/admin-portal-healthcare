# Local Setup Guide - Healthcare Admin Portal

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** (comes with Node.js) or **yarn**
- **Git** (for cloning the repository)

### Verify Installation

```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher
psql --version    # Should show PostgreSQL 14.x or higher
```

---

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd admin-portal-healthcare
```

---

## Step 2: Database Setup

### Create PostgreSQL Database

```bash
# Start PostgreSQL service (varies by OS)
# Linux/Mac:
sudo service postgresql start
# or
brew services start postgresql

# Windows:
# Start PostgreSQL service from Services app

# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE healthcare_portal;
CREATE USER healthcare_admin WITH ENCRYPTED PASSWORD 'your_password_here';
GRANT ALL PRIVILEGES ON DATABASE healthcare_portal TO healthcare_admin;

# Grant schema permissions (PostgreSQL 15+)
\c healthcare_portal
GRANT ALL ON SCHEMA public TO healthcare_admin;

# Exit psql
\q
```

---

## Step 3: Backend Setup

### Navigate to Backend Directory

```bash
cd backend
```

### Install Dependencies

```bash
npm install
```

This will install all required packages:
- express (v5.1.0)
- prisma (v6.19.0)
- bcrypt (v5.1.1)
- jsonwebtoken (v9.0.2)
- nodemailer (v6.10.1)
- pdfkit (v0.15.2)
- express-validator (v7.0.1)
- express-rate-limit (v7.1.5)
- And all other dependencies

### Create Environment File

```bash
# Copy the example file
cp .env.example .env

# Edit the .env file
nano .env  # or use your preferred editor
```

### Configure `.env` File

Update the following variables in `backend/.env`:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# JWT Secret (IMPORTANT: Generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long-change-this

# API Keys for Service Communication (Generate unique strings)
DOCTOR_SERVICE_API_KEY=doctor_api_key_abc123xyz789_unique_string
PATIENT_SERVICE_API_KEY=patient_api_key_def456uvw012_unique_string

# External Service URLs (if you have separate doctor/patient services)
DOCTOR_SERVICE_URL=http://localhost:3000/api
PATIENT_SERVICE_URL=http://localhost:3000/api

# Database Connection (Update with your credentials)
DATABASE_URL="postgresql://healthcare_admin:your_password_here@localhost:5432/healthcare_portal?schema=public"

# CORS - Frontend URL
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175
FRONTEND_URL=http://localhost:5174

# Email Configuration (Optional for testing - use Gmail App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM=noreply@healthcare.com
APP_NAME=Healthcare Admin Portal

# Session Configuration
SESSION_TIMEOUT=30m
TOKEN_EXPIRY=8h

# Data Retention (HIPAA Compliance)
AUDIT_LOG_RETENTION_DAYS=2555  # 7 years
```

**Important Notes**:
- Replace `your_password_here` with your PostgreSQL password
- Generate a strong JWT_SECRET (min 32 characters)
- For email testing, use a [Gmail App Password](https://support.google.com/accounts/answer/185833)

### Run Prisma Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name initial_setup

# Verify migration
npx prisma migrate status
```

This will create all database tables:
- Admin
- PasswordResetToken
- AuditLog
- Department

### Seed Initial Admin User (Optional)

Create a script to add your first admin user:

```bash
# Create a seed script
cat > prisma/seed.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  const admin = await prisma.admin.create({
    data: {
      username: 'admin',
      email: 'admin@healthcare.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true
    }
  });

  console.log('Created admin user:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
EOF

# Run the seed script
node prisma/seed.js
```

**Default Admin Credentials**:
- Email: `admin@healthcare.com`
- Password: `Admin@123`

**IMPORTANT**: Change this password after first login!

---

## Step 4: Frontend Setup

### Navigate to Frontend Directory

```bash
cd ../frontend
```

### Install Dependencies

```bash
npm install
```

This will install:
- react (v19.2.0)
- react-router-dom (v7.9.5)
- react-toastify (v11.0.2)
- axios (v1.7.9)
- tailwindcss (v4.0.0)
- And all other dependencies

### Verify Frontend Configuration

Check `frontend/src/config/api.js` to ensure it points to your backend:

```javascript
const API_BASE_URL = 'http://localhost:4000/api';
```

---

## Step 5: Run the Application

### Terminal 1: Start Backend Server

```bash
cd backend
npm run dev
```

Expected output:
```
🚀 Server running on port 4000
✅ Database connected successfully
📋 Audit logging enabled
🏥 Healthcare Admin Portal API is ready
```

### Terminal 2: Start Frontend Development Server

```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5174/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

---

## Step 6: Access the Application

Open your browser and navigate to:

**Frontend**: http://localhost:5174

**Backend API**: http://localhost:4000

**Health Check**: http://localhost:4000/health

---

## Step 7: Test the Features

### 1. Login

Navigate to http://localhost:5174

- Email: `admin@healthcare.com`
- Password: `Admin@123`

### 2. Test Dashboard

After login, you should see:
- User statistics
- Recent activity
- Navigation menu

### 3. Test User Management

- Create a new admin user
- Update user details
- Deactivate/activate users
- View user list with pagination

### 4. Test Department Management

Navigate to Departments section:
- Create new department
- Update department details
- View department list
- View department statistics

### 5. Test Audit Logs

Navigate to Audit Logs:
- View all logged activities
- Filter by action, resource, user
- Search by username or IP address
- View audit statistics

### 6. Test Password Reset

Logout and click "Forgot Password":
- Enter email address
- Check email for reset link
- Reset password with new credentials

### 7. Test PDF Reports

Navigate to Reports:
- Generate user list PDF
- Generate statistics report
- Download and verify PDF

### 8. Test Health Endpoint

```bash
curl http://localhost:4000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-15T...",
  "uptime": 123.45,
  "database": "connected"
}
```

---

## Step 8: Run Data Retention Script

Test the HIPAA-compliant data retention:

```bash
cd backend
npm run data-retention
```

Expected output:
```
🔄 Starting data retention cleanup...

1️⃣ Cleaning up password reset tokens...
✅ Deleted 0 old password reset tokens

2️⃣ Checking audit logs for archival...
📦 Found 0 audit logs ready for archival

✅ Data retention cleanup completed successfully!
```

---

## Common Issues and Troubleshooting

### Issue 1: Database Connection Failed

**Error**: `Can't reach database server at localhost:5432`

**Solution**:
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Start PostgreSQL
sudo service postgresql start

# Verify connection
psql -U healthcare_admin -d healthcare_portal
```

### Issue 2: Prisma Client Not Generated

**Error**: `Cannot find module '@prisma/client'`

**Solution**:
```bash
cd backend
npx prisma generate
```

### Issue 3: Port Already in Use

**Error**: `Port 4000 is already in use`

**Solution**:
```bash
# Find process using port 4000
lsof -ti:4000

# Kill the process
kill -9 <PID>

# Or change port in backend/.env
PORT=4001
```

### Issue 4: CORS Error in Browser

**Error**: `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution**:
Verify `ALLOWED_ORIGINS` in `backend/.env` includes your frontend URL:
```env
ALLOWED_ORIGINS=http://localhost:5174
```

### Issue 5: Email Not Sending

**Error**: `Invalid login: 535-5.7.8 Username and Password not accepted`

**Solution**:
- Use Gmail App Password (not regular password)
- Enable 2FA on Gmail account
- Generate App Password: https://myaccount.google.com/apppasswords
- Update SMTP_PASS in .env with App Password

### Issue 6: JWT Token Invalid

**Error**: `Invalid token` or `Token expired`

**Solution**:
- Clear browser localStorage
- Logout and login again
- Verify JWT_SECRET is same between restarts

---

## API Testing with cURL

### Test Authentication

```bash
# Register new admin
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testadmin",
    "email": "test@example.com",
    "password": "Test@123456"
  }'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@healthcare.com",
    "password": "Admin@123"
  }'

# Copy the token from response
```

### Test Protected Routes

```bash
# Replace YOUR_TOKEN with actual JWT token from login
TOKEN="your-jwt-token-here"

# Get current user profile
curl -X GET http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Get all users
curl -X GET http://localhost:4000/api/users \
  -H "Authorization: Bearer $TOKEN"

# Get audit logs
curl -X GET http://localhost:4000/api/audit-logs \
  -H "Authorization: Bearer $TOKEN"

# Get departments
curl -X GET http://localhost:4000/api/departments \
  -H "Authorization: Bearer $TOKEN"
```

---

## Development Tools

### Prisma Studio (Database GUI)

```bash
cd backend
npx prisma studio
```

This opens http://localhost:5555 with a GUI to view/edit database records.

### Check Database Tables

```bash
psql -U healthcare_admin -d healthcare_portal

# List tables
\dt

# View Admin table
SELECT * FROM "Admin";

# View Audit Logs
SELECT * FROM "AuditLog" ORDER BY timestamp DESC LIMIT 10;

# Exit
\q
```

### View Logs

```bash
# Backend logs (if running with pm2 or similar)
cd backend
npm run dev 2>&1 | tee server.log

# Frontend logs
cd frontend
npm run dev 2>&1 | tee client.log
```

---

## Production Build

### Build Frontend

```bash
cd frontend
npm run build

# Preview production build
npm run preview
```

### Build Backend

```bash
cd backend

# Set production environment
export NODE_ENV=production

# Run Prisma migrations
npx prisma migrate deploy

# Start server
npm start
```

---

## Quick Start Script

Save this as `start.sh` in the root directory:

```bash
#!/bin/bash

echo "🏥 Starting Healthcare Admin Portal..."

# Start backend
echo "📦 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start frontend
echo "🎨 Starting frontend server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Application started!"
echo "📱 Frontend: http://localhost:5174"
echo "🔧 Backend:  http://localhost:4000"
echo "❤️  Health:   http://localhost:4000/health"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
```

Make it executable:
```bash
chmod +x start.sh
./start.sh
```

---

## Need Help?

- Backend runs on: http://localhost:4000
- Frontend runs on: http://localhost:5174
- Health check: http://localhost:4000/health
- Prisma Studio: http://localhost:5555 (when running)

If you encounter issues not covered here, check:
1. All dependencies are installed (`npm install`)
2. PostgreSQL is running and accessible
3. `.env` file is properly configured
4. Prisma client is generated (`npx prisma generate`)
5. Database migrations are applied (`npx prisma migrate dev`)

Happy testing! 🚀
