/**
 * VisionDrive Smart Kitchen - Alerts Lambda
 * 
 * Handles temperature threshold breaches and sends notifications.
 */

const { DynamoDBClient, PutItemCommand, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

const dynamoClient = new DynamoDBClient({ region: "me-central-1" });
const snsClient = new SNSClient({ region: "me-central-1" });

const DEVICES_TABLE = process.env.DEVICES_TABLE || 'VisionDrive-Devices';
const ALERTS_TABLE = process.env.ALERTS_TABLE || 'VisionDrive-Alerts';
const ALERT_TOPIC_ARN = process.env.ALERT_TOPIC_ARN;

/**
 * Default temperature thresholds (used if device config not found)
 */
const DEFAULT_THRESHOLDS = {
  min: 0,    // °C - Below this triggers LOW_TEMP alert
  max: 8     // °C - Above this triggers HIGH_TEMP alert
};

/**
 * Convert mA to temperature (same logic as data-ingestion)
 */
function convertToTemperature(mA, probeType = 'fridge') {
  const profiles = {
    fridge: { minMA: 4, maxMA: 20, minTemp: 0, maxTemp: 10 },
    freezer: { minMA: 4, maxMA: 20, minTemp: -30, maxTemp: 0 },
    general: { minMA: 4, maxMA: 20, minTemp: -40, maxTemp: 85 },
  };
  
  const profile = profiles[probeType] || profiles.fridge;
  const { minMA, maxMA, minTemp, maxTemp } = profile;
  const clampedMA = Math.max(minMA, Math.min(maxMA, mA));
  
  return minTemp + ((clampedMA - minMA) / (maxMA - minMA)) * (maxTemp - minTemp);
}

/**
 * Get device thresholds from DynamoDB
 */
async function getDeviceThresholds(deviceId) {
  try {
    const result = await dynamoClient.send(new GetItemCommand({
      TableName: DEVICES_TABLE,
      Key: {
        PK: { S: `DEVICE#${deviceId}` },
        SK: { S: 'METADATA' }
      }
    }));
    
    if (result.Item?.alertThresholds?.M) {
      return {
        min: parseFloat(result.Item.alertThresholds.M.min?.N || DEFAULT_THRESHOLDS.min),
        max: parseFloat(result.Item.alertThresholds.M.max?.N || DEFAULT_THRESHOLDS.max)
      };
    }
    
    return DEFAULT_THRESHOLDS;
  } catch (error) {
    console.warn('Failed to get device thresholds, using defaults:', error.message);
    return DEFAULT_THRESHOLDS;
  }
}

/**
 * Get device and kitchen info for alert message
 */
async function getDeviceInfo(deviceId) {
  try {
    const result = await dynamoClient.send(new GetItemCommand({
      TableName: DEVICES_TABLE,
      Key: {
        PK: { S: `DEVICE#${deviceId}` },
        SK: { S: 'METADATA' }
      }
    }));
    
    return {
      location: result.Item?.location?.S || 'Unknown Location',
      kitchenName: result.Item?.kitchenName?.S || 'Unknown Kitchen'
    };
  } catch (error) {
    return { location: 'Unknown', kitchenName: 'Unknown' };
  }
}

/**
 * Store alert in DynamoDB
 */
async function storeAlert(alertData) {
  const timestamp = new Date().toISOString();
  const ttl = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // 30 days TTL
  
  await dynamoClient.send(new PutItemCommand({
    TableName: ALERTS_TABLE,
    Item: {
      PK: { S: `KITCHEN#${alertData.kitchenId}` },
      SK: { S: `ALERT#${timestamp}` },
      GSI1PK: { S: 'ALERT#ACTIVE' },
      GSI1SK: { S: timestamp },
      deviceId: { S: alertData.deviceId },
      alertType: { S: alertData.alertType },
      temperature: { N: String(alertData.temperature) },
      threshold: { N: String(alertData.threshold) },
      rawMA: { N: String(alertData.rawMA) },
      acknowledged: { BOOL: false },
      createdAt: { S: timestamp },
      ttl: { N: String(ttl) }
    }
  }));
  
  return timestamp;
}

/**
 * Send SNS notification
 */
async function sendNotification(alertData, deviceInfo) {
  if (!ALERT_TOPIC_ARN) {
    console.warn('ALERT_TOPIC_ARN not configured, skipping notification');
    return;
  }
  
  const alertEmoji = alertData.alertType === 'HIGH_TEMP' ? '🔥' : '❄️';
  const alertAction = alertData.alertType === 'HIGH_TEMP' 
    ? 'Temperature is TOO HIGH - check refrigeration!'
    : 'Temperature is TOO LOW - check for over-cooling!';
  
  const message = `
${alertEmoji} TEMPERATURE ALERT - VisionDrive Smart Kitchen

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ Alert Type: ${alertData.alertType}

📍 Location: ${deviceInfo.location}
🏪 Kitchen: ${deviceInfo.kitchenName}
🔌 Device: ${alertData.deviceId}

🌡️ Current Temperature: ${alertData.temperature.toFixed(1)}°C
📏 Threshold: ${alertData.threshold}°C

⏰ Time: ${new Date().toLocaleString('en-AE', { timeZone: 'Asia/Dubai' })}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 ACTION REQUIRED: ${alertAction}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VisionDrive Smart Kitchen Monitoring System
  `.trim();
  
  await snsClient.send(new PublishCommand({
    TopicArn: ALERT_TOPIC_ARN,
    Subject: `${alertEmoji} Temperature Alert - ${deviceInfo.location}`,
    Message: message,
    MessageAttributes: {
      alertType: {
        DataType: 'String',
        StringValue: alertData.alertType
      },
      deviceId: {
        DataType: 'String',
        StringValue: alertData.deviceId
      },
      temperature: {
        DataType: 'Number',
        StringValue: String(alertData.temperature)
      }
    }
  }));
  
  console.log('Alert notification sent successfully');
}

/**
 * Main handler
 */
exports.handler = async (event) => {
  console.log('Alert event received:', JSON.stringify(event, null, 2));
  
  try {
    const { deviceId, kitchenId, raw_ma, timestamp } = event;
    
    // Validate required fields
    if (!deviceId || !kitchenId || raw_ma === undefined) {
      throw new Error('Missing required fields');
    }
    
    // Convert to temperature
    const temperature = convertToTemperature(raw_ma, 'fridge');
    
    // Get device thresholds
    const thresholds = await getDeviceThresholds(deviceId);
    
    // Determine alert type
    let alertType = null;
    let threshold = null;
    
    if (temperature > thresholds.max) {
      alertType = 'HIGH_TEMP';
      threshold = thresholds.max;
    } else if (temperature < thresholds.min) {
      alertType = 'LOW_TEMP';
      threshold = thresholds.min;
    }
    
    if (!alertType) {
      console.log(`Temperature ${temperature}°C is within thresholds [${thresholds.min}, ${thresholds.max}]`);
      return {
        statusCode: 200,
        body: JSON.stringify({ alertTriggered: false })
      };
    }
    
    console.log(`🚨 ALERT: ${alertType} - ${temperature}°C (threshold: ${threshold}°C)`);
    
    // Build alert data
    const alertData = {
      deviceId,
      kitchenId,
      alertType,
      temperature,
      threshold,
      rawMA: raw_ma
    };
    
    // Get device info for notification
    const deviceInfo = await getDeviceInfo(deviceId);
    
    // Store alert and send notification in parallel
    await Promise.all([
      storeAlert(alertData),
      sendNotification(alertData, deviceInfo)
    ]);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        alertTriggered: true,
        alertType,
        temperature,
        threshold
      })
    };
    
  } catch (error) {
    console.error('Error processing alert:', error);
    throw error;
  }
};
