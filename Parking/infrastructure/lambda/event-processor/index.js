/**
 * VisionDrive Parking - Event Processor Lambda
 * 
 * Processes incoming parking sensor data from AWS IoT Core.
 * Handles bay state changes, creates events, updates zone occupancy.
 */

const { DynamoDBClient, GetItemCommand, PutItemCommand, UpdateItemCommand, QueryCommand } = require("@aws-sdk/client-dynamodb");
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const dynamoClient = new DynamoDBClient({ region: "me-central-1" });
const snsClient = new SNSClient({ region: "me-central-1" });

const TABLE_NAME = process.env.TABLE_NAME || 'VisionDrive-Parking';
const ALERT_TOPIC_ARN = process.env.ALERT_TOPIC_ARN;

/**
 * Get sensor by device ID
 */
async function getSensor(deviceId) {
  const result = await dynamoClient.send(new GetItemCommand({
    TableName: TABLE_NAME,
    Key: marshall({
      PK: `SENSOR#${deviceId}`,
      SK: 'METADATA'
    })
  }));
  
  return result.Item ? unmarshall(result.Item) : null;
}

/**
 * Get current bay state
 */
async function getBay(zoneId, bayNumber) {
  const result = await dynamoClient.send(new GetItemCommand({
    TableName: TABLE_NAME,
    Key: marshall({
      PK: `ZONE#${zoneId}`,
      SK: `BAY#${bayNumber}`
    })
  }));
  
  return result.Item ? unmarshall(result.Item) : null;
}

/**
 * Get zone metadata
 */
async function getZone(zoneId) {
  const result = await dynamoClient.send(new GetItemCommand({
    TableName: TABLE_NAME,
    Key: marshall({
      PK: `ZONE#${zoneId}`,
      SK: 'METADATA'
    })
  }));
  
  return result.Item ? unmarshall(result.Item) : null;
}

/**
 * Update bay status
 */
async function updateBay(zoneId, bayNumber, updates) {
  const updateExpressions = [];
  const expressionValues = {};
  const expressionNames = {};
  
  Object.entries(updates).forEach(([key, value]) => {
    updateExpressions.push(`#${key} = :${key}`);
    expressionNames[`#${key}`] = key;
    expressionValues[`:${key}`] = value;
  });
  
  await dynamoClient.send(new UpdateItemCommand({
    TableName: TABLE_NAME,
    Key: marshall({
      PK: `ZONE#${zoneId}`,
      SK: `BAY#${bayNumber}`
    }),
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionNames,
    ExpressionAttributeValues: marshall(expressionValues)
  }));
}

/**
 * Create parking event
 */
async function createEvent(zoneId, bayNumber, eventType, timestamp, extras = {}) {
  const eventItem = {
    PK: `ZONE#${zoneId}#BAY#${bayNumber}`,
    SK: `EVENT#${timestamp}`,
    GSI1PK: `ZONE#${zoneId}`,
    GSI1SK: `EVENT#${timestamp}`,
    eventType,
    timestamp,
    ...extras,
    // TTL: 90 days from now
    ttl: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60)
  };
  
  await dynamoClient.send(new PutItemCommand({
    TableName: TABLE_NAME,
    Item: marshall(eventItem)
  }));
  
  console.log(`Created event: ${eventType} for ${zoneId}/${bayNumber}`);
}

/**
 * Update zone occupancy count
 */
async function updateZoneOccupancy(zoneId, increment) {
  await dynamoClient.send(new UpdateItemCommand({
    TableName: TABLE_NAME,
    Key: marshall({
      PK: `ZONE#${zoneId}`,
      SK: 'METADATA'
    }),
    UpdateExpression: 'SET occupiedBays = occupiedBays + :inc, updatedAt = :now',
    ExpressionAttributeValues: marshall({
      ':inc': increment,
      ':now': new Date().toISOString()
    })
  }));
}

/**
 * Update sensor health metrics
 */
async function updateSensorHealth(deviceId, battery, signal, timestamp) {
  await dynamoClient.send(new UpdateItemCommand({
    TableName: TABLE_NAME,
    Key: marshall({
      PK: `SENSOR#${deviceId}`,
      SK: 'METADATA'
    }),
    UpdateExpression: 'SET lastBattery = :bat, lastSignal = :sig, lastSeen = :ts',
    ExpressionAttributeValues: marshall({
      ':bat': battery,
      ':sig': signal,
      ':ts': timestamp
    })
  }));
}

/**
 * Calculate parking duration in minutes
 */
function calculateDuration(occupiedSince, leaveTime) {
  const start = new Date(occupiedSince).getTime();
  const end = new Date(leaveTime).getTime();
  return Math.round((end - start) / 60000);
}

/**
 * Calculate revenue based on duration and hourly rate
 */
function calculateRevenue(durationMinutes, pricePerHour) {
  const hours = durationMinutes / 60;
  return Math.round(hours * pricePerHour * 100) / 100;
}

/**
 * Send low battery alert
 */
async function sendLowBatteryAlert(deviceId, zoneId, bayNumber, battery) {
  if (!ALERT_TOPIC_ARN) return;
  
  await snsClient.send(new PublishCommand({
    TopicArn: ALERT_TOPIC_ARN,
    Subject: `🔋 Low Battery Alert - Bay ${bayNumber}`,
    Message: `
Low Battery Alert - VisionDrive Parking

Sensor: ${deviceId}
Zone: ${zoneId}
Bay: ${bayNumber}
Battery Level: ${battery}%

Please schedule battery replacement.
    `.trim()
  }));
}

/**
 * Main handler
 */
exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  try {
    const {
      deviceId,
      zoneId,
      bayId,
      status,
      battery,
      signal,
      mode,
      receivedAt,
      alertType
    } = event;
    
    // Handle low battery alert separately
    if (alertType === 'LOW_BATTERY') {
      console.log(`Low battery alert for ${deviceId}: ${battery}%`);
      await sendLowBatteryAlert(deviceId, zoneId, bayId, battery);
      return { statusCode: 200, body: 'Low battery alert sent' };
    }
    
    // Get sensor mapping if deviceId provided
    let sensorZoneId = zoneId;
    let sensorBayNumber = bayId;
    
    if (deviceId && !zoneId) {
      const sensor = await getSensor(deviceId);
      if (!sensor) {
        console.error(`Unknown sensor: ${deviceId}`);
        return { statusCode: 404, body: 'Sensor not found' };
      }
      sensorZoneId = sensor.zoneId;
      sensorBayNumber = sensor.bayNumber;
    }
    
    const timestamp = receivedAt || new Date().toISOString();
    
    // Get current bay state
    const bay = await getBay(sensorZoneId, sensorBayNumber);
    
    if (!bay) {
      console.error(`Bay not found: ${sensorZoneId}/${sensorBayNumber}`);
      return { statusCode: 404, body: 'Bay not found' };
    }
    
    // Check for state change
    const previousStatus = bay.status;
    const newStatus = status;
    
    if (previousStatus !== newStatus) {
      console.log(`State change: ${previousStatus} → ${newStatus} for ${sensorZoneId}/${sensorBayNumber}`);
      
      if (newStatus === 'occupied') {
        // Vehicle arrived
        await createEvent(sensorZoneId, sensorBayNumber, 'ARRIVE', timestamp, {
          detectionMode: mode || 'dual'
        });
        
        await updateBay(sensorZoneId, sensorBayNumber, {
          status: 'occupied',
          occupiedSince: timestamp,
          lastChange: timestamp,
          currentDuration: 0
        });
        
        await updateZoneOccupancy(sensorZoneId, 1);
        
      } else if (newStatus === 'vacant') {
        // Vehicle left
        const duration = bay.occupiedSince 
          ? calculateDuration(bay.occupiedSince, timestamp)
          : 0;
        
        // Get zone for pricing
        const zone = await getZone(sensorZoneId);
        const revenue = zone?.pricePerHour 
          ? calculateRevenue(duration, zone.pricePerHour)
          : null;
        
        await createEvent(sensorZoneId, sensorBayNumber, 'LEAVE', timestamp, {
          detectionMode: mode || 'dual',
          duration,
          revenue
        });
        
        await updateBay(sensorZoneId, sensorBayNumber, {
          status: 'vacant',
          occupiedSince: null,
          lastChange: timestamp,
          currentDuration: null
        });
        
        await updateZoneOccupancy(sensorZoneId, -1);
      }
    } else {
      // No state change, just update heartbeat
      await updateBay(sensorZoneId, sensorBayNumber, {
        lastHeartbeat: timestamp
      });
    }
    
    // Update sensor health
    if (deviceId && (battery !== undefined || signal !== undefined)) {
      await updateSensorHealth(deviceId, battery || 0, signal || 0, timestamp);
      
      // Check for low battery
      if (battery && battery < 20) {
        await sendLowBatteryAlert(deviceId, sensorZoneId, sensorBayNumber, battery);
      }
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Event processed successfully',
        zoneId: sensorZoneId,
        bayNumber: sensorBayNumber,
        status: newStatus,
        stateChanged: previousStatus !== newStatus
      })
    };
    
  } catch (error) {
    console.error('Error processing parking event:', error);
    throw error;
  }
};
