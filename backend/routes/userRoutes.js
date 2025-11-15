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

const router = express.Router();

// All routes require admin authentication
router.use(authenticateAdmin);

// GET /api/users/stats - Get user statistics
router.get('/stats', getUserStats);

// GET /api/users - Get all users
router.get('/', getAllUsers);

// GET /api/users/:id - Get user by ID
router.get('/:id', getUserById);

// POST /api/users - Create new user
router.post('/', createUser);

// PUT /api/users/:id - Update user
router.put('/:id', updateUser);

// DELETE /api/users/:id - Delete user
router.delete('/:id', deleteUser);

module.exports = router;
