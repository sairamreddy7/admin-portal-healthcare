const express = require('express');
const router = express.Router();
const {
  getAllInvoices,
  getInvoiceById,
  getBillingStats
} = require('../controllers/billingController');
const { authenticateAdmin } = require('../middleware/auth');

// All routes require admin authentication
router.use(authenticateAdmin);

// GET /api/billing/stats - Get billing statistics
router.get('/stats', getBillingStats);

// GET /api/billing/invoices - Get all invoices
router.get('/invoices', getAllInvoices);

// GET /api/billing/invoices/:id - Get invoice by ID
router.get('/invoices/:id', getInvoiceById);

module.exports = router;
