const axios = require('axios');

const PATIENT_SERVICE_URL = process.env.PATIENT_SERVICE_URL || 'http://localhost:3000/api';
const API_KEY = process.env.PATIENT_SERVICE_API_KEY;

// Get all invoices
async function getAllInvoices(req, res) {
  try {
    const { status, patientId, startDate, endDate } = req.query;
    
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (patientId) params.append('patientId', patientId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await axios.get(`${PATIENT_SERVICE_URL}/billing/invoices?${params.toString()}`, {
      headers: {
        'x-api-key': API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching invoices:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch invoices',
      details: error.response?.data || error.message
    });
  }
}

// Get invoice by ID
async function getInvoiceById(req, res) {
  try {
    const { id } = req.params;
    const response = await axios.get(`${PATIENT_SERVICE_URL}/billing/invoices/${id}`, {
      headers: {
        'x-api-key': API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching invoice:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch invoice',
      details: error.response?.data || error.message
    });
  }
}

// Get billing statistics
async function getBillingStats(req, res) {
  try {
    // Fetch all invoices to calculate stats
    const response = await axios.get(`${PATIENT_SERVICE_URL}/billing/invoices`, {
      headers: {
        'x-api-key': API_KEY
      }
    });

    const invoices = response.data?.data || [];
    
    // Calculate statistics
    const total = invoices.length;
    const paid = invoices.filter(inv => inv.status === 'PAID').length;
    const pending = invoices.filter(inv => inv.status === 'PENDING').length;
    const overdue = invoices.filter(inv => inv.status === 'OVERDUE').length;
    
    // Calculate revenue
    const totalRevenue = invoices
      .filter(inv => inv.status === 'PAID')
      .reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);
    
    const pendingAmount = invoices
      .filter(inv => inv.status === 'PENDING')
      .reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);
    
    const overdueAmount = invoices
      .filter(inv => inv.status === 'OVERDUE')
      .reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);

    // This month's revenue
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthRevenue = invoices
      .filter(inv => {
        const invDate = new Date(inv.createdAt);
        return inv.status === 'PAID' && 
               invDate.getMonth() === currentMonth && 
               invDate.getFullYear() === currentYear;
      })
      .reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);

    res.json({
      success: true,
      data: {
        total,
        paid,
        pending,
        overdue,
        totalRevenue: totalRevenue.toFixed(2),
        pendingAmount: pendingAmount.toFixed(2),
        overdueAmount: overdueAmount.toFixed(2),
        thisMonthRevenue: thisMonthRevenue.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error fetching billing stats:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch billing statistics',
      details: error.response?.data || error.message
    });
  }
}

module.exports = {
  getAllInvoices,
  getInvoiceById,
  getBillingStats
};
