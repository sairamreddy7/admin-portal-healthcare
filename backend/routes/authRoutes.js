const express = require('express');
const { login, createAdmin, verifyToken } = require('../controllers/authController');
const { authenticateAdmin } = require('../middleware/auth');
const { validateLogin, validateCreateAdmin } = require('../middleware/validation');
const { authLimiter, createUserLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// POST /api/auth/login - Admin login (with rate limiting and validation)
router.post('/login', authLimiter, validateLogin, login);

// POST /api/auth/create-admin - Create new admin user (protected, with validation and rate limiting)
router.post('/create-admin', authenticateAdmin, createUserLimiter, validateCreateAdmin, createAdmin);

// GET /api/auth/verify - Verify admin token
router.get('/verify', authenticateAdmin, verifyToken);

module.exports = router;
