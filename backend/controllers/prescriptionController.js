const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PATIENT_SERVICE_URL = process.env.PATIENT_SERVICE_URL || 'http://localhost:3000/api';
const API_KEY = process.env.PATIENT_SERVICE_API_KEY;

// Get all prescriptions
async function getAllPrescriptions(req, res) {
  try {
    const { patientId, doctorId, status, limit = 100, page = 1 } = req.query;
    
    // Build filter conditions
    const where = {};
    if (patientId) where.patientId = patientId;
    if (doctorId) where.doctorId = doctorId;
    if (status) where.status = status;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Fetch prescriptions from Prisma database
    const [prescriptions, total] = await Promise.all([
      prisma.prescription.findMany({
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
          prescribedDate: 'desc'
        },
        skip,
        take
      }),
      prisma.prescription.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        prescriptions,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching prescriptions:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch prescriptions',
      details: error.message
    });
  }
}

// Get prescription by ID
async function getPrescriptionById(req, res) {
  try {
    const { id } = req.params;
    
    const prescription = await prisma.prescription.findUnique({
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

    if (!prescription) {
      return res.status(404).json({
        success: false,
        error: 'Prescription not found'
      });
    }

    res.json({
      success: true,
      data: prescription
    });
  } catch (error) {
    console.error('Error fetching prescription:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch prescription',
      details: error.message
    });
  }
}

// Get prescription statistics
async function getPrescriptionStats(req, res) {
  try {
    const [total, active, completed, cancelled, thisMonthPrescriptions] = await Promise.all([
      prisma.prescription.count(),
      prisma.prescription.count({ where: { status: 'ACTIVE' } }),
      prisma.prescription.count({ where: { status: 'COMPLETED' } }),
      prisma.prescription.count({ where: { status: 'CANCELLED' } }),
      prisma.prescription.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        total,
        active,
        completed,
        cancelled,
        thisMonthPrescriptions
      }
    });
  } catch (error) {
    console.error('Error fetching prescription stats:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch prescription statistics',
      details: error.message
    });
  }
}

module.exports = {
  getAllPrescriptions,
  getPrescriptionById,
  getPrescriptionStats
};
