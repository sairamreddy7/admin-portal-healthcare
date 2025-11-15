const axios = require('axios');

const PATIENT_SERVICE_URL = process.env.PATIENT_SERVICE_URL || 'http://localhost:3000/api';
const API_KEY = process.env.PATIENT_SERVICE_API_KEY;

// Get all prescriptions
async function getAllPrescriptions(req, res) {
  try {
    const { patientId, doctorId, status } = req.query;
    
    const params = new URLSearchParams();
    if (patientId) params.append('patientId', patientId);
    if (doctorId) params.append('doctorId', doctorId);
    if (status) params.append('status', status);

    const response = await axios.get(`${PATIENT_SERVICE_URL}/medications?${params.toString()}`, {
      headers: {
        'x-api-key': API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching prescriptions:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch prescriptions',
      details: error.response?.data || error.message
    });
  }
}

// Get prescription by ID
async function getPrescriptionById(req, res) {
  try {
    const { id } = req.params;
    const response = await axios.get(`${PATIENT_SERVICE_URL}/medications/${id}`, {
      headers: {
        'x-api-key': API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching prescription:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch prescription',
      details: error.response?.data || error.message
    });
  }
}

// Get prescription statistics
async function getPrescriptionStats(req, res) {
  try {
    const response = await axios.get(`${PATIENT_SERVICE_URL}/medications`, {
      headers: {
        'x-api-key': API_KEY
      }
    });

    const prescriptions = response.data?.data || [];
    
    // Calculate statistics
    const total = prescriptions.length;
    const active = prescriptions.filter(p => p.status === 'ACTIVE').length;
    const completed = prescriptions.filter(p => p.status === 'COMPLETED').length;
    const cancelled = prescriptions.filter(p => p.status === 'CANCELLED').length;

    // This month's prescriptions
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthPrescriptions = prescriptions.filter(p => {
      const pDate = new Date(p.createdAt);
      return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
    }).length;

    res.json({
      success: true,
      data: {
        total,
        active,
        completed,
        cancelled,
        thisMonthPrescriptions
      }
    });
  } catch (error) {
    console.error('Error fetching prescription stats:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch prescription statistics',
      details: error.response?.data || error.message
    });
  }
}

module.exports = {
  getAllPrescriptions,
  getPrescriptionById,
  getPrescriptionStats
};
