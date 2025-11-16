// backend/routes/externalRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { apiKeyRateLimiter } = require('../middleware/apiKeyAuth');

// Import controllers
const doctorController = require('../controllers/externalDoctorController');
const patientController = require('../controllers/externalPatientController');
const appointmentController = require('../controllers/externalAppointmentController');

// All routes require authentication
router.use(authenticateToken);

// Apply rate limiting for external API calls
router.use(apiKeyRateLimiter);

// ==================== Doctor Routes ====================

// Get all doctors (simple list)
router.get('/doctors', doctorController.getAllDoctors);

// Get paginated doctors
router.get('/doctors/paginated', doctorController.getDoctorsPaginated);

// Get doctor by ID
router.get('/doctors/:id', doctorController.getDoctorById);

// Create doctor (admin only)
router.post('/doctors', doctorController.createDoctor);

// Update doctor (admin only)
router.put('/doctors/:id', doctorController.updateDoctor);

// Delete doctor (admin only)
router.delete('/doctors/:id', doctorController.deleteDoctor);

// ==================== Patient Routes ====================

// Get all patients
router.get('/patients', patientController.getAllPatients);

// Get patient by ID
router.get('/patients/:id', patientController.getPatientById);

// Create patient (admin only)
router.post('/patients', patientController.createPatient);

// Update patient (admin only)
router.put('/patients/:id', patientController.updatePatient);

// Delete patient (admin only)
router.delete('/patients/:id', patientController.deletePatient);

// ==================== Appointment Routes ====================

// Get appointment statistics (should be before /:id route)
router.get('/appointments/stats', appointmentController.getAppointmentStats);

// Get all appointments
router.get('/appointments', appointmentController.getAllAppointments);

// Get appointment by ID
router.get('/appointments/:id', appointmentController.getAppointmentById);

// Create appointment
router.post('/appointments', appointmentController.createAppointment);

// Update appointment
router.put('/appointments/:id', appointmentController.updateAppointment);

// Cancel appointment
router.patch('/appointments/:id/cancel', appointmentController.cancelAppointment);

// Delete appointment (admin only)
router.delete('/appointments/:id', appointmentController.deleteAppointment);

module.exports = router;
