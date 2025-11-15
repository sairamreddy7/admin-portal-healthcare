const express = require('express');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats
} = require('../controllers/userController');
const { authenticateAdmin } = require('../middleware/auth');
const { validateCreateUser, validateUpdateUser, validateUUID } = require('../middleware/validation');
const { createUserLimiter, apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// All routes require admin authentication
router.use(authenticateAdmin);

// Apply general API rate limiting to all user routes
router.use(apiLimiter);

// GET /api/users/stats - Get user statistics
router.get('/stats', getUserStats);

// GET /api/users - Get all users
router.get('/', getAllUsers);

// GET /api/users/:id - Get user by ID (with UUID validation)
router.get('/:id', validateUUID('id'), getUserById);

// POST /api/users - Create new user (with validation and strict rate limiting)
router.post('/', createUserLimiter, validateCreateUser, createUser);

// PUT /api/users/:id - Update user (with validation and UUID validation)
router.put('/:id', validateUUID('id'), validateUpdateUser, updateUser);

// DELETE /api/users/:id - Delete user (with UUID validation)
router.delete('/:id', validateUUID('id'), deleteUser);

module.exports = router;
