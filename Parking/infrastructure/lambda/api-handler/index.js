/**
 * VisionDrive Parking - API Handler Lambda
 * 
 * Handles all REST API requests for the parking system.
 */

const { DynamoDBClient, GetItemCommand, PutItemCommand, UpdateItemCommand, QueryCommand, ScanCommand, DeleteItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const client = new DynamoDBClient({ region: "me-central-1" });
const TABLE_NAME = process.env.TABLE_NAME || 'VisionDrive-Parking';

/**
 * CORS headers
 */
const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
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
// ZONES
// ==========================================

async function listZones(tenantId) {
  let params;
  
  if (tenantId) {
    params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :sk)',
      ExpressionAttributeValues: marshall({
        ':pk': `TENANT#${tenantId}`,
        ':sk': 'ZONE#'
      })
    };
  } else {
    params = {
      TableName: TABLE_NAME,
      FilterExpression: 'begins_with(PK, :pk) AND SK = :sk',
      ExpressionAttributeValues: marshall({
        ':pk': 'ZONE#',
        ':sk': 'METADATA'
      })
    };
  }
  
  const result = tenantId 
    ? await client.send(new QueryCommand(params))
    : await client.send(new ScanCommand(params));
  
  const zones = (result.Items || []).map(item => {
    const zone = unmarshall(item);
    return {
      zoneId: zone.zoneId,
      name: zone.name,
      address: zone.address,
      city: zone.city,
      totalBays: zone.totalBays,
      occupiedBays: zone.occupiedBays || 0,
      vacantBays: (zone.totalBays || 0) - (zone.occupiedBays || 0),
      occupancyRate: zone.totalBays ? Math.round((zone.occupiedBays || 0) / zone.totalBays * 100) : 0,
      location: zone.location,
      pricePerHour: zone.pricePerHour,
      operatingHours: zone.operatingHours
    };
  });
  
  return response(200, { zones, count: zones.length });
}

async function getZone(zoneId) {
  const result = await client.send(new GetItemCommand({
    TableName: TABLE_NAME,
    Key: marshall({
      PK: `ZONE#${zoneId}`,
      SK: 'METADATA'
    })
  }));
  
  if (!result.Item) {
    return response(404, { error: 'Zone not found' });
  }
  
  const zone = unmarshall(result.Item);
  return response(200, {
    zoneId: zone.zoneId,
    name: zone.name,
    address: zone.address,
    city: zone.city,
    totalBays: zone.totalBays,
    occupiedBays: zone.occupiedBays || 0,
    vacantBays: (zone.totalBays || 0) - (zone.occupiedBays || 0),
    occupancyRate: zone.totalBays ? Math.round((zone.occupiedBays || 0) / zone.totalBays * 100) : 0,
    location: zone.location,
    pricePerHour: zone.pricePerHour,
    operatingHours: zone.operatingHours,
    tenantId: zone.tenantId,
    createdAt: zone.createdAt
  });
}

async function createZone(body) {
  const data = JSON.parse(body);
  const zoneId = data.zoneId || `zone-${Date.now()}`;
  
  const zoneItem = {
    PK: `ZONE#${zoneId}`,
    SK: 'METADATA',
    GSI1PK: `TENANT#${data.tenantId || 'default'}`,
    GSI1SK: `ZONE#${zoneId}`,
    zoneId,
    name: data.name,
    address: data.address,
    city: data.city || 'Dubai',
    totalBays: data.totalBays || 0,
    occupiedBays: 0,
    location: data.location,
    pricePerHour: data.pricePerHour || 0,
    operatingHours: data.operatingHours || { open: '00:00', close: '23:59' },
    tenantId: data.tenantId || 'default',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  await client.send(new PutItemCommand({
    TableName: TABLE_NAME,
    Item: marshall(zoneItem)
  }));
  
  return response(201, { zoneId, message: 'Zone created successfully' });
}

// ==========================================
// BAYS
// ==========================================

async function listBays(zoneId) {
  const result = await client.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: marshall({
      ':pk': `ZONE#${zoneId}`,
      ':sk': 'BAY#'
    })
  }));
  
  const bays = (result.Items || []).map(item => {
    const bay = unmarshall(item);
    return {
      zoneId,
      bayNumber: bay.bayNumber,
      sensorId: bay.sensorId,
      status: bay.status,
      lastChange: bay.lastChange,
      occupiedSince: bay.occupiedSince,
      currentDuration: bay.currentDuration,
      batteryLevel: bay.batteryLevel,
      signalStrength: bay.signalStrength,
      bayType: bay.bayType || 'standard',
      location: bay.location
    };
  });
  
  const summary = {
    total: bays.length,
    occupied: bays.filter(b => b.status === 'occupied').length,
    vacant: bays.filter(b => b.status === 'vacant').length,
    unknown: bays.filter(b => b.status === 'unknown').length
  };
  
  return response(200, { bays, summary });
}

async function getBay(zoneId, bayNumber) {
  const result = await client.send(new GetItemCommand({
    TableName: TABLE_NAME,
    Key: marshall({
      PK: `ZONE#${zoneId}`,
      SK: `BAY#${bayNumber}`
    })
  }));
  
  if (!result.Item) {
    return response(404, { error: 'Bay not found' });
  }
  
  const bay = unmarshall(result.Item);
  return response(200, {
    zoneId,
    bayNumber: bay.bayNumber,
    sensorId: bay.sensorId,
    status: bay.status,
    lastChange: bay.lastChange,
    occupiedSince: bay.occupiedSince,
    currentDuration: bay.currentDuration,
    batteryLevel: bay.batteryLevel,
    signalStrength: bay.signalStrength,
    bayType: bay.bayType || 'standard',
    location: bay.location,
    lastHeartbeat: bay.lastHeartbeat
  });
}

// ==========================================
// EVENTS
// ==========================================

async function queryEvents(options = {}) {
  const { zoneId, from, to, eventType, limit = 100 } = options;
  
  let params;
  
  if (zoneId) {
    params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :sk)',
      ExpressionAttributeValues: marshall({
        ':pk': `ZONE#${zoneId}`,
        ':sk': 'EVENT#'
      }),
      ScanIndexForward: false,
      Limit: parseInt(limit)
    };
    
    // Add time range filter
    if (from || to) {
      params.FilterExpression = [];
      if (from) {
        params.FilterExpression.push('timestamp >= :from');
        params.ExpressionAttributeValues[':from'] = { S: from };
      }
      if (to) {
        params.FilterExpression.push('timestamp <= :to');
        params.ExpressionAttributeValues[':to'] = { S: to };
      }
      params.FilterExpression = params.FilterExpression.join(' AND ');
    }
  } else {
    // Scan all events (limited)
    params = {
      TableName: TABLE_NAME,
      FilterExpression: 'begins_with(SK, :sk)',
      ExpressionAttributeValues: marshall({ ':sk': 'EVENT#' }),
      Limit: parseInt(limit)
    };
  }
  
  const result = zoneId 
    ? await client.send(new QueryCommand(params))
    : await client.send(new ScanCommand(params));
  
  let events = (result.Items || []).map(item => {
    const event = unmarshall(item);
    // Parse zone/bay from PK
    const pkParts = event.PK.split('#');
    return {
      zoneId: pkParts[1],
      bayNumber: pkParts[3],
      eventType: event.eventType,
      timestamp: event.timestamp,
      duration: event.duration,
      revenue: event.revenue,
      detectionMode: event.detectionMode
    };
  });
  
  if (eventType) {
    events = events.filter(e => e.eventType === eventType);
  }
  
  return response(200, { events, count: events.length });
}

// ==========================================
// SENSORS
// ==========================================

async function listSensors(zoneId) {
  let params;
  
  if (zoneId) {
    params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :sk)',
      ExpressionAttributeValues: marshall({
        ':pk': `ZONE#${zoneId}`,
        ':sk': 'SENSOR#'
      })
    };
  } else {
    params = {
      TableName: TABLE_NAME,
      FilterExpression: 'begins_with(PK, :pk) AND SK = :sk',
      ExpressionAttributeValues: marshall({
        ':pk': 'SENSOR#',
        ':sk': 'METADATA'
      })
    };
  }
  
  const result = zoneId 
    ? await client.send(new QueryCommand(params))
    : await client.send(new ScanCommand(params));
  
  const sensors = (result.Items || []).map(item => {
    const sensor = unmarshall(item);
    return {
      sensorId: sensor.sensorId,
      model: sensor.model,
      zoneId: sensor.zoneId,
      bayNumber: sensor.bayNumber,
      status: sensor.status,
      batteryLevel: sensor.lastBattery,
      signalStrength: sensor.lastSignal,
      lastSeen: sensor.lastSeen,
      firmwareVersion: sensor.firmwareVersion,
      installDate: sensor.installDate
    };
  });
  
  return response(200, { sensors, count: sensors.length });
}

async function registerSensor(body) {
  const data = JSON.parse(body);
  const sensorId = data.sensorId;
  
  if (!sensorId || !data.zoneId || data.bayNumber === undefined) {
    return response(400, { error: 'sensorId, zoneId, and bayNumber are required' });
  }
  
  const sensorItem = {
    PK: `SENSOR#${sensorId}`,
    SK: 'METADATA',
    GSI1PK: `ZONE#${data.zoneId}`,
    GSI1SK: `SENSOR#${sensorId}`,
    GSI2PK: `SENSOR#${sensorId}`,
    GSI2SK: 'BAY',
    sensorId,
    model: data.model || 'PSL01B',
    zoneId: data.zoneId,
    bayNumber: data.bayNumber,
    status: 'active',
    firmwareVersion: data.firmwareVersion || 'unknown',
    installDate: new Date().toISOString(),
    lastBattery: 100,
    lastSignal: 0,
    lastSeen: null
  };
  
  await client.send(new PutItemCommand({
    TableName: TABLE_NAME,
    Item: marshall(sensorItem)
  }));
  
  // Also create/update the bay record
  const bayItem = {
    PK: `ZONE#${data.zoneId}`,
    SK: `BAY#${data.bayNumber}`,
    GSI2PK: `SENSOR#${sensorId}`,
    GSI2SK: 'BAY',
    bayNumber: data.bayNumber,
    sensorId,
    status: 'unknown',
    bayType: data.bayType || 'standard',
    location: data.location,
    lastChange: null,
    occupiedSince: null
  };
  
  await client.send(new PutItemCommand({
    TableName: TABLE_NAME,
    Item: marshall(bayItem)
  }));
  
  return response(201, { sensorId, message: 'Sensor registered successfully' });
}

// ==========================================
// ANALYTICS
// ==========================================

async function getOccupancyAnalytics(zoneId, period = 'day') {
  // Get zone summary
  const zones = zoneId 
    ? [await getZoneData(zoneId)]
    : await getAllZonesData();
  
  const totals = zones.reduce((acc, zone) => ({
    totalBays: acc.totalBays + (zone.totalBays || 0),
    occupiedBays: acc.occupiedBays + (zone.occupiedBays || 0)
  }), { totalBays: 0, occupiedBays: 0 });
  
  return response(200, {
    period,
    totalBays: totals.totalBays,
    occupiedBays: totals.occupiedBays,
    vacantBays: totals.totalBays - totals.occupiedBays,
    occupancyRate: totals.totalBays 
      ? Math.round(totals.occupiedBays / totals.totalBays * 100) 
      : 0,
    zones: zones.map(z => ({
      zoneId: z.zoneId,
      name: z.name,
      occupancyRate: z.totalBays 
        ? Math.round((z.occupiedBays || 0) / z.totalBays * 100) 
        : 0
    }))
  });
}

async function getZoneData(zoneId) {
  const result = await client.send(new GetItemCommand({
    TableName: TABLE_NAME,
    Key: marshall({ PK: `ZONE#${zoneId}`, SK: 'METADATA' })
  }));
  return result.Item ? unmarshall(result.Item) : null;
}

async function getAllZonesData() {
  const result = await client.send(new ScanCommand({
    TableName: TABLE_NAME,
    FilterExpression: 'begins_with(PK, :pk) AND SK = :sk',
    ExpressionAttributeValues: marshall({ ':pk': 'ZONE#', ':sk': 'METADATA' })
  }));
  return (result.Items || []).map(item => unmarshall(item));
}

// ==========================================
// MAIN ROUTER
// ==========================================

exports.handler = async (event) => {
  console.log('API Request:', JSON.stringify(event, null, 2));
  
  const { httpMethod, path, pathParameters, queryStringParameters, body } = event;
  const method = httpMethod;
  const query = queryStringParameters || {};
  
  try {
    // Parse path
    const segments = path.split('/').filter(s => s);
    
    // /zones
    if (segments[0] === 'zones') {
      if (segments.length === 1) {
        if (method === 'GET') return await listZones(query.tenantId);
        if (method === 'POST') return await createZone(body);
      }
      if (segments.length === 2) {
        const zoneId = segments[1];
        if (method === 'GET') return await getZone(zoneId);
      }
      if (segments.length === 3) {
        const zoneId = segments[1];
        if (segments[2] === 'bays' && method === 'GET') {
          return await listBays(zoneId);
        }
        if (segments[2] === 'events' && method === 'GET') {
          return await queryEvents({ zoneId, ...query });
        }
        if (segments[2] === 'analytics' && method === 'GET') {
          return await getOccupancyAnalytics(zoneId, query.period);
        }
      }
      if (segments.length === 4 && segments[2] === 'bays') {
        const zoneId = segments[1];
        const bayNumber = segments[3];
        if (method === 'GET') return await getBay(zoneId, bayNumber);
      }
    }
    
    // /sensors
    if (segments[0] === 'sensors') {
      if (segments.length === 1) {
        if (method === 'GET') return await listSensors(query.zoneId);
        if (method === 'POST') return await registerSensor(body);
      }
    }
    
    // /events
    if (segments[0] === 'events') {
      if (segments.length === 1 && method === 'GET') {
        return await queryEvents(query);
      }
    }
    
    // /analytics
    if (segments[0] === 'analytics') {
      if (segments[1] === 'occupancy' && method === 'GET') {
        return await getOccupancyAnalytics(query.zoneId, query.period);
      }
    }
    
    return response(404, { error: 'Route not found', path });
    
  } catch (error) {
    console.error('API Error:', error);
    return response(500, { error: 'Internal server error', message: error.message });
  }
};
