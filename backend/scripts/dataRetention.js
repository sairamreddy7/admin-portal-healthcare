/**
 * Data Retention Script
 * Implements HIPAA-compliant data retention policies
 * Run this script periodically (e.g., daily via cron job)
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Data retention periods (in days)
const RETENTION_PERIODS = {
  AUDIT_LOGS: parseInt(process.env.AUDIT_LOG_RETENTION_DAYS) || 2555, // 7 years (HIPAA requirement)
  PASSWORD_RESET_TOKENS: 7, // 1 week
  INACTIVE_SESSIONS: 30, // 30 days
  DELETED_RECORDS: 90 // 90 days before permanent deletion (soft delete period)
};

/**
 * Delete old password reset tokens
 */
async function cleanupPasswordResetTokens() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - RETENTION_PERIODS.PASSWORD_RESET_TOKENS);

  const result = await prisma.passwordResetToken.deleteMany({
    where: {
      createdAt: { lt: cutoffDate }
    }
  });

  console.log(`✅ Deleted ${result.count} old password reset tokens`);
  return result.count;
}

/**
 * Archive old audit logs (optional: move to archive table before deleting)
 */
async function archiveOldAuditLogs() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - RETENTION_PERIODS.AUDIT_LOGS);

  // In production, you might want to:
  // 1. Export to cold storage (S3, etc.)
  // 2. Move to an archive table
  // 3. Then delete from main table

  const oldLogs = await prisma.auditLog.findMany({
    where: {
      timestamp: { lt: cutoffDate }
    },
    select: { id: true }
  });

  console.log(`📦 Found ${oldLogs.length} audit logs ready for archival`);

  // For now, we'll keep them (HIPAA requires 7 years)
  // Uncomment below to delete after archival:
  /*
  const result = await prisma.auditLog.deleteMany({
    where: {
      timestamp: { lt: cutoffDate }
    }
  });
  console.log(`✅ Deleted ${result.count} archived audit logs`);
  */

  return oldLogs.length;
}

/**
 * Log data retention activity
 */
async function logRetentionActivity(details) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: null,
        username: 'system',
        action: 'DATA_RETENTION',
        resource: 'SYSTEM',
        method: 'SCRIPT',
        endpoint: '/scripts/dataRetention',
        ipAddress: 'localhost',
        userAgent: 'data-retention-script',
        statusCode: 200,
        requestBody: details
      }
    });
  } catch (error) {
    console.error('Failed to log retention activity:', error);
  }
}

/**
 * Main retention cleanup function
 */
async function runDataRetention() {
  console.log('🔄 Starting data retention cleanup...\n');

  const results = {
    passwordResetTokens: 0,
    auditLogsArchived: 0,
    startTime: new Date(),
    endTime: null,
    success: true,
    errors: []
  };

  try {
    // Cleanup password reset tokens
    console.log('1️⃣ Cleaning up password reset tokens...');
    results.passwordResetTokens = await cleanupPasswordResetTokens();

    // Archive audit logs
    console.log('\n2️⃣ Checking audit logs for archival...');
    results.auditLogsArchived = await archiveOldAuditLogs();

    results.endTime = new Date();
    results.duration = results.endTime - results.startTime;

    // Log retention activity
    await logRetentionActivity(results);

    console.log('\n✅ Data retention cleanup completed successfully!');
    console.log(`Duration: ${results.duration}ms`);
    console.log(`\nSummary:`);
    console.log(`  - Password Reset Tokens Deleted: ${results.passwordResetTokens}`);
    console.log(`  - Audit Logs Found for Archival: ${results.auditLogsArchived}`);
  } catch (error) {
    console.error('\n❌ Data retention cleanup failed:', error);
    results.success = false;
    results.errors.push(error.message);
    results.endTime = new Date();

    // Try to log the failure
    try {
      await logRetentionActivity({
        ...results,
        error: error.message
      });
    } catch (logError) {
      console.error('Failed to log retention failure:', logError);
    }
  } finally {
    await prisma.$disconnect();
  }

  return results;
}

// Run if called directly
if (require.main === module) {
  runDataRetention()
    .then(() => {
      console.log('\n👋 Data retention script finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { runDataRetention };
