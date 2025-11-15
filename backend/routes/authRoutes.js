const express = require('express');
const { login, createAdmin, verifyToken } = require('../controllers/authController');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login - Admin login
router.post('/login', login);

// POST /api/auth/create-admin - Create new admin user (protected)
router.post('/create-admin', authenticateAdmin, createAdmin);

// GET /api/auth/verify - Verify admin token
router.get('/verify', authenticateAdmin, verifyToken);

module.exports = router;
