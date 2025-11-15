const nodemailer = require('nodemailer');

/**
 * Email Service
 * Handles email notifications for password reset, alerts, etc.
 */

// Create reusable transporter
const createTransporter = () => {
  // For development, use ethereal.email or configure SMTP
  // For production, configure with real SMTP credentials

  if (process.env.NODE_ENV === 'production') {
    // Production SMTP configuration
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Development - Create test account
    // In production, you'd use real SMTP credentials
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'test@ethereal.email',
        pass: process.env.SMTP_PASS || 'test123',
      },
    });
  }
};

/**
 * Send password reset email
 */
async function sendPasswordResetEmail(email, resetToken, username) {
  try {
    const transporter = createTransporter();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"${process.env.APP_NAME || 'Healthcare Admin Portal'}" <${process.env.SMTP_FROM || 'noreply@healthcare.com'}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; padding: 12px 30px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            .warning { background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 10px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello ${username || 'User'},</p>

              <p>We received a request to reset your password for your Healthcare Admin Portal account.</p>

              <p>Click the button below to reset your password:</p>

              <a href="${resetUrl}" class="button">Reset Password</a>

              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #4F46E5;">${resetUrl}</p>

              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul>
                  <li>This link will expire in 1 hour</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                  <li>Your password will remain unchanged until you create a new one</li>
                </ul>
              </div>

              <p>If you're having trouble, contact your system administrator.</p>

              <p>Best regards,<br>Healthcare Admin Portal Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; ${new Date().getFullYear()} Healthcare Admin Portal. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Reset Request

        Hello ${username || 'User'},

        We received a request to reset your password for your Healthcare Admin Portal account.

        Click this link to reset your password:
        ${resetUrl}

        This link will expire in 1 hour.

        If you didn't request this reset, please ignore this email.

        Best regards,
        Healthcare Admin Portal Team
      `
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('Password reset email sent:', info.messageId);

    // In development, log the preview URL
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

/**
 * Send account created notification
 */
async function sendAccountCreatedEmail(email, username, temporaryPassword) {
  try {
    const transporter = createTransporter();

    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/login`;

    const mailOptions = {
      from: `"${process.env.APP_NAME || 'Healthcare Admin Portal'}" <${process.env.SMTP_FROM || 'noreply@healthcare.com'}>`,
      to: email,
      subject: 'Welcome to Healthcare Admin Portal',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #10B981; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; padding: 12px 30px; background-color: #10B981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .credentials { background-color: #E0F2FE; border-left: 4px solid #0EA5E9; padding: 15px; margin: 15px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            .warning { background-color: #FEE2E2; border-left: 4px solid #EF4444; padding: 10px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Healthcare Admin Portal</h1>
            </div>
            <div class="content">
              <p>Hello ${username},</p>

              <p>Your admin account has been successfully created!</p>

              <div class="credentials">
                <strong>Your Login Credentials:</strong><br>
                <strong>Username:</strong> ${username}<br>
                <strong>Email:</strong> ${email}<br>
                ${temporaryPassword ? `<strong>Temporary Password:</strong> ${temporaryPassword}` : ''}
              </div>

              ${temporaryPassword ? `
              <div class="warning">
                <strong>⚠️ Important Security Notice:</strong>
                <p>Please change your password immediately after your first login.</p>
              </div>
              ` : ''}

              <a href="${loginUrl}" class="button">Login Now</a>

              <p>If you have any questions, please contact your system administrator.</p>

              <p>Best regards,<br>Healthcare Admin Portal Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; ${new Date().getFullYear()} Healthcare Admin Portal. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Account created email sent:', info.messageId);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending account created email:', error);
    throw error;
  }
}

/**
 * Send system alert notification
 */
async function sendSystemAlert(email, alertType, message) {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.APP_NAME || 'Healthcare Admin Portal'}" <${process.env.SMTP_FROM || 'noreply@healthcare.com'}>`,
      to: email,
      subject: `System Alert: ${alertType}`,
      html: `
        <h2>System Alert</h2>
        <p><strong>Type:</strong> ${alertType}</p>
        <p><strong>Message:</strong> ${message}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('System alert sent:', info.messageId);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending system alert:', error);
    throw error;
  }
}

module.exports = {
  sendPasswordResetEmail,
  sendAccountCreatedEmail,
  sendSystemAlert
};
