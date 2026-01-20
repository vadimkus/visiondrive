/**
 * AWS IoT Custom Authorizer for VisionDrive Smart Kitchen
 * 
 * 🔐 Security: Device token validation (VD-2026-001 mitigation)
 * 
 * This provides a second authentication layer beyond TLS.
 * Even if an attacker performs MITM with a valid CA certificate,
 * they cannot forge messages without the device's secret token.
 * 
 * How it works:
 * 1. Each sensor is provisioned with a unique device token
 * 2. Sensor includes token in MQTT username or custom header
 * 3. This authorizer validates the token against DynamoDB
 * 4. Only valid tokens can publish/subscribe
 */

const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const crypto = require('crypto');

const dynamoClient = new DynamoDBClient({ region: 'me-central-1' });
const DEVICES_TABLE = process.env.DEVICES_TABLE || 'VisionDrive-Devices';

/**
 * Custom authorizer handler
 * 
 * @param {Object} event - The authorizer event
 * @param {string} event.token - The device token (from MQTT username)
 * @param {string} event.signatureVerified - Whether AWS verified the token signature
 * @param {Object} event.protocols - Connection protocols
 * @param {Object} event.protocolData - Protocol-specific data
 * @param {Object} event.connectionMetadata - Connection metadata
 */
exports.handler = async (event) => {
  console.log('Custom Authorizer invoked:', JSON.stringify(event, null, 2));

  try {
    // Extract device token from the event
    // Token can be in: username, password, or custom header
    const token = extractToken(event);
    
    if (!token) {
      console.log('No token provided');
      return generateAuthResponse(false, null, 'DENY');
    }

    // Validate token format (should be: deviceId:secretHash)
    const [deviceId, secretHash] = token.split(':');
    
    if (!deviceId || !secretHash) {
      console.log('Invalid token format');
      return generateAuthResponse(false, null, 'DENY');
    }

    // Look up device in DynamoDB
    const device = await getDevice(deviceId);
    
    if (!device) {
      console.log(`Device not found: ${deviceId}`);
      return generateAuthResponse(false, null, 'DENY');
    }

    // Validate secret hash
    const expectedHash = device.secretHash?.S;
    const isValid = validateSecretHash(secretHash, expectedHash);

    if (!isValid) {
      console.log(`Invalid secret for device: ${deviceId}`);
      return generateAuthResponse(false, deviceId, 'DENY');
    }

    // Check if device is enabled
    const isEnabled = device.enabled?.BOOL !== false;
    if (!isEnabled) {
      console.log(`Device disabled: ${deviceId}`);
      return generateAuthResponse(false, deviceId, 'DENY');
    }

    console.log(`Device authenticated: ${deviceId}`);

    // Generate policy allowing this device to publish/subscribe
    const kitchenId = device.kitchenId?.S || '*';
    return generateAuthResponse(true, deviceId, 'ALLOW', kitchenId);

  } catch (error) {
    console.error('Authorizer error:', error);
    return generateAuthResponse(false, null, 'DENY');
  }
};

/**
 * Extract token from various sources in the event
 */
function extractToken(event) {
  // Try MQTT username first
  if (event.protocolData?.mqtt?.username) {
    return event.protocolData.mqtt.username;
  }

  // Try password field
  if (event.protocolData?.mqtt?.password) {
    // Password is base64 encoded
    const decoded = Buffer.from(event.protocolData.mqtt.password, 'base64').toString('utf8');
    return decoded;
  }

  // Try custom token field
  if (event.token) {
    return event.token;
  }

  // Try HTTP authorization header (for HTTP publish)
  if (event.protocolData?.http?.headers?.Authorization) {
    const auth = event.protocolData.http.headers.Authorization;
    if (auth.startsWith('Bearer ')) {
      return auth.substring(7);
    }
  }

  return null;
}

/**
 * Get device from DynamoDB
 */
async function getDevice(deviceId) {
  try {
    const result = await dynamoClient.send(new GetItemCommand({
      TableName: DEVICES_TABLE,
      Key: {
        PK: { S: `DEVICE#${deviceId}` },
        SK: { S: 'METADATA' }
      }
    }));
    return result.Item;
  } catch (error) {
    console.error('Error fetching device:', error);
    return null;
  }
}

/**
 * Validate secret hash using timing-safe comparison
 */
function validateSecretHash(providedHash, expectedHash) {
  if (!expectedHash) return false;
  
  // Use timing-safe comparison to prevent timing attacks
  const providedBuffer = Buffer.from(providedHash, 'utf8');
  const expectedBuffer = Buffer.from(expectedHash, 'utf8');
  
  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }
  
  return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
}

/**
 * Generate IAM policy response for AWS IoT
 */
function generateAuthResponse(isAuthenticated, deviceId, effect, kitchenId = '*') {
  const response = {
    isAuthenticated,
    principalId: deviceId || 'anonymous',
    disconnectAfterInSeconds: 86400, // 24 hours
    refreshAfterInSeconds: 3600, // Refresh auth every hour
    policyDocuments: [
      {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: effect,
            Action: 'iot:Connect',
            Resource: deviceId 
              ? `arn:aws:iot:me-central-1:*:client/visiondrive-${deviceId}`
              : '*'
          },
          {
            Effect: effect,
            Action: 'iot:Publish',
            Resource: deviceId
              ? `arn:aws:iot:me-central-1:*:topic/visiondrive/${kitchenId}/${deviceId}/*`
              : '*'
          },
          {
            Effect: effect,
            Action: 'iot:Subscribe',
            Resource: deviceId
              ? `arn:aws:iot:me-central-1:*:topicfilter/visiondrive/${kitchenId}/${deviceId}/commands`
              : '*'
          },
          {
            Effect: effect,
            Action: 'iot:Receive',
            Resource: deviceId
              ? `arn:aws:iot:me-central-1:*:topic/visiondrive/${kitchenId}/${deviceId}/commands`
              : '*'
          }
        ]
      }
    ]
  };

  return response;
}

/**
 * Utility function to generate a device secret
 * Call this when provisioning a new device
 */
function generateDeviceSecret() {
  const secret = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(secret).digest('hex');
  return { secret, hash };
}

// Export for testing
module.exports.generateDeviceSecret = generateDeviceSecret;
