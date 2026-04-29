# Gmail SMTP Setup for SAAR Platform

## Required: Configure Gmail for OTP Emails

The forgot password feature requires Gmail SMTP to send OTP codes to users' email addresses.

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click "2-Step Verification" 
3. Follow the setup process to enable 2FA

### Step 2: Generate App Password
1. In Google Account Security, go to "2-Step Verification"
2. Scroll down to "App passwords"
3. Click "Select app" → Choose "Mail"
4. Click "Select device" → Choose "Other (custom name)"
5. Enter "SAAR Platform" as the name
6. Click "Generate"
7. **Copy the 16-character password** (format: xxxx xxxx xxxx xxxx)

### Step 3: Update .env File
Edit `/SAAR-BACKEND/.env` and replace:

```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
```

**Example:**
```env
SMTP_USER=john.doe@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
```

### Step 4: Restart Backend Server
```bash
cd SAAR-BACKEND
npm start
```

### Step 5: Test
1. Go to login page
2. Click "Forgot your password?"
3. Enter your email address
4. Check your Gmail inbox for the OTP code

## Alternative Email Providers

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

## Troubleshooting

### "Email service is not configured"
- Check that SMTP_USER and SMTP_PASS are filled in .env
- Restart the backend server after changes

### "Failed to send email"
- Verify Gmail app password is correct (16 characters)
- Ensure 2-Factor Authentication is enabled
- Check that the Gmail account is active

### "Invalid credentials"
- Don't use your regular Gmail password
- Use the 16-character app password generated in Step 2
- Remove any spaces from the app password

## Security Notes
- Never commit the .env file with real credentials
- Use app passwords, not regular account passwords
- Keep your app passwords secure and private