const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Get all audit logs with pagination and filtering
 */
async function getAllAuditLogs(req, res) {
  try {
    const {
      page = 1,
      limit = 50,
      userId,
      action,
      resource,
      startDate,
      endDate,
      search
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};

    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (resource) where.resource = resource;

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { endpoint: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.auditLog.count({ where })
    ]);

    res.json({
      logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
}

/**
 * Get audit log by ID
 */
async function getAuditLogById(req, res) {
  try {
    const { id } = req.params;

    const log = await prisma.auditLog.findUnique({
      where: { id }
    });

    if (!log) {
      return res.status(404).json({ error: 'Audit log not found' });
    }

    res.json(log);
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
}

/**
 * Get audit statistics
 */
async function getAuditStatistics(req, res) {
  try {
    const { startDate, endDate } = req.query;

    const where = {};
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    const [
      totalLogs,
      loginAttempts,
      failedLogins,
      dataAccess,
      modifications,
      deletions,
      exports,
      accessDenied
    ] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.count({ where: { ...where, action: 'LOGIN' } }),
      prisma.auditLog.count({ where: { ...where, action: 'LOGIN', statusCode: { gte: 400 } } }),
      prisma.auditLog.count({ where: { ...where, action: 'READ' } }),
      prisma.auditLog.count({ where: { ...where, action: { in: ['CREATE', 'UPDATE'] } } }),
      prisma.auditLog.count({ where: { ...where, action: 'DELETE' } }),
      prisma.auditLog.count({ where: { ...where, action: 'EXPORT' } }),
      prisma.auditLog.count({ where: { ...where, action: 'ACCESS_DENIED' } })
    ]);

    // Get top users by activity
    const topUsers = await prisma.auditLog.groupBy({
      by: ['username'],
      where,
      _count: true,
      orderBy: { _count: { username: 'desc' } },
      take: 10
    });

    // Get top resources accessed
    const topResources = await prisma.auditLog.groupBy({
      by: ['resource'],
      where,
      _count: true,
      orderBy: { _count: { resource: 'desc' } },
      take: 10
    });

    res.json({
      totalLogs,
      loginAttempts,
      failedLogins,
      successfulLogins: loginAttempts - failedLogins,
      dataAccess,
      modifications,
      deletions,
      exports,
      accessDenied,
      topUsers: topUsers.map(u => ({ username: u.username, count: u._count })),
      topResources: topResources.map(r => ({ resource: r.resource, count: r._count }))
    });
  } catch (error) {
    console.error('Error fetching audit statistics:', error);
    res.status(500).json({ error: 'Failed to fetch audit statistics' });
  }
}

/**
 * Get user activity logs
 */
async function getUserActivity(req, res) {
  try {
    const { userId } = req.params;
    const { limit = 100 } = req.query;

    const logs = await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit)
    });

    res.json({ logs });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ error: 'Failed to fetch user activity' });
  }
}

/**
 * Delete old audit logs (data retention)
 */
async function deleteOldAuditLogs(req, res) {
  try {
    const { days = 90 } = req.body;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const result = await prisma.auditLog.deleteMany({
      where: {
        timestamp: { lt: cutoffDate }
      }
    });

    res.json({
      message: `Deleted ${result.count} audit logs older than ${days} days`,
      deletedCount: result.count,
      cutoffDate
    });
  } catch (error) {
    console.error('Error deleting old audit logs:', error);
    res.status(500).json({ error: 'Failed to delete old audit logs' });
  }
}

module.exports = {
  getAllAuditLogs,
  getAuditLogById,
  getAuditStatistics,
  getUserActivity,
  deleteOldAuditLogs
};
