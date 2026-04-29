// Professional Email Service Providers for OTP delivery

// 1. RESEND (Easiest setup - recommended)
import { Resend } from 'resend';

export const sendWithResend = async ({ to, subject, html }) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  try {
    const data = await resend.emails.send({
      from: 'SAAR Platform <noreply@yourdomain.com>',
      to: [to],
      subject,
      html,
    });
    console.log('✅ Email sent via Resend:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Resend error:', error);
    throw new Error('Failed to send email via Resend');
  }
};

// 2. SENDGRID (Most popular)
import sgMail from '@sendgrid/mail';

export const sendWithSendGrid = async ({ to, subject, html }) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  const msg = {
    to,
    from: 'noreply@yourdomain.com',
    subject,
    html,
  };
  
  try {
    await sgMail.send(msg);
    console.log('✅ Email sent via SendGrid');
  } catch (error) {
    console.error('❌ SendGrid error:', error);
    throw new Error('Failed to send email via SendGrid');
  }
};

// 3. AMAZON SES
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

export const sendWithAmazonSES = async ({ to, subject, html }) => {
  const sesClient = new SESClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  
  const params = {
    Source: 'noreply@yourdomain.com',
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject },
      Body: { Html: { Data: html } },
    },
  };
  
  try {
    const command = new SendEmailCommand(params);
    const result = await sesClient.send(command);
    console.log('✅ Email sent via Amazon SES:', result.MessageId);
    return result;
  } catch (error) {
    console.error('❌ Amazon SES error:', error);
    throw new Error('Failed to send email via Amazon SES');
  }
};

// 4. SMS OTP with TWILIO (Alternative to email)
import twilio from 'twilio';

export const sendSMSOTP = async (phoneNumber, otp) => {
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  
  try {
    const message = await client.messages.create({
      body: `Your SAAR verification code is: ${otp}. Valid for 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    console.log('✅ SMS sent via Twilio:', message.sid);
    return message;
  } catch (error) {
    console.error('❌ Twilio error:', error);
    throw new Error('Failed to send SMS via Twilio');
  }
};