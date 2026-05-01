import nodemailer from 'nodemailer';

const getTransporter = () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return null;
};

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('Email not sent: SMTP credentials not configured.');
    return;
  }
  try {
    await transporter.sendMail({
      from: `"SAAR Platform" <${process.env.SMTP_USER}>`,
      to, subject, html,
    });
  } catch (err) {
    console.error('Email send error:', err.message);
    throw err;
  }
};

export const bookRequestEmail = (ownerEmail, ownerName, requesterName, bookTitle) => ({
  to: ownerEmail,
  subject: `Book Request: "${bookTitle}"`,
  html: `<p>Hi ${ownerName},</p><p><strong>${requesterName}</strong> has requested your book <strong>"${bookTitle}"</strong> on SAAR.</p><p>Log in to accept or decline the request.</p>`,
});

export const requestAcceptedEmail = (requesterEmail, requesterName, bookTitle) => ({
  to: requesterEmail,
  subject: `Your request for "${bookTitle}" was accepted!`,
  html: `<p>Hi ${requesterName},</p><p>Your request for <strong>"${bookTitle}"</strong> was accepted. Chat with the owner to arrange the exchange.</p>`,
});

export const emailVerificationEmail = (userEmail, userName, token) => ({
  to: userEmail,
  subject: 'Verify Your SAAR Account',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #6366f1;">SAAR</h1>
      <h2>Welcome to SAAR, ${userName}!</h2>
      <p>Please verify your email address to complete your registration:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/verify-email?token=${token}"
           style="background: #6366f1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
          Verify Email Address
        </a>
      </div>
      <p style="color: #6b7280; font-size: 14px;">
        If the button doesn't work, copy and paste this link:<br>
        ${process.env.FRONTEND_URL}/verify-email?token=${token}
      </p>
    </div>
  `,
});

export const welcomeEmail = (userEmail, userName) => ({
  to: userEmail,
  subject: 'Welcome to SAAR - Your Academic Journey Starts Here!',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #6366f1;">SAAR</h1>
      <h2>Welcome, ${userName}! 🎉</h2>
      <p>Your academic resource hub is ready. Start uploading notes, exchanging books, and joining study groups.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/dashboard"
           style="background: #6366f1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
          Get Started
        </a>
      </div>
    </div>
  `,
});

export const passwordResetOTPEmail = (userEmail, userName, otp) => ({
  to: userEmail,
  subject: 'Your SAAR Password Reset Code',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #6366f1;">SAAR</h1>
      <h2>Password Reset Code</h2>
      <p>Hi ${userName}, use this code to reset your password:</p>
      <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px dashed #6366f1; text-align: center;">
        <div style="font-size: 32px; font-weight: bold; color: #6366f1; letter-spacing: 8px; font-family: monospace;">
          ${otp}
        </div>
      </div>
      <p style="color: #ef4444; font-weight: bold;">⏰ This code expires in 5 minutes</p>
      <p style="color: #92400e; font-size: 14px;">
        <strong>Security Notice:</strong> If you didn't request this, please ignore this email. Never share this code with anyone.
      </p>
    </div>
  `,
});
