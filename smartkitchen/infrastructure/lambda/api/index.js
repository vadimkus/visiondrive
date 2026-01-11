/**
 * VisionDrive Smart Kitchen - API Handler Lambda
 * 
 * Handles all REST API requests for the dashboard.
 * 🇦🇪 UAE Data Residency: All data stored in DynamoDB in me-central-1
 */

const { DynamoDBClient, GetItemCommand, PutItemCommand, QueryCommand, ScanCommand, UpdateItemCommand, DeleteItemCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall, marshall } = require("@aws-sdk/util-dynamodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const dynamoClient = new DynamoDBClient({ region: "me-central-1" });

const SENSOR_READINGS_TABLE = process.env.SENSOR_READINGS_TABLE || 'VisionDrive-SensorReadings';
const DEVICES_TABLE = process.env.DEVICES_TABLE || 'VisionDrive-Devices';
const ALERTS_TABLE = process.env.ALERTS_TABLE || 'VisionDrive-Alerts';
const JWT_SECRET = process.env.JWT_SECRET || 'smartkitchen-uae-secret-2026';

/**
 * CORS headers for all responses
 */
const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};

/**
 * Response helper
 */
function response(statusCode, body) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body)
  };
}

// ==========================================
// AUTH HANDLERS
// ==========================================

async function login(body) {
  const data = JSON.parse(body);
  const { email, password } = data;

  if (!email || !password) {
    return response(400, { error: 'Email and password are required' });
  }

  // Get user from DynamoDB
  const result = await dynamoClient.send(new GetItemCommand({
    TableName: DEVICES_TABLE,
    Key: {
      PK: { S: `USER#${email.toLowerCase()}` },
      SK: { S: 'PROFILE' }
    }
  }));

  if (!result.Item) {
    return response(401, { error: 'Invalid email or password' });
  }

  const user = unmarshall(result.Item);

  // Verify password
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return response(401, { error: 'Invalid email or password' });
  }

  if (user.status !== 'ACTIVE') {
    return response(401, { error: 'Account is not active' });
  }

  // Generate JWT token
  const token = jwt.sign(
    { 
      userId: user.userId, 
      email: user.email, 
      role: user.role,
      kitchenId: user.kitchenId 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return response(200, {
    success: true,
    user: {
      id: user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
      kitchenId: user.kitchenId
    },
    token
  });
}

async function createUser(body) {
  const data = JSON.parse(body);
  const { email, password, name, role, kitchenId, adminKey } = data;

  // Simple admin key protection (change in production!)
  if (adminKey !== 'VisionDrive2026!') {
    return response(403, { error: 'Unauthorized' });
  }

  if (!email || !password) {
    return response(400, { error: 'Email and password are required' });
  }

  const userId = `user-${Date.now()}`;
  const passwordHash = await bcrypt.hash(password, 10);

  await dynamoClient.send(new PutItemCommand({
    TableName: DEVICES_TABLE,
    Item: marshall({
      PK: `USER#${email.toLowerCase()}`,
      SK: 'PROFILE',
      userId,
      email: email.toLowerCase(),
      name: name || email.split('@')[0],
      passwordHash,
      role: role || 'CUSTOMER_ADMIN',
      kitchenId: kitchenId || null,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    })
  }));

  return response(201, { 
    success: true, 
    userId, 
    message: 'User created successfully' 
  });
}

// ==========================================
// KITCHENS HANDLERS
// ==========================================

async function listKitchens() {
  const result = await dynamoClient.send(new ScanCommand({
    TableName: DEVICES_TABLE,
    FilterExpression: 'begins_with(PK, :prefix) AND SK = :sk',
    ExpressionAttributeValues: {
      ':prefix': { S: 'KITCHEN#' },
      ':sk': { S: 'METADATA' }
    }
  }));
  
  const kitchens = (result.Items || []).map(item => unmarshall(item));
  return response(200, { kitchens, count: kitchens.length });
}

async function getKitchen(kitchenId) {
  const result = await dynamoClient.send(new GetItemCommand({
    TableName: DEVICES_TABLE,
    Key: {
      PK: { S: `KITCHEN#${kitchenId}` },
      SK: { S: 'METADATA' }
    }
  }));
  
  if (!result.Item) {
    return response(404, { error: 'Kitchen not found' });
  }
  
  return response(200, unmarshall(result.Item));
}

async function createKitchen(body) {
  const data = JSON.parse(body);
  const kitchenId = data.kitchenId || `kitchen-${Date.now()}`;
  
  await dynamoClient.send(new PutItemCommand({
    TableName: DEVICES_TABLE,
    Item: marshall({
      PK: `KITCHEN#${kitchenId}`,
      SK: 'METADATA',
      GSI1PK: 'KITCHENS',
      GSI1SK: kitchenId,
      kitchenId,
      name: data.name,
      address: data.address,
      manager: data.manager,
      phone: data.phone,
      createdAt: new Date().toISOString()
    })
  }));
  
  return response(201, { kitchenId, message: 'Kitchen created' });
}

// ==========================================
// SENSORS HANDLERS
// ==========================================

async function listSensors(kitchenId = null) {
  let params;
  
  if (kitchenId) {
    params = {
      TableName: DEVICES_TABLE,
      FilterExpression: 'begins_with(PK, :prefix) AND SK = :sk AND kitchenId = :kitchen',
      ExpressionAttributeValues: {
        ':prefix': { S: 'DEVICE#' },
        ':sk': { S: 'METADATA' },
        ':kitchen': { S: kitchenId }
      }
    };
  } else {
    params = {
      TableName: DEVICES_TABLE,
      FilterExpression: 'begins_with(PK, :prefix) AND SK = :sk',
      ExpressionAttributeValues: {
        ':prefix': { S: 'DEVICE#' },
        ':sk': { S: 'METADATA' }
      }
    };
  }
  
  const result = await dynamoClient.send(new ScanCommand(params));
  const sensors = (result.Items || []).map(item => unmarshall(item));
  
  return response(200, { sensors, count: sensors.length });
}

async function getSensor(sensorId) {
  const result = await dynamoClient.send(new GetItemCommand({
    TableName: DEVICES_TABLE,
    Key: {
      PK: { S: `DEVICE#${sensorId}` },
      SK: { S: 'METADATA' }
    }
  }));
  
  if (!result.Item) {
    return response(404, { error: 'Sensor not found' });
  }
  
  return response(200, unmarshall(result.Item));
}

async function registerSensor(body) {
  const data = JSON.parse(body);
  const sensorId = data.sensorId || `sensor-${Date.now()}`;
  
  await dynamoClient.send(new PutItemCommand({
    TableName: DEVICES_TABLE,
    Item: marshall({
      PK: `DEVICE#${sensorId}`,
      SK: 'METADATA',
      GSI1PK: `KITCHEN#${data.kitchenId}`,
      GSI1SK: sensorId,
      sensorId,
      kitchenId: data.kitchenId,
      location: data.location,
      probeModel: data.probeModel || 'PT100',
      alertThresholds: data.alertThresholds || { min: 0, max: 8 },
      transmissionInterval: data.transmissionInterval || 300,
      status: 'active',
      installDate: new Date().toISOString()
    })
  }));
  
  return response(201, { sensorId, message: 'Sensor registered' });
}

// ==========================================
// READINGS HANDLERS (DynamoDB - UAE Data Residency)
// ==========================================

async function getCurrentReading(sensorId) {
  // Query latest reading from DynamoDB
  const result = await dynamoClient.send(new QueryCommand({
    TableName: SENSOR_READINGS_TABLE,
    KeyConditionExpression: 'deviceId = :deviceId',
    ExpressionAttributeValues: {
      ':deviceId': { S: sensorId }
    },
    ScanIndexForward: false, // Descending order
    Limit: 1
  }));
  
  if (!result.Items || result.Items.length === 0) {
    return response(404, { error: 'No readings found', sensorId });
  }
  
  const reading = unmarshall(result.Items[0]);
  return response(200, {
    sensorId: reading.deviceId,
    kitchenId: reading.kitchenId,
    temperature: reading.temperature,
    rawMA: reading.rawMA,
    batteryVoltage: reading.batteryVoltage,
    signalStrength: reading.signalStrength,
    timestamp: reading.timestamp
  });
}

async function getSensorReadings(sensorId, hours = 24) {
  const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  
  const result = await dynamoClient.send(new QueryCommand({
    TableName: SENSOR_READINGS_TABLE,
    KeyConditionExpression: 'deviceId = :deviceId AND #ts > :since',
    ExpressionAttributeNames: {
      '#ts': 'timestamp'
    },
    ExpressionAttributeValues: {
      ':deviceId': { S: sensorId },
      ':since': { S: hoursAgo }
    },
    ScanIndexForward: true // Ascending order for chart data
  }));
  
  const readings = (result.Items || []).map(item => {
    const r = unmarshall(item);
    return {
      temperature: r.temperature,
      rawMA: r.rawMA,
      batteryVoltage: r.batteryVoltage,
      signalStrength: r.signalStrength,
      time: r.timestamp
    };
  });
  
  return response(200, { sensorId, readings, count: readings.length });
}

async function getDailyStats() {
  // Get readings from last 24 hours and calculate stats
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  // Get all sensors first
  const sensorsResult = await dynamoClient.send(new ScanCommand({
    TableName: DEVICES_TABLE,
    FilterExpression: 'begins_with(PK, :prefix) AND SK = :sk',
    ExpressionAttributeValues: {
      ':prefix': { S: 'DEVICE#' },
      ':sk': { S: 'METADATA' }
    }
  }));
  
  const sensors = (sensorsResult.Items || []).map(item => unmarshall(item));
  const stats = [];
  
  for (const sensor of sensors) {
    const readingsResult = await dynamoClient.send(new QueryCommand({
      TableName: SENSOR_READINGS_TABLE,
      KeyConditionExpression: 'deviceId = :deviceId AND #ts > :since',
      ExpressionAttributeNames: { '#ts': 'timestamp' },
      ExpressionAttributeValues: {
        ':deviceId': { S: sensor.sensorId },
        ':since': { S: yesterday }
      }
    }));
    
    const readings = (readingsResult.Items || []).map(item => unmarshall(item));
    
    if (readings.length > 0) {
      const temps = readings.map(r => r.temperature).filter(t => typeof t === 'number');
      stats.push({
        deviceId: sensor.sensorId,
        kitchenId: sensor.kitchenId,
        avgTemp: temps.reduce((a, b) => a + b, 0) / temps.length,
        maxTemp: Math.max(...temps),
        minTemp: Math.min(...temps),
        readingCount: readings.length
      });
    }
  }
  
  return response(200, { stats, count: stats.length });
}

// ==========================================
// ALERTS HANDLERS
// ==========================================

async function listAlerts(kitchenId = null, active = true) {
  let params;
  
  if (active) {
    params = {
      TableName: ALERTS_TABLE,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk',
      ExpressionAttributeValues: {
        ':pk': { S: 'ALERT#ACTIVE' }
      },
      ScanIndexForward: false
    };
  } else if (kitchenId) {
    params = {
      TableName: ALERTS_TABLE,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': { S: `KITCHEN#${kitchenId}` }
      },
      ScanIndexForward: false
    };
  } else {
    params = {
      TableName: ALERTS_TABLE,
      Limit: 100
    };
    const result = await dynamoClient.send(new ScanCommand(params));
    const alerts = (result.Items || []).map(item => unmarshall(item));
    return response(200, { alerts, count: alerts.length });
  }
  
  const result = await dynamoClient.send(new QueryCommand(params));
  const alerts = (result.Items || []).map(item => unmarshall(item));
  
  return response(200, { alerts, count: alerts.length });
}

async function acknowledgeAlert(alertId) {
  // alertId format: kitchenId:timestamp
  const [kitchenId, timestamp] = alertId.split(':');
  
  await dynamoClient.send(new UpdateItemCommand({
    TableName: ALERTS_TABLE,
    Key: {
      PK: { S: `KITCHEN#${kitchenId}` },
      SK: { S: `ALERT#${timestamp}` }
    },
    UpdateExpression: 'SET acknowledged = :ack, acknowledgedAt = :time REMOVE GSI1PK, GSI1SK',
    ExpressionAttributeValues: {
      ':ack': { BOOL: true },
      ':time': { S: new Date().toISOString() }
    }
  }));
  
  return response(200, { message: 'Alert acknowledged' });
}

// ==========================================
// MAIN ROUTER
// ==========================================

exports.handler = async (event) => {
  console.log('API Request:', JSON.stringify(event, null, 2));
  
  const { httpMethod, path, pathParameters, queryStringParameters, body } = event;
  const method = httpMethod;
  
  try {
    // Parse path segments
    const segments = path.split('/').filter(s => s);
    
    // Route requests
    
    // AUTH routes
    if (segments[0] === 'auth') {
      if (segments.length === 2) {
        if (segments[1] === 'login' && method === 'POST') {
          return await login(body);
        }
        if (segments[1] === 'register' && method === 'POST') {
          return await createUser(body);
        }
      }
    }

    if (segments[0] === 'kitchens') {
      if (segments.length === 1) {
        if (method === 'GET') return await listKitchens();
        if (method === 'POST') return await createKitchen(body);
      }
      if (segments.length === 2) {
        const kitchenId = segments[1];
        if (method === 'GET') return await getKitchen(kitchenId);
      }
      if (segments.length === 3) {
        const kitchenId = segments[1];
        if (segments[2] === 'sensors') {
          return await listSensors(kitchenId);
        }
        if (segments[2] === 'alerts') {
          return await listAlerts(kitchenId, false);
        }
      }
    }
    
    if (segments[0] === 'sensors') {
      if (segments.length === 1) {
        if (method === 'GET') return await listSensors();
        if (method === 'POST') return await registerSensor(body);
      }
      if (segments.length === 2) {
        const sensorId = segments[1];
        if (method === 'GET') return await getSensor(sensorId);
      }
      if (segments.length === 3) {
        const sensorId = segments[1];
        if (segments[2] === 'current') {
          return await getCurrentReading(sensorId);
        }
        if (segments[2] === 'readings') {
          const hours = queryStringParameters?.hours || 24;
          return await getSensorReadings(sensorId, parseInt(hours));
        }
      }
    }
    
    if (segments[0] === 'alerts') {
      if (segments.length === 1) {
        if (method === 'GET') return await listAlerts();
      }
      if (segments.length === 3 && segments[2] === 'acknowledge') {
        const alertId = segments[1];
        return await acknowledgeAlert(alertId);
      }
    }
    
    if (segments[0] === 'analytics') {
      if (segments.length === 2 && segments[1] === 'daily') {
        return await getDailyStats();
      }
    }
    
    return response(404, { error: 'Route not found', path });
    
  } catch (error) {
    console.error('API Error:', error);
    return response(500, { error: 'Internal server error', message: error.message });
  }
};
