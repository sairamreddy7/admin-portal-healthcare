// backend/controllers/externalAppointmentController.js
const externalApi = require('../utils/externalApiClient');

/**
 * Controller for managing appointments from external Doctor/Patient Portal
 * Acts as a proxy between Admin Portal and Appointment Service
 */

/**
 * Get all appointments with optional filters
 * GET /api/external/appointments
 * Query params: status, patientId, doctorId, date, page, limit
 */
async function getAllAppointments(req, res) {
  try {
    const result = await externalApi.getAppointments(req.query);

    if (!result.success) {
      return res.status(result.status || 500).json({
        success: false,
        error: result.error || 'Failed to fetch appointments',
        message: result.message,
      });
    }

    return res.json(result.data);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch appointments from external service',
      message: error.message,
    });
  }
}

/**
 * Get appointment by ID
 * GET /api/external/appointments/:id
 */
async function getAppointmentById(req, res) {
  try {
    const { id } = req.params;
    const result = await externalApi.getAppointmentById(id);

    if (!result.success) {
      return res.status(result.status || 500).json({
        success: false,
        error: result.error || 'Failed to fetch appointment',
        message: result.message,
      });
    }

    return res.json(result.data);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch appointment from external service',
      message: error.message,
    });
  }
}

/**
 * Create new appointment
 * POST /api/external/appointments
 */
async function createAppointment(req, res) {
  try {
    const appointmentData = req.body;
    const result = await externalApi.createAppointment(appointmentData);

    if (!result.success) {
      return res.status(result.status || 500).json({
        success: false,
        error: result.error || 'Failed to create appointment',
        message: result.message,
        details: result.data,
      });
    }

    return res.status(201).json(result.data);
  } catch (error) {
    console.error('Error creating appointment:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create appointment in external service',
      message: error.message,
    });
  }
}

/**
 * Update appointment
 * PUT /api/external/appointments/:id
 */
async function updateAppointment(req, res) {
  try {
    const { id } = req.params;
    const appointmentData = req.body;
    const result = await externalApi.updateAppointment(id, appointmentData);

    if (!result.success) {
      return res.status(result.status || 500).json({
        success: false,
        error: result.error || 'Failed to update appointment',
        message: result.message,
        details: result.data,
      });
    }

    return res.json(result.data);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update appointment in external service',
      message: error.message,
    });
  }
}

/**
 * Cancel appointment
 * PATCH /api/external/appointments/:id/cancel
 */
async function cancelAppointment(req, res) {
  try {
    const { id } = req.params;
    const result = await externalApi.cancelAppointment(id);

    if (!result.success) {
      return res.status(result.status || 500).json({
        success: false,
        error: result.error || 'Failed to cancel appointment',
        message: result.message,
      });
    }

    return res.json(result.data);
  } catch (error) {
    console.error('Error canceling appointment:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to cancel appointment in external service',
      message: error.message,
    });
  }
}

/**
 * Delete appointment
 * DELETE /api/external/appointments/:id
 */
async function deleteAppointment(req, res) {
  try {
    const { id } = req.params;
    const result = await externalApi.deleteAppointment(id);

    if (!result.success) {
      return res.status(result.status || 500).json({
        success: false,
        error: result.error || 'Failed to delete appointment',
        message: result.message,
      });
    }

    return res.json(result.data);
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete appointment from external service',
      message: error.message,
    });
  }
}

/**
 * Get appointment statistics
 * GET /api/external/appointments/stats
 */
async function getAppointmentStats(req, res) {
  try {
    // Get all appointments and calculate stats
    const result = await externalApi.getAppointments(req.query);

    if (!result.success) {
      return res.status(result.status || 500).json({
        success: false,
        error: result.error || 'Failed to fetch appointment statistics',
        message: result.message,
      });
    }

    const appointments = result.data.appointments || result.data || [];

    // Calculate statistics
    const stats = {
      total: appointments.length,
      byStatus: {},
      upcoming: 0,
      completed: 0,
      cancelled: 0,
    };

    const now = new Date();
    appointments.forEach((apt) => {
      // Count by status
      const status = apt.status || 'UNKNOWN';
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

      // Count by time
      if (status === 'COMPLETED') {
        stats.completed++;
      } else if (status === 'CANCELLED') {
        stats.cancelled++;
      } else if (new Date(apt.appointmentDate) > now) {
        stats.upcoming++;
      }
    });

    return res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching appointment statistics:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch appointment statistics',
      message: error.message,
    });
  }
}

module.exports = {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  deleteAppointment,
  getAppointmentStats,
};
