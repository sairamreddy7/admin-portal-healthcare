const express = require('express');
const {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorStats
} = require('../controllers/doctorController');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require admin authentication
router.use(authenticateAdmin);

// GET /api/doctors/stats - Get doctor statistics
router.get('/stats', getDoctorStats);

// GET /api/doctors - Get all doctors
router.get('/', getAllDoctors);

// GET /api/doctors/:id - Get doctor by ID
router.get('/:id', getDoctorById);

// POST /api/doctors - Create new doctor
router.post('/', createDoctor);

// PUT /api/doctors/:id - Update doctor
router.put('/:id', updateDoctor);

// DELETE /api/doctors/:id - Delete doctor
router.delete('/:id', deleteDoctor);

module.exports = router;
