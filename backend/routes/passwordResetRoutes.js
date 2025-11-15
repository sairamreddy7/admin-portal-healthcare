const express = require('express');
const {
  requestPasswordReset,
  verifyResetToken,
  resetPassword,
  changePassword
} = require('../controllers/passwordResetController');
const { authenticateAdmin } = require('../middleware/auth');
const {
  validatePasswordResetRequest,
  validateResetPassword,
  validateChangePassword
} = require('../middleware/validation');
const { passwordResetLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// POST /api/password-reset/request - Request password reset (public, rate limited)
router.post('/request', passwordResetLimiter, validatePasswordResetRequest, requestPasswordReset);

// GET /api/password-reset/verify/:token - Verify reset token (public)
router.get('/verify/:token', verifyResetToken);

// POST /api/password-reset/reset - Reset password with token (public, rate limited)
router.post('/reset', passwordResetLimiter, validateResetPassword, resetPassword);

// POST /api/password-reset/change - Change password for authenticated user (protected)
router.post('/change', authenticateAdmin, validateChangePassword, changePassword);

module.exports = router;
