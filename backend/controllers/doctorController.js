const axios = require('axios');

const DOCTOR_SERVICE_URL = process.env.DOCTOR_SERVICE_URL || 'http://localhost:3000/api';
const PATIENT_SERVICE_URL = process.env.PATIENT_SERVICE_URL || 'http://localhost:3000/api';
const API_KEY = process.env.DOCTOR_SERVICE_API_KEY;

// Get all doctors from the doctor service
async function getAllDoctors(req, res) {
  try {
    const response = await axios.get(`${DOCTOR_SERVICE_URL}/doctors`, {
      headers: {
        'x-api-key': API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching doctors:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch doctors',
      details: error.response?.data || error.message
    });
  }
}

// Get doctor by ID
async function getDoctorById(req, res) {
  try {
    const { id } = req.params;
    const response = await axios.get(`${DOCTOR_SERVICE_URL}/doctors/${id}`, {
      headers: {
        'x-api-key': API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching doctor:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch doctor',
      details: error.response?.data || error.message
    });
  }
}

// Create new doctor
async function createDoctor(req, res) {
  try {
    const response = await axios.post(`${DOCTOR_SERVICE_URL}/auth/register`, {
      ...req.body,
      role: 'DOCTOR'
    }, {
      headers: {
        'x-api-key': API_KEY
      }
    });

    res.status(201).json(response.data);
  } catch (error) {
    console.error('Error creating doctor:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to create doctor',
      details: error.response?.data || error.message
    });
  }
}

// Update doctor profile
async function updateDoctor(req, res) {
  try {
    const { id } = req.params;
    const response = await axios.put(`${DOCTOR_SERVICE_URL}/doctors/${id}`, req.body, {
      headers: {
        'x-api-key': API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error updating doctor:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to update doctor',
      details: error.response?.data || error.message
    });
  }
}

// Delete doctor
async function deleteDoctor(req, res) {
  try {
    const { id } = req.params;
    const response = await axios.delete(`${DOCTOR_SERVICE_URL}/doctors/${id}`, {
      headers: {
        'x-api-key': API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error deleting doctor:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to delete doctor',
      details: error.response?.data || error.message
    });
  }
}

// Get doctor statistics
async function getDoctorStats(req, res) {
  try {
    const response = await axios.get(`${DOCTOR_SERVICE_URL}/doctors/stats`, {
      headers: {
        'x-api-key': API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching doctor stats:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch doctor statistics',
      details: error.response?.data || error.message
    });
  }
}

module.exports = {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorStats
};
