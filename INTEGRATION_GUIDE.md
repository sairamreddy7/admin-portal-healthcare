# Healthcare Portal Integration Guide

## Overview

This guide explains how to integrate the **Admin Portal** with the **Doctor/Patient Portal** to create a unified healthcare management system.

---

## System Architecture

The healthcare system consists of two main portals:

### 1. Admin Portal
- **Purpose**: Administrative management and oversight
- **Backend Port**: 4000
- **Frontend Port**: 5174
- **Features**:
  - Admin user management
  - Department management
  - Audit logging (HIPAA compliance)
  - System reporting
  - External service integration

### 2. Doctor/Patient Portal
- **Purpose**: Clinical operations and patient care
- **Backend Port**: 3000
- **Features**:
  - Patient management
  - Doctor profiles
  - Appointment scheduling
  - Medical records
  - Billing and payments
  - Prescriptions
  - Test results
  - Messaging

---

## Integration Architecture

The Admin Portal integrates with the Doctor/Patient Portal using:

1. **API Proxy Pattern**: Admin Portal proxies requests to external services
2. **API Key Authentication**: Service-to-service authentication
3. **RESTful APIs**: Standard HTTP/JSON communication
4. **Health Monitoring**: Cross-service health checks

```
┌─────────────────────┐
│   Admin Portal      │
│   (Port 4000)       │
│                     │
│  ┌───────────────┐  │
│  │ External API  │  │──────┐
│  │ Client        │  │      │
│  └───────────────┘  │      │
└─────────────────────┘      │
                             │ HTTP/REST
                             │ API Keys
                             ▼
                    ┌─────────────────────┐
                    │ Doctor/Patient      │
                    │ Portal (Port 3000)  │
                    │                     │
                    │  - Appointments     │
                    │  - Patients         │
                    │  - Doctors          │
                    │  - Billing          │
                    └─────────────────────┘
```

---

## Setup Instructions

### Step 1: Directory Structure

Ensure both portals are in the correct location:

```
/home/user/
├── admin-portal-healthcare/          # This repository
│   ├── backend/
│   ├── frontend/
│   ├── start-all.sh
│   └── stop-all.sh
└── capstone-helath-care-portal-latest/  # Doctor/Patient Portal
    ├── backend/
    └── frontend/
```

### Step 2: Configure Environment Variables

#### Admin Portal Backend (.env)

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-min-32-characters

# API Keys for Service Communication
DOCTOR_SERVICE_API_KEY=doctor_api_key_abc123xyz789_unique_string
PATIENT_SERVICE_API_KEY=patient_api_key_def456uvw012_unique_string
ADMIN_SERVICE_API_KEY=admin_api_key_xyz789abc123_unique_string

# External Service URLs
DOCTOR_SERVICE_URL=http://localhost:3000/api
PATIENT_SERVICE_URL=http://localhost:3000/api

# External API Configuration
EXTERNAL_API_TIMEOUT=10000

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/healthcare_portal?schema=public"

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
FRONTEND_URL=http://localhost:5174

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Session
SESSION_TIMEOUT=30m
TOKEN_EXPIRY=8h

# HIPAA Compliance
AUDIT_LOG_RETENTION_DAYS=2555
```

#### Doctor/Patient Portal Backend (.env)

The Doctor/Patient Portal needs to accept API key authentication from the Admin Portal.

Add these to your Doctor/Patient Portal backend middleware:

```javascript
// In your Doctor/Patient Portal backend
// middleware/apiKeyAuth.js

function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (apiKey && apiKey === process.env.ADMIN_SERVICE_API_KEY) {
    req.serviceType = 'ADMIN_SERVICE';
    return next();
  }

  // Continue with normal authentication
  next();
}

// Apply to routes that Admin Portal needs to access
router.use(validateApiKey);
```

### Step 3: Generate API Keys

Generate secure API keys for service communication:

```bash
cd admin-portal-healthcare/backend

# Generate random API keys
node -e "console.log('DOCTOR_SERVICE_API_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('PATIENT_SERVICE_API_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('ADMIN_SERVICE_API_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
```

Update both `.env` files with the same API keys.

### Step 4: Database Setup

Both portals can share the same database or use separate databases.

#### Option A: Shared Database (Recommended)

```bash
# Create single database
psql -U postgres

CREATE DATABASE healthcare_portal;
CREATE USER healthcare_admin WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE healthcare_portal TO healthcare_admin;

\c healthcare_portal
GRANT ALL ON SCHEMA public TO healthcare_admin;
\q

# Run migrations for both portals
cd admin-portal-healthcare/backend
npx prisma migrate dev

cd ../../capstone-helath-care-portal-latest/backend
npx prisma migrate dev
```

#### Option B: Separate Databases

```bash
# Create two databases
psql -U postgres

CREATE DATABASE healthcare_admin;
CREATE DATABASE healthcare_portal;

# Configure each portal with its own DATABASE_URL
```

---

## Running the Integrated System

### Option 1: Use Unified Startup Script (Recommended)

```bash
cd admin-portal-healthcare

# Start all services
./start-all.sh

# This will start:
# 1. Doctor/Patient Portal Backend (port 3000)
# 2. Doctor/Patient Portal Frontend
# 3. Admin Portal Backend (port 4000)
# 4. Admin Portal Frontend (port 5174)
```

**Access the applications**:
- Admin Portal: http://localhost:5174
- Doctor/Patient Portal: http://localhost:3000 (or configured port)
- Admin API: http://localhost:4000
- Health Check: http://localhost:4000/health

**Stop all services**:
```bash
./stop-all.sh
```

### Option 2: Start Services Manually

**Terminal 1 - Doctor/Patient Backend**:
```bash
cd capstone-helath-care-portal-latest/backend
npm run dev
```

**Terminal 2 - Doctor/Patient Frontend**:
```bash
cd capstone-helath-care-portal-latest/frontend
npm run dev
```

**Terminal 3 - Admin Portal Backend**:
```bash
cd admin-portal-healthcare/backend
npm run dev
```

**Terminal 4 - Admin Portal Frontend**:
```bash
cd admin-portal-healthcare/frontend
npm run dev
```

---

## API Integration Endpoints

The Admin Portal provides proxy endpoints to access Doctor/Patient Portal data.

### Base URL
```
http://localhost:4000/api/external
```

### Authentication
All external API endpoints require JWT authentication from the Admin Portal.

```bash
# Login to Admin Portal
POST http://localhost:4000/api/auth/login
{
  "email": "admin@healthcare.com",
  "password": "Admin@123"
}

# Use the returned token
Authorization: Bearer <token>
```

### Available Endpoints

#### Doctors

```bash
# Get all doctors (simple list)
GET /api/external/doctors

# Get paginated doctors
GET /api/external/doctors/paginated?page=1&limit=10&search=john

# Get doctor by ID
GET /api/external/doctors/:id

# Create doctor
POST /api/external/doctors
{
  "name": "Dr. John Smith",
  "specialization": "Cardiology",
  "email": "john@example.com"
}

# Update doctor
PUT /api/external/doctors/:id
{
  "name": "Dr. John Smith Sr."
}

# Delete doctor
DELETE /api/external/doctors/:id
```

#### Patients

```bash
# Get all patients
GET /api/external/patients?page=1&limit=10

# Get patient by ID
GET /api/external/patients/:id

# Create patient
POST /api/external/patients
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "dateOfBirth": "1990-01-01"
}

# Update patient
PUT /api/external/patients/:id

# Delete patient
DELETE /api/external/patients/:id
```

#### Appointments

```bash
# Get all appointments
GET /api/external/appointments?status=SCHEDULED&date=2025-11-15

# Get appointment statistics
GET /api/external/appointments/stats

# Get appointment by ID
GET /api/external/appointments/:id

# Create appointment
POST /api/external/appointments
{
  "patientId": "uuid",
  "doctorId": "uuid",
  "appointmentDate": "2025-11-20T10:00:00Z",
  "reason": "Check-up"
}

# Update appointment
PUT /api/external/appointments/:id

# Cancel appointment
PATCH /api/external/appointments/:id/cancel

# Delete appointment
DELETE /api/external/appointments/:id
```

---

## Frontend Integration

### Fetching External Data in Admin Portal

```javascript
// frontend/src/services/externalApi.js

const API_BASE_URL = 'http://localhost:4000/api/external';

export async function getDoctors() {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/doctors`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch doctors');
  }

  return response.json();
}

export async function getPatients(params = {}) {
  const token = localStorage.getItem('token');
  const queryString = new URLSearchParams(params).toString();

  const response = await fetch(`${API_BASE_URL}/patients?${queryString}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  return response.json();
}

export async function getAppointmentStats() {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/appointments/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  return response.json();
}
```

### Example React Component

```javascript
// frontend/src/pages/ExternalDoctors.jsx

import { useState, useEffect } from 'react';
import { getDoctors } from '../services/externalApi';
import { showToast } from '../utils/toast';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ExternalDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDoctors();
  }, []);

  async function loadDoctors() {
    try {
      setLoading(true);
      const data = await getDoctors();
      setDoctors(data.doctors || data);
      showToast.success('Doctors loaded successfully');
    } catch (error) {
      showToast.error('Failed to load doctors: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading doctors..." />;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Doctors (External)</h1>
      <div className="grid gap-4">
        {doctors.map(doctor => (
          <div key={doctor.id} className="border p-4 rounded">
            <h3 className="font-semibold">{doctor.name}</h3>
            <p className="text-gray-600">{doctor.specialization}</p>
            <p className="text-sm text-gray-500">{doctor.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Health Monitoring

### Check System Health

```bash
curl http://localhost:4000/health
```

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-11-15T10:00:00.000Z",
  "uptime": 3600.5,
  "environment": "development",
  "version": "1.0.0",
  "database": "connected",
  "externalServices": {
    "doctorService": {
      "available": true,
      "responseTime": 45
    },
    "patientService": {
      "available": true,
      "responseTime": 38
    }
  }
}
```

### Status Codes

- `200`: All systems operational
- `503`: System degraded (database or external services unavailable)

---

## Error Handling

### External Service Errors

When the Doctor/Patient Portal is unavailable, the Admin Portal returns graceful errors:

```json
{
  "success": false,
  "error": "External API Error",
  "service": "http://localhost:3000/api",
  "endpoint": "/doctors",
  "status": 503,
  "message": "Service unavailable - No response from external service"
}
```

### Frontend Error Handling

```javascript
try {
  const doctors = await getDoctors();
} catch (error) {
  if (error.message.includes('503')) {
    showToast.error('Doctor/Patient Portal is currently unavailable');
  } else {
    showToast.error('Failed to load doctors: ' + error.message);
  }
}
```

---

## Security Considerations

### API Key Security

1. **Never commit API keys** to version control
2. **Use strong random keys** (32+ bytes)
3. **Rotate keys regularly** (every 90 days recommended)
4. **Use environment variables** for all secrets
5. **Different keys for each environment** (dev, staging, production)

### Network Security

For production:

1. **Use HTTPS** for all API communications
2. **Implement API Gateway** for better security
3. **Use VPN or private network** for service-to-service communication
4. **Rate limiting** on all endpoints (already implemented)
5. **IP whitelisting** for admin access

### Authentication

- Admin Portal uses **JWT tokens** for user authentication
- External services use **API keys** for service-to-service auth
- Both can be used simultaneously (optional API key middleware)

---

## Troubleshooting

### External Service Connection Failed

**Error**: `Service unavailable - No response from external service`

**Solutions**:
1. Verify Doctor/Patient Portal is running on port 3000
2. Check `DOCTOR_SERVICE_URL` and `PATIENT_SERVICE_URL` in `.env`
3. Ensure API keys match in both portals
4. Check firewall/network settings

### API Key Invalid

**Error**: `Invalid API key`

**Solutions**:
1. Verify API keys match in both `.env` files
2. Ensure `X-API-Key` header is being sent
3. Check middleware is properly configured
4. Restart both services after changing API keys

### CORS Errors

**Error**: `Access to XMLHttpRequest has been blocked by CORS policy`

**Solutions**:
1. Add frontend URL to `ALLOWED_ORIGINS` in backend `.env`
2. Restart backend server
3. Clear browser cache

### Port Already in Use

**Error**: `Port 4000 is already in use`

**Solutions**:
```bash
# Find process using port
lsof -ti:4000

# Kill the process
kill -9 $(lsof -ti:4000)

# Or change port in .env
PORT=4001
```

---

## Production Deployment

### Docker Compose Setup

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: healthcare_portal
      POSTGRES_USER: healthcare_admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  doctor-patient-backend:
    build: ./capstone-helath-care-portal-latest/backend
    environment:
      DATABASE_URL: ${DATABASE_URL}
      ADMIN_SERVICE_API_KEY: ${ADMIN_SERVICE_API_KEY}
    ports:
      - "3000:3000"
    depends_on:
      - postgres

  admin-backend:
    build: ./admin-portal-healthcare/backend
    environment:
      DATABASE_URL: ${DATABASE_URL}
      DOCTOR_SERVICE_URL: http://doctor-patient-backend:3000/api
      DOCTOR_SERVICE_API_KEY: ${DOCTOR_SERVICE_API_KEY}
    ports:
      - "4000:4000"
    depends_on:
      - postgres
      - doctor-patient-backend

  admin-frontend:
    build: ./admin-portal-healthcare/frontend
    ports:
      - "5174:80"
    depends_on:
      - admin-backend

volumes:
  postgres_data:
```

### Environment Variables for Production

```env
# Use secure values!
JWT_SECRET=<64-character-random-string>
DOCTOR_SERVICE_API_KEY=<64-character-random-string>
PATIENT_SERVICE_API_KEY=<64-character-random-string>
ADMIN_SERVICE_API_KEY=<64-character-random-string>

DATABASE_URL=postgresql://user:pass@postgres:5432/healthcare_portal

NODE_ENV=production
DOCTOR_SERVICE_URL=https://api.healthcare.com/doctor
PATIENT_SERVICE_URL=https://api.healthcare.com/patient
```

---

## API Rate Limits

### Admin Portal

- **Authentication**: 5 requests / 15 minutes
- **User Creation**: 10 requests / hour
- **General API**: 100 requests / 15 minutes
- **External API**: 1000 requests / 15 minutes (service-to-service)

### Handling Rate Limits

```javascript
if (error.status === 429) {
  showToast.error('Too many requests. Please try again later.');
  // Implement exponential backoff
  await new Promise(resolve => setTimeout(resolve, 60000));
}
```

---

## Monitoring and Logging

### Log Files

When using `start-all.sh`, logs are written to:

- `admin-backend.log` - Admin Portal backend logs
- `admin-frontend.log` - Admin Portal frontend logs
- `doctor-patient-backend.log` - Doctor/Patient Portal backend logs
- `doctor-patient-frontend.log` - Doctor/Patient Portal frontend logs

### View Logs

```bash
# Tail admin backend logs
tail -f admin-backend.log

# Search for errors
grep -i error admin-backend.log

# View last 100 lines
tail -n 100 admin-backend.log
```

### Audit Logging

All API requests are logged to the database for HIPAA compliance:

```bash
# View recent audit logs
curl -H "Authorization: Bearer <token>" \
  http://localhost:4000/api/audit-logs

# Filter by action
curl -H "Authorization: Bearer <token>" \
  "http://localhost:4000/api/audit-logs?action=CREATE&resource=doctor"
```

---

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review log files for error details
3. Verify environment configuration
4. Ensure all services are running
5. Check database connectivity

---

## Summary

The integration enables:

- ✅ Unified management of doctors, patients, and appointments
- ✅ Centralized admin oversight
- ✅ HIPAA-compliant audit logging
- ✅ Service-to-service API communication
- ✅ Health monitoring across all services
- ✅ Secure API key authentication
- ✅ Easy startup with unified scripts

**Quick Start**:
```bash
./start-all.sh
# Visit http://localhost:5174
# Login with admin@healthcare.com / Admin@123
```
