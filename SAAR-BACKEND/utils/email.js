import nodemailer from 'nodemailer';

const getTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
};

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = getTransporter();
  if (!transporter) return;
  try {
    await transporter.sendMail({
      from: `"SAAR Platform" <${process.env.SMTP_USER}>`,
      to, subject, html,
    });
  } catch (err) {
    console.error('Email send error:', err.message);
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
