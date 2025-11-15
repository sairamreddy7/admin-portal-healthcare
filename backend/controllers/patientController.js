const axios = require('axios');

const PATIENT_SERVICE_URL = process.env.PATIENT_SERVICE_URL || 'http://localhost:3000/api';
const API_KEY = process.env.PATIENT_SERVICE_API_KEY;

// Get all patients from the patient service
async function getAllPatients(req, res) {
  try {
    const response = await axios.get(`${PATIENT_SERVICE_URL}/patients`, {
      headers: {
        'x-api-key': API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching patients:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch patients',
      details: error.response?.data || error.message
    });
  }
}

// Get patient by ID
async function getPatientById(req, res) {
  try {
    const { id } = req.params;
    const response = await axios.get(`${PATIENT_SERVICE_URL}/patients/${id}`, {
      headers: {
        'x-api-key': API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching patient:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch patient',
      details: error.response?.data || error.message
    });
  }
}

// Create new patient
async function createPatient(req, res) {
  try {
    const response = await axios.post(`${PATIENT_SERVICE_URL}/auth/register`, {
      ...req.body,
      role: 'PATIENT'
    }, {
      headers: {
        'x-api-key': API_KEY
      }
    });

    res.status(201).json(response.data);
  } catch (error) {
    console.error('Error creating patient:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to create patient',
      details: error.response?.data || error.message
    });
  }
}

// Update patient profile
async function updatePatient(req, res) {
  try {
    const { id } = req.params;
    const response = await axios.put(`${PATIENT_SERVICE_URL}/patients/${id}`, req.body, {
      headers: {
        'x-api-key': API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error updating patient:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to update patient',
      details: error.response?.data || error.message
    });
  }
}

// Delete patient
async function deletePatient(req, res) {
  try {
    const { id } = req.params;
    const response = await axios.delete(`${PATIENT_SERVICE_URL}/patients/${id}`, {
      headers: {
        'x-api-key': API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error deleting patient:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to delete patient',
      details: error.response?.data || error.message
    });
  }
}

// Get patient statistics
async function getPatientStats(req, res) {
  try {
    const response = await axios.get(`${PATIENT_SERVICE_URL}/patients/stats`, {
      headers: {
        'x-api-key': API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching patient stats:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch patient statistics',
      details: error.response?.data || error.message
    });
  }
}

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientStats
};
