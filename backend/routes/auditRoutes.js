const express = require('express');
const {
  getAllAuditLogs,
  getAuditLogById,
  getAuditStatistics,
  getUserActivity,
  deleteOldAuditLogs
} = require('../controllers/auditController');
const { authenticateAdmin } = require('../middleware/auth');
const { validateUUID } = require('../middleware/validation');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// All routes require admin authentication
router.use(authenticateAdmin);

// Apply rate limiting
router.use(apiLimiter);

// GET /api/audit-logs - Get all audit logs with pagination and filtering
router.get('/', getAllAuditLogs);

// GET /api/audit-logs/statistics - Get audit statistics
router.get('/statistics', getAuditStatistics);

// GET /api/audit-logs/user/:userId - Get user activity logs
router.get('/user/:userId', validateUUID('userId'), getUserActivity);

// GET /api/audit-logs/:id - Get audit log by ID
router.get('/:id', validateUUID('id'), getAuditLogById);

// DELETE /api/audit-logs/cleanup - Delete old audit logs (data retention)
router.delete('/cleanup', deleteOldAuditLogs);

module.exports = router;
