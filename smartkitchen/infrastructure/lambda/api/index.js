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
  
  const kitchens = (result.Items || []).map(item => {
    const k = unmarshall(item);
    return {
      id: k.kitchenId,
      name: k.name,
      address: k.address,
      emirate: k.emirate || 'Dubai',
      tradeLicense: k.tradeLicense,
      dmPermitNumber: k.dmPermitNumber,
      contactName: k.contactName || k.manager,
      contactPhone: k.contactPhone || k.phone,
      contactEmail: k.contactEmail,
      sensorCount: k.equipmentCount || k.sensorCount || 0,
      ownerCount: k.ownerCount || 0,
      activeAlerts: k.activeAlerts || 0,
      avgTemperature: k.avgTemperature || null,
      status: k.status || 'normal',
      createdAt: k.createdAt
    };
  });
  
  return response(200, { success: true, kitchens, count: kitchens.length });
}

async function getKitchen(kitchenId) {
  // Get kitchen metadata
  const result = await dynamoClient.send(new GetItemCommand({
    TableName: DEVICES_TABLE,
    Key: {
      PK: { S: `KITCHEN#${kitchenId}` },
      SK: { S: 'METADATA' }
    }
  }));
  
  if (!result.Item) {
    return response(404, { success: false, error: 'Kitchen not found' });
  }
  
  const k = unmarshall(result.Item);
  
  // Get equipment for this kitchen
  const equipmentResult = await dynamoClient.send(new QueryCommand({
    TableName: DEVICES_TABLE,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': { S: `KITCHEN#${kitchenId}` },
      ':sk': { S: 'EQUIPMENT#' }
    }
  }));
  
  const equipment = (equipmentResult.Items || []).map(item => {
    const e = unmarshall(item);
    return {
      id: e.equipmentId,
      name: e.name,
      type: e.type,
      serialNumber: e.serialNumber,
      brand: e.brand,
      model: e.model,
      sensorDevEui: e.sensorDevEui,
      sensorImei: e.sensorImei,
      minTemp: e.minTemp,
      maxTemp: e.maxTemp,
      isFreezer: e.isFreezer,
      location: e.location,
      status: e.status,
      lastReading: e.lastReading,
      lastReadingAt: e.lastReadingAt,
      batteryLevel: e.batteryLevel,
      signalStrength: e.signalStrength,
      installDate: e.installDate,
      createdAt: e.createdAt
    };
  });
  
  // Get owners for this kitchen
  const ownersResult = await dynamoClient.send(new QueryCommand({
    TableName: DEVICES_TABLE,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': { S: `KITCHEN#${kitchenId}` },
      ':sk': { S: 'OWNER#' }
    }
  }));
  
  const owners = (ownersResult.Items || []).map(item => {
    const o = unmarshall(item);
    return {
      id: o.ownerId,
      name: o.name,
      email: o.email,
      phone: o.phone,
      isPrimary: o.isPrimary,
      canManage: o.canManage,
      canViewReports: o.canViewReports,
      notifyEmail: o.notifyEmail,
      notifyWhatsApp: o.notifyWhatsApp,
      notifyOnAlert: o.notifyOnAlert,
      createdAt: o.createdAt
    };
  });
  
  // Calculate stats
  const temps = equipment.filter(e => e.lastReading !== null).map(e => e.lastReading);
  const avgTemperature = temps.length > 0 ? temps.reduce((a, b) => a + b, 0) / temps.length : null;
  const minTemperature = temps.length > 0 ? Math.min(...temps) : null;
  const maxTemperature = temps.length > 0 ? Math.max(...temps) : null;
  
  return response(200, {
    success: true,
    kitchen: {
      id: k.kitchenId,
      name: k.name,
      address: k.address,
      emirate: k.emirate || 'Dubai',
      tradeLicense: k.tradeLicense,
      dmPermitNumber: k.dmPermitNumber,
      contactName: k.contactName || k.manager,
      contactPhone: k.contactPhone || k.phone,
      contactEmail: k.contactEmail,
      lat: k.lat,
      lng: k.lng,
      status: k.status || 'normal',
      sensorCount: equipment.length,
      ownerCount: owners.length,
      activeAlerts: k.activeAlerts || 0,
      avgTemperature,
      minTemperature,
      maxTemperature,
      equipment,
      owners,
      createdAt: k.createdAt,
      updatedAt: k.updatedAt
    }
  });
}

async function createKitchen(body) {
  const data = JSON.parse(body);
  
  if (!data.name || !data.address) {
    return response(400, { success: false, error: 'Name and address are required' });
  }
  
  const kitchenId = data.kitchenId || `kitchen-${Date.now()}`;
  const now = new Date().toISOString();
  
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
      emirate: data.emirate || 'Dubai',
      tradeLicense: data.tradeLicense || null,
      dmPermitNumber: data.dmPermitNumber || null,
      contactName: data.contactName || null,
      contactPhone: data.contactPhone || null,
      contactEmail: data.contactEmail || null,
      lat: data.lat || null,
      lng: data.lng || null,
      status: 'ACTIVE',
      equipmentCount: 0,
      ownerCount: 0,
      activeAlerts: 0,
      createdAt: now,
      updatedAt: now
    })
  }));
  
  return response(201, { 
    success: true,
    kitchen: { id: kitchenId, name: data.name },
    message: 'Kitchen created successfully' 
  });
}

async function updateKitchen(kitchenId, body) {
  const data = JSON.parse(body);
  const now = new Date().toISOString();
  
  const updateExpressions = [];
  const expressionValues = {};
  const expressionNames = {};
  
  const fields = ['name', 'address', 'emirate', 'tradeLicense', 'dmPermitNumber', 
                  'contactName', 'contactPhone', 'contactEmail', 'lat', 'lng', 'status'];
  
  fields.forEach(field => {
    if (data[field] !== undefined) {
      updateExpressions.push(`#${field} = :${field}`);
      expressionNames[`#${field}`] = field;
      expressionValues[`:${field}`] = { S: String(data[field]) };
    }
  });
  
  updateExpressions.push('#updatedAt = :updatedAt');
  expressionNames['#updatedAt'] = 'updatedAt';
  expressionValues[':updatedAt'] = { S: now };
  
  await dynamoClient.send(new UpdateItemCommand({
    TableName: DEVICES_TABLE,
    Key: {
      PK: { S: `KITCHEN#${kitchenId}` },
      SK: { S: 'METADATA' }
    },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionNames,
    ExpressionAttributeValues: expressionValues
  }));
  
  return response(200, { success: true, message: 'Kitchen updated successfully' });
}

async function deleteKitchen(kitchenId) {
  // Delete all equipment and owners first
  const items = await dynamoClient.send(new QueryCommand({
    TableName: DEVICES_TABLE,
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeValues: {
      ':pk': { S: `KITCHEN#${kitchenId}` }
    }
  }));
  
  for (const item of items.Items || []) {
    const unmarshalled = unmarshall(item);
    await dynamoClient.send(new DeleteItemCommand({
      TableName: DEVICES_TABLE,
      Key: {
        PK: { S: `KITCHEN#${kitchenId}` },
        SK: { S: unmarshalled.SK }
      }
    }));
  }
  
  return response(200, { success: true, message: 'Kitchen deleted successfully' });
}

// ==========================================
// EQUIPMENT HANDLERS
// ==========================================

async function listEquipment(kitchenId) {
  const result = await dynamoClient.send(new QueryCommand({
    TableName: DEVICES_TABLE,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': { S: `KITCHEN#${kitchenId}` },
      ':sk': { S: 'EQUIPMENT#' }
    }
  }));
  
  const equipment = (result.Items || []).map(item => {
    const e = unmarshall(item);
    return {
      id: e.equipmentId,
      kitchenId: e.kitchenId,
      name: e.name,
      type: e.type,
      serialNumber: e.serialNumber,
      brand: e.brand,
      model: e.model,
      sensorDevEui: e.sensorDevEui,
      sensorImei: e.sensorImei,
      minTemp: e.minTemp,
      maxTemp: e.maxTemp,
      isFreezer: e.isFreezer,
      location: e.location,
      status: e.status,
      lastReading: e.lastReading,
      lastReadingAt: e.lastReadingAt,
      batteryLevel: e.batteryLevel,
      signalStrength: e.signalStrength,
      installDate: e.installDate,
      lastMaintenanceAt: e.lastMaintenanceAt,
      createdAt: e.createdAt
    };
  });
  
  return response(200, { success: true, equipment });
}

async function createEquipment(kitchenId, body) {
  const data = JSON.parse(body);
  
  if (!data.name) {
    return response(400, { success: false, error: 'Equipment name is required' });
  }
  
  // Check for duplicate serial number
  if (data.serialNumber) {
    const dupCheck = await dynamoClient.send(new ScanCommand({
      TableName: DEVICES_TABLE,
      FilterExpression: 'serialNumber = :sn',
      ExpressionAttributeValues: {
        ':sn': { S: data.serialNumber }
      }
    }));
    
    if (dupCheck.Items && dupCheck.Items.length > 0) {
      return response(400, { success: false, error: 'Serial number already exists' });
    }
  }
  
  // Check for duplicate DevEUI
  if (data.sensorDevEui) {
    const dupCheck = await dynamoClient.send(new ScanCommand({
      TableName: DEVICES_TABLE,
      FilterExpression: 'sensorDevEui = :deveui',
      ExpressionAttributeValues: {
        ':deveui': { S: data.sensorDevEui }
      }
    }));
    
    if (dupCheck.Items && dupCheck.Items.length > 0) {
      return response(400, { success: false, error: 'Sensor DevEUI already registered' });
    }
  }
  
  const equipmentId = `equip-${Date.now()}`;
  const now = new Date().toISOString();
  const isFreezer = data.type === 'FREEZER' || data.type === 'BLAST_CHILLER' || data.isFreezer;
  
  await dynamoClient.send(new PutItemCommand({
    TableName: DEVICES_TABLE,
    Item: marshall({
      PK: `KITCHEN#${kitchenId}`,
      SK: `EQUIPMENT#${equipmentId}`,
      GSI1PK: data.sensorDevEui ? `DEVEUI#${data.sensorDevEui}` : `EQUIP#${equipmentId}`,
      GSI1SK: now,
      equipmentId,
      kitchenId,
      name: data.name,
      type: data.type || 'FRIDGE',
      serialNumber: data.serialNumber || null,
      brand: data.brand || null,
      model: data.model || null,
      sensorDevEui: data.sensorDevEui || null,
      sensorImei: data.sensorImei || null,
      minTemp: data.minTemp !== undefined ? data.minTemp : (isFreezer ? -25 : 0),
      maxTemp: data.maxTemp !== undefined ? data.maxTemp : (isFreezer ? -15 : 5),
      isFreezer,
      location: data.location || null,
      status: 'ACTIVE',
      lastReading: null,
      lastReadingAt: null,
      batteryLevel: null,
      signalStrength: null,
      installDate: data.installDate || now,
      createdAt: now,
      updatedAt: now
    })
  }));
  
  // Update kitchen equipment count
  await dynamoClient.send(new UpdateItemCommand({
    TableName: DEVICES_TABLE,
    Key: {
      PK: { S: `KITCHEN#${kitchenId}` },
      SK: { S: 'METADATA' }
    },
    UpdateExpression: 'SET equipmentCount = if_not_exists(equipmentCount, :zero) + :one',
    ExpressionAttributeValues: {
      ':zero': { N: '0' },
      ':one': { N: '1' }
    }
  }));
  
  return response(201, { 
    success: true,
    equipment: { id: equipmentId, name: data.name, type: data.type },
    message: 'Equipment added successfully' 
  });
}

async function updateEquipment(kitchenId, equipmentId, body) {
  const data = JSON.parse(body);
  const now = new Date().toISOString();
  
  const updateExpressions = [];
  const expressionValues = { ':updatedAt': { S: now } };
  const expressionNames = { '#updatedAt': 'updatedAt' };
  
  const fields = ['name', 'type', 'serialNumber', 'brand', 'model', 'sensorDevEui', 
                  'sensorImei', 'minTemp', 'maxTemp', 'isFreezer', 'location', 'status'];
  
  fields.forEach(field => {
    if (data[field] !== undefined) {
      updateExpressions.push(`#${field} = :${field}`);
      expressionNames[`#${field}`] = field;
      if (typeof data[field] === 'number') {
        expressionValues[`:${field}`] = { N: String(data[field]) };
      } else if (typeof data[field] === 'boolean') {
        expressionValues[`:${field}`] = { BOOL: data[field] };
      } else {
        expressionValues[`:${field}`] = { S: String(data[field] || '') };
      }
    }
  });
  
  updateExpressions.push('#updatedAt = :updatedAt');
  
  await dynamoClient.send(new UpdateItemCommand({
    TableName: DEVICES_TABLE,
    Key: {
      PK: { S: `KITCHEN#${kitchenId}` },
      SK: { S: `EQUIPMENT#${equipmentId}` }
    },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionNames,
    ExpressionAttributeValues: expressionValues
  }));
  
  return response(200, { success: true, message: 'Equipment updated successfully' });
}

async function deleteEquipment(kitchenId, equipmentId) {
  await dynamoClient.send(new DeleteItemCommand({
    TableName: DEVICES_TABLE,
    Key: {
      PK: { S: `KITCHEN#${kitchenId}` },
      SK: { S: `EQUIPMENT#${equipmentId}` }
    }
  }));
  
  // Update kitchen equipment count
  await dynamoClient.send(new UpdateItemCommand({
    TableName: DEVICES_TABLE,
    Key: {
      PK: { S: `KITCHEN#${kitchenId}` },
      SK: { S: 'METADATA' }
    },
    UpdateExpression: 'SET equipmentCount = equipmentCount - :one',
    ExpressionAttributeValues: {
      ':one': { N: '1' }
    }
  }));
  
  return response(200, { success: true, message: 'Equipment deleted successfully' });
}

// ==========================================
// OWNERS HANDLERS
// ==========================================

async function listOwners(kitchenId) {
  const result = await dynamoClient.send(new QueryCommand({
    TableName: DEVICES_TABLE,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': { S: `KITCHEN#${kitchenId}` },
      ':sk': { S: 'OWNER#' }
    }
  }));
  
  const owners = (result.Items || []).map(item => {
    const o = unmarshall(item);
    return {
      id: o.ownerId,
      kitchenId: o.kitchenId,
      name: o.name,
      email: o.email,
      phone: o.phone,
      emiratesId: o.emiratesId,
      isPrimary: o.isPrimary,
      canManage: o.canManage,
      canViewReports: o.canViewReports,
      notifyEmail: o.notifyEmail,
      notifyWhatsApp: o.notifyWhatsApp,
      notifyOnAlert: o.notifyOnAlert,
      notifyDailyReport: o.notifyDailyReport,
      hasPortalAccess: o.hasPortalAccess || false,
      createdAt: o.createdAt
    };
  });
  
  // Sort: primary first, then by createdAt
  owners.sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
  
  return response(200, { success: true, owners });
}

async function createOwner(kitchenId, body) {
  const data = JSON.parse(body);
  
  if (!data.name || !data.email) {
    return response(400, { success: false, error: 'Name and email are required' });
  }
  
  // Check for duplicate email in this kitchen
  const existingOwners = await dynamoClient.send(new QueryCommand({
    TableName: DEVICES_TABLE,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    FilterExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':pk': { S: `KITCHEN#${kitchenId}` },
      ':sk': { S: 'OWNER#' },
      ':email': { S: data.email.toLowerCase() }
    }
  }));
  
  if (existingOwners.Items && existingOwners.Items.length > 0) {
    return response(400, { success: false, error: 'Owner with this email already exists for this kitchen' });
  }
  
  // Check if this is the first owner
  const ownerCount = await dynamoClient.send(new QueryCommand({
    TableName: DEVICES_TABLE,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': { S: `KITCHEN#${kitchenId}` },
      ':sk': { S: 'OWNER#' }
    },
    Select: 'COUNT'
  }));
  
  const isFirst = (ownerCount.Count || 0) === 0;
  const isPrimary = isFirst || data.isPrimary === true;
  
  // If making this owner primary, remove primary from others
  if (isPrimary && !isFirst) {
    const allOwners = await dynamoClient.send(new QueryCommand({
      TableName: DEVICES_TABLE,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': { S: `KITCHEN#${kitchenId}` },
        ':sk': { S: 'OWNER#' }
      }
    }));
    
    for (const item of allOwners.Items || []) {
      const owner = unmarshall(item);
      if (owner.isPrimary) {
        await dynamoClient.send(new UpdateItemCommand({
          TableName: DEVICES_TABLE,
          Key: {
            PK: { S: `KITCHEN#${kitchenId}` },
            SK: { S: `OWNER#${owner.ownerId}` }
          },
          UpdateExpression: 'SET isPrimary = :false',
          ExpressionAttributeValues: {
            ':false': { BOOL: false }
          }
        }));
      }
    }
  }
  
  const ownerId = `owner-${Date.now()}`;
  const now = new Date().toISOString();
  
  await dynamoClient.send(new PutItemCommand({
    TableName: DEVICES_TABLE,
    Item: marshall({
      PK: `KITCHEN#${kitchenId}`,
      SK: `OWNER#${ownerId}`,
      GSI1PK: `EMAIL#${data.email.toLowerCase()}`,
      GSI1SK: kitchenId,
      ownerId,
      kitchenId,
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone || null,
      emiratesId: data.emiratesId || null,
      isPrimary,
      canManage: data.canManage || false,
      canViewReports: data.canViewReports !== false,
      notifyEmail: data.notifyEmail !== false,
      notifyWhatsApp: data.notifyWhatsApp || false,
      notifyOnAlert: data.notifyOnAlert !== false,
      notifyDailyReport: data.notifyDailyReport || false,
      hasPortalAccess: false,
      createdAt: now,
      updatedAt: now
    })
  }));
  
  // Update kitchen owner count
  await dynamoClient.send(new UpdateItemCommand({
    TableName: DEVICES_TABLE,
    Key: {
      PK: { S: `KITCHEN#${kitchenId}` },
      SK: { S: 'METADATA' }
    },
    UpdateExpression: 'SET ownerCount = if_not_exists(ownerCount, :zero) + :one',
    ExpressionAttributeValues: {
      ':zero': { N: '0' },
      ':one': { N: '1' }
    }
  }));
  
  return response(201, { 
    success: true,
    owner: { id: ownerId, name: data.name, email: data.email, isPrimary },
    message: 'Owner added successfully' 
  });
}

async function updateOwner(kitchenId, ownerId, body) {
  const data = JSON.parse(body);
  const now = new Date().toISOString();
  
  // If making this owner primary, remove primary from others
  if (data.isPrimary === true) {
    const allOwners = await dynamoClient.send(new QueryCommand({
      TableName: DEVICES_TABLE,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': { S: `KITCHEN#${kitchenId}` },
        ':sk': { S: 'OWNER#' }
      }
    }));
    
    for (const item of allOwners.Items || []) {
      const owner = unmarshall(item);
      if (owner.isPrimary && owner.ownerId !== ownerId) {
        await dynamoClient.send(new UpdateItemCommand({
          TableName: DEVICES_TABLE,
          Key: {
            PK: { S: `KITCHEN#${kitchenId}` },
            SK: { S: `OWNER#${owner.ownerId}` }
          },
          UpdateExpression: 'SET isPrimary = :false',
          ExpressionAttributeValues: {
            ':false': { BOOL: false }
          }
        }));
      }
    }
  }
  
  const updateExpressions = [];
  const expressionValues = { ':updatedAt': { S: now } };
  const expressionNames = { '#updatedAt': 'updatedAt' };
  
  const fields = ['name', 'email', 'phone', 'emiratesId', 'isPrimary', 'canManage', 
                  'canViewReports', 'notifyEmail', 'notifyWhatsApp', 'notifyOnAlert', 'notifyDailyReport'];
  
  fields.forEach(field => {
    if (data[field] !== undefined) {
      updateExpressions.push(`#${field} = :${field}`);
      expressionNames[`#${field}`] = field;
      if (typeof data[field] === 'boolean') {
        expressionValues[`:${field}`] = { BOOL: data[field] };
      } else {
        expressionValues[`:${field}`] = { S: String(data[field] || '') };
      }
    }
  });
  
  updateExpressions.push('#updatedAt = :updatedAt');
  
  await dynamoClient.send(new UpdateItemCommand({
    TableName: DEVICES_TABLE,
    Key: {
      PK: { S: `KITCHEN#${kitchenId}` },
      SK: { S: `OWNER#${ownerId}` }
    },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionNames,
    ExpressionAttributeValues: expressionValues
  }));
  
  return response(200, { success: true, message: 'Owner updated successfully' });
}

async function deleteOwner(kitchenId, ownerId) {
  // Check owner count
  const ownerCount = await dynamoClient.send(new QueryCommand({
    TableName: DEVICES_TABLE,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': { S: `KITCHEN#${kitchenId}` },
      ':sk': { S: 'OWNER#' }
    },
    Select: 'COUNT'
  }));
  
  if ((ownerCount.Count || 0) <= 1) {
    return response(400, { success: false, error: 'Cannot delete the last owner. Add another owner first.' });
  }
  
  // Get owner to check if primary
  const ownerResult = await dynamoClient.send(new GetItemCommand({
    TableName: DEVICES_TABLE,
    Key: {
      PK: { S: `KITCHEN#${kitchenId}` },
      SK: { S: `OWNER#${ownerId}` }
    }
  }));
  
  const owner = ownerResult.Item ? unmarshall(ownerResult.Item) : null;
  
  // Delete the owner
  await dynamoClient.send(new DeleteItemCommand({
    TableName: DEVICES_TABLE,
    Key: {
      PK: { S: `KITCHEN#${kitchenId}` },
      SK: { S: `OWNER#${ownerId}` }
    }
  }));
  
  // If primary was deleted, make another owner primary
  if (owner && owner.isPrimary) {
    const remainingOwners = await dynamoClient.send(new QueryCommand({
      TableName: DEVICES_TABLE,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': { S: `KITCHEN#${kitchenId}` },
        ':sk': { S: 'OWNER#' }
      },
      Limit: 1
    }));
    
    if (remainingOwners.Items && remainingOwners.Items.length > 0) {
      const nextOwner = unmarshall(remainingOwners.Items[0]);
      await dynamoClient.send(new UpdateItemCommand({
        TableName: DEVICES_TABLE,
        Key: {
          PK: { S: `KITCHEN#${kitchenId}` },
          SK: { S: `OWNER#${nextOwner.ownerId}` }
        },
        UpdateExpression: 'SET isPrimary = :true',
        ExpressionAttributeValues: {
          ':true': { BOOL: true }
        }
      }));
    }
  }
  
  // Update kitchen owner count
  await dynamoClient.send(new UpdateItemCommand({
    TableName: DEVICES_TABLE,
    Key: {
      PK: { S: `KITCHEN#${kitchenId}` },
      SK: { S: 'METADATA' }
    },
    UpdateExpression: 'SET ownerCount = ownerCount - :one',
    ExpressionAttributeValues: {
      ':one': { N: '1' }
    }
  }));
  
  return response(200, { success: true, message: 'Owner removed successfully' });
}

// ==========================================
// SENSORS HANDLERS (legacy - for backward compatibility)
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
  
  const { httpMethod, path, queryStringParameters, body } = event;
  const method = httpMethod;
  
  // Handle OPTIONS for CORS
  if (method === 'OPTIONS') {
    return response(200, {});
  }
  
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

    // KITCHENS routes
    if (segments[0] === 'kitchens') {
      // /kitchens
      if (segments.length === 1) {
        if (method === 'GET') return await listKitchens();
        if (method === 'POST') return await createKitchen(body);
      }
      // /kitchens/{id}
      if (segments.length === 2) {
        const kitchenId = segments[1];
        if (method === 'GET') return await getKitchen(kitchenId);
        if (method === 'PUT') return await updateKitchen(kitchenId, body);
        if (method === 'DELETE') return await deleteKitchen(kitchenId);
      }
      // /kitchens/{id}/equipment
      if (segments.length === 3 && segments[2] === 'equipment') {
        const kitchenId = segments[1];
        if (method === 'GET') return await listEquipment(kitchenId);
        if (method === 'POST') return await createEquipment(kitchenId, body);
      }
      // /kitchens/{id}/equipment/{equipmentId}
      if (segments.length === 4 && segments[2] === 'equipment') {
        const kitchenId = segments[1];
        const equipmentId = segments[3];
        if (method === 'PUT') return await updateEquipment(kitchenId, equipmentId, body);
        if (method === 'DELETE') return await deleteEquipment(kitchenId, equipmentId);
      }
      // /kitchens/{id}/owners
      if (segments.length === 3 && segments[2] === 'owners') {
        const kitchenId = segments[1];
        if (method === 'GET') return await listOwners(kitchenId);
        if (method === 'POST') return await createOwner(kitchenId, body);
      }
      // /kitchens/{id}/owners/{ownerId}
      if (segments.length === 4 && segments[2] === 'owners') {
        const kitchenId = segments[1];
        const ownerId = segments[3];
        if (method === 'PUT') return await updateOwner(kitchenId, ownerId, body);
        if (method === 'DELETE') return await deleteOwner(kitchenId, ownerId);
      }
      // /kitchens/{id}/sensors (legacy)
      if (segments.length === 3 && segments[2] === 'sensors') {
        return await listSensors(segments[1]);
      }
      // /kitchens/{id}/alerts
      if (segments.length === 3 && segments[2] === 'alerts') {
        return await listAlerts(segments[1], false);
      }
    }
    
    // SENSORS routes (legacy)
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
    
    // ALERTS routes
    if (segments[0] === 'alerts') {
      if (segments.length === 1) {
        if (method === 'GET') return await listAlerts();
      }
      if (segments.length === 3 && segments[2] === 'acknowledge') {
        const alertId = segments[1];
        return await acknowledgeAlert(alertId);
      }
    }
    
    // ANALYTICS routes
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
