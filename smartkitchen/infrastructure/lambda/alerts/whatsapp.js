/**
 * WhatsApp Alert Integration via Twilio
 * 
 * This module handles sending WhatsApp messages for temperature alerts.
 * Uses Twilio WhatsApp Business API.
 * 
 * Environment Variables Required:
 * - TWILIO_ACCOUNT_SID: Your Twilio Account SID
 * - TWILIO_AUTH_TOKEN: Your Twilio Auth Token
 * - TWILIO_WHATSAPP_FROM: Your Twilio WhatsApp number (e.g., whatsapp:+14155238886)
 * 
 * @module whatsapp
 */

const twilio = require('twilio');

// Initialize Twilio client
const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!accountSid || !authToken) {
    console.error('Twilio credentials not configured');
    return null;
  }
  
  return twilio(accountSid, authToken);
};

/**
 * Alert severity levels
 */
const SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'critical',
  DANGER_ZONE: 'danger_zone',
};

/**
 * Get emoji based on alert severity
 */
const getSeverityEmoji = (severity) => {
  const emojis = {
    [SEVERITY.INFO]: 'ℹ️',
    [SEVERITY.WARNING]: '⚠️',
    [SEVERITY.CRITICAL]: '🚨',
    [SEVERITY.DANGER_ZONE]: '🔴',
  };
  return emojis[severity] || '📢';
};

/**
 * Format temperature for display
 */
const formatTemp = (temp) => {
  return `${temp.toFixed(1)}°C`;
};

/**
 * Format alert message for WhatsApp
 * 
 * @param {Object} alert - Alert object
 * @param {string} alert.sensorName - Name of the sensor
 * @param {string} alert.sensorIcon - Emoji icon for the sensor
 * @param {string} alert.kitchenName - Name of the kitchen
 * @param {number} alert.currentTemp - Current temperature reading
 * @param {Object} alert.requiredRange - Required temperature range {min, max}
 * @param {string} alert.severity - Alert severity level
 * @param {string} alert.message - Alert message
 * @returns {string} Formatted WhatsApp message
 */
const formatAlertMessage = (alert) => {
  const emoji = getSeverityEmoji(alert.severity);
  const timestamp = new Date().toLocaleString('en-AE', { 
    timeZone: 'Asia/Dubai',
    dateStyle: 'short',
    timeStyle: 'short'
  });
  
  let rangeText = '';
  if (alert.requiredRange) {
    if (alert.requiredRange.min !== undefined && alert.requiredRange.max !== undefined) {
      rangeText = `${alert.requiredRange.min}°C to ${alert.requiredRange.max}°C`;
    } else if (alert.requiredRange.min !== undefined) {
      rangeText = `≥${alert.requiredRange.min}°C`;
    } else if (alert.requiredRange.max !== undefined) {
      rangeText = `≤${alert.requiredRange.max}°C`;
    }
  }
  
  // Format message based on severity
  let header = '';
  switch (alert.severity) {
    case SEVERITY.CRITICAL:
      header = '🚨 *CRITICAL TEMPERATURE ALERT*';
      break;
    case SEVERITY.DANGER_ZONE:
      header = '🔴 *DANGER ZONE ALERT*';
      break;
    case SEVERITY.WARNING:
      header = '⚠️ *Temperature Warning*';
      break;
    default:
      header = 'ℹ️ *VisionDrive Alert*';
  }
  
  const message = `${header}

${alert.sensorIcon || '🌡️'} *${alert.sensorName}*
${alert.message}

📍 *Kitchen:* ${alert.kitchenName}
🌡️ *Current:* ${formatTemp(alert.currentTemp)}
✅ *Required:* ${rangeText}
⏰ *Time:* ${timestamp}

${alert.severity === SEVERITY.DANGER_ZONE ? '⚠️ *Food in danger zone (5-60°C) for 2+ hours must be discarded per DM guidelines.*\n\n' : ''}Action required to maintain DM compliance.

---
_VisionDrive Smart Kitchen_
_Reply STOP to unsubscribe_`;

  return message;
};

/**
 * Send WhatsApp alert message
 * 
 * @param {Object} options - Message options
 * @param {string} options.to - Recipient phone number (with country code)
 * @param {Object} options.alert - Alert data
 * @returns {Promise<Object>} Twilio message response
 */
const sendWhatsAppAlert = async ({ to, alert }) => {
  const client = getTwilioClient();
  
  if (!client) {
    throw new Error('Twilio client not initialized');
  }
  
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
  const toNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  
  const messageBody = formatAlertMessage(alert);
  
  try {
    const message = await client.messages.create({
      body: messageBody,
      from: fromNumber,
      to: toNumber,
    });
    
    console.log(`WhatsApp message sent: ${message.sid}`);
    
    return {
      success: true,
      messageId: message.sid,
      status: message.status,
    };
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    throw error;
  }
};

/**
 * Send test WhatsApp message
 * 
 * @param {string} to - Recipient phone number
 * @returns {Promise<Object>} Twilio message response
 */
const sendTestMessage = async (to) => {
  const client = getTwilioClient();
  
  if (!client) {
    throw new Error('Twilio client not initialized');
  }
  
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
  const toNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  
  const testMessage = `✅ *VisionDrive Test Message*

Your WhatsApp alerts are configured correctly!

You will receive notifications for:
• 🚨 Critical temperature breaches
• 🔴 Danger Zone warnings (5-60°C)
• ⚠️ Equipment offline alerts

---
_VisionDrive Smart Kitchen_
_Reply STOP to unsubscribe_`;

  try {
    const message = await client.messages.create({
      body: testMessage,
      from: fromNumber,
      to: toNumber,
    });
    
    console.log(`Test WhatsApp message sent: ${message.sid}`);
    
    return {
      success: true,
      messageId: message.sid,
      status: message.status,
    };
  } catch (error) {
    console.error('Failed to send test WhatsApp message:', error);
    throw error;
  }
};

/**
 * Check if user has WhatsApp alerts enabled
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User WhatsApp settings or null
 */
const getUserWhatsAppSettings = async (userId) => {
  // TODO: Implement database lookup for user settings
  // This would query DynamoDB for user preferences
  // For now, return mock data
  return {
    enabled: true,
    number: '+971501234567',
  };
};

/**
 * Process temperature alert and send WhatsApp if enabled
 * 
 * @param {Object} alertData - Alert data from sensor
 * @param {string} userId - User ID to check settings
 * @returns {Promise<Object>} Result of notification attempt
 */
const processAlertWithWhatsApp = async (alertData, userId) => {
  try {
    // Get user's WhatsApp settings
    const settings = await getUserWhatsAppSettings(userId);
    
    if (!settings || !settings.enabled || !settings.number) {
      return {
        whatsAppSent: false,
        reason: 'WhatsApp alerts not enabled',
      };
    }
    
    // Send WhatsApp alert
    const result = await sendWhatsAppAlert({
      to: settings.number,
      alert: alertData,
    });
    
    return {
      whatsAppSent: true,
      ...result,
    };
  } catch (error) {
    console.error('Error processing WhatsApp alert:', error);
    return {
      whatsAppSent: false,
      reason: error.message,
    };
  }
};

module.exports = {
  sendWhatsAppAlert,
  sendTestMessage,
  getUserWhatsAppSettings,
  processAlertWithWhatsApp,
  formatAlertMessage,
  SEVERITY,
};
