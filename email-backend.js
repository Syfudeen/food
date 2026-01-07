// Add this to your backend.js file for email sending
const nodemailer = require('nodemailer');

// Create email transporter using Gmail (or your preferred service)
const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com', // Replace with your email
        pass: 'your-app-password'     // Use app password, not regular password
    }
});

// Email sending endpoint
app.post('/send-reset-email', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const resetLink = `http://10.23.240.23:3000/reset-password.html?email=${email}`;
        
        const mailOptions = {
            from: 'your-email@gmail.com', // Replace with your email
            to: email,
            subject: 'Password Reset Request - Restaurant App',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #ff4500; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1>🍽️ Restaurant App</h1>
                        <h2>Password Reset Request</h2>
                    </div>
                    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                        <p>Dear Customer,</p>
                        <p>You requested to reset your password for the Restaurant App.</p>
                        <p>Please click the button below to reset your password:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetLink}" style="background: #ff4500; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                Reset Password
                            </a>
                        </div>
                        <p>Or copy and paste this link in your browser:</p>
                        <p style="background: #e9ecef; padding: 10px; border-radius: 5px; word-break: break-all;">
                            ${resetLink}
                        </p>
                        <p>If you didn't request this, please ignore this email.</p>
                        <p>Best regards,<br>Restaurant Team</p>
                        <p style="color: #666; font-size: 12px;">Contact: +91 8072007223</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        
        console.log(`✅ Password reset email sent to: ${email}`);
        res.json({ success: true, message: 'Password reset email sent successfully' });
        
    } catch (error) {
        console.error('❌ Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

// Simple reset password page
app.get('/reset-password.html', (req, res) => {
    const email = req.query.email;
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Reset Password - Restaurant</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
                .reset-container { background: white; border-radius: 15px; padding: 40px; max-width: 400px; width: 90%; box-shadow: 0 15px 35px rgba(0,0,0,0.1); }
                .header { text-align: center; margin-bottom: 30px; }
                .header h2 { color: #ff4500; margin-bottom: 10px; }
                .btn-reset { background: #ff4500; color: white; border: none; padding: 12px 30px; border-radius: 25px; width: 100%; font-weight: 600; }
                .btn-reset:hover { background: #ff6b35; }
            </style>
        </head>
        <body>
            <div class="reset-container">
                <div class="header">
                    <h2>🔑 Reset Password</h2>
                    <p>Enter your new password</p>
                </div>
                <form onsubmit="handleReset(event)">
                    <input type="hidden" id="email" value="${email || ''}">
                    <div class="mb-3">
                        <label class="form-label">New Password</label>
                        <input type="password" class="form-control" id="newPassword" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Confirm Password</label>
                        <input type="password" class="form-control" id="confirmPassword" required>
                    </div>
                    <button type="submit" class="btn-reset">Reset Password</button>
                </form>
                <div class="text-center mt-3">
                    <a href="login.html" style="color: #ff4500;">← Back to Login</a>
                </div>
            </div>
            <script>
                function handleReset(event) {
                    event.preventDefault();
                    const newPassword = document.getElementById('newPassword').value;
                    const confirmPassword = document.getElementById('confirmPassword').value;
                    
                    if (newPassword !== confirmPassword) {
                        alert('Passwords do not match!');
                        return;
                    }
                    
                    alert('Password reset functionality will be implemented with your user database. For now, please contact support.');
                    window.location.href = 'login.html';
                }
            </script>
        </body>
        </html>
    `);
});
