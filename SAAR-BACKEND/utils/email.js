import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const nodemailer = require('nodemailer');

// Simple email service with fallback options
export const sendEmail = async ({ to, subject, html }) => {
  console.log('🔍 Starting email send process...');
  console.log('📧 To:', to);
  console.log('📝 Subject:', subject);
  console.log('🔍 Nodemailer object:', typeof nodemailer, Object.keys(nodemailer));
  
  // Skip Resend completely and go straight to Gmail
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log('📮 Using Gmail SMTP...');
    console.log('👤 SMTP User:', process.env.SMTP_USER);
    
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { 
          user: process.env.SMTP_USER, 
          pass: process.env.SMTP_PASS 
        },
      });
      
      console.log('🔗 Verifying SMTP connection...');
      await transporter.verify();
      console.log('✅ SMTP connection verified');
      
      const info = await transporter.sendMail({
        from: `"SAAR Platform" <${process.env.SMTP_USER}>`,
        to, subject, html,
      });
      
      console.log('✅ Email sent via Gmail SMTP to:', to);
      console.log('📧 Message ID:', info.messageId);
      return info;
    } catch (error) {
      console.error('❌ Gmail SMTP error details:');
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Full error:', error);
      throw new Error(`Gmail SMTP failed: ${error.message}`);
    }
  }
  
  // Development fallback - use Ethereal test email
  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log('📧 Using test email service for development');
    
    const transporter = nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    
    const info = await transporter.sendMail({
      from: '"SAAR Platform" <noreply@saar.edu>',
      to, subject, html,
    });
    
    console.log('✅ Test email sent to:', to);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('🔗 Preview email at:', previewUrl);
    }
    
    return info;
  } catch (error) {
    console.error('❌ Test email error:', error);
    throw new Error('Email service is not available. Please configure SMTP credentials.');
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
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #6366f1; margin: 0;">SAAR</h1>
        <p style="color: #666; margin: 5px 0;">Student Academic Resource Platform</p>
      </div>
      
      <div style="background: #f8fafc; padding: 30px; border-radius: 10px;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">Welcome to SAAR, ${userName}!</h2>
        <p style="color: #4b5563; margin-bottom: 30px;">Please verify your email address to complete your registration:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/verify-email?token=${token}" 
             style="background: #6366f1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          If the button doesn't work, copy and paste this link: <br>
          ${process.env.FRONTEND_URL}/verify-email?token=${token}
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          This email was sent by SAAR Platform • Please do not reply to this email
        </p>
      </div>
    </div>
  `,
});

export const welcomeEmail = (userEmail, userName) => ({
  to: userEmail,
  subject: 'Welcome to SAAR - Your Academic Journey Starts Here!',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #6366f1; margin: 0;">SAAR</h1>
        <p style="color: #666; margin: 5px 0;">Student Academic Resource Platform</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h2 style="margin: 0 0 15px 0;">Welcome to SAAR, ${userName}! 🎉</h2>
        <p style="margin: 0; opacity: 0.9;">Your academic resource hub is ready!</p>
      </div>
      
      <div style="background: #f8fafc; padding: 30px; border-radius: 10px;">
        <h3 style="color: #1f2937; margin-top: 0;">What you can do now:</h3>
        
        <div style="margin: 20px 0;">
          <div style="display: flex; align-items: center; margin: 15px 0;">
            <div style="background: #10b981; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold;">1</div>
            <div>
              <strong>Upload & Share Notes</strong><br>
              <span style="color: #6b7280; font-size: 14px;">Share your study materials with fellow students</span>
            </div>
          </div>
          
          <div style="display: flex; align-items: center; margin: 15px 0;">
            <div style="background: #3b82f6; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold;">2</div>
            <div>
              <strong>Exchange Books</strong><br>
              <span style="color: #6b7280; font-size: 14px;">Find and exchange textbooks with other students</span>
            </div>
          </div>
          
          <div style="display: flex; align-items: center; margin: 15px 0;">
            <div style="background: #8b5cf6; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold;">3</div>
            <div>
              <strong>Join Study Groups</strong><br>
              <span style="color: #6b7280; font-size: 14px;">Connect with students in your courses</span>
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/dashboard" 
             style="background: #6366f1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Get Started
          </a>
        </div>
      </div>
    </div>
  `,
});
export const passwordResetOTPEmail = (userEmail, userName, otp) => ({
  to: userEmail,
  subject: 'Your SAAR Password Reset Code',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #6366f1; margin: 0;">SAAR</h1>
        <p style="color: #666; margin: 5px 0;">Student Academic Resource Platform</p>
      </div>
      
      <div style="background: #f8fafc; padding: 30px; border-radius: 10px; text-align: center;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">Password Reset Code</h2>
        <p style="color: #4b5563; margin-bottom: 30px;">Hi ${userName},</p>
        <p style="color: #4b5563; margin-bottom: 30px;">Use this code to reset your password:</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px dashed #6366f1;">
          <div style="font-size: 32px; font-weight: bold; color: #6366f1; letter-spacing: 8px; font-family: monospace;">
            ${otp}
          </div>
        </div>
        
        <p style="color: #ef4444; font-weight: bold; margin: 20px 0;">⏰ This code expires in 5 minutes</p>
        <p style="color: #6b7280; font-size: 14px;">Enter this code in the app to continue with your password reset.</p>
      </div>
      
      <div style="margin-top: 30px; padding: 20px; background: #fef3c7; border-radius: 8px;">
        <p style="color: #92400e; margin: 0; font-size: 14px;">
          <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. 
          Never share this code with anyone.
        </p>
      </div>
      
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          This email was sent by SAAR Platform • Please do not reply to this email
        </p>
      </div>
    </div>
  `,
});
