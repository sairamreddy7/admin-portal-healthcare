const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Audit Logging Middleware
 * Logs all user actions for HIPAA compliance and security auditing
 */

// Actions that should always be logged
const LOGGED_ACTIONS = {
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  PASSWORD_RESET: 'PASSWORD_RESET',
  ACCESS_DENIED: 'ACCESS_DENIED',
  EXPORT: 'EXPORT'
};

// Resources to track
const RESOURCES = {
  USER: 'USER',
  DOCTOR: 'DOCTOR',
  PATIENT: 'PATIENT',
  APPOINTMENT: 'APPOINTMENT',
  PRESCRIPTION: 'PRESCRIPTION',
  MEDICAL_RECORD: 'MEDICAL_RECORD',
  BILLING: 'BILLING',
  TEST_RESULT: 'TEST_RESULT',
  MESSAGE: 'MESSAGE',
  REPORT: 'REPORT',
  DEPARTMENT: 'DEPARTMENT',
  SYSTEM: 'SYSTEM'
};

/**
 * Determine action type from HTTP method and endpoint
 */
function determineAction(method, endpoint) {
  if (endpoint.includes('/login')) return LOGGED_ACTIONS.LOGIN;
  if (endpoint.includes('/logout')) return LOGGED_ACTIONS.LOGOUT;
  if (endpoint.includes('/password-reset')) return LOGGED_ACTIONS.PASSWORD_RESET;
  if (endpoint.includes('/reports') || endpoint.includes('/export')) return LOGGED_ACTIONS.EXPORT;

  switch (method.toUpperCase()) {
    case 'POST': return LOGGED_ACTIONS.CREATE;
    case 'GET': return LOGGED_ACTIONS.READ;
    case 'PUT':
    case 'PATCH': return LOGGED_ACTIONS.UPDATE;
    case 'DELETE': return LOGGED_ACTIONS.DELETE;
    default: return 'UNKNOWN';
  }
}

/**
 * Determine resource type from endpoint
 */
function determineResource(endpoint) {
  if (endpoint.includes('/users')) return RESOURCES.USER;
  if (endpoint.includes('/doctors')) return RESOURCES.DOCTOR;
  if (endpoint.includes('/patients')) return RESOURCES.PATIENT;
  if (endpoint.includes('/appointments')) return RESOURCES.APPOINTMENT;
  if (endpoint.includes('/prescriptions')) return RESOURCES.PRESCRIPTION;
  if (endpoint.includes('/medical-records')) return RESOURCES.MEDICAL_RECORD;
  if (endpoint.includes('/billing') || endpoint.includes('/invoices')) return RESOURCES.BILLING;
  if (endpoint.includes('/test-results')) return RESOURCES.TEST_RESULT;
  if (endpoint.includes('/messages')) return RESOURCES.MESSAGE;
  if (endpoint.includes('/reports')) return RESOURCES.REPORT;
  if (endpoint.includes('/departments')) return RESOURCES.DEPARTMENT;
  return RESOURCES.SYSTEM;
}

/**
 * Extract resource ID from endpoint
 */
function extractResourceId(endpoint) {
  // Match UUID pattern in URL
  const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  const match = endpoint.match(uuidRegex);
  return match ? match[0] : null;
}

/**
 * Sanitize sensitive data from request/response
 */
function sanitizeData(data) {
  if (!data) return null;

  const sanitized = { ...data };

  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'api_key'];

  function removeSensitiveFields(obj) {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
      return obj.map(item => removeSensitiveFields(item));
    }

    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        cleaned[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        cleaned[key] = removeSensitiveFields(value);
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }

  return removeSensitiveFields(sanitized);
}

/**
 * Get client IP address
 */
function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown';
}

/**
 * Audit logging middleware
 */
async function auditLogger(req, res, next) {
  // Skip logging for health checks and static assets
  if (req.path === '/' || req.path.includes('/health') || req.path.includes('/favicon')) {
    return next();
  }

  const startTime = Date.now();

  // Store original res.json to intercept response
  const originalJson = res.json.bind(res);

  let responseBody = null;
  let statusCode = null;

  res.json = function (data) {
    responseBody = data;
    statusCode = res.statusCode;
    return originalJson(data);
  };

  // Store original res.send to intercept response
  const originalSend = res.send.bind(res);
  res.send = function (data) {
    if (!responseBody) {
      responseBody = data;
      statusCode = res.statusCode;
    }
    return originalSend(data);
  };

  // Wait for response to complete
  res.on('finish', async () => {
    try {
      const duration = Date.now() - startTime;
      const action = determineAction(req.method, req.path);
      const resource = determineResource(req.path);
      const resourceId = extractResourceId(req.path);

      // Extract user information
      const userId = req.user?.userId || null;
      const username = req.user?.email || 'anonymous';

      // Get client information
      const ipAddress = getClientIp(req);
      const userAgent = req.headers['user-agent'] || 'unknown';

      // Prepare audit log data
      const auditData = {
        userId,
        username,
        action,
        resource,
        resourceId,
        method: req.method,
        endpoint: req.path,
        ipAddress,
        userAgent,
        statusCode: statusCode || res.statusCode
      };

      // Add request body for write operations (sanitized)
      if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
        auditData.requestBody = sanitizeData(req.body);
      }

      // Add error message if request failed
      if (res.statusCode >= 400) {
        if (typeof responseBody === 'object' && responseBody?.error) {
          auditData.errorMessage = responseBody.error;
        } else if (typeof responseBody === 'string') {
          auditData.errorMessage = responseBody.substring(0, 500);
        }
      }

      // Log to database asynchronously (don't block response)
      setImmediate(async () => {
        try {
          await prisma.auditLog.create({ data: auditData });
        } catch (error) {
          console.error('Failed to create audit log:', error);
          // Don't throw - audit logging should never break the application
        }
      });

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[AUDIT] ${action} ${resource} - ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
      }
    } catch (error) {
      console.error('Audit logging error:', error);
      // Don't throw - audit logging should never break the application
    }
  });

  next();
}

/**
 * Log specific high-priority actions manually
 */
async function logAction(userId, action, resource, details = {}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        username: details.username || 'system',
        action,
        resource,
        resourceId: details.resourceId || null,
        method: details.method || 'MANUAL',
        endpoint: details.endpoint || '/manual',
        ipAddress: details.ipAddress || 'system',
        userAgent: details.userAgent || 'system',
        statusCode: details.statusCode || 200,
        requestBody: sanitizeData(details.requestBody),
        responseBody: sanitizeData(details.responseBody)
      }
    });
  } catch (error) {
    console.error('Failed to log action:', error);
  }
}

module.exports = {
  auditLogger,
  logAction,
  LOGGED_ACTIONS,
  RESOURCES
};
