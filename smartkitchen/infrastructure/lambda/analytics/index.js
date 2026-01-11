/**
 * VisionDrive Smart Kitchen - Analytics Lambda
 * 
 * Generates daily/weekly analytics reports from sensor data.
 */

const { TimestreamQueryClient, QueryCommand } = require("@aws-sdk/client-timestream-query");

const queryClient = new TimestreamQueryClient({ region: "me-central-1" });

const DATABASE_NAME = process.env.TIMESTREAM_DATABASE || 'visiondrive_smartkitchen';
const TABLE_NAME = process.env.TIMESTREAM_TABLE || 'sensor_readings';

/**
 * Execute Timestream query
 */
async function executeQuery(queryString) {
  const command = new QueryCommand({ QueryString: queryString });
  const response = await queryClient.send(command);
  return parseQueryResult(response);
}

/**
 * Parse Timestream query result into simple objects
 */
function parseQueryResult(response) {
  const columns = response.ColumnInfo.map(col => col.Name);
  const rows = response.Rows.map(row => {
    const obj = {};
    row.Data.forEach((data, index) => {
      const value = data.ScalarValue;
      obj[columns[index]] = value;
    });
    return obj;
  });
  return rows;
}

/**
 * Get daily statistics for all sensors
 */
async function getDailyStats(date = 'today') {
  const timeFilter = date === 'today' ? 'ago(24h)' : `ago(${date}d)`;
  
  const query = `
    SELECT 
      device_id,
      kitchen_id,
      AVG(measure_value::double) as avg_temp,
      MAX(measure_value::double) as max_temp,
      MIN(measure_value::double) as min_temp,
      COUNT(*) as reading_count
    FROM "${DATABASE_NAME}"."${TABLE_NAME}"
    WHERE measure_name = 'temperature'
      AND time > ${timeFilter}
    GROUP BY device_id, kitchen_id
    ORDER BY kitchen_id, device_id
  `;
  
  return executeQuery(query);
}

/**
 * Get hourly averages for a specific kitchen
 */
async function getHourlyAverages(kitchenId, hours = 24) {
  const query = `
    SELECT 
      kitchen_id,
      bin(time, 1h) as hour,
      AVG(measure_value::double) as avg_temp,
      COUNT(*) as reading_count
    FROM "${DATABASE_NAME}"."${TABLE_NAME}"
    WHERE kitchen_id = '${kitchenId}'
      AND measure_name = 'temperature'
      AND time > ago(${hours}h)
    GROUP BY kitchen_id, bin(time, 1h)
    ORDER BY hour
  `;
  
  return executeQuery(query);
}

/**
 * Get temperature trend (is it rising or falling?)
 */
async function getTemperatureTrend(deviceId, hours = 6) {
  const query = `
    SELECT 
      time,
      measure_value::double as temperature
    FROM "${DATABASE_NAME}"."${TABLE_NAME}"
    WHERE device_id = '${deviceId}'
      AND measure_name = 'temperature'
      AND time > ago(${hours}h)
    ORDER BY time ASC
  `;
  
  const readings = await executeQuery(query);
  
  if (readings.length < 2) {
    return { trend: 'insufficient_data', readings: readings.length };
  }
  
  // Simple linear regression for trend
  const first = parseFloat(readings[0].temperature);
  const last = parseFloat(readings[readings.length - 1].temperature);
  const diff = last - first;
  
  let trend = 'stable';
  if (diff > 0.5) trend = 'rising';
  else if (diff < -0.5) trend = 'falling';
  
  return {
    trend,
    startTemp: first,
    endTemp: last,
    change: diff.toFixed(2),
    readingCount: readings.length
  };
}

/**
 * Get alerts summary
 */
async function getAlertsSummary(kitchenId, days = 7) {
  // Note: Alerts are in DynamoDB, this is a placeholder
  // In production, query DynamoDB for alerts
  return {
    totalAlerts: 0,
    highTempAlerts: 0,
    lowTempAlerts: 0,
    acknowledgedRate: 0
  };
}

/**
 * Generate full analytics report
 */
async function generateReport(params) {
  const { kitchenId, reportType = 'daily' } = params;
  
  const report = {
    generatedAt: new Date().toISOString(),
    reportType,
    data: {}
  };
  
  if (kitchenId) {
    // Kitchen-specific report
    report.kitchenId = kitchenId;
    report.data.hourlyAverages = await getHourlyAverages(kitchenId, 24);
    report.data.alertsSummary = await getAlertsSummary(kitchenId, 7);
  } else {
    // Global report
    report.data.dailyStats = await getDailyStats();
  }
  
  return report;
}

/**
 * Main handler
 */
exports.handler = async (event) => {
  console.log('Analytics event:', JSON.stringify(event, null, 2));
  
  try {
    // Handle different invocation sources
    let params = {};
    
    if (event.queryStringParameters) {
      // API Gateway invocation
      params = event.queryStringParameters;
    } else if (event.kitchenId || event.reportType) {
      // Direct invocation
      params = event;
    }
    
    const report = await generateReport(params);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(report)
    };
    
  } catch (error) {
    console.error('Error generating analytics:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Failed to generate analytics',
        message: error.message
      })
    };
  }
};
