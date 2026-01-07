# Email Setup Guide for Forgot Password

## Quick Setup with EmailJS (Free - 200 emails/month)

### Step 1: Create EmailJS Account
1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account (200 emails/month free)

### Step 2: Create Email Service
1. In EmailJS dashboard, click "Email Services"
2. Click "Add New Service"
3. Choose "Gmail" (or your preferred email service)
4. Follow the instructions to connect your email
5. Note your Service ID (e.g., "service_gmail123")

### Step 3: Create Email Template
1. Click "Email Templates" → "Create New Template"
2. Template Name: "Password Reset"
3. Template ID: "template_password_reset" (note this ID)

### Template Content:
```
Subject: Password Reset Request - Restaurant App

Dear {{to_email}},

You requested to reset your password for the Restaurant App.

Please click the following link to reset your password:
{{reset_link}}

If you didn't request this, please ignore this email.

Best regards,
Restaurant Team
```

### Step 4: Update Login Page
Replace these values in `login.html`:

```javascript
// Line 149: Replace with your EmailJS public key
emailjs.init("YOUR_PUBLIC_KEY");

// Line 224: Replace with your service ID
emailjs.send("service_gmail123", "template_password_reset", {
    to_email: email,
    from_name: "Restaurant App",
    reset_link: "http://localhost:3000/reset-password.html?email=" + email,
    reply_to: "support@restaurant.com"
})
```

### Step 5: Test It
1. Open login.html
2. Click "Forgot Password?"
3. Enter your email
4. Check your inbox for the reset email

## Alternative: Use Your Own Email Server

If you have your own email server, you can:
1. Create a simple backend endpoint for sending emails
2. Use Node.js with nodemailer
3. Connect to any SMTP service (Gmail, Outlook, etc.)

## Current Status
- ✅ Forgot password UI is working
- ✅ Email service integration ready
- ⚠️ Need EmailJS configuration to send real emails

## Benefits of EmailJS
- ✅ Free tier (200 emails/month)
- ✅ No backend required
- ✅ Easy setup
- ✅ Reliable delivery
- ✅ Professional templates
