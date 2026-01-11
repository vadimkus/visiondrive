/**
 * VisionDrive Smart Kitchen - AWS Client Library
 * 
 * Provides type-safe access to AWS API Gateway for Smart Kitchen IoT monitoring.
 * Connects to deployed AWS infrastructure in UAE region (me-central-1).
 */

// Types for Smart Kitchen data
export interface Kitchen {
  id: string
  name: string
  address: string
  manager: string
  phone: string
  sensorCount: number
  createdAt: string
}

export interface Sensor {
  id: string
  kitchenId: string
  kitchenName: string
  location: string
  probeModel: string
  installDate: string
  status: 'online' | 'offline' | 'warning'
  alertThresholds: {
    min: number
    max: number
  }
  transmissionInterval: number
}

export interface SensorReading {
  deviceId: string
  kitchenId: string
  temperature: number
  rawMA: number
  batteryVoltage: number
  signalStrength: number
  timestamp: string
}

export interface Alert {
  id: string
  deviceId: string
  kitchenId: string
  kitchenName: string
  type: 'HIGH_TEMP' | 'LOW_TEMP' | 'BATTERY_LOW' | 'OFFLINE'
  temperature?: number
  threshold?: number
  createdAt: string
  acknowledged: boolean
  acknowledgedAt?: string
  acknowledgedBy?: string
}

export interface DailyStats {
  deviceId: string
  kitchenId: string
  avgTemp: number
  maxTemp: number
  minTemp: number
  readingCount: number
}

// AWS API Configuration - 🇦🇪 UAE Region
const API_URL = process.env.SMART_KITCHEN_API_URL || 'https://w7gfk5cka2.execute-api.me-central-1.amazonaws.com/prod'

/**
 * Temperature conversion: 4-20mA to Celsius
 */
export function convertToTemperature(
  mA: number, 
  probeType: 'fridge' | 'freezer' | 'general' = 'fridge'
): number {
  const profiles = {
    fridge: { minMA: 4, maxMA: 20, minTemp: 0, maxTemp: 10 },
    freezer: { minMA: 4, maxMA: 20, minTemp: -30, maxTemp: 0 },
    general: { minMA: 4, maxMA: 20, minTemp: -40, maxTemp: 85 },
  }
  
  const profile = profiles[probeType]
  const clampedMA = Math.max(profile.minMA, Math.min(profile.maxMA, mA))
  const temp = profile.minTemp + ((clampedMA - profile.minMA) / (profile.maxMA - profile.minMA)) * (profile.maxTemp - profile.minTemp)
  
  return Math.round(temp * 100) / 100
}

/**
 * Smart Kitchen API Client
 * 
 * Connects to AWS API Gateway in UAE region for all Smart Kitchen operations.
 */
export class SmartKitchenClient {
  private apiEndpoint: string
  private useMockData: boolean

  constructor(apiEndpoint?: string) {
    this.apiEndpoint = apiEndpoint || API_URL
    // Use mock data if API URL is not configured or we're in development
    this.useMockData = !this.apiEndpoint || process.env.SMART_KITCHEN_USE_MOCK === 'true'
  }

  private async fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
    if (this.useMockData) {
      throw new Error('API not configured - using mock data')
    }

    const url = `${this.apiEndpoint}${path}`
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // ==========================================
  // KITCHENS
  // ==========================================

  async listKitchens(): Promise<Kitchen[]> {
    try {
      const data = await this.fetchAPI<{ kitchens: any[] }>('/kitchens')
      return data.kitchens.map(k => ({
        id: k.kitchenId || k.id,
        name: k.name,
        address: k.address,
        manager: k.manager,
        phone: k.phone,
        sensorCount: k.sensorCount || 0,
        createdAt: k.createdAt,
      }))
    } catch (error) {
      console.log('Using mock kitchens data')
      return [
        { id: 'kitchen-001', name: 'Main Kitchen', address: 'Dubai Marina', manager: 'Ahmed Hassan', phone: '+971-50-123-4567', sensorCount: 5, createdAt: '2026-01-01' },
        { id: 'kitchen-002', name: 'Cloud Kitchen A', address: 'Business Bay', manager: 'Sara Ali', phone: '+971-50-234-5678', sensorCount: 3, createdAt: '2026-01-05' },
      ]
    }
  }

  async getKitchen(kitchenId: string): Promise<Kitchen | null> {
    try {
      const data = await this.fetchAPI<any>(`/kitchens/${kitchenId}`)
      return {
        id: data.kitchenId || data.id,
        name: data.name,
        address: data.address,
        manager: data.manager,
        phone: data.phone,
        sensorCount: data.sensorCount || 0,
        createdAt: data.createdAt,
      }
    } catch (error) {
      console.log('Using mock kitchen data')
      const kitchens = await this.listKitchens()
      return kitchens.find(k => k.id === kitchenId) || null
    }
  }

  async createKitchen(data: Partial<Kitchen>): Promise<{ kitchenId: string }> {
    return this.fetchAPI<{ kitchenId: string }>('/kitchens', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // ==========================================
  // SENSORS
  // ==========================================

  async listSensors(kitchenId?: string): Promise<Sensor[]> {
    try {
      const path = kitchenId ? `/kitchens/${kitchenId}/sensors` : '/sensors'
      const data = await this.fetchAPI<{ sensors: any[] }>(path)
      return data.sensors.map(s => ({
        id: s.sensorId || s.id,
        kitchenId: s.kitchenId,
        kitchenName: s.kitchenName || 'Unknown',
        location: s.location,
        probeModel: s.probeModel || 'PT100',
        installDate: s.installDate,
        status: s.status || 'online',
        alertThresholds: s.alertThresholds || { min: 0, max: 8 },
        transmissionInterval: s.transmissionInterval || 300,
      }))
    } catch (error) {
      console.log('Using mock sensors data')
      const allSensors: Sensor[] = [
        { id: 'sensor-001', kitchenId: 'kitchen-001', kitchenName: 'Main Kitchen', location: 'Walk-in Fridge', probeModel: 'PT100', installDate: '2026-01-01', status: 'online', alertThresholds: { min: 0, max: 8 }, transmissionInterval: 300 },
        { id: 'sensor-002', kitchenId: 'kitchen-001', kitchenName: 'Main Kitchen', location: 'Freezer', probeModel: 'PT100', installDate: '2026-01-01', status: 'online', alertThresholds: { min: -25, max: -15 }, transmissionInterval: 300 },
      ]
      return kitchenId ? allSensors.filter(s => s.kitchenId === kitchenId) : allSensors
    }
  }

  async getSensor(sensorId: string): Promise<Sensor | null> {
    try {
      const data = await this.fetchAPI<any>(`/sensors/${sensorId}`)
      return {
        id: data.sensorId || data.id,
        kitchenId: data.kitchenId,
        kitchenName: data.kitchenName || 'Unknown',
        location: data.location,
        probeModel: data.probeModel || 'PT100',
        installDate: data.installDate,
        status: data.status || 'online',
        alertThresholds: data.alertThresholds || { min: 0, max: 8 },
        transmissionInterval: data.transmissionInterval || 300,
      }
    } catch (error) {
      console.log('Using mock sensor data')
      const sensors = await this.listSensors()
      return sensors.find(s => s.id === sensorId) || null
    }
  }

  async registerSensor(data: {
    kitchenId: string
    location: string
    probeModel?: string
    alertThresholds?: { min: number; max: number }
  }): Promise<{ sensorId: string }> {
    return this.fetchAPI<{ sensorId: string }>('/sensors', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // ==========================================
  // READINGS
  // ==========================================

  async getCurrentReading(sensorId: string): Promise<SensorReading | null> {
    try {
      const data = await this.fetchAPI<any>(`/sensors/${sensorId}/current`)
      return {
        deviceId: data.sensorId || sensorId,
        kitchenId: data.kitchenId || 'unknown',
        temperature: data.temperature,
        rawMA: data.rawMA || 0,
        batteryVoltage: data.batteryVoltage || 3.3,
        signalStrength: data.signalStrength || -70,
        timestamp: data.timestamp || new Date().toISOString(),
      }
    } catch (error) {
      console.log('Using mock reading data')
      return {
        deviceId: sensorId,
        kitchenId: 'kitchen-001',
        temperature: 4.2 + (Math.random() - 0.5),
        rawMA: 8.5,
        batteryVoltage: 3.52,
        signalStrength: -75,
        timestamp: new Date().toISOString()
      }
    }
  }

  async getReadings(
    sensorId: string, 
    hours: number = 24
  ): Promise<SensorReading[]> {
    try {
      const data = await this.fetchAPI<{ readings: any[] }>(
        `/sensors/${sensorId}/readings?hours=${hours}`
      )
      return data.readings.map(r => ({
        deviceId: sensorId,
        kitchenId: r.kitchenId || 'unknown',
        temperature: r.temperature,
        rawMA: r.rawMA || 0,
        batteryVoltage: r.batteryVoltage || 3.3,
        signalStrength: r.signalStrength || -70,
        timestamp: r.time || r.timestamp,
      }))
    } catch (error) {
      console.log('Using mock readings data')
      const readings: SensorReading[] = []
      const now = Date.now()
      
      for (let i = hours; i >= 0; i--) {
        readings.push({
          deviceId: sensorId,
          kitchenId: 'kitchen-001',
          temperature: 4 + Math.sin(i / 3) + (Math.random() - 0.5),
          rawMA: 8 + Math.sin(i / 3),
          batteryVoltage: 3.52,
          signalStrength: -75 - Math.floor(Math.random() * 10),
          timestamp: new Date(now - i * 3600000).toISOString()
        })
      }
      
      return readings
    }
  }

  async getDailyStats(): Promise<DailyStats[]> {
    try {
      const data = await this.fetchAPI<{ stats: any[] }>('/analytics/daily')
      return data.stats.map(s => ({
        deviceId: s.deviceId,
        kitchenId: s.kitchenId,
        avgTemp: s.avgTemp,
        maxTemp: s.maxTemp,
        minTemp: s.minTemp,
        readingCount: s.readingCount,
      }))
    } catch (error) {
      console.log('Using mock stats data')
      return [
        { deviceId: 'sensor-001', kitchenId: 'kitchen-001', avgTemp: 4.2, maxTemp: 5.8, minTemp: 3.1, readingCount: 288 },
        { deviceId: 'sensor-002', kitchenId: 'kitchen-001', avgTemp: -18.5, maxTemp: -17.2, minTemp: -19.8, readingCount: 288 },
      ]
    }
  }

  // ==========================================
  // ALERTS
  // ==========================================

  async listAlerts(options?: { 
    kitchenId?: string
    active?: boolean 
  }): Promise<Alert[]> {
    try {
      let path = '/alerts'
      const params = new URLSearchParams()
      if (options?.kitchenId) params.append('kitchenId', options.kitchenId)
      if (options?.active !== undefined) params.append('active', String(options.active))
      if (params.toString()) path += `?${params.toString()}`

      const data = await this.fetchAPI<{ alerts: any[] }>(path)
      return data.alerts.map(a => ({
        id: a.alertId || a.id || `${a.kitchenId}:${a.timestamp}`,
        deviceId: a.deviceId,
        kitchenId: a.kitchenId,
        kitchenName: a.kitchenName || 'Unknown',
        type: a.type,
        temperature: a.temperature,
        threshold: a.threshold,
        createdAt: a.createdAt || a.timestamp,
        acknowledged: a.acknowledged || false,
        acknowledgedAt: a.acknowledgedAt,
        acknowledgedBy: a.acknowledgedBy,
      }))
    } catch (error) {
      console.log('Using mock alerts data')
      const alerts: Alert[] = [
        {
          id: 'alert-001',
          deviceId: 'sensor-005',
          kitchenId: 'kitchen-002',
          kitchenName: 'Cloud Kitchen A',
          type: 'HIGH_TEMP',
          temperature: 9.2,
          threshold: 8,
          createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
          acknowledged: false
        }
      ]
      
      let filtered = alerts
      if (options?.kitchenId) {
        filtered = filtered.filter(a => a.kitchenId === options.kitchenId)
      }
      if (options?.active !== undefined) {
        filtered = filtered.filter(a => !a.acknowledged === options.active)
      }
      
      return filtered
    }
  }

  async acknowledgeAlert(
    alertId: string,
    acknowledgedBy?: string
  ): Promise<void> {
    await this.fetchAPI(`/alerts/${alertId}/acknowledge`, {
      method: 'PUT',
      body: JSON.stringify({ acknowledgedBy }),
    })
  }

  // ==========================================
  // STATS
  // ==========================================

  async getDashboardStats(): Promise<{
    totalSensors: number
    onlineSensors: number
    activeAlerts: number
    avgTemperature: number
  }> {
    const sensors = await this.listSensors()
    const alerts = await this.listAlerts({ active: true })
    const onlineSensors = sensors.filter(s => s.status === 'online').length
    
    return {
      totalSensors: sensors.length,
      onlineSensors,
      activeAlerts: alerts.length,
      avgTemperature: 4.5 // TODO: Calculate from actual readings
    }
  }
}

// Default client instance
export const smartKitchenClient = new SmartKitchenClient()
