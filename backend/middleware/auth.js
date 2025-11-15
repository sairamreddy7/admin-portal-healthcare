const { verifyToken } = require('../utils/jwt');
const { checkSessionTimeout } = require('./sessionTimeout');

function authenticateAdmin(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    req.user = decoded;

    // Check session timeout
    checkSessionTimeout(req, res, next);
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
}

module.exports = { authenticateAdmin };
