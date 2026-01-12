/**
 * VisionDrive Parking - AWS IoT Custom Authorizer
 * 
 * Validates MQTT username/password for SWIOTT parking sensors.
 * Returns IAM policy allowing sensor to publish to parking topics.
 */

// Authorized credentials (in production, store in Secrets Manager)
const AUTHORIZED_USERS = {
  'swiott01': process.env.SWIOTT_PASSWORD || 'your-secure-password',
  'swiott02': process.env.SWIOTT_PASSWORD || 'your-secure-password',
  // Add more sensors as needed
};

exports.handler = async (event) => {
  console.log('Custom Authorizer Event:', JSON.stringify(event, null, 2));
  
  try {
    // Extract credentials from the event
    // For MQTT, credentials come in protocolData
    const username = event.protocolData?.mqtt?.username || 
                     event.token || 
                     event.username;
    
    const password = event.protocolData?.mqtt?.password ?
                     Buffer.from(event.protocolData.mqtt.password, 'base64').toString('utf-8') :
                     event.password;
    
    console.log(`Auth attempt for user: ${username}`);
    
    // Validate credentials
    if (!username || !password) {
      console.log('Missing credentials');
      return generatePolicy('Deny', event);
    }
    
    const expectedPassword = AUTHORIZED_USERS[username];
    
    if (!expectedPassword || password !== expectedPassword) {
      console.log('Invalid credentials');
      return generatePolicy('Deny', event);
    }
    
    console.log(`User ${username} authenticated successfully`);
    
    // Return Allow policy for authenticated sensor
    return generatePolicy('Allow', event, username);
    
  } catch (error) {
    console.error('Authorization error:', error);
    return generatePolicy('Deny', event);
  }
};

/**
 * Generate IAM policy for IoT Core
 */
function generatePolicy(effect, event, username = 'anonymous') {
  const accountId = process.env.AWS_ACCOUNT_ID || '307436091440';
  const region = process.env.AWS_REGION || 'me-central-1';
  
  // Policy statements
  const statements = [];
  
  if (effect === 'Allow') {
    // Allow connecting with any client ID
    statements.push({
      Action: 'iot:Connect',
      Effect: 'Allow',
      Resource: `arn:aws:iot:${region}:${accountId}:client/*`
    });
    
    // Allow publishing to parking topics
    statements.push({
      Action: 'iot:Publish',
      Effect: 'Allow',
      Resource: `arn:aws:iot:${region}:${accountId}:topic/visiondrive/parking/*`
    });
    
    // Allow subscribing (for future use)
    statements.push({
      Action: 'iot:Subscribe',
      Effect: 'Allow',
      Resource: `arn:aws:iot:${region}:${accountId}:topicfilter/visiondrive/parking/*`
    });
    
    // Allow receiving messages
    statements.push({
      Action: 'iot:Receive',
      Effect: 'Allow',
      Resource: `arn:aws:iot:${region}:${accountId}:topic/visiondrive/parking/*`
    });
  } else {
    // Deny all
    statements.push({
      Action: 'iot:*',
      Effect: 'Deny',
      Resource: '*'
    });
  }
  
  const policy = {
    isAuthenticated: effect === 'Allow',
    principalId: username,
    disconnectAfterInSeconds: 86400, // 24 hours
    refreshAfterInSeconds: 300, // 5 minutes
    policyDocuments: [
      {
        Version: '2012-10-17',
        Statement: statements
      }
    ]
  };
  
  console.log('Generated policy:', JSON.stringify(policy, null, 2));
  
  return policy;
}
