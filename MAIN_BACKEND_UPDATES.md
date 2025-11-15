# Main Backend Updates Required for Admin Service Integration

## Overview

The main backend needs to be updated to accept API key-authenticated requests from the admin service.

## Location

Main backend: `/Users/reethuchada/Documents/capstone-helath-care-portal-latest/backend`

## Required Changes

### 1. Update `.env` File

**File:** `/backend/.env`

Add this line:
```env
# API Key for Admin Service
ADMIN_SERVICE_API_KEY=b24691bf5dd3e8cf77c6d214ba879261b977dd553cd822e23f87f5381acf9f8e
```

### 2. Create API Key Middleware

**File:** `/backend/middleware/apiKeyAuth.js` (CREATE NEW FILE)

```javascript
function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  // If no API key provided, continue with regular JWT auth
  if (!apiKey) {
    return next();
  }
  
  // Validate API key
  if (apiKey === process.env.ADMIN_SERVICE_API_KEY) {
    req.serviceAuth = true;
    req.fromService = 'ADMIN';
    req.bypassAuth = true; // Skip JWT auth for service calls
    return next();
  }
  
  // Invalid API key
  return res.status(403).json({ error: 'Invalid API key' });
}

module.exports = { validateApiKey };
```

### 3. Update Doctor Routes

**File:** `/backend/routes/doctorRoutes.js`

```javascript
const { validateApiKey } = require('../middleware/apiKeyAuth');
const { authenticateToken } = require('../middleware/auth');

// Modify authentication to allow API key OR JWT
function allowServiceOrUser(req, res, next) {
  // If service auth (via API key), skip to next
  if (req.serviceAuth) {
    return next();
  }
  // Otherwise, require JWT
  return authenticateToken(req, res, next);
}

// Update routes
router.get('/', validateApiKey, allowServiceOrUser, getAllDoctors);
router.get('/stats', validateApiKey, allowServiceOrUser, getDoctorStats);
router.get('/:id', validateApiKey, allowServiceOrUser, getDoctorById);
router.put('/:id', validateApiKey, allowServiceOrUser, updateDoctor);
router.delete('/:id', validateApiKey, allowServiceOrUser, deleteDoctor);
```

### 4. Update Patient Routes

**File:** `/backend/routes/patientRoutes.js`

```javascript
const { validateApiKey } = require('../middleware/apiKeyAuth');
const { authenticateToken } = require('../middleware/auth');

// Modify authentication to allow API key OR JWT
function allowServiceOrUser(req, res, next) {
  // If service auth (via API key), skip to next
  if (req.serviceAuth) {
    return next();
  }
  // Otherwise, require JWT
  return authenticateToken(req, res, next);
}

// Update routes
router.get('/', validateApiKey, allowServiceOrUser, getAllPatients);
router.get('/stats', validateApiKey, allowServiceOrUser, getPatientStats);
router.get('/:id', validateApiKey, allowServiceOrUser, getPatientById);
router.put('/:id', validateApiKey, allowServiceOrUser, updatePatient);
router.delete('/:id', validateApiKey, allowServiceOrUser, deletePatient);
```

### 5. Add Stats Endpoints (if not exist)

**File:** `/backend/controllers/doctorController.js`

Add this function if it doesn't exist:

```javascript
async function getDoctorStats(req, res) {
  try {
    const totalDoctors = await prisma.doctor.count();
    const doctorsBySpecialization = await prisma.doctor.groupBy({
      by: ['specialization'],
      _count: true
    });

    res.json({
      total: totalDoctors,
      bySpecialization: doctorsBySpecialization
    });
  } catch (error) {
    console.error('Error fetching doctor stats:', error);
    res.status(500).json({ error: 'Failed to fetch doctor statistics' });
  }
}

module.exports = {
  // ... existing exports
  getDoctorStats
};
```

**File:** `/backend/controllers/patientController.js`

Add this function if it doesn't exist:

```javascript
async function getPatientStats(req, res) {
  try {
    const totalPatients = await prisma.patient.count();
    const patientsByGender = await prisma.patient.groupBy({
      by: ['gender'],
      _count: true
    });

    res.json({
      total: totalPatients,
      byGender: patientsByGender
    });
  } catch (error) {
    console.error('Error fetching patient stats:', error);
    res.status(500).json({ error: 'Failed to fetch patient statistics' });
  }
}

module.exports = {
  // ... existing exports
  getPatientStats
};
```

## Quick Setup Script

Create a file `/backend/setup-admin-integration.sh`:

```bash
#!/bin/bash

echo "Setting up Admin Service Integration..."

# Add API key to .env
echo "" >> .env
echo "# API Key for Admin Service" >> .env
echo "ADMIN_SERVICE_API_KEY=b24691bf5dd3e8cf77c6d214ba879261b977dd553cd822e23f87f5381acf9f8e" >> .env

echo "✅ Added API key to .env"
echo "⚠️  Please manually create the apiKeyAuth.js middleware file"
echo "⚠️  Please manually update doctor and patient routes"
echo "⚠️  Restart the main backend server after changes"
```

Make it executable and run:
```bash
chmod +x /backend/setup-admin-integration.sh
./setup-admin-integration.sh
```

## Testing the Integration

### 1. Restart Main Backend

```bash
cd /Users/reethuchada/Documents/capstone-helath-care-portal-latest/backend
# Kill existing process
pkill -f "node server.js"
# Start again
npm start
```

### 2. Test from Admin Service

With admin backend running on port 4000, login and get a token:

```bash
# Login as admin
TOKEN=$(curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@healthcare.com", "password": "Admin@123"}' \
  | jq -r '.token')

# Test getting all doctors through admin service
curl http://localhost:4000/api/doctors \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Verify API Key is Used

Check the main backend logs. When the admin service calls the main backend, it should include the `x-api-key` header.

## Security Notes

1. **API Key Rotation**: If the API key is compromised:
   ```bash
   # Generate new key
   cd /admin-portal-healthcare/backend
   npm run generate-api-key
   
   # Update both .env files
   # Restart both servers
   ```

2. **Environment Variables**: Never commit `.env` files to git:
   ```bash
   # Ensure .gitignore includes
   .env
   .env.local
   ```

3. **Production**: In production, use different API keys than development.

## Verification Checklist

- [ ] API key added to main backend `.env`
- [ ] API key middleware created (`middleware/apiKeyAuth.js`)
- [ ] Doctor routes updated to accept API key
- [ ] Patient routes updated to accept API key
- [ ] Stats endpoints added to controllers (if missing)
- [ ] Main backend restarted
- [ ] Admin service can successfully call main backend
- [ ] Regular JWT authentication still works for frontend

## Troubleshooting

### Admin Service Can't Connect to Main Backend

**Check 1:** Is main backend running on port 3000?
```bash
curl http://localhost:3000/
```

**Check 2:** Is API key correct in both .env files?
```bash
# Admin backend .env
grep DOCTOR_SERVICE_API_KEY /admin-portal-healthcare/backend/.env

# Main backend .env
grep ADMIN_SERVICE_API_KEY /capstone-helath-care-portal-latest/backend/.env
```

**Check 3:** Are the API keys matching?
They should be the same value!

### 403 Forbidden Errors

This means the API key is invalid or not being sent correctly.

**Check:** Look at admin backend logs to see what API key is being sent:
```bash
# In doctorController.js or patientController.js
console.log('Using API Key:', process.env.DOCTOR_SERVICE_API_KEY);
```

## Complete Example: Update Doctor Routes

**Before:**
```javascript
// routes/doctorRoutes.js
router.get('/', authenticateToken, getAllDoctors);
```

**After:**
```javascript
// routes/doctorRoutes.js
const { validateApiKey } = require('../middleware/apiKeyAuth');

function allowServiceOrUser(req, res, next) {
  if (req.serviceAuth) return next();
  return authenticateToken(req, res, next);
}

router.get('/', validateApiKey, allowServiceOrUser, getAllDoctors);
```

## Summary

This integration allows:
- ✅ Admin service to manage doctors and patients via API keys
- ✅ Regular frontend to continue using JWT authentication
- ✅ Secure service-to-service communication
- ✅ Independent deployment of admin and main services

**API Key:** `b24691bf5dd3e8cf77c6d214ba879261b977dd553cd822e23f87f5381acf9f8e`

Add this to the main backend `.env` and update the routes as shown above!
