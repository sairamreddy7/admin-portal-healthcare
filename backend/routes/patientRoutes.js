const express = require('express');
const {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientStats
} = require('../controllers/patientController');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require admin authentication
router.use(authenticateAdmin);

// GET /api/patients/stats - Get patient statistics
router.get('/stats', getPatientStats);

// GET /api/patients - Get all patients
router.get('/', getAllPatients);

// GET /api/patients/:id - Get patient by ID
router.get('/:id', getPatientById);

// POST /api/patients - Create new patient
router.post('/', createPatient);

// PUT /api/patients/:id - Update patient
router.put('/:id', updatePatient);

// DELETE /api/patients/:id - Delete patient
router.delete('/:id', deletePatient);

module.exports = router;
