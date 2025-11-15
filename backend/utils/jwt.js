const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'admin-healthcare-portal-secret-key-2025';
const JWT_EXPIRES_IN = '8h';

function generateToken(userId, role, email) {
  return jwt.sign(
    { userId, role, email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

module.exports = { generateToken, verifyToken };
