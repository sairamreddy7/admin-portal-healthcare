// backend/controllers/externalDoctorController.js
const externalApi = require('../utils/externalApiClient');

/**
 * Controller for managing doctors from external Doctor/Patient Portal
 * Acts as a proxy between Admin Portal and Doctor/Patient Service
 */

/**
 * Get all doctors (simple list for dropdowns)
 * GET /api/external/doctors
 */
async function getAllDoctors(req, res) {
  try {
    const result = await externalApi.getDoctors(req.query);

    if (!result.success) {
      return res.status(result.status || 500).json({
        success: false,
        error: result.error || 'Failed to fetch doctors',
        message: result.message,
      });
    }

    return res.json(result.data);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch doctors from external service',
      message: error.message,
    });
  }
}

/**
 * Get paginated doctors list with search
 * GET /api/external/doctors/paginated
 */
async function getDoctorsPaginated(req, res) {
  try {
    const result = await externalApi.getDoctorsPaginated(req.query);

    if (!result.success) {
      return res.status(result.status || 500).json({
        success: false,
        error: result.error || 'Failed to fetch doctors',
        message: result.message,
      });
    }

    return res.json(result.data);
  } catch (error) {
    console.error('Error fetching paginated doctors:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch doctors from external service',
      message: error.message,
    });
  }
}

/**
 * Get doctor by ID
 * GET /api/external/doctors/:id
 */
async function getDoctorById(req, res) {
  try {
    const { id } = req.params;
    const result = await externalApi.getDoctorById(id);

    if (!result.success) {
      return res.status(result.status || 500).json({
        success: false,
        error: result.error || 'Failed to fetch doctor',
        message: result.message,
      });
    }

    return res.json(result.data);
  } catch (error) {
    console.error('Error fetching doctor:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch doctor from external service',
      message: error.message,
    });
  }
}

/**
 * Create new doctor
 * POST /api/external/doctors
 */
async function createDoctor(req, res) {
  try {
    const doctorData = req.body;
    const result = await externalApi.createDoctor(doctorData);

    if (!result.success) {
      return res.status(result.status || 500).json({
        success: false,
        error: result.error || 'Failed to create doctor',
        message: result.message,
        details: result.data,
      });
    }

    return res.status(201).json(result.data);
  } catch (error) {
    console.error('Error creating doctor:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create doctor in external service',
      message: error.message,
    });
  }
}

/**
 * Update doctor
 * PUT /api/external/doctors/:id
 */
async function updateDoctor(req, res) {
  try {
    const { id } = req.params;
    const doctorData = req.body;
    const result = await externalApi.updateDoctor(id, doctorData);

    if (!result.success) {
      return res.status(result.status || 500).json({
        success: false,
        error: result.error || 'Failed to update doctor',
        message: result.message,
        details: result.data,
      });
    }

    return res.json(result.data);
  } catch (error) {
    console.error('Error updating doctor:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update doctor in external service',
      message: error.message,
    });
  }
}

/**
 * Delete doctor
 * DELETE /api/external/doctors/:id
 */
async function deleteDoctor(req, res) {
  try {
    const { id } = req.params;
    const result = await externalApi.deleteDoctor(id);

    if (!result.success) {
      return res.status(result.status || 500).json({
        success: false,
        error: result.error || 'Failed to delete doctor',
        message: result.message,
      });
    }

    return res.json(result.data);
  } catch (error) {
    console.error('Error deleting doctor:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete doctor from external service',
      message: error.message,
    });
  }
}

module.exports = {
  getAllDoctors,
  getDoctorsPaginated,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
};
