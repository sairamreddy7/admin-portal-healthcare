const axios = require('axios');

const PATIENT_SERVICE_URL = process.env.PATIENT_SERVICE_URL || 'http://localhost:3000/api';
const API_KEY = process.env.PATIENT_SERVICE_API_KEY;

// Get all message threads
async function getAllThreads(req, res) {
  try {
    const { patientId, doctorId } = req.query;
    
    const params = new URLSearchParams();
    if (patientId) params.append('patientId', patientId);
    if (doctorId) params.append('doctorId', doctorId);

    const response = await axios.get(`${PATIENT_SERVICE_URL}/messages/threads?${params.toString()}`, {
      headers: {
        'x-api-key': API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching message threads:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch message threads',
      details: error.response?.data || error.message
    });
  }
}

// Get thread by ID with messages
async function getThreadById(req, res) {
  try {
    const { id } = req.params;
    
    // Fetch thread details and messages
    const [threadResponse, messagesResponse] = await Promise.all([
      axios.get(`${PATIENT_SERVICE_URL}/messages/threads/${id}`, {
        headers: { 'x-api-key': API_KEY }
      }),
      axios.get(`${PATIENT_SERVICE_URL}/messages/threads/${id}/messages`, {
        headers: { 'x-api-key': API_KEY }
      })
    ]);

    res.json({
      success: true,
      data: {
        thread: threadResponse.data?.data,
        messages: messagesResponse.data?.data || []
      }
    });
  } catch (error) {
    console.error('Error fetching thread:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch thread',
      details: error.response?.data || error.message
    });
  }
}

// Get message statistics
async function getMessageStats(req, res) {
  try {
    const response = await axios.get(`${PATIENT_SERVICE_URL}/messages/threads`, {
      headers: {
        'x-api-key': API_KEY
      }
    });

    const threads = response.data?.data || [];
    
    // Calculate statistics
    const totalThreads = threads.length;
    const activeThreads = threads.filter(t => t.status === 'ACTIVE').length;
    const closedThreads = threads.filter(t => t.status === 'CLOSED').length;

    // Today's messages
    const today = new Date().toISOString().split('T')[0];
    const todayThreads = threads.filter(t => {
      const tDate = new Date(t.lastMessageAt || t.createdAt).toISOString().split('T')[0];
      return tDate === today;
    }).length;

    res.json({
      success: true,
      data: {
        totalThreads,
        activeThreads,
        closedThreads,
        todayThreads
      }
    });
  } catch (error) {
    console.error('Error fetching message stats:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch message statistics',
      details: error.response?.data || error.message
    });
  }
}

module.exports = {
  getAllThreads,
  getThreadById,
  getMessageStats
};
