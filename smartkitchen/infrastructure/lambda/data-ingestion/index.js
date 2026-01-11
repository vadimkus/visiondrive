/**
 * VisionDrive Smart Kitchen - Data Ingestion Lambda
 * 
 * Processes incoming sensor data from AWS IoT Core and stores in Timestream.
 * Converts raw mA readings to temperature values.
 */

const { TimestreamWriteClient, WriteRecordsCommand } = require("@aws-sdk/client-timestream-write");
const { DynamoDBClient, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");

const timestreamClient = new TimestreamWriteClient({ region: "me-central-1" });
const dynamoClient = new DynamoDBClient({ region: "me-central-1" });

const DATABASE_NAME = process.env.TIMESTREAM_DATABASE || 'visiondrive_smartkitchen';
const TABLE_NAME = process.env.TIMESTREAM_TABLE || 'sensor_readings';
const DEVICES_TABLE = process.env.DEVICES_TABLE || 'VisionDrive-Devices';

/**
 * Temperature Conversion Profiles
 * Adjust based on your specific temperature probe specifications
 */
const PROBE_PROFILES = {
  // Standard kitchen fridge: 0°C to 10°C
  fridge: { minMA: 4, maxMA: 20, minTemp: 0, maxTemp: 10 },
  // Walk-in freezer: -30°C to 0°C
  freezer: { minMA: 4, maxMA: 20, minTemp: -30, maxTemp: 0 },
  // General purpose: -40°C to 85°C
  general: { minMA: 4, maxMA: 20, minTemp: -40, maxTemp: 85 },
  // Kitchen ambient: 15°C to 35°C
  ambient: { minMA: 4, maxMA: 20, minTemp: 15, maxTemp: 35 },
};

/**
 * Convert 4-20mA reading to temperature
 * @param {number} mA - Current reading in milliamps
 * @param {string} probeType - Type of probe (fridge, freezer, general, ambient)
 * @returns {number} Temperature in Celsius
 */
function convertToTemperature(mA, probeType = 'fridge') {
  const profile = PROBE_PROFILES[probeType] || PROBE_PROFILES.fridge;
  const { minMA, maxMA, minTemp, maxTemp } = profile;
  
  // Clamp mA to valid range
  const clampedMA = Math.max(minMA, Math.min(maxMA, mA));
  
  // Linear interpolation
  const temperature = minTemp + ((clampedMA - minMA) / (maxMA - minMA)) * (maxTemp - minTemp);
  
  return Math.round(temperature * 100) / 100; // Round to 2 decimal places
}

/**
 * Update device last seen timestamp in DynamoDB
 */
async function updateDeviceLastSeen(deviceId, temperature, battery) {
  try {
    await dynamoClient.send(new UpdateItemCommand({
      TableName: DEVICES_TABLE,
      Key: {
        PK: { S: `DEVICE#${deviceId}` },
        SK: { S: 'METADATA' }
      },
      UpdateExpression: 'SET lastSeen = :ts, lastTemperature = :temp, lastBattery = :bat',
      ExpressionAttributeValues: {
        ':ts': { S: new Date().toISOString() },
        ':temp': { N: String(temperature) },
        ':bat': { N: String(battery) }
      }
    }));
  } catch (error) {
    console.warn('Failed to update device last seen:', error.message);
    // Don't throw - this is not critical
  }
}

/**
 * Main handler for IoT Core data
 */
exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  try {
    const {
      deviceId,
      kitchenId,
      raw_ma,
      battery,
      voltage,
      received_at
    } = event;
    
    // Validate required fields
    if (!deviceId || !kitchenId || raw_ma === undefined) {
      throw new Error(`Missing required fields: deviceId=${deviceId}, kitchenId=${kitchenId}, raw_ma=${raw_ma}`);
    }
    
    // Convert mA to temperature
    // TODO: Get probe type from device config in DynamoDB
    const temperature = convertToTemperature(raw_ma, 'fridge');
    
    console.log(`Device ${deviceId}: ${raw_ma}mA → ${temperature}°C`);
    
    // Current timestamp
    const currentTime = received_at || Date.now();
    
    // Prepare records for Timestream
    const commonDimensions = [
      { Name: 'device_id', Value: deviceId },
      { Name: 'kitchen_id', Value: kitchenId }
    ];
    
    const records = [
      {
        Dimensions: commonDimensions,
        MeasureName: 'temperature',
        MeasureValue: String(temperature),
        MeasureValueType: 'DOUBLE',
        Time: String(currentTime),
        TimeUnit: 'MILLISECONDS'
      },
      {
        Dimensions: commonDimensions,
        MeasureName: 'raw_ma',
        MeasureValue: String(raw_ma),
        MeasureValueType: 'DOUBLE',
        Time: String(currentTime),
        TimeUnit: 'MILLISECONDS'
      }
    ];
    
    // Add battery voltage if present
    if (battery !== undefined) {
      records.push({
        Dimensions: commonDimensions,
        MeasureName: 'battery_voltage',
        MeasureValue: String(battery),
        MeasureValueType: 'DOUBLE',
        Time: String(currentTime),
        TimeUnit: 'MILLISECONDS'
      });
    }
    
    // Add voltage reading if present
    if (voltage !== undefined) {
      records.push({
        Dimensions: commonDimensions,
        MeasureName: 'voltage',
        MeasureValue: String(voltage),
        MeasureValueType: 'DOUBLE',
        Time: String(currentTime),
        TimeUnit: 'MILLISECONDS'
      });
    }
    
    // Write to Timestream
    const writeCommand = new WriteRecordsCommand({
      DatabaseName: DATABASE_NAME,
      TableName: TABLE_NAME,
      Records: records
    });
    
    await timestreamClient.send(writeCommand);
    console.log(`Successfully stored ${records.length} records for ${deviceId}`);
    
    // Update device last seen
    await updateDeviceLastSeen(deviceId, temperature, battery || 0);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Data ingested successfully',
        deviceId,
        temperature,
        recordsWritten: records.length
      })
    };
    
  } catch (error) {
    console.error('Error processing sensor data:', error);
    
    // Check for specific Timestream errors
    if (error.name === 'RejectedRecordsException') {
      console.error('Rejected records:', JSON.stringify(error.RejectedRecords, null, 2));
    }
    
    throw error;
  }
};
