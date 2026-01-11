/**
 * VisionDrive Smart Kitchen - Multi-Sensor Simulator
 * 
 * Simulates multiple sensors across multiple kitchens for comprehensive testing.
 * 
 * Usage:
 *   npx tsx simulate-multi-sensor.ts
 *   npx tsx simulate-multi-sensor.ts --config sensors.json
 */

interface SensorConfig {
  sensorId: string
  kitchenId: string
  kitchenName: string
  location: string
  probeType: 'fridge' | 'freezer' | 'general'
  baseTemp: number
  alertThresholds: { min: number; max: number }
}

interface SimulatorState {
  tick: number
  battery: number
  lastTemp: number
  anomalyMode: boolean
  anomalyStart: number
}

// Default sensor fleet configuration
const defaultSensors: SensorConfig[] = [
  { sensorId: 'sensor-001', kitchenId: 'kitchen-001', kitchenName: 'Main Kitchen', location: 'Walk-in Fridge', probeType: 'fridge', baseTemp: 4.0, alertThresholds: { min: 0, max: 8 } },
  { sensorId: 'sensor-002', kitchenId: 'kitchen-001', kitchenName: 'Main Kitchen', location: 'Freezer', probeType: 'freezer', baseTemp: -18.0, alertThresholds: { min: -25, max: -15 } },
  { sensorId: 'sensor-003', kitchenId: 'kitchen-001', kitchenName: 'Main Kitchen', location: 'Display Fridge', probeType: 'fridge', baseTemp: 5.0, alertThresholds: { min: 0, max: 8 } },
  { sensorId: 'sensor-004', kitchenId: 'kitchen-002', kitchenName: 'Cloud Kitchen A', location: 'Main Fridge', probeType: 'fridge', baseTemp: 4.5, alertThresholds: { min: 0, max: 8 } },
  { sensorId: 'sensor-005', kitchenId: 'kitchen-002', kitchenName: 'Cloud Kitchen A', location: 'Cold Storage', probeType: 'fridge', baseTemp: 3.0, alertThresholds: { min: 0, max: 8 } },
  { sensorId: 'sensor-006', kitchenId: 'kitchen-003', kitchenName: 'Restaurant Kitchen', location: 'Prep Fridge', probeType: 'fridge', baseTemp: 4.0, alertThresholds: { min: 0, max: 8 } },
]

// Sensor states
const sensorStates = new Map<string, SimulatorState>()

// Initialize states
function initializeSensors(sensors: SensorConfig[]) {
  sensors.forEach(sensor => {
    sensorStates.set(sensor.sensorId, {
      tick: 0,
      battery: 3.50 + Math.random() * 0.1,
      lastTemp: sensor.baseTemp,
      anomalyMode: false,
      anomalyStart: 0
    })
  })
}

// Generate temperature with realistic behavior
function generateTemperature(sensor: SensorConfig, state: SimulatorState): number {
  let temp = sensor.baseTemp
  
  // Daily variation (sine wave over 24 hours mapped to ticks)
  temp += Math.sin(state.tick / 100) * 0.5
  
  // Door opening simulation (random spikes)
  if (Math.random() < 0.05) {
    temp += sensor.probeType === 'freezer' ? 3 : 1.5
  }
  
  // Random noise
  temp += (Math.random() - 0.5) * 0.5
  
  // Anomaly mode (simulates equipment failure)
  if (state.anomalyMode) {
    const anomalyDuration = state.tick - state.anomalyStart
    temp += anomalyDuration * 0.3 // Temperature rising due to failure
  } else {
    // Random chance to start anomaly (1% per tick)
    if (Math.random() < 0.01) {
      state.anomalyMode = true
      state.anomalyStart = state.tick
      console.log(`\n🚨 ANOMALY STARTED: ${sensor.sensorId} (${sensor.location})`)
    }
  }
  
  // Recovery from anomaly after some time
  if (state.anomalyMode && (state.tick - state.anomalyStart) > 20) {
    if (Math.random() < 0.1) {
      state.anomalyMode = false
      console.log(`\n✅ ANOMALY RESOLVED: ${sensor.sensorId}`)
    }
  }
  
  state.lastTemp = temp
  return Math.round(temp * 100) / 100
}

// Convert temperature to mA
function tempToMA(temp: number, probeType: string): number {
  const profiles: Record<string, { minTemp: number; maxTemp: number }> = {
    fridge: { minTemp: 0, maxTemp: 10 },
    freezer: { minTemp: -30, maxTemp: 0 },
    general: { minTemp: -40, maxTemp: 85 }
  }
  const profile = profiles[probeType] || profiles.fridge
  return 4 + ((temp - profile.minTemp) / (profile.maxTemp - profile.minTemp)) * 16
}

// Generate payload for a sensor
function generatePayload(sensor: SensorConfig): object {
  const state = sensorStates.get(sensor.sensorId)!
  const temperature = generateTemperature(sensor, state)
  const mA = tempToMA(temperature, sensor.probeType)
  
  // Battery drain
  state.battery = Math.max(2.5, state.battery - 0.0001)
  state.tick++
  
  // Check for alert
  const isAlert = temperature < sensor.alertThresholds.min || temperature > sensor.alertThresholds.max
  
  return {
    deviceId: sensor.sensorId,
    kitchenId: sensor.kitchenId,
    kitchenName: sensor.kitchenName,
    location: sensor.location,
    temperature,
    raw_ma: Math.round(mA * 100) / 100,
    battery: Math.round(state.battery * 100) / 100,
    signalStrength: -70 - Math.floor(Math.random() * 20),
    timestamp: new Date().toISOString(),
    isAlert,
    alertType: isAlert ? (temperature > sensor.alertThresholds.max ? 'HIGH_TEMP' : 'LOW_TEMP') : null
  }
}

// Format temperature with color
function formatTemp(temp: number, thresholds: { min: number; max: number }): string {
  const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m'
  }
  
  let color = colors.green
  if (temp < thresholds.min) color = colors.blue
  else if (temp > thresholds.max) color = colors.red
  else if (temp > thresholds.max - 1) color = colors.yellow
  
  return `${color}${temp.toFixed(1)}°C${colors.reset}`
}

// Main display
function displayDashboard(sensors: SensorConfig[]) {
  console.clear()
  console.log('╔════════════════════════════════════════════════════════════════════════════════╗')
  console.log('║           VisionDrive Smart Kitchen - Multi-Sensor Simulator                  ║')
  console.log('╚════════════════════════════════════════════════════════════════════════════════╝')
  console.log()
  console.log(`Time: ${new Date().toLocaleTimeString()}                                    Press Ctrl+C to stop`)
  console.log()
  console.log('┌──────────────┬────────────────┬─────────────────┬────────────┬─────────┬────────┐')
  console.log('│ Sensor       │ Kitchen        │ Location        │ Temperature│ Battery │ Status │')
  console.log('├──────────────┼────────────────┼─────────────────┼────────────┼─────────┼────────┤')
  
  let alertCount = 0
  
  sensors.forEach(sensor => {
    const payload = generatePayload(sensor) as any
    
    const tempDisplay = formatTemp(payload.temperature, sensor.alertThresholds)
    const statusIcon = payload.isAlert ? '\x1b[31m⚠ ALERT\x1b[0m' : '\x1b[32m✓ OK   \x1b[0m'
    
    if (payload.isAlert) alertCount++
    
    console.log(
      `│ ${sensor.sensorId.padEnd(12)} │ ${sensor.kitchenName.substring(0, 14).padEnd(14)} │ ${sensor.location.substring(0, 15).padEnd(15)} │ ${tempDisplay.padEnd(18)} │ ${payload.battery.toFixed(2)}V  │ ${statusIcon} │`
    )
  })
  
  console.log('└──────────────┴────────────────┴─────────────────┴────────────┴─────────┴────────┘')
  console.log()
  console.log(`Active Alerts: ${alertCount > 0 ? '\x1b[31m' + alertCount + '\x1b[0m' : '\x1b[32m0\x1b[0m'}`)
  console.log()
  console.log('Legend: \x1b[32m●\x1b[0m Normal  \x1b[33m●\x1b[0m Warning  \x1b[31m●\x1b[0m Critical  \x1b[34m●\x1b[0m Too Cold')
}

// Run simulator
async function runSimulator() {
  const sensors = defaultSensors
  initializeSensors(sensors)
  
  // Display dashboard every 2 seconds
  displayDashboard(sensors)
  setInterval(() => displayDashboard(sensors), 2000)
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nSimulator stopped.')
  process.exit(0)
})

runSimulator().catch(console.error)
