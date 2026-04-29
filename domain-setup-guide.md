# Resend Domain Setup Guide

## Quick Domain Verification Options:

### Option 1: Use Your Own Domain
1. Go to https://resend.com/domains
2. Click "Add Domain"
3. Enter your domain (e.g., mydomain.com)
4. Add the DNS records Resend provides
5. Wait for verification (usually 5-10 minutes)

### Option 2: Free Domain Services
If you don't have a domain:

**Freenom (Free domains):**
1. Go to freenom.com
2. Get a free .tk, .ml, .ga, or .cf domain
3. Add it to Resend
4. Configure DNS records

**GitHub Pages:**
1. Create a GitHub repo named: username.github.io
2. Enable GitHub Pages
3. Use: username.github.io as your domain in Resend

### Option 3: Subdomain Services
**Netlify:**
1. Deploy any simple site to Netlify
2. Get free subdomain: yourapp.netlify.app
3. Use this domain in Resend

## After Domain Verification:

Update your .env file:
```env
RESEND_DOMAIN=yourdomain.com
```

And the code will use: noreply@yourdomain.com

## Test Domain Verification:
Once verified, test with:
```bash
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "SAAR <noreply@yourdomain.com>",
    "to": ["any-email@example.com"],
    "subject": "Test",
    "html": "<p>Success!</p>"
  }'
```

Which domain option would you like to use?