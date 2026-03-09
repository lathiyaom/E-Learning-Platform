const nodemailer = require("nodemailer");
const logger = require("./logger");

let transporter;

// Initialize transporter based on environment
const initTransporter = () => {
  if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
    // Development - use Mailtrap
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.mailtrap.io",
      port: parseInt(process.env.SMTP_PORT || "2525"),
      auth: {
        user: process.env.SMTP_USER || "test",
        pass: process.env.SMTP_PASS || "test",
      },
    });
  } else {
    // Production - use configured SMTP or SendGrid
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
};

transporter = initTransporter();

// Email templates with variables
const emailTemplates = {
  passwordReset: {
    subject: "Password Reset Request - E-Learning Platform",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">Password Reset Request</h1>
        </div>
        <div style="padding: 20px; background-color: #fff;">
          <p style="color: #666; font-size: 14px;">Hi {{firstName}},</p>
          <p style="color: #666; font-size: 14px;">We received a request to reset your password for your E-Learning Platform account associated with <strong>{{email}}</strong>.</p>
          <p style="color: #666; font-size: 14px;">Click the button below to reset your password. This link will expire in 1 hour.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{resetLink}}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-size: 16px;">Reset Password</a>
          </div>
          <p style="color: #999; font-size: 12px;">Or copy and paste this link in your browser:<br/>{{resetLink}}</p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">© 2024 E-Learning Platform. All rights reserved.</p>
        </div>
      </div>
    `,
  },
  passwordResetConfirmation: {
    subject: "Your Password Has Been Reset - E-Learning Platform",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">Password Reset Successful</h1>
        </div>
        <div style="padding: 20px; background-color: #fff;">
          <p style="color: #666; font-size: 14px;">Hi {{firstName}},</p>
          <p style="color: #666; font-size: 14px;">Your password has been successfully reset. You can now log in to your E-Learning Platform account with your new password.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{loginLink}}" style="display: inline-block; background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-size: 16px;">Go to Login</a>
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">If you did not make this change or if you have any concerns about your account security, please contact support immediately.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">© 2024 E-Learning Platform. All rights reserved.</p>
        </div>
      </div>
    `,
  },
  passwordResetExpired: {
    subject: "Password Reset Link Expired - E-Learning Platform",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">Password Reset Link Expired</h1>
        </div>
        <div style="padding: 20px; background-color: #fff;">
          <p style="color: #666; font-size: 14px;">Hi {{firstName}},</p>
          <p style="color: #666; font-size: 14px;">The password reset link you attempted to use has expired. Password reset links are valid for 1 hour.</p>
          <p style="color: #666; font-size: 14px;">To reset your password, please request a new link:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{forgotPasswordLink}}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-size: 16px;">Request New Link</a>
          </div>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">© 2024 E-Learning Platform. All rights reserved.</p>
        </div>
      </div>
    `,
  },
};

/**
 * Send Email - Generic function to send emails
 */
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER || "noreply@eduverse.com",
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments || [],
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info("Email sent successfully", {
      to: options.to,
      subject: options.subject,
    });
    return result;
  } catch (error) {
    logger.error("Email send error", {
      to: options.to,
      subject: options.subject,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Send Password Reset Email - For forgot password flow
 */
const sendPasswordResetEmail = async (email, firstName, resetToken, resetLink) => {
  try {
    const template = emailTemplates.passwordReset;
    let html = template.html;

    // Replace template variables
    html = html
      .replace(/{{firstName}}/g, firstName || "User")
      .replace(/{{email}}/g, email)
      .replace(/{{resetLink}}/g, resetLink)
      .replace(/{{resetToken}}/g, resetToken);

    await sendEmail({
      to: email,
      subject: template.subject,
      html,
    });

    logger.info("Password reset email sent", { email });
  } catch (error) {
    logger.error("Failed to send password reset email", { email, error: error.message });
    throw error;
  }
};

/**
 * Send Password Reset Confirmation Email
 */
const sendPasswordResetConfirmationEmail = async (email, firstName, loginLink) => {
  try {
    const template = emailTemplates.passwordResetConfirmation;
    let html = template.html;

    // Replace template variables
    html = html
      .replace(/{{firstName}}/g, firstName || "User")
      .replace(/{{email}}/g, email)
      .replace(/{{loginLink}}/g, loginLink);

    await sendEmail({
      to: email,
      subject: template.subject,
      html,
    });

    logger.info("Password reset confirmation email sent", { email });
  } catch (error) {
    logger.error("Failed to send password reset confirmation email", { email, error: error.message });
    throw error;
  }
};

/**
 * Send Password Reset Expired Email
 */
const sendPasswordResetExpiredEmail = async (email, firstName, forgotPasswordLink) => {
  try {
    const template = emailTemplates.passwordResetExpired;
    let html = template.html;

    // Replace template variables
    html = html
      .replace(/{{firstName}}/g, firstName || "User")
      .replace(/{{email}}/g, email)
      .replace(/{{forgotPasswordLink}}/g, forgotPasswordLink);

    await sendEmail({
      to: email,
      subject: template.subject,
      html,
    });

    logger.info("Password reset expired email sent", { email });
  } catch (error) {
    logger.error("Failed to send password reset expired email", { email, error: error.message });
    throw error;
  }
};

module.exports = {
  transporter,
  sendEmail,
  sendPasswordResetEmail,
  sendPasswordResetConfirmationEmail,
  sendPasswordResetExpiredEmail,
  emailTemplates,
};
