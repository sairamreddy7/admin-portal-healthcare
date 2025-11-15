const express = require('express');
const {
  generateUserReport,
  generateStatsReport,
  generateDoctorReport,
  generatePatientReport,
  generateAppointmentReport
} = require('../controllers/reportController');
const { authenticateAdmin } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// All routes require admin authentication
router.use(authenticateAdmin);

// Apply rate limiting
router.use(apiLimiter);

// GET /api/reports/users - Generate user list PDF report
router.get('/users', generateUserReport);

// GET /api/reports/statistics - Generate statistics PDF report
router.get('/statistics', generateStatsReport);

// GET /api/reports/doctors - Generate doctor list PDF report
router.get('/doctors', generateDoctorReport);

// GET /api/reports/patients - Generate patient list PDF report
router.get('/patients', generatePatientReport);

// GET /api/reports/appointments - Generate appointment PDF report
router.get('/appointments', generateAppointmentReport);

module.exports = router;
