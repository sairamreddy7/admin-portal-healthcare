# Healthcare Admin Portal

A comprehensive administrative management system for healthcare organizations with HIPAA-compliant audit logging, user management, department management, and secure authentication.

---

## Features

### Core Administration
- **Admin User Management** - Create, update, delete admin users with role-based access control
- **Department Management** - Organize hospital/clinic departments with detailed information
- **HIPAA-Compliant Audit Logging** - Track all system activities with 7-year retention
- **Secure Authentication** - JWT-based auth with session timeout and rate limiting
- **Password Reset** - Email-based secure password recovery
- **PDF Reports** - Generate comprehensive reports (users, statistics, audit logs)

### Security & Compliance
- **Input Validation** - Comprehensive validation for all user inputs
- **Rate Limiting** - Prevent brute force attacks (5 login attempts per 15 min)
- **Session Management** - Automatic timeout after 30 minutes of inactivity
- **Password Security** - Bcrypt hashing with strength requirements
- **Audit Trail** - Complete activity logging (HIPAA compliant)
- **Data Retention** - Automated cleanup with 7-year audit log retention

### User Experience
- **Toast Notifications** - Real-time feedback for all actions
- **Loading States** - Multiple loading indicators for better UX
- **Error Boundary** - Graceful error handling
- **Mobile Responsive** - Works on all device sizes
- **Dark/Light Mode** - (If implemented in frontend)

---

## Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL v14+
- npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd admin-portal-healthcare

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### Configuration

The database is already configured in `backend/.env`:

```env
DATABASE_URL="postgresql://healthcare_admin:HealthCare2024!@20.42.48.79:5432/healthcare_portal?schema=public"
```

### Database Setup

```bash
cd backend

# Generate Prisma client
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate

# Run migrations
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma migrate deploy

# Create initial admin user
node scripts/createAdmin.js
```

### Start Application

```bash
# From project root
./start-admin.sh
```

This will start:
- Backend API on **http://localhost:4000**
- Frontend on **http://localhost:5174**

### Default Login

```
Email: admin@healthcare.com
Password: Admin@123
```

⚠️ **Change this password after first login!**

---

## Project Structure

```
admin-portal-healthcare/
├── backend/
│   ├── controllers/         # Business logic
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── departmentController.js
│   │   ├── auditController.js
│   │   ├── passwordResetController.js
│   │   └── reportController.js
│   ├── middleware/          # Authentication, validation, rate limiting
│   │   ├── auth.js
│   │   ├── validation.js
│   │   ├── rateLimiter.js
│   │   ├── apiKeyAuth.js
│   │   ├── auditLogger.js
│   │   └── sessionTimeout.js
│   ├── routes/             # API route definitions
│   ├── utils/              # Helper functions
│   │   ├── jwt.js
│   │   ├── emailService.js
│   │   ├── pdfService.js
│   │   └── externalApiClient.js
│   ├── scripts/            # Maintenance scripts
│   │   ├── createAdmin.js
│   │   └── dataRetention.js
│   ├── prisma/             # Database schema and migrations
│   │   └── schema.prisma
│   ├── server.js           # Express app entry point
│   ├── .env                # Environment configuration
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── ErrorBoundary.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── pages/          # Page components
│   │   ├── utils/          # Frontend utilities
│   │   │   └── toast.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   └── package.json
├── start-admin.sh          # Start script
├── stop-admin.sh           # Stop script
├── README.md              # This file
└── Documentation/
    ├── ADMIN_PORTAL_STANDALONE_GUIDE.md
    ├── LOCAL_SETUP_GUIDE.md
    ├── PHASE1_SECURITY_FIXES.md
    ├── PHASE2_ESSENTIAL_FEATURES.md
    ├── PHASE3_COMPLIANCE_POLISH.md
    └── INTEGRATION_GUIDE.md
```

---

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get current user
- `POST /api/auth/change-password` - Change password

### User Management
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/statistics` - User statistics

### Department Management
- `GET /api/departments` - List all departments
- `GET /api/departments/:id` - Get department by ID
- `POST /api/departments` - Create department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department
- `GET /api/departments/statistics` - Department statistics

### Audit Logs
- `GET /api/audit-logs` - List audit logs
- `GET /api/audit-logs/:id` - Get audit log by ID
- `GET /api/audit-logs/statistics` - Audit statistics
- `GET /api/audit-logs/users/:userId` - User activity

### Password Reset
- `POST /api/password-reset/request` - Request password reset
- `POST /api/password-reset/verify` - Verify reset token
- `POST /api/password-reset/reset` - Reset password

### Reports
- `POST /api/reports/users/pdf` - Generate user list PDF
- `GET /api/reports/statistics` - System statistics

### System
- `GET /health` - Health check
- `GET /` - API documentation

---

## Environment Variables

```env
# Server
PORT=4000
NODE_ENV=development

# Security
JWT_SECRET=<strong-random-secret>
SESSION_TIMEOUT=30m
TOKEN_EXPIRY=8h

# Database
DATABASE_URL="postgresql://healthcare_admin:HealthCare2024!@20.42.48.79:5432/healthcare_portal?schema=public"

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
FRONTEND_URL=http://localhost:5174

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@healthcare.com

# Data Retention (HIPAA)
AUDIT_LOG_RETENTION_DAYS=2555  # 7 years

# External Services (Optional)
DOCTOR_SERVICE_URL=http://localhost:3000/api
PATIENT_SERVICE_URL=http://localhost:3000/api
DOCTOR_SERVICE_API_KEY=<api-key>
PATIENT_SERVICE_API_KEY=<api-key>
EXTERNAL_API_TIMEOUT=10000
```

---

## Database Schema

### Admin
- `id` (UUID, Primary Key)
- `username` (String, Unique)
- `email` (String, Unique)
- `password` (String, Hashed)
- `role` (Enum: SUPER_ADMIN, ADMIN, VIEWER)
- `isActive` (Boolean)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Department
- `id` (UUID, Primary Key)
- `name` (String, Unique)
- `description` (String, Optional)
- `headName` (String, Optional)
- `location` (String, Optional)
- `phoneNumber` (String, Optional)
- `email` (String, Optional)
- `isActive` (Boolean)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### AuditLog
- `id` (UUID, Primary Key)
- `userId` (String, Optional)
- `username` (String, Optional)
- `action` (String)
- `resource` (String)
- `resourceId` (String, Optional)
- `method` (String)
- `endpoint` (String)
- `ipAddress` (String, Optional)
- `userAgent` (String, Optional)
- `statusCode` (Int, Optional)
- `errorMessage` (String, Optional)
- `requestBody` (JSON, Optional)
- `responseBody` (JSON, Optional)
- `timestamp` (DateTime)

### PasswordResetToken
- `id` (UUID, Primary Key)
- `userId` (String)
- `token` (String, Unique, Hashed)
- `expiresAt` (DateTime)
- `used` (Boolean)
- `createdAt` (DateTime)

---

## Security Features

### Authentication & Authorization
- JWT-based authentication with configurable expiration
- Role-based access control (SUPER_ADMIN, ADMIN, VIEWER)
- Session timeout after 30 minutes of inactivity
- Secure password hashing with bcrypt (10 rounds)

### Rate Limiting
- Authentication endpoints: 5 requests per 15 minutes
- User creation: 10 requests per hour
- General API: 100 requests per 15 minutes
- External API calls: 1000 requests per 15 minutes

### Input Validation
- Email format validation
- Password strength requirements (min 8 chars, uppercase, lowercase, number, special char)
- Username validation (alphanumeric, 3-50 chars)
- SQL injection prevention
- XSS prevention

### Data Security
- Sensitive data sanitization in audit logs
- Passwords never logged or exposed
- Tokens hashed before storage
- Secure password reset flow with one-time tokens

---

## HIPAA Compliance

### Audit Logging
- **Complete Activity Tracking**: All user actions logged automatically
- **7-Year Retention**: Audit logs retained for 2555 days (HIPAA requirement)
- **Immutable Logs**: Append-only, cannot be modified
- **Detailed Information**: User ID, action, resource, timestamp, IP address, user agent

### Data Retention
- Automated cleanup script for old data
- Configurable retention periods
- Password reset tokens deleted after 7 days
- Audit logs archived after 7 years

### Access Control
- Role-based permissions
- Session timeout enforcement
- Failed login tracking
- User activity monitoring

---

## Maintenance

### Data Retention Script

Run regularly to clean up old data:

```bash
cd backend
npm run data-retention
```

**Schedule with cron** (recommended):
```bash
# Run daily at 2 AM
0 2 * * * cd /path/to/backend && npm run data-retention >> /var/log/data-retention.log 2>&1
```

### Database Backups

```bash
# Backup
pg_dump -h 20.42.48.79 -U healthcare_admin healthcare_portal > backup_$(date +%Y%m%d).sql

# Restore
psql -h 20.42.48.79 -U healthcare_admin healthcare_portal < backup_20251115.sql
```

### View Logs

```bash
# Application logs
tail -f admin-backend.log
tail -f admin-frontend.log

# Search for errors
grep -i error admin-backend.log

# Database logs
psql -h 20.42.48.79 -U healthcare_admin healthcare_portal
SELECT * FROM "AuditLog" ORDER BY timestamp DESC LIMIT 20;
```

---

## Troubleshooting

### Cannot connect to database
```bash
# Test connection
psql -h 20.42.48.79 -U healthcare_admin -d healthcare_portal

# Check firewall
telnet 20.42.48.79 5432
```

### Port already in use
```bash
# Find and kill process
lsof -ti:4000 | xargs kill -9
lsof -ti:5174 | xargs kill -9
```

### Prisma client errors
```bash
cd backend
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
```

### Login fails
```bash
# Reset admin user
cd backend
node scripts/createAdmin.js
```

---

## Production Deployment

### Build Frontend

```bash
cd frontend
npm run build
# Files in dist/ ready for deployment
```

### Run Backend with PM2

```bash
npm install -g pm2
cd backend
pm2 start server.js --name admin-backend
pm2 save
pm2 startup
```

### Environment Setup
- Set `NODE_ENV=production`
- Use strong `JWT_SECRET` (64+ characters)
- Configure production database
- Enable HTTPS
- Set correct `ALLOWED_ORIGINS`

---

## Documentation

- **[Admin Portal Standalone Guide](./ADMIN_PORTAL_STANDALONE_GUIDE.md)** - Complete standalone setup
- **[Local Setup Guide](./LOCAL_SETUP_GUIDE.md)** - Detailed local development setup
- **[Phase 1: Security Fixes](./PHASE1_SECURITY_FIXES.md)** - Security implementation details
- **[Phase 2: Essential Features](./PHASE2_ESSENTIAL_FEATURES.md)** - Feature documentation
- **[Phase 3: HIPAA Compliance](./PHASE3_COMPLIANCE_POLISH.md)** - Compliance features
- **[Integration Guide](./INTEGRATION_GUIDE.md)** - External service integration (optional)

---

## Tech Stack

### Backend
- Node.js v18+
- Express.js v5.1.0
- Prisma ORM v6.19.0
- PostgreSQL v14+
- JWT for authentication
- Bcrypt for password hashing
- Nodemailer for emails
- PDFKit for PDF generation

### Frontend
- React v19.2.0
- Vite v5.x
- React Router v7.9.5
- Tailwind CSS v4.0.0
- React Toastify v11.0.2
- Axios v1.7.9

---

## License

MIT

---

## Support

For issues, questions, or contributions, please refer to the documentation files or contact the development team.

---

## Quick Reference

### Start Application
```bash
./start-admin.sh
```

### Stop Application
```bash
./stop-admin.sh
```

### Access URLs
- Frontend: http://localhost:5174
- Backend: http://localhost:4000
- Health: http://localhost:4000/health

### Default Login
- Email: admin@healthcare.com
- Password: Admin@123

### Database
- Host: 20.42.48.79
- Port: 5432
- Database: healthcare_portal
- User: healthcare_admin

---

**Built for MIT 572 Capstone Project** - Healthcare Administrative Management System with HIPAA Compliance
