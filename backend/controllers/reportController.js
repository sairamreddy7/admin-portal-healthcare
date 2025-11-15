const { PrismaClient } = require('@prisma/client');
const {
  generateUserListPDF,
  generateStatisticsReportPDF,
  generateCustomReportPDF
} = require('../utils/pdfService');

const prisma = new PrismaClient();

/**
 * Generate User List Report (PDF)
 */
async function generateUserReport(req, res) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const pdfBuffer = await generateUserListPDF(users);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="user-report-${Date.now()}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating user report:', error);
    res.status(500).json({ error: 'Failed to generate user report' });
  }
}

/**
 * Generate Statistics Report (PDF)
 */
async function generateStatsReport(req, res) {
  try {
    const [
      totalUsers,
      totalDoctors,
      totalPatients,
      activeUsers,
      totalAppointments
    ] = await Promise.all([
      prisma.user.count(),
      prisma.doctor.count(),
      prisma.patient.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.appointment.count()
    ]);

    const stats = {
      totalUsers,
      totalDoctors,
      totalPatients,
      activeAppointments: totalAppointments,
      additionalInfo: {
        'Active Users': activeUsers,
        'Inactive Users': totalUsers - activeUsers,
        'Report Date': new Date().toLocaleDateString(),
        'System Version': '1.0.0'
      }
    };

    const pdfBuffer = await generateStatisticsReportPDF(stats);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="statistics-report-${Date.now()}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating statistics report:', error);
    res.status(500).json({ error: 'Failed to generate statistics report' });
  }
}

/**
 * Generate Doctor List Report (PDF)
 */
async function generateDoctorReport(req, res) {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        user: {
          select: {
            username: true,
            email: true,
            isActive: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedDoctors = doctors.map(doctor => ({
      username: doctor.user.username,
      email: doctor.user.email,
      name: `${doctor.firstName} ${doctor.lastName}`,
      specialization: doctor.specialization,
      licenseNumber: doctor.licenseNumber,
      experience: `${doctor.yearsExperience || 0} years`,
      status: doctor.user.isActive ? 'Active' : 'Inactive'
    }));

    const columns = [
      { key: 'username', label: 'Username' },
      { key: 'name', label: 'Full Name' },
      { key: 'specialization', label: 'Specialization' },
      { key: 'licenseNumber', label: 'License' },
      { key: 'status', label: 'Status' }
    ];

    const pdfBuffer = await generateCustomReportPDF(
      'Doctor List Report',
      formattedDoctors,
      columns
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="doctor-report-${Date.now()}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating doctor report:', error);
    res.status(500).json({ error: 'Failed to generate doctor report' });
  }
}

/**
 * Generate Patient List Report (PDF)
 */
async function generatePatientReport(req, res) {
  try {
    const patients = await prisma.patient.findMany({
      include: {
        user: {
          select: {
            username: true,
            email: true,
            isActive: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedPatients = patients.map(patient => ({
      username: patient.user.username,
      name: `${patient.firstName} ${patient.lastName}`,
      gender: patient.gender,
      bloodGroup: patient.bloodGroup || 'N/A',
      phone: patient.phoneNumber,
      status: patient.user.isActive ? 'Active' : 'Inactive'
    }));

    const columns = [
      { key: 'username', label: 'Username' },
      { key: 'name', label: 'Full Name' },
      { key: 'gender', label: 'Gender' },
      { key: 'bloodGroup', label: 'Blood Group' },
      { key: 'status', label: 'Status' }
    ];

    const pdfBuffer = await generateCustomReportPDF(
      'Patient List Report',
      formattedPatients,
      columns
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="patient-report-${Date.now()}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating patient report:', error);
    res.status(500).json({ error: 'Failed to generate patient report' });
  }
}

/**
 * Generate Appointment Report (PDF)
 */
async function generateAppointmentReport(req, res) {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            specialization: true
          }
        }
      },
      orderBy: {
        dateTime: 'desc'
      },
      take: 100 // Limit to last 100 appointments
    });

    const formattedAppointments = appointments.map(apt => ({
      patient: `${apt.patient.firstName} ${apt.patient.lastName}`,
      doctor: `${apt.doctor.firstName} ${apt.doctor.lastName}`,
      specialization: apt.doctor.specialization,
      dateTime: new Date(apt.dateTime).toLocaleString(),
      status: apt.status,
      reason: apt.reason || 'N/A'
    }));

    const columns = [
      { key: 'patient', label: 'Patient' },
      { key: 'doctor', label: 'Doctor' },
      { key: 'dateTime', label: 'Date & Time' },
      { key: 'status', label: 'Status' }
    ];

    const pdfBuffer = await generateCustomReportPDF(
      'Appointment Report (Last 100)',
      formattedAppointments,
      columns
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="appointment-report-${Date.now()}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating appointment report:', error);
    res.status(500).json({ error: 'Failed to generate appointment report' });
  }
}

module.exports = {
  generateUserReport,
  generateStatsReport,
  generateDoctorReport,
  generatePatientReport,
  generateAppointmentReport
};
