# Firebase Setup Guide for Restaurant App

## Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "restaurant-app")
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication
1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Enable "Email/Password" sign-in method
4. Click "Save"

## Step 3: Get Firebase Configuration
1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Firebase SDK snippet"
4. Copy the configuration object

## Step 4: Update Firebase Configuration
Replace the content in `firebase-config.js` with your actual Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};
```

## Step 5: Test Forgot Password Functionality
1. Start your backend server: `node backend.js`
2. Open `forgot-password.html` in your browser
3. Enter an email address
4. Check your email for the reset link

## Features Implemented
- ✅ Forgot password page with Firebase integration
- ✅ Email validation and error handling
- ✅ Loading states and user feedback
- ✅ Responsive design
- ✅ Integration with existing login system
- ✅ Automatic redirect after successful reset

## Security Notes
- Firebase handles secure password reset emails
- Reset links expire after 24 hours
- Rate limiting prevents abuse
- All communication is encrypted

## Troubleshooting
- If emails don't arrive, check spam folder
- Ensure Email/Password authentication is enabled
- Verify Firebase configuration is correct
- Check browser console for error messages
