const express = require('express');
const router = express.Router();
const {
  getAllAppointments,
  getAppointmentById,
  getAppointmentStats,
  cancelAppointment
} = require('../controllers/appointmentController');
const { authenticateAdmin } = require('../middleware/auth');

// All routes require admin authentication
router.use(authenticateAdmin);

// GET /api/appointments/stats - Get appointment statistics
router.get('/stats', getAppointmentStats);

// GET /api/appointments - Get all appointments with filters
router.get('/', getAllAppointments);

// GET /api/appointments/:id - Get appointment by ID
router.get('/:id', getAppointmentById);

// PATCH /api/appointments/:id/cancel - Cancel appointment
router.patch('/:id/cancel', cancelAppointment);

module.exports = router;
