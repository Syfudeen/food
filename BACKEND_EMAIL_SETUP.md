# Backend Email Setup - Immediate Working Solution

## Quick Setup (2 minutes)

### Step 1: Install Nodemailer
In your restaurant folder, run:
```bash
npm install nodemailer
```

### Step 2: Add Email Code to Backend
Copy the code from `email-backend.js` and add it to your `backend.js` file.

### Step 3: Configure Gmail
1. Enable 2-factor authentication on your Gmail
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate new app password
   - Use this password in the code

### Step 4: Update Email Configuration
In `backend.js`, update these lines:
```javascript
auth: {
    user: 'your-email@gmail.com',    // Your Gmail
    pass: 'your-app-password'       // App password (not regular password)
}
```

### Step 5: Restart Backend
```bash
node backend.js
```

## Test It Now!
1. Open login.html
2. Click "Forgot Password?"
3. Enter your email
4. Check your inbox immediately!

## Benefits
✅ **Works immediately** - No external services needed
✅ **Free** - Uses your existing Gmail
✅ **Professional emails** - Beautiful HTML templates
✅ **Reliable** - Direct email sending
✅ **No limits** - Send as many emails as you want

## Email Template Preview
The system sends beautiful HTML emails with:
- Restaurant branding
- Reset button
- Backup link
- Contact information

## Troubleshooting
If emails don't send:
1. Check Gmail app password is correct
2. Ensure nodemailer is installed
3. Check backend console for errors
4. Verify backend is running on port 3000

## Alternative Email Services
You can also use:
- Outlook (Hotmail)
- Yahoo Mail
- Any SMTP server
- Your own email server

Just change the service configuration in the transporter.
