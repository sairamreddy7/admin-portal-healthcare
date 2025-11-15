const axios = require('axios');

const PATIENT_SERVICE_URL = process.env.PATIENT_SERVICE_URL || 'http://localhost:3000/api';
const API_KEY = process.env.PATIENT_SERVICE_API_KEY;

// Get all test results
async function getAllTestResults(req, res) {
  try {
    const { patientId, status, testType } = req.query;
    
    const params = new URLSearchParams();
    if (patientId) params.append('patientId', patientId);
    if (status) params.append('status', status);
    if (testType) params.append('testType', testType);

    const response = await axios.get(`${PATIENT_SERVICE_URL}/test-results?${params.toString()}`, {
      headers: {
        'x-api-key': API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching test results:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch test results',
      details: error.response?.data || error.message
    });
  }
}

// Get test result by ID
async function getTestResultById(req, res) {
  try {
    const { id } = req.params;
    const response = await axios.get(`${PATIENT_SERVICE_URL}/test-results/${id}`, {
      headers: {
        'x-api-key': API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching test result:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch test result',
      details: error.response?.data || error.message
    });
  }
}

// Get test result statistics
async function getTestResultStats(req, res) {
  try {
    const response = await axios.get(`${PATIENT_SERVICE_URL}/test-results`, {
      headers: {
        'x-api-key': API_KEY
      }
    });

    const testResults = response.data?.data || [];
    
    // Calculate statistics
    const total = testResults.length;
    const pending = testResults.filter(t => t.status === 'PENDING').length;
    const completed = testResults.filter(t => t.status === 'COMPLETED').length;
    const reviewed = testResults.filter(t => t.status === 'REVIEWED').length;

    // This week's test results
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeekTests = testResults.filter(t => {
      const tDate = new Date(t.createdAt);
      return tDate >= oneWeekAgo;
    }).length;

    res.json({
      success: true,
      data: {
        total,
        pending,
        completed,
        reviewed,
        thisWeekTests
      }
    });
  } catch (error) {
    console.error('Error fetching test result stats:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch test result statistics',
      details: error.response?.data || error.message
    });
  }
}

module.exports = {
  getAllTestResults,
  getTestResultById,
  getTestResultStats
};
