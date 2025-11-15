const axios = require('axios');

const PATIENT_SERVICE_URL = process.env.PATIENT_SERVICE_URL || 'http://localhost:3000/api';
const API_KEY = process.env.PATIENT_SERVICE_API_KEY;

// Get all appointments with filters
async function getAllAppointments(req, res) {
  try {
    const { status, patientId, doctorId, date, startDate, endDate } = req.query;
    
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (patientId) params.append('patientId', patientId);
    if (doctorId) params.append('doctorId', doctorId);
    if (date) params.append('date', date);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await axios.get(`${PATIENT_SERVICE_URL}/appointments?${params.toString()}`, {
      headers: {
        'x-api-key': API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching appointments:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch appointments',
      details: error.response?.data || error.message
    });
  }
}

// Get appointment by ID
async function getAppointmentById(req, res) {
  try {
    const { id } = req.params;
    const response = await axios.get(`${PATIENT_SERVICE_URL}/appointments/${id}`, {
      headers: {
        'x-api-key': API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching appointment:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch appointment',
      details: error.response?.data || error.message
    });
  }
}

// Get appointment statistics
async function getAppointmentStats(req, res) {
  try {
    // Fetch all appointments to calculate stats
    const response = await axios.get(`${PATIENT_SERVICE_URL}/appointments`, {
      headers: {
        'x-api-key': API_KEY
      }
    });

    const appointments = response.data?.data || [];
    
    // Calculate statistics
    const total = appointments.length;
    const scheduled = appointments.filter(apt => apt.status === 'SCHEDULED').length;
    const completed = appointments.filter(apt => apt.status === 'COMPLETED').length;
    const cancelled = appointments.filter(apt => apt.status === 'CANCELLED').length;
    
    // Today's appointments
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate).toISOString().split('T')[0];
      return aptDate === today;
    }).length;

    // This month's appointments
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear;
    }).length;

    res.json({
      success: true,
      data: {
        total,
        scheduled,
        completed,
        cancelled,
        todayAppointments,
        thisMonthAppointments
      }
    });
  } catch (error) {
    console.error('Error fetching appointment stats:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch appointment statistics',
      details: error.response?.data || error.message
    });
  }
}

// Cancel appointment
async function cancelAppointment(req, res) {
  try {
    const { id } = req.params;
    const response = await axios.patch(
      `${PATIENT_SERVICE_URL}/appointments/${id}/cancel`,
      req.body,
      {
        headers: {
          'x-api-key': API_KEY
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error cancelling appointment:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to cancel appointment',
      details: error.response?.data || error.message
    });
  }
}

module.exports = {
  getAllAppointments,
  getAppointmentById,
  getAppointmentStats,
  cancelAppointment
};
