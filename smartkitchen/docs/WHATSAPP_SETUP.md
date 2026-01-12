# WhatsApp Alerts Setup Guide

## Overview

VisionDrive Smart Kitchen supports WhatsApp notifications for temperature alerts via Twilio WhatsApp Business API.

## Architecture

```
Temperature Alert Triggered (AWS Lambda)
        ↓
Check: Is WhatsApp enabled for user?
        ↓
YES → Format alert message
        ↓
Call Twilio WhatsApp API
        ↓
Message delivered to kitchen owner's WhatsApp
```

## Prerequisites

1. **Twilio Account** - Create at [twilio.com](https://www.twilio.com)
2. **WhatsApp Business API Access** - Enable in Twilio Console
3. **Verified Phone Number** - For production use

## Setup Steps

### 1. Create Twilio Account

1. Go to [twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up with email and phone number
3. Verify your account

### 2. Enable WhatsApp Sandbox (Development)

1. Go to Twilio Console → Messaging → Try it out → Send a WhatsApp message
2. Follow the sandbox setup instructions
3. Save the sandbox number: `whatsapp:+14155238886`

### 3. Get Credentials

1. Go to Twilio Console → Account Info
2. Copy your:
   - **Account SID**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Auth Token**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 4. Configure Environment Variables

Add these to your AWS Lambda environment:

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### 5. Update CDK Stack

In `smartkitchen/infrastructure/cdk/lib/lambda-stack.ts`:

```typescript
const alertsHandler = new lambda.Function(this, 'AlertsHandler', {
  // ... existing config
  environment: {
    // ... existing env vars
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
    TWILIO_WHATSAPP_FROM: 'whatsapp:+14155238886',
  },
});
```

### 6. Add Twilio SDK to Lambda

Update `smartkitchen/infrastructure/lambda/alerts/package.json`:

```json
{
  "dependencies": {
    "twilio": "^4.20.0"
  }
}
```

### 7. Deploy

```bash
cd smartkitchen/infrastructure/cdk
npm install
cdk deploy SmartKitchen-Lambda
```

## Alert Message Format

Messages are formatted as follows:

```
🚨 *CRITICAL TEMPERATURE ALERT*

🛒 *Display Cooler*
Temperature above safe threshold

📍 *Kitchen:* Abdul's Kitchen
🌡️ *Current:* 8.2°C
✅ *Required:* 0°C to 5°C
⏰ *Time:* 12/01/2026, 08:15 PM

Action required to maintain DM compliance.

---
_VisionDrive Smart Kitchen_
_Reply STOP to unsubscribe_
```

## Alert Types

| Type | Trigger | Emoji |
|------|---------|-------|
| Critical | Temperature far outside range | 🚨 |
| Danger Zone | 5-60°C (food unsafe) | 🔴 |
| Warning | Temperature slightly outside range | ⚠️ |
| Equipment Offline | Sensor disconnected | 📡 |

## User Settings

Kitchen owners can configure WhatsApp alerts in Settings:

1. Go to **Settings** page
2. Enable **WhatsApp Alerts**
3. Enter phone number with country code (e.g., `+971-50-123-4567`)
4. Click **Send Test Message** to verify

## Production Checklist

Before going live:

- [ ] Apply for WhatsApp Business API approval
- [ ] Verify business with Meta
- [ ] Set up production WhatsApp number
- [ ] Configure message templates (required for business-initiated messages)
- [ ] Test with multiple phone numbers
- [ ] Set up monitoring for failed deliveries

## Costs

| Item | Cost |
|------|------|
| Twilio WhatsApp (UAE) | ~$0.05/message |
| Estimated monthly (50 alerts) | ~$2.50 |
| Estimated monthly (200 alerts) | ~$10.00 |

## Testing

### Send Test Message (via API)

```bash
curl -X POST https://your-api/whatsapp/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"phoneNumber": "+971501234567"}'
```

### Simulate Alert

```bash
curl -X POST https://your-api/alerts/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sensorId": "sensor-1",
    "temperature": 8.5,
    "severity": "warning"
  }'
```

## Troubleshooting

### Message Not Delivered

1. Check Twilio Console → Messaging → Logs
2. Verify phone number format (must include country code)
3. Ensure recipient has WhatsApp installed
4. For sandbox: recipient must have joined sandbox

### Rate Limiting

- Twilio limits: 1 message/second per number
- For high volume: upgrade to WhatsApp Business API tier

### Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 21608 | Number not WhatsApp user | Verify number has WhatsApp |
| 63007 | Message outside 24h window | Use template message |
| 63016 | Rate limit exceeded | Slow down or upgrade tier |

## Files Reference

```
smartkitchen/infrastructure/lambda/alerts/
├── whatsapp.js          # WhatsApp integration module
├── index.js             # Main alerts handler
└── package.json         # Dependencies (add twilio)
```

## Support

- Twilio Support: [support.twilio.com](https://support.twilio.com)
- WhatsApp Business API Docs: [developers.facebook.com/docs/whatsapp](https://developers.facebook.com/docs/whatsapp)

---

*Last Updated: January 12, 2026*
