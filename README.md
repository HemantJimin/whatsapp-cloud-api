# WhatsApp Cloud API Backend

Express.js server for Meta's WhatsApp Cloud API with n8n integration.

## Features

- POST `/send` - Send WhatsApp messages
- GET `/health` - Health check
- POST/GET `/webhook` - Incoming messages

## Quick Deploy to Render.com

1. Visit https://render.com
2. Click "New" → "Web Service"
3. Connect this GitHub repo
4. Set start command: `npm start`
5. Add environment variables from `.env.example`
6. Deploy!

## API Endpoints

POST /send
Body: { phone_number_id, to, text, access_token }

GET /health
Returns API status

## Usage with n8n

Add HTTP Request node:
- Method: POST
- URL: https://your-api.com/send
- Body: { phone_number_id, to, text, access_token }

See .env.example for configuration.
