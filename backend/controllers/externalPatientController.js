// backend/controllers/externalPatientController.js
const externalApi = require('../utils/externalApiClient');

/**
 * Controller for managing patients from external Doctor/Patient Portal
 * Acts as a proxy between Admin Portal and Patient Service
 */

/**
 * Get all patients
 * GET /api/external/patients
 */
async function getAllPatients(req, res) {
  try {
    const result = await externalApi.getPatients(req.query);

    if (!result.success) {
      return res.status(result.status || 500).json({
        success: false,
        error: result.error || 'Failed to fetch patients',
        message: result.message,
      });
    }

    return res.json(result.data);
  } catch (error) {
    console.error('Error fetching patients:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch patients from external service',
      message: error.message,
    });
  }
}

/**
 * Get patient by ID
 * GET /api/external/patients/:id
 */
async function getPatientById(req, res) {
  try {
    const { id } = req.params;
    const result = await externalApi.getPatientById(id);

    if (!result.success) {
      return res.status(result.status || 500).json({
        success: false,
        error: result.error || 'Failed to fetch patient',
        message: result.message,
      });
    }

    return res.json(result.data);
  } catch (error) {
    console.error('Error fetching patient:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch patient from external service',
      message: error.message,
    });
  }
}

/**
 * Create new patient
 * POST /api/external/patients
 */
async function createPatient(req, res) {
  try {
    const patientData = req.body;
    const result = await externalApi.createPatient(patientData);

    if (!result.success) {
      return res.status(result.status || 500).json({
        success: false,
        error: result.error || 'Failed to create patient',
        message: result.message,
        details: result.data,
      });
    }

    return res.status(201).json(result.data);
  } catch (error) {
    console.error('Error creating patient:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create patient in external service',
      message: error.message,
    });
  }
}

/**
 * Update patient
 * PUT /api/external/patients/:id
 */
async function updatePatient(req, res) {
  try {
    const { id } = req.params;
    const patientData = req.body;
    const result = await externalApi.updatePatient(id, patientData);

    if (!result.success) {
      return res.status(result.status || 500).json({
        success: false,
        error: result.error || 'Failed to update patient',
        message: result.message,
        details: result.data,
      });
    }

    return res.json(result.data);
  } catch (error) {
    console.error('Error updating patient:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update patient in external service',
      message: error.message,
    });
  }
}

/**
 * Delete patient
 * DELETE /api/external/patients/:id
 */
async function deletePatient(req, res) {
  try {
    const { id } = req.params;
    const result = await externalApi.deletePatient(id);

    if (!result.success) {
      return res.status(result.status || 500).json({
        success: false,
        error: result.error || 'Failed to delete patient',
        message: result.message,
      });
    }

    return res.json(result.data);
  } catch (error) {
    console.error('Error deleting patient:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete patient from external service',
      message: error.message,
    });
  }
}

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
};
