const express = require('express');
const router = express.Router();
const {
  getAllPrescriptions,
  getPrescriptionById,
  getPrescriptionStats
} = require('../controllers/prescriptionController');
const { authenticateAdmin } = require('../middleware/auth');

// All routes require admin authentication
router.use(authenticateAdmin);

// GET /api/prescriptions/stats - Get prescription statistics
router.get('/stats', getPrescriptionStats);

// GET /api/prescriptions - Get all prescriptions
router.get('/', getAllPrescriptions);

// GET /api/prescriptions/:id - Get prescription by ID
router.get('/:id', getPrescriptionById);

module.exports = router;
