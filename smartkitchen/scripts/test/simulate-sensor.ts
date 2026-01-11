/**
 * VisionDrive Smart Kitchen - Sensor Data Simulator
 * 
 * Simulates NB-IoT sensor data for testing the dashboard and AWS pipeline.
 * 
 * Usage:
 *   npx tsx simulate-sensor.ts
 *   npx tsx simulate-sensor.ts --sensor sensor-001 --kitchen kitchen-001 --interval 5
 */

import { writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

// Configuration
interface SimulatorConfig {
  sensorId: string
  kitchenId: string
  location: string
  intervalSeconds: number
  probeType: 'fridge' | 'freezer' | 'general'
  baseTemperature: number
  variation: number
  batteryVoltage: number
  signalStrength: number
  outputMode: 'console' | 'file' | 'mqtt' | 'api'
  apiEndpoint?: string
  mqttBroker?: string
}

// Parse command line arguments
function parseArgs(): Partial<SimulatorConfig> {
  const args = process.argv.slice(2)
  const config: Partial<SimulatorConfig> = {}
  
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace('--', '')
    const value = args[i + 1]
    
    switch (key) {
      case 'sensor': config.sensorId = value; break
      case 'kitchen': config.kitchenId = value; break
      case 'location': config.location = value; break
      case 'interval': config.intervalSeconds = parseInt(value); break
      case 'type': config.probeType = value as 'fridge' | 'freezer' | 'general'; break
      case 'output': config.outputMode = value as 'console' | 'file' | 'mqtt' | 'api'; break
      case 'api': config.apiEndpoint = value; break
    }
  }
  
  return config
}

// Default configuration
const defaultConfig: SimulatorConfig = {
  sensorId: 'sensor-sim-001',
  kitchenId: 'kitchen-001',
  location: 'Test Fridge',
  intervalSeconds: 5,
  probeType: 'fridge',
  baseTemperature: 4.0,
  variation: 1.5,
  batteryVoltage: 3.52,
  signalStrength: -75,
  outputMode: 'console'
}

// Temperature profiles
const temperatureProfiles = {
  fridge: { base: 4.0, min: 0, max: 8, variation: 1.5 },
  freezer: { base: -18.0, min: -25, max: -15, variation: 2.0 },
  general: { base: 20.0, min: -40, max: 85, variation: 5.0 }
}

// Convert temperature to mA (4-20mA range)
function temperatureToMA(temp: number, probeType: 'fridge' | 'freezer' | 'general'): number {
  const profiles = {
    fridge: { minTemp: 0, maxTemp: 10 },
    freezer: { minTemp: -30, maxTemp: 0 },
    general: { minTemp: -40, maxTemp: 85 }
  }
  
  const profile = profiles[probeType]
  const mA = 4 + ((temp - profile.minTemp) / (profile.maxTemp - profile.minTemp)) * 16
  return Math.max(4, Math.min(20, mA))
}

// Generate realistic temperature with daily variation
function generateTemperature(config: SimulatorConfig, tick: number): number {
  const profile = temperatureProfiles[config.probeType]
  
  // Base temperature
  let temp = profile.base
  
  // Add sinusoidal variation (simulates door openings, compressor cycles)
  temp += Math.sin(tick / 10) * (profile.variation * 0.5)
  
  // Add random noise
  temp += (Math.random() - 0.5) * profile.variation
  
  // Clamp to valid range
  temp = Math.max(profile.min, Math.min(profile.max, temp))
  
  return Math.round(temp * 100) / 100
}

// Generate simulated battery drain
function simulateBattery(initialVoltage: number, tick: number): number {
  // Slow drain over time
  const drain = tick * 0.00001
  return Math.max(2.5, initialVoltage - drain)
}

// Generate simulated signal strength variation
function simulateSignal(baseSignal: number): number {
  // Random variation ±10 dBm
  return baseSignal + Math.floor((Math.random() - 0.5) * 20)
}

// Generate sensor payload (matches Dragino PS-NB-GE JSON format)
function generatePayload(config: SimulatorConfig, tick: number): object {
  const temperature = generateTemperature(config, tick)
  const mA = temperatureToMA(temperature, config.probeType)
  const battery = simulateBattery(config.batteryVoltage, tick)
  const signal = simulateSignal(config.signalStrength)
  
  return {
    // Dragino format
    mod: 'PS-NB',
    Battery: Math.round(battery * 100) / 100,
    IDC_mA: Math.round(mA * 100) / 100,
    VDC_V: 0,
    IDC_AD: Math.round(mA * 204.8),
    VDC_AD: 0,
    
    // Extended fields for VisionDrive
    _visiondrive: {
      deviceId: config.sensorId,
      kitchenId: config.kitchenId,
      location: config.location,
      temperature: temperature,
      signalStrength: signal,
      timestamp: new Date().toISOString(),
      tick: tick
    }
  }
}

// Output handlers
async function outputToConsole(payload: object, config: SimulatorConfig) {
  const timestamp = new Date().toISOString()
  const temp = (payload as any)._visiondrive.temperature
  
  console.log(`\n[${timestamp}] ${config.sensorId}`)
  console.log(`  Temperature: ${temp.toFixed(1)}°C`)
  console.log(`  Raw mA: ${(payload as any).IDC_mA}`)
  console.log(`  Battery: ${(payload as any).Battery}V`)
  console.log(`  Topic: visiondrive/${config.kitchenId}/${config.sensorId}/temperature`)
  console.log(`  Payload: ${JSON.stringify(payload)}`)
}

async function outputToFile(payload: object, config: SimulatorConfig) {
  const outputDir = './simulated-data'
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }
  
  const filename = join(outputDir, `${config.sensorId}-${new Date().toISOString().split('T')[0]}.jsonl`)
  appendFileSync(filename, JSON.stringify(payload) + '\n')
  console.log(`[${new Date().toISOString()}] Written to ${filename}`)
}

async function outputToApi(payload: object, config: SimulatorConfig) {
  if (!config.apiEndpoint) {
    console.error('API endpoint not configured')
    return
  }
  
  try {
    const response = await fetch(config.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: config.sensorId,
        kitchenId: config.kitchenId,
        raw_ma: (payload as any).IDC_mA,
        battery: (payload as any).Battery,
        timestamp: Date.now()
      })
    })
    
    console.log(`[${new Date().toISOString()}] API response: ${response.status}`)
  } catch (error) {
    console.error('Failed to send to API:', error)
  }
}

// Main simulator
async function runSimulator() {
  const userConfig = parseArgs()
  const config: SimulatorConfig = { ...defaultConfig, ...userConfig }
  
  console.log('╔════════════════════════════════════════════════════════════════════╗')
  console.log('║        VisionDrive Smart Kitchen - Sensor Simulator                ║')
  console.log('╚════════════════════════════════════════════════════════════════════╝')
  console.log()
  console.log('Configuration:')
  console.log(`  Sensor:    ${config.sensorId}`)
  console.log(`  Kitchen:   ${config.kitchenId}`)
  console.log(`  Location:  ${config.location}`)
  console.log(`  Type:      ${config.probeType}`)
  console.log(`  Interval:  ${config.intervalSeconds}s`)
  console.log(`  Output:    ${config.outputMode}`)
  console.log()
  console.log('Press Ctrl+C to stop')
  console.log()
  
  let tick = 0
  
  const runTick = async () => {
    const payload = generatePayload(config, tick)
    
    switch (config.outputMode) {
      case 'console':
        await outputToConsole(payload, config)
        break
      case 'file':
        await outputToFile(payload, config)
        break
      case 'api':
        await outputToApi(payload, config)
        break
    }
    
    tick++
  }
  
  // Initial tick
  await runTick()
  
  // Run on interval
  setInterval(runTick, config.intervalSeconds * 1000)
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nSimulator stopped.')
  process.exit(0)
})

// Run
runSimulator().catch(console.error)
