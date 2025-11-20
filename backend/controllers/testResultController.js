const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PATIENT_SERVICE_URL = process.env.PATIENT_SERVICE_URL || 'http://localhost:3000/api';
const API_KEY = process.env.PATIENT_SERVICE_API_KEY;

// Get all test results (using medical records as test results)
async function getAllTestResults(req, res) {
  try {
    const { patientId, status, testType, limit = 100, page = 1 } = req.query;
    
    // Build filter conditions
    const where = {};
    if (patientId) where.patientId = patientId;
    // Note: MedicalRecord doesn't have status/testType, but we can filter later if needed

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Fetch medical records from Prisma database (treating them as test results)
    const [medicalRecords, total] = await Promise.all([
      prisma.medicalRecord.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              dateOfBirth: true
            }
          },
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              specialization: true
            }
          }
        },
        orderBy: {
          visitDate: 'desc'
        },
        skip,
        take
      }),
      prisma.medicalRecord.count({ where })
    ]);

    // Map medical records to test result format
    const testResults = medicalRecords.map(record => ({
      ...record,
      testName: record.diagnosis,
      testType: record.treatment ? 'Treatment' : 'Diagnostic',
      testDate: record.visitDate,
      status: 'COMPLETED' // Medical records are completed by default
    }));

    res.json({
      success: true,
      data: {
        testResults,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching test results:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch test results',
      details: error.message
    });
  }
}

// Get test result by ID
async function getTestResultById(req, res) {
  try {
    const { id } = req.params;
    
    const medicalRecord = await prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true
          }
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true
          }
        }
      }
    });

    if (!medicalRecord) {
      return res.status(404).json({
        success: false,
        error: 'Test result not found'
      });
    }

    // Map to test result format
    const testResult = {
      ...medicalRecord,
      testName: medicalRecord.diagnosis,
      testType: medicalRecord.treatment ? 'Treatment' : 'Diagnostic',
      testDate: medicalRecord.visitDate,
      status: 'COMPLETED'
    };

    res.json({
      success: true,
      data: testResult
    });
  } catch (error) {
    console.error('Error fetching test result:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch test result',
      details: error.message
    });
  }
}

// Get test result statistics
async function getTestResultStats(req, res) {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [total, thisWeekTests] = await Promise.all([
      prisma.medicalRecord.count(),
      prisma.medicalRecord.count({
        where: {
          createdAt: {
            gte: oneWeekAgo
          }
        }
      })
    ]);

    // All medical records are considered completed
    res.json({
      success: true,
      data: {
        total,
        pending: 0,
        completed: total,
        reviewed: total,
        thisWeekTests
      }
    });
  } catch (error) {
    console.error('Error fetching test result stats:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch test result statistics',
      details: error.message
    });
  }
}

module.exports = {
  getAllTestResults,
  getTestResultById,
  getTestResultStats
};
