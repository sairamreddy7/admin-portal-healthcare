const express = require('express');
const router = express.Router();
const {
  getAllThreads,
  getThreadById,
  getMessageStats
} = require('../controllers/messageController');
const { authenticateAdmin } = require('../middleware/auth');

// All routes require admin authentication
router.use(authenticateAdmin);

// GET /api/messages/stats - Get message statistics
router.get('/stats', getMessageStats);

// GET /api/messages/threads - Get all message threads
router.get('/threads', getAllThreads);

// GET /api/messages/threads/:id - Get thread by ID with messages
router.get('/threads/:id', getThreadById);

module.exports = router;
