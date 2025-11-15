const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * PDF Generation Service
 * Creates PDF reports for users, doctors, patients, appointments, etc.
 */

/**
 * Generate User List PDF Report
 */
async function generateUserListPDF(users, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc
        .fontSize(20)
        .fillColor('#4F46E5')
        .text('Healthcare Admin Portal', { align: 'center' })
        .moveDown(0.5);

      doc
        .fontSize(16)
        .fillColor('#000')
        .text('User List Report', { align: 'center' })
        .moveDown(0.5);

      doc
        .fontSize(10)
        .fillColor('#666')
        .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' })
        .moveDown(2);

      // Summary
      doc
        .fontSize(12)
        .fillColor('#000')
        .text(`Total Users: ${users.length}`, { align: 'left' })
        .moveDown(1);

      // Table Header
      const tableTop = doc.y;
      const col1X = 50;
      const col2X = 200;
      const col3X = 350;
      const col4X = 450;

      doc
        .fontSize(10)
        .fillColor('#4F46E5')
        .font('Helvetica-Bold')
        .text('Username', col1X, tableTop)
        .text('Email', col2X, tableTop)
        .text('Role', col3X, tableTop)
        .text('Status', col4X, tableTop);

      // Draw line under header
      doc
        .moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke();

      // Table Rows
      let y = tableTop + 25;
      doc.font('Helvetica').fillColor('#000').fontSize(9);

      users.forEach((user, index) => {
        // Check if we need a new page
        if (y > 700) {
          doc.addPage();
          y = 50;
        }

        const status = user.isActive ? 'Active' : 'Inactive';
        const statusColor = user.isActive ? '#10B981' : '#EF4444';

        doc
          .fillColor('#000')
          .text(user.username || 'N/A', col1X, y, { width: 140 })
          .text(user.email || 'N/A', col2X, y, { width: 140 })
          .text(user.role || 'N/A', col3X, y)
          .fillColor(statusColor)
          .text(status, col4X, y);

        y += 20;

        // Draw subtle line between rows
        if (index < users.length - 1) {
          doc
            .strokeColor('#E5E7EB')
            .moveTo(50, y - 5)
            .lineTo(550, y - 5)
            .stroke();
        }
      });

      // Footer
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc
          .fontSize(8)
          .fillColor('#666')
          .text(
            `Page ${i + 1} of ${pageCount}`,
            50,
            doc.page.height - 50,
            { align: 'center' }
          );
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate Statistics Report PDF
 */
async function generateStatisticsReportPDF(stats, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc
        .fontSize(20)
        .fillColor('#4F46E5')
        .text('Healthcare Admin Portal', { align: 'center' })
        .moveDown(0.5);

      doc
        .fontSize(16)
        .fillColor('#000')
        .text('System Statistics Report', { align: 'center' })
        .moveDown(0.5);

      doc
        .fontSize(10)
        .fillColor('#666')
        .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' })
        .moveDown(2);

      // Statistics Cards
      const cardY = doc.y;
      const cardWidth = 240;
      const cardHeight = 80;
      const cardSpacing = 20;

      // Function to draw a stat card
      const drawStatCard = (x, y, label, value, color = '#4F46E5') => {
        doc
          .roundedRect(x, y, cardWidth, cardHeight, 5)
          .fillAndStroke('#F3F4F6', '#E5E7EB');

        doc
          .fontSize(12)
          .fillColor('#666')
          .text(label, x + 15, y + 15);

        doc
          .fontSize(28)
          .fillColor(color)
          .text(value.toString(), x + 15, y + 35);
      };

      // Draw stat cards
      if (stats.totalUsers !== undefined) {
        drawStatCard(50, cardY, 'Total Users', stats.totalUsers, '#4F46E5');
      }

      if (stats.totalDoctors !== undefined) {
        drawStatCard(50 + cardWidth + cardSpacing, cardY, 'Total Doctors', stats.totalDoctors, '#10B981');
      }

      if (stats.totalPatients !== undefined) {
        drawStatCard(50, cardY + cardHeight + cardSpacing, 'Total Patients', stats.totalPatients, '#F59E0B');
      }

      if (stats.activeAppointments !== undefined) {
        drawStatCard(50 + cardWidth + cardSpacing, cardY + cardHeight + cardSpacing, 'Active Appointments', stats.activeAppointments, '#EF4444');
      }

      doc.moveDown(12);

      // Additional Details
      if (stats.additionalInfo) {
        doc
          .fontSize(14)
          .fillColor('#000')
          .text('Additional Information', { underline: true })
          .moveDown(0.5);

        doc.fontSize(10).fillColor('#666');
        Object.entries(stats.additionalInfo).forEach(([key, value]) => {
          doc.text(`${key}: ${value}`).moveDown(0.3);
        });
      }

      // Footer
      doc
        .fontSize(8)
        .fillColor('#666')
        .text(
          'Page 1 of 1',
          50,
          doc.page.height - 50,
          { align: 'center' }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate Custom Report PDF
 */
async function generateCustomReportPDF(title, data, columns, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc
        .fontSize(20)
        .fillColor('#4F46E5')
        .text('Healthcare Admin Portal', { align: 'center' })
        .moveDown(0.5);

      doc
        .fontSize(16)
        .fillColor('#000')
        .text(title, { align: 'center' })
        .moveDown(0.5);

      doc
        .fontSize(10)
        .fillColor('#666')
        .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' })
        .moveDown(2);

      // Summary
      doc
        .fontSize(12)
        .fillColor('#000')
        .text(`Total Records: ${data.length}`, { align: 'left' })
        .moveDown(1);

      // Dynamic Table
      const tableTop = doc.y;
      const columnWidth = 500 / columns.length;
      let xPos = 50;

      // Table Header
      doc.fontSize(10).fillColor('#4F46E5').font('Helvetica-Bold');
      columns.forEach((column) => {
        doc.text(column.label, xPos, tableTop, { width: columnWidth });
        xPos += columnWidth;
      });

      // Draw line under header
      doc
        .moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke();

      // Table Rows
      let y = tableTop + 25;
      doc.font('Helvetica').fillColor('#000').fontSize(9);

      data.forEach((row, index) => {
        if (y > 700) {
          doc.addPage();
          y = 50;
        }

        xPos = 50;
        columns.forEach((column) => {
          const value = row[column.key] || 'N/A';
          doc.text(value.toString(), xPos, y, { width: columnWidth - 10 });
          xPos += columnWidth;
        });

        y += 20;
      });

      // Footer
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc
          .fontSize(8)
          .fillColor('#666')
          .text(
            `Page ${i + 1} of ${pageCount}`,
            50,
            doc.page.height - 50,
            { align: 'center' }
          );
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  generateUserListPDF,
  generateStatisticsReportPDF,
  generateCustomReportPDF
};
