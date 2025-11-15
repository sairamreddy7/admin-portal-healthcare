// Admin Portal Server
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { auditLogger } = require('./middleware/auditLogger');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const passwordResetRoutes = require('./routes/passwordResetRoutes');
const reportRoutes = require('./routes/reportRoutes');
const auditRoutes = require('./routes/auditRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const billingRoutes = require('./routes/billingRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const testResultRoutes = require('./routes/testResultRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5174'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - [ADMIN] ${req.method} ${req.path}`);
  next();
});

// Audit logging (HIPAA compliance)
app.use(auditLogger);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Healthcare Admin Portal API',
    version: '1.0.0',
    service: 'Admin Management System',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile'
      },
      userManagement: {
        getAllUsers: 'GET /api/users',
        createUser: 'POST /api/users',
        updateUser: 'PUT /api/users/:id',
        deleteUser: 'DELETE /api/users/:id'
      },
      doctorManagement: {
        getAllDoctors: 'GET /api/admin/doctors',
        createDoctor: 'POST /api/admin/doctors',
        updateDoctor: 'PUT /api/admin/doctors/:id',
        deleteDoctor: 'DELETE /api/admin/doctors/:id'
      },
      patientManagement: {
        getAllPatients: 'GET /api/admin/patients',
        updatePatient: 'PUT /api/admin/patients/:id',
        deletePatient: 'DELETE /api/admin/patients/:id'
      },
      systemSettings: {
        getSettings: 'GET /api/settings',
        updateSettings: 'PUT /api/settings'
      },
      reports: {
        getStatistics: 'GET /api/reports/statistics',
        getAppointmentReport: 'GET /api/reports/appointments'
      },
      auditLogs: {
        getLogs: 'GET /api/audit-logs'
      }
    }
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    database: 'unknown',
    memory: process.memoryUsage()
  };

  // Check database connectivity
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.database = 'connected';
  } catch (error) {
    health.database = 'disconnected';
    health.status = 'degraded';
    health.error = 'Database connection failed';
  } finally {
    await prisma.$disconnect();
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/test-results', testResultRoutes);
app.use('/api/messages', messageRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('===========================================');
  console.log('🏥 Healthcare Admin Portal API Server');
  console.log('===========================================');
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Local: http://localhost:${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/`);
  console.log('===========================================');
  console.log('Service Connections:');
  console.log(`  Doctor Service: ${process.env.DOCTOR_SERVICE_URL}`);
  console.log(`  Patient Service: ${process.env.PATIENT_SERVICE_URL}`);
  console.log('===========================================');
});

module.exports = app;
