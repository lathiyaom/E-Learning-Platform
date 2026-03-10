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
    subject: "Password Reset Request - Eduverse",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - Eduverse</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F9FAFB; -webkit-font-smoothing: antialiased;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F9FAFB;">
          <tr>
            <td style="padding: 40px 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                
                <!-- Header with Gradient Background -->
                <tr>
                  <td style="background: linear-gradient(135deg, #1A1B23 0%, #2d2e3b 100%); padding: 48px 40px; text-align: center; position: relative;">
                    <!-- Logo -->
                    <div style="margin-bottom: 24px;">
                      <div style="display: inline-block; background: linear-gradient(135deg, #B48B4D 0%, #ecb613 100%); padding: 12px 28px; border-radius: 12px; box-shadow: 0 8px 24px rgba(180, 139, 77, 0.25);">
                        <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; background: linear-gradient(135deg, #FFFFFF 0%, #f3f0ff 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">EDUVERSE</h1>
                      </div>
                    </div>
                    
                    <!-- Badge -->
                    <div style="display: inline-block; background: rgba(180, 139, 77, 0.15); border: 1px solid rgba(180, 139, 77, 0.3); padding: 8px 20px; border-radius: 20px; margin-bottom: 20px;">
                      <span style="color: #ecb613; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">🔐 Security Alert</span>
                    </div>
                    
                    <h2 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; line-height: 1.3;">Password Reset Request</h2>
                  </td>
                </tr>
                
                <!-- Main Content -->
                <tr>
                  <td style="padding: 48px 40px;">
                    <div style="margin-bottom: 32px;">
                      <p style="margin: 0 0 8px 0; color: #1A1B23; font-size: 18px; font-weight: 600;">Hi {{firstName}},</p>
                      <p style="margin: 0; color: #64748b; font-size: 16px; line-height: 1.6;">We received a request to reset the password for your Eduverse account associated with <strong style="color: #1A1B23;">{{email}}</strong>.</p>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #f3f0ff 0%, #fef3e2 100%); border-left: 4px solid #B48B4D; padding: 20px 24px; border-radius: 12px; margin-bottom: 32px;">
                      <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6;">
                        <strong style="color: #1A1B23;">⏰ Time-Sensitive:</strong> This password reset link will expire in <strong style="color: #B48B4D;">1 hour</strong> for your security.
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 28px 0; color: #64748b; font-size: 15px; line-height: 1.6;">Click the button below to create a new password and regain access to your account:</p>
                    
                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 36px 0;">
                      <a href="{{resetLink}}" style="display: inline-block; background: linear-gradient(135deg, #B48B4D 0%, #ecb613 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-size: 16px; font-weight: 700; box-shadow: 0 8px 24px rgba(180, 139, 77, 0.3); transition: all 0.3s;">
                        Reset My Password →
                      </a>
                    </div>
                    
                    <!-- Alternative Link -->
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; margin: 32px 0;">
                      <p style="margin: 0 0 8px 0; color: #475569; font-size: 13px; font-weight: 600;">Or copy and paste this link:</p>
                      <p style="margin: 0; color: #B48B4D; font-size: 12px; word-break: break-all; line-height: 1.5;">{{resetLink}}</p>
                    </div>
                    
                    <!-- Security Notice -->
                    <div style="margin-top: 36px; padding-top: 32px; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                        <strong style="color: #1A1B23;">Didn't request this?</strong> If you didn't request a password reset, please ignore this email or <a href="mailto:support@eduverse.com" style="color: #B48B4D; text-decoration: none; font-weight: 600;">contact our support team</a> if you have concerns about your account security.
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 32px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0 0 12px 0; color: #94a3b8; font-size: 13px; line-height: 1.6;">
                      This email was sent by <strong style="color: #64748b;">Eduverse</strong><br/>
                      Your trusted platform for online learning excellence
                    </p>
                    <p style="margin: 0; color: #cbd5e1; font-size: 12px;">© 2026 Eduverse. All rights reserved.</p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  },
  passwordResetConfirmation: {
    subject: "Password Successfully Changed - Eduverse",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed - Eduverse</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F9FAFB; -webkit-font-smoothing: antialiased;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F9FAFB;">
          <tr>
            <td style="padding: 40px 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                
                <!-- Header with Success Theme -->
                <tr>
                  <td style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 48px 40px; text-align: center; position: relative;">
                    <!-- Logo -->
                    <div style="margin-bottom: 24px;">
                      <div style="display: inline-block; background: linear-gradient(135deg, #B48B4D 0%, #ecb613 100%); padding: 12px 28px; border-radius: 12px; box-shadow: 0 8px 24px rgba(180, 139, 77, 0.25);">
                        <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; background: linear-gradient(135deg, #FFFFFF 0%, #f3f0ff 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">EDUVERSE</h1>
                      </div>
                    </div>
                    
                    <!-- Success Icon -->
                    <div style="margin-bottom: 20px;">
                      <div style="display: inline-block; width: 80px; height: 80px; background: rgba(255, 255, 255, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 48px;">✓</span>
                      </div>
                    </div>
                    
                    <h2 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; line-height: 1.3;">Password Changed Successfully!</h2>
                  </td>
                </tr>
                
                <!-- Main Content -->
                <tr>
                  <td style="padding: 48px 40px;">
                    <div style="margin-bottom: 32px;">
                      <p style="margin: 0 0 8px 0; color: #1A1B23; font-size: 18px; font-weight: 600;">Hi {{firstName}},</p>
                      <p style="margin: 0; color: #64748b; font-size: 16px; line-height: 1.6;">Great news! Your password has been successfully reset. You can now access your Eduverse account with your new credentials.</p>
                    </div>
                    
                    <!-- Info Box -->
                    <div style="background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%); border-left: 4px solid #10b981; padding: 20px 24px; border-radius: 12px; margin-bottom: 32px;">
                      <p style="margin: 0; color: #065f46; font-size: 14px; line-height: 1.6;">
                        <strong>🎉 All Set!</strong> Your account is now secure with your new password. You can log in and continue your learning journey.
                      </p>
                    </div>
                    
                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 36px 0;">
                      <a href="{{loginLink}}" style="display: inline-block; background: linear-gradient(135deg, #B48B4D 0%, #ecb613 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-size: 16px; font-weight: 700; box-shadow: 0 8px 24px rgba(180, 139, 77, 0.3);">
                        Go to Login →
                      </a>
                    </div>
                    
                    <!-- Security Tips -->
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 24px; border-radius: 12px; margin: 32px 0;">
                      <p style="margin: 0 0 12px 0; color: #1A1B23; font-size: 15px; font-weight: 600;">🛡️ Security Tips:</p>
                      <ul style="margin: 0; padding-left: 20px; color: #64748b; font-size: 14px; line-height: 1.8;">
                        <li>Never share your password with anyone</li>
                        <li>Use a unique password for your Eduverse account</li>
                        <li>Enable two-factor authentication for extra security</li>
                      </ul>
                    </div>
                    
                    <!-- Security Alert -->
                    <div style="margin-top: 36px; padding-top: 32px; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                        <strong style="color: #dc2626;">⚠️ Didn't make this change?</strong> If you did not reset your password, please <a href="mailto:support@eduverse.com" style="color: #dc2626; text-decoration: none; font-weight: 600;">contact our support team immediately</a> to secure your account.
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 32px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0 0 12px 0; color: #94a3b8; font-size: 13px; line-height: 1.6;">
                      This email was sent by <strong style="color: #64748b;">Eduverse</strong><br/>
                      Your trusted platform for online learning excellence
                    </p>
                    <p style="margin: 0; color: #cbd5e1; font-size: 12px;">© 2026 Eduverse. All rights reserved.</p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  },
  passwordResetExpired: {
    subject: "Password Reset Link Expired - Eduverse",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Link Expired - Eduverse</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F9FAFB; -webkit-font-smoothing: antialiased;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F9FAFB;">
          <tr>
            <td style="padding: 40px 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                
                <!-- Header with Warning Theme -->
                <tr>
                  <td style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); padding: 48px 40px; text-align: center; position: relative;">
                    <!-- Logo -->
                    <div style="margin-bottom: 24px;">
                      <div style="display: inline-block; background: linear-gradient(135deg, #B48B4D 0%, #ecb613 100%); padding: 12px 28px; border-radius: 12px; box-shadow: 0 8px 24px rgba(180, 139, 77, 0.25);">
                        <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; background: linear-gradient(135deg, #FFFFFF 0%, #f3f0ff 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">EDUVERSE</h1>
                      </div>
                    </div>
                    
                    <!-- Warning Icon -->
                    <div style="margin-bottom: 20px;">
                      <div style="display: inline-block; width: 80px; height: 80px; background: rgba(255, 255, 255, 0.2); border-radius: 50%;">
                        <span style="font-size: 48px; line-height: 80px;">⏱️</span>
                      </div>
                    </div>
                    
                    <h2 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; line-height: 1.3;">Link Has Expired</h2>
                  </td>
                </tr>
                
                <!-- Main Content -->
                <tr>
                  <td style="padding: 48px 40px;">
                    <div style="margin-bottom: 32px;">
                      <p style="margin: 0 0 8px 0; color: #1A1B23; font-size: 18px; font-weight: 600;">Hi {{firstName}},</p>
                      <p style="margin: 0; color: #64748b; font-size: 16px; line-height: 1.6;">The password reset link you tried to use has expired. For security reasons, password reset links are only valid for <strong style="color: #1A1B23;">1 hour</strong>.</p>
                    </div>
                    
                    <!-- Warning Box -->
                    <div style="background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); border-left: 4px solid #f59e0b; padding: 20px 24px; border-radius: 12px; margin-bottom: 32px;">
                      <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                        <strong>🔒 Security First:</strong> Links expire after 1 hour to keep your account secure. Don't worry—you can request a new link anytime!
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 28px 0; color: #64748b; font-size: 15px; line-height: 1.6;">No worries! Simply request a new password reset link, and we'll send you a fresh one that's valid for another hour:</p>
                    
                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 36px 0;">
                      <a href="{{forgotPasswordLink}}" style="display: inline-block; background: linear-gradient(135deg, #B48B4D 0%, #ecb613 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-size: 16px; font-weight: 700; box-shadow: 0 8px 24px rgba(180, 139, 77, 0.3);">
                        Request New Link →
                      </a>
                    </div>
                    
                    <!-- Help Section -->
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 24px; border-radius: 12px; margin: 32px 0;">
                      <p style="margin: 0 0 12px 0; color: #1A1B23; font-size: 15px; font-weight: 600;">💡 Quick Tips:</p>
                      <ul style="margin: 0; padding-left: 20px; color: #64748b; font-size: 14px; line-height: 1.8;">
                        <li>Check your email immediately after requesting a reset</li>
                        <li>Complete the password reset process within 1 hour</li>
                        <li>Check your spam folder if you don't see the email</li>
                      </ul>
                    </div>
                    
                    <!-- Support -->
                    <div style="margin-top: 36px; padding-top: 32px; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                        <strong style="color: #1A1B23;">Need Help?</strong> Our support team is here to assist you. <a href="mailto:support@eduverse.com" style="color: #B48B4D; text-decoration: none; font-weight: 600;">Contact us anytime</a> if you're having trouble accessing your account.
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 32px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0 0 12px 0; color: #94a3b8; font-size: 13px; line-height: 1.6;">
                      This email was sent by <strong style="color: #64748b;">Eduverse</strong><br/>
                      Your trusted platform for online learning excellence
                    </p>
                    <p style="margin: 0; color: #cbd5e1; font-size: 12px;">© 2026 Eduverse. All rights reserved.</p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
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
