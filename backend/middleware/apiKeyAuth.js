// backend/middleware/apiKeyAuth.js
const rateLimit = require('express-rate-limit');

/**
 * API Key Authentication Middleware
 * Used for service-to-service authentication between portals
 */

function validateApiKey(req, res, next) {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'API key is required'
      });
    }

    // Check against configured API keys for different services
    const validApiKeys = [
      process.env.DOCTOR_SERVICE_API_KEY,
      process.env.PATIENT_SERVICE_API_KEY,
      process.env.ADMIN_SERVICE_API_KEY
    ].filter(Boolean); // Remove undefined values

    if (!validApiKeys.includes(apiKey)) {
      return res.status(403).json({
        success: false,
        error: 'Invalid API key'
      });
    }

    // Identify which service is making the request
    if (apiKey === process.env.DOCTOR_SERVICE_API_KEY) {
      req.serviceType = 'DOCTOR_SERVICE';
    } else if (apiKey === process.env.PATIENT_SERVICE_API_KEY) {
      req.serviceType = 'PATIENT_SERVICE';
    } else if (apiKey === process.env.ADMIN_SERVICE_API_KEY) {
      req.serviceType = 'ADMIN_SERVICE';
    }

    // Attach service information to request
    req.apiService = {
      type: req.serviceType,
      authenticated: true,
      timestamp: new Date().toISOString(),
    };

    next();
  } catch (error) {
    console.error('API key validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Authorize specific service types
 * Usage: authorizeService('DOCTOR_SERVICE', 'ADMIN_SERVICE')
 */
function authorizeService(...allowedServices) {
  return (req, res, next) => {
    if (!req.apiService || !req.apiService.authenticated) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'API key authentication required',
      });
    }

    if (!allowedServices.includes(req.apiService.type)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Access denied. This endpoint is only available to: ${allowedServices.join(', ')}`,
      });
    }

    next();
  };
}

/**
 * Optional API key authentication
 * Allows both API key and JWT token authentication
 */
function optionalApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (apiKey) {
    const validKeys = {
      DOCTOR_SERVICE: process.env.DOCTOR_SERVICE_API_KEY,
      PATIENT_SERVICE: process.env.PATIENT_SERVICE_API_KEY,
      ADMIN_SERVICE: process.env.ADMIN_SERVICE_API_KEY,
    };

    let serviceType = null;
    for (const [service, validKey] of Object.entries(validKeys)) {
      if (validKey && apiKey === validKey) {
        serviceType = service;
        break;
      }
    }

    if (serviceType) {
      req.apiService = {
        type: serviceType,
        authenticated: true,
        timestamp: new Date().toISOString(),
      };
      req.serviceType = serviceType;
    }
  }

  next();
}

/**
 * Rate limiter for API key authenticated requests
 * More permissive than user-facing endpoints
 */
const apiKeyRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per window (much higher than user endpoints)
  message: {
    success: false,
    error: 'Too Many Requests',
    message: 'Rate limit exceeded for API key requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use API key as identifier
  keyGenerator: (req) => {
    return req.headers['x-api-key'] || req.ip;
  },
  // Skip rate limiting if not using API key
  skip: (req) => {
    return !req.headers['x-api-key'];
  },
});

module.exports = {
  validateApiKey,
  authorizeService,
  optionalApiKey,
  apiKeyRateLimiter
};
