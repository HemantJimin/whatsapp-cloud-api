require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const WHATSAPP_API_URL = 'https://graph.instagram.com/v18.0';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'API is running', timestamp: new Date() });
});

// Send WhatsApp message endpoint
app.post('/send', async (req, res) => {
  try {
    const { phone_number_id, to, text, access_token } = req.body;

    // Validate inputs
    if (!phone_number_id || !to || !text || !access_token) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: phone_number_id, to, text, access_token'
      });
    }

    // Call Meta WhatsApp Cloud API
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${phone_number_id}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to.replace(/\D/g, ''),  // Remove non-numeric characters
        type: 'text',
        text: { body: text }
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      success: true,
      message_id: response.data.messages[0].id,
      data: response.data
    });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || error.message
    });
  }
});

// Webhook to receive incoming messages
app.post('/webhook', (req, res) => {
  try {
    const data = req.body;

    if (data.object === 'whatsapp_business_account') {
      // Process incoming message event
      console.log('Incoming message:', data);
      res.json({ received: true });
    } else {
      res.status(400).json({ error: 'Invalid webhook object' });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook verification (for Meta)
app.get('/webhook', (req, res) => {
  const verify_token = process.env.WEBHOOK_VERIFY_TOKEN || 'webdevsoft_token';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === verify_token) {
      console.log('Webhook verified');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`WhatsApp Cloud API server running on port ${PORT}`);
});

module.exports = app;
