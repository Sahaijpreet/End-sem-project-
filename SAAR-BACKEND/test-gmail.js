import nodemailer from 'nodemailer';

const testGmail = async () => {
  console.log('Testing Gmail SMTP connection...');
  
  const transporter = nodemailer.createTransporter({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'sahaijpreets@gmail.com',
      pass: 'zgph uwok ssec yekk'
    }
  });

  try {
    // Verify connection
    await transporter.verify();
    console.log('✅ Gmail SMTP connection verified');
    
    // Send test email
    const info = await transporter.sendMail({
      from: '"SAAR Platform" <sahaijpreets@gmail.com>',
      to: 'sahaijpreets@gmail.com',
      subject: 'Test OTP - SAAR',
      html: '<h2>Test OTP: 123456</h2><p>This is a test email from SAAR platform.</p>'
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ Gmail SMTP Error:', error.message);
    console.error('Full error:', error);
  }
};

testGmail();