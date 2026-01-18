/**
 * VisionDrive Smart Kitchen - Data Ingestion Lambda
 * 
 * Processes incoming sensor data from AWS IoT Core and stores in DynamoDB.
 * 
 * Supports TWO sensor types:
 * 1. PS-NB-GE: Sends raw_ma (4-20mA), needs conversion to temperature
 * 2. S31-NB:   Sends Temperature and Humidity directly (SHT31 probe)
 * 
 * 🇦🇪 UAE Data Residency: All data stored in DynamoDB in me-central-1
 */

const { DynamoDBClient, PutItemCommand, UpdateItemCommand, QueryCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const dynamoClient = new DynamoDBClient({ region: "me-central-1" });

const SENSOR_READINGS_TABLE = process.env.SENSOR_READINGS_TABLE || 'VisionDrive-SensorReadings';
const DEVICES_TABLE = process.env.DEVICES_TABLE || 'VisionDrive-Devices';
const ALERTS_TABLE = process.env.ALERTS_TABLE || 'VisionDrive-Alerts';

/**
 * Temperature Conversion Profiles for PS-NB-GE (4-20mA probes)
 */
const PROBE_PROFILES = {
  fridge: { minMA: 4, maxMA: 20, minTemp: 0, maxTemp: 10 },
  freezer: { minMA: 4, maxMA: 20, minTemp: -30, maxTemp: 0 },
  general: { minMA: 4, maxMA: 20, minTemp: -40, maxTemp: 85 },
  ambient: { minMA: 4, maxMA: 20, minTemp: 15, maxTemp: 35 },
};

/**
 * Convert 4-20mA reading to temperature (for PS-NB-GE sensors)
 */
function convertToTemperature(mA, probeType = 'fridge') {
  const profile = PROBE_PROFILES[probeType] || PROBE_PROFILES.fridge;
  const { minMA, maxMA, minTemp, maxTemp } = profile;
  const clampedMA = Math.max(minMA, Math.min(maxMA, mA));
  const temperature = minTemp + ((clampedMA - minMA) / (maxMA - minMA)) * (maxTemp - minTemp);
  return Math.round(temperature * 100) / 100;
}

/**
 * Detect sensor type from payload
 * S31-NB sends: { mod: "S31-NB", Temperature, Humidity, Battery }
 * PS-NB-GE sends: { IDC_mA, VDC_V, Battery }
 */
function detectSensorType(payload) {
  if (payload.Temperature !== undefined || payload.Humidity !== undefined || payload.mod?.includes('S31')) {
    return 'S31-NB';
  }
  if (payload.raw_ma !== undefined || payload.IDC_mA !== undefined) {
    return 'PS-NB-GE';
  }
  return 'unknown';
}

/**
 * Find equipment by DevEUI or IMEI to update its lastReading
 */
async function findAndUpdateEquipment(deviceId, temperature, humidity, battery, signal) {
  try {
    // Try to find equipment by sensor DevEUI or IMEI
    // Device ID format could be: visiondrive-s31-kitchen-001 or just s31-001
    const sensorId = deviceId.replace('visiondrive-', '').replace('s31-', '');
    
    // Search for equipment with matching sensorDevEui or sensorImei
    const result = await dynamoClient.send(new QueryCommand({
      TableName: DEVICES_TABLE,
      IndexName: 'GSI1',
      KeyConditionExpression: 'begins_with(GSI1PK, :prefix)',
      ExpressionAttributeValues: {
        ':prefix': { S: 'DEVEUI#' }
      }
    }));
    
    // For now, we'll update based on deviceId pattern
    // In production, you'd match the DEVEUI from the sensor
    console.log(`Looking for equipment with deviceId: ${deviceId}`);
    
  } catch (error) {
    console.warn('Failed to update equipment:', error.message);
  }
}

/**
 * Store reading in DynamoDB (time-series style)
 */
async function storeReading(deviceId, kitchenId, data) {
  const now = new Date();
  const timestamp = now.toISOString();
  const dateKey = timestamp.split('T')[0]; // YYYY-MM-DD
  
  const item = {
    // Partition by device + date for efficient queries
    PK: `${deviceId}#${dateKey}`,
    SK: timestamp,
    // Attributes
    deviceId,
    kitchenId,
    timestamp,
    temperature: data.temperature,
    humidity: data.humidity || null,
    rawMA: data.rawMA || null,
    batteryVoltage: data.battery || null,
    signalStrength: data.signal || null,
    sensorType: data.sensorType,
    // TTL for automatic cleanup (90 days)
    TTL: Math.floor(now.getTime() / 1000) + (90 * 24 * 60 * 60)
  };
  
  await dynamoClient.send(new PutItemCommand({
    TableName: SENSOR_READINGS_TABLE,
    Item: marshall(item, { removeUndefinedValues: true })
  }));
  
  console.log(`Stored reading: ${deviceId} = ${data.temperature}°C, ${data.humidity || '-'}% humidity`);
  return item;
}

/**
 * Update device/equipment lastReading in DynamoDB
 */
async function updateDeviceLastSeen(deviceId, kitchenId, data) {
  const now = new Date().toISOString();
  
  try {
    // Update DEVICE record (legacy)
    await dynamoClient.send(new UpdateItemCommand({
      TableName: DEVICES_TABLE,
      Key: {
        PK: { S: `DEVICE#${deviceId}` },
        SK: { S: 'METADATA' }
      },
      UpdateExpression: 'SET lastSeen = :ts, lastTemperature = :temp, lastHumidity = :hum, lastBattery = :bat',
      ExpressionAttributeValues: {
        ':ts': { S: now },
        ':temp': { N: String(data.temperature || 0) },
        ':hum': { N: String(data.humidity || 0) },
        ':bat': { N: String(data.battery || 0) }
      }
    }));
  } catch (error) {
    // Device might not exist yet, that's OK
    console.log('Device record not found, skipping update:', deviceId);
  }
}

/**
 * Check temperature thresholds and create alert if needed
 */
async function checkThresholdsAndAlert(deviceId, kitchenId, temperature, humidity) {
  // Dubai Municipality Danger Zone: 5°C - 60°C
  const isDangerZone = temperature > 5 && temperature < 60;
  
  // For fridges (0-5°C) and freezers (<-18°C), check if out of range
  // This would normally be configured per-equipment
  const isFridgeOutOfRange = temperature > 8; // Give some buffer above 5°C
  const isFreezerOutOfRange = temperature > -15; // Give some buffer above -18°C
  
  if (isDangerZone) {
    console.log(`⚠️ DANGER ZONE: ${deviceId} at ${temperature}°C`);
    
    const alertTimestamp = new Date().toISOString();
    
    await dynamoClient.send(new PutItemCommand({
      TableName: ALERTS_TABLE,
      Item: marshall({
        PK: `KITCHEN#${kitchenId}`,
        SK: `ALERT#${alertTimestamp}`,
        GSI1PK: 'ALERT#ACTIVE',
        GSI1SK: alertTimestamp,
        deviceId,
        kitchenId,
        alertType: 'DANGER_ZONE',
        severity: 'danger',
        temperature,
        humidity: humidity || null,
        threshold: { min: 5, max: 60 },
        message: `DANGER ZONE: Temperature at ${temperature}°C is in the danger zone (5°C - 60°C)`,
        acknowledged: false,
        createdAt: alertTimestamp
      }, { removeUndefinedValues: true })
    }));
    
    return true;
  }
  
  return false;
}

/**
 * Main handler for IoT Core data
 * 
 * Payload formats:
 * 
 * From IoT Rule (PS-NB-GE):
 * {
 *   deviceId: "sensor-001",
 *   kitchenId: "kitchen-001", 
 *   raw_ma: 12.5,
 *   battery: 3.52,
 *   voltage: 0,
 *   received_at: 1234567890
 * }
 * 
 * From IoT Rule (S31-NB):
 * {
 *   deviceId: "s31-001",
 *   kitchenId: "kitchen-001",
 *   temperature: 24.5,
 *   humidity: 62.3,
 *   battery: 3.52,
 *   received_at: 1234567890
 * }
 * 
 * Raw S31-NB JSON (if sent directly):
 * {
 *   mod: "S31-NB",
 *   Battery: 3.52,
 *   Temperature: 24.5,
 *   Humidity: 62.3
 * }
 */
exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  try {
    // Extract common fields
    let deviceId = event.deviceId || event.device_id || 'unknown';
    let kitchenId = event.kitchenId || event.kitchen_id || 'unknown';
    const receivedAt = event.received_at || Date.now();
    
    // Detect sensor type
    const sensorType = detectSensorType(event);
    console.log(`Sensor type detected: ${sensorType}`);
    
    let temperature, humidity, rawMA, battery;
    
    if (sensorType === 'S31-NB') {
      // S31-NB sends temperature and humidity directly
      temperature = event.temperature ?? event.Temperature;
      humidity = event.humidity ?? event.Humidity;
      battery = event.battery ?? event.Battery;
      rawMA = null;
      
      console.log(`S31-NB: ${temperature}°C, ${humidity}% humidity, ${battery}V`);
      
    } else if (sensorType === 'PS-NB-GE') {
      // PS-NB-GE sends mA, need to convert
      rawMA = event.raw_ma ?? event.IDC_mA;
      battery = event.battery ?? event.Battery;
      humidity = null;
      
      // TODO: Get probe type from device config
      temperature = convertToTemperature(rawMA, 'fridge');
      
      console.log(`PS-NB-GE: ${rawMA}mA → ${temperature}°C, ${battery}V`);
      
    } else {
      // Try to extract whatever we can
      temperature = event.temperature ?? event.Temperature ?? event.temp;
      humidity = event.humidity ?? event.Humidity ?? event.hum;
      battery = event.battery ?? event.Battery ?? event.bat;
      rawMA = event.raw_ma ?? event.IDC_mA ?? event.mA;
      
      if (rawMA && !temperature) {
        temperature = convertToTemperature(rawMA, 'fridge');
      }
      
      console.log(`Unknown sensor: temp=${temperature}, humidity=${humidity}, mA=${rawMA}`);
    }
    
    // Validate we have at least temperature
    if (temperature === undefined || temperature === null) {
      throw new Error(`No temperature value found in payload: ${JSON.stringify(event)}`);
    }
    
    // Store the reading
    const data = {
      temperature,
      humidity,
      rawMA,
      battery,
      sensorType,
      signal: event.signal ?? event.rssi ?? null
    };
    
    await storeReading(deviceId, kitchenId, data);
    
    // Update device last seen
    await updateDeviceLastSeen(deviceId, kitchenId, data);
    
    // Check thresholds and create alert if needed
    const alertCreated = await checkThresholdsAndAlert(deviceId, kitchenId, temperature, humidity);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Data ingested successfully',
        deviceId,
        kitchenId,
        sensorType,
        temperature,
        humidity: humidity || null,
        alertCreated
      })
    };
    
  } catch (error) {
    console.error('Error processing sensor data:', error);
    throw error;
  }
};
