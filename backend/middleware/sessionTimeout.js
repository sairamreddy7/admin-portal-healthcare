const { verifyToken } = require('../utils/jwt');

/**
 * Session Timeout Middleware
 * Tracks user activity and enforces session timeouts
 */

// In-memory session store (for production, use Redis or database)
const activeSessions = new Map();

// Parse timeout from environment (e.g., "30m" -> 30 minutes in milliseconds)
const parseTimeout = (timeoutString) => {
  const match = timeoutString.match(/^(\d+)([smhd])$/);
  if (!match) return 30 * 60 * 1000; // Default 30 minutes

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return 30 * 60 * 1000;
  }
};

const SESSION_TIMEOUT = parseTimeout(process.env.SESSION_TIMEOUT || '30m');

/**
 * Check if session has timed out
 */
function checkSessionTimeout(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return next();
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return next();
    }

    const userId = decoded.userId;
    const now = Date.now();

    // Check if session exists
    const session = activeSessions.get(userId);

    if (session) {
      const timeSinceLastActivity = now - session.lastActivity;

      if (timeSinceLastActivity > SESSION_TIMEOUT) {
        // Session has timed out
        activeSessions.delete(userId);
        return res.status(401).json({
          error: 'Session expired',
          message: 'Your session has expired due to inactivity. Please log in again.',
          code: 'SESSION_EXPIRED'
        });
      }

      // Update last activity
      session.lastActivity = now;
      session.activityCount++;
    } else {
      // Create new session
      activeSessions.set(userId, {
        userId,
        lastActivity: now,
        createdAt: now,
        activityCount: 1
      });
    }

    // Add session info to request
    req.session = {
      userId,
      lastActivity: now,
      timeRemaining: SESSION_TIMEOUT - (now - (session?.createdAt || now))
    };

    next();
  } catch (error) {
    console.error('Session timeout check error:', error);
    next();
  }
}

/**
 * Get session info for a user
 */
function getSessionInfo(userId) {
  const session = activeSessions.get(userId);
  if (!session) return null;

  const now = Date.now();
  const timeRemaining = SESSION_TIMEOUT - (now - session.lastActivity);

  return {
    userId: session.userId,
    lastActivity: new Date(session.lastActivity),
    createdAt: new Date(session.createdAt),
    activityCount: session.activityCount,
    timeRemaining: Math.max(0, timeRemaining),
    isActive: timeRemaining > 0
  };
}

/**
 * Clear session for a user
 */
function clearSession(userId) {
  activeSessions.delete(userId);
}

/**
 * Get all active sessions (for admin monitoring)
 */
function getAllActiveSessions() {
  const now = Date.now();
  const sessions = [];

  activeSessions.forEach((session, userId) => {
    const timeSinceLastActivity = now - session.lastActivity;
    if (timeSinceLastActivity <= SESSION_TIMEOUT) {
      sessions.push({
        userId,
        lastActivity: new Date(session.lastActivity),
        createdAt: new Date(session.createdAt),
        activityCount: session.activityCount,
        timeRemaining: SESSION_TIMEOUT - timeSinceLastActivity
      });
    } else {
      // Clean up expired session
      activeSessions.delete(userId);
    }
  });

  return sessions;
}

/**
 * Clean up expired sessions periodically
 */
function cleanupExpiredSessions() {
  const now = Date.now();
  let cleaned = 0;

  activeSessions.forEach((session, userId) => {
    if (now - session.lastActivity > SESSION_TIMEOUT) {
      activeSessions.delete(userId);
      cleaned++;
    }
  });

  if (cleaned > 0) {
    console.log(`Cleaned up ${cleaned} expired sessions`);
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredSessions, 5 * 60 * 1000);

module.exports = {
  checkSessionTimeout,
  getSessionInfo,
  clearSession,
  getAllActiveSessions,
  SESSION_TIMEOUT
};
