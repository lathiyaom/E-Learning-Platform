const nodemailer = require("nodemailer");

let transporter;

// For development/testing
if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
  transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.MAILTRAP_USER || "test",
      pass: process.env.MAILTRAP_PASS || "test",
    },
  });
} else {
  // Production - use SendGrid or AWS SES
  transporter = nodemailer.createTransport({
    service: "SendGrid",
    auth: {
      user: "apikey",
      pass: process.env.SENDGRID_API_KEY,
    },
  });
}

const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@eduverse.com",
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email send error:", error);
    throw error;
  }
};

module.exports = { transporter, sendEmail };
