const express = require('express');
const router = express.Router();
const {
  getAllTestResults,
  getTestResultById,
  getTestResultStats
} = require('../controllers/testResultController');
const { authenticateAdmin } = require('../middleware/auth');

// All routes require admin authentication
router.use(authenticateAdmin);

// GET /api/test-results/stats - Get test result statistics
router.get('/stats', getTestResultStats);

// GET /api/test-results - Get all test results
router.get('/', getAllTestResults);

// GET /api/test-results/:id - Get test result by ID
router.get('/:id', getTestResultById);

module.exports = router;
