/**
 * VisionDrive Parking - API Client
 * Connects to AWS API Gateway in UAE region
 */

const API_URL = process.env.NEXT_PUBLIC_PARKING_API_URL || 
  'https://o2s68toqw0.execute-api.me-central-1.amazonaws.com/prod';

// Types
export interface Zone {
  zoneId: string;
  name: string;
  address?: string;
  city?: string;
  totalBays: number;
  occupiedBays: number;
  vacantBays: number;
  occupancyRate: number;
  location?: { lat: number; lng: number };
  pricePerHour: number;
  operatingHours?: { open: string; close: string };
  kind?: string;
  tenantId?: string;
}

export interface Bay {
  zoneId: string;
  bayId?: string;
  bayNumber: string;
  sensorId?: string;
  status: 'occupied' | 'vacant' | 'unknown';
  lastChange?: string;
  occupiedSince?: string;
  currentDuration?: number;
  batteryLevel?: number;
  signalStrength?: number;
  bayType?: string;
  location?: { lat: number; lng: number };
}

export interface Sensor {
  sensorId: string;
  model?: string;
  zoneId?: string;
  bayNumber?: string;
  status: string;
  batteryLevel?: number;
  signalStrength?: number;
  lastSeen?: string;
  firmwareVersion?: string;
  installDate?: string;
  devEui?: string;
  type?: string;
}

export interface ParkingEvent {
  zoneId: string;
  bayNumber: string;
  eventType: 'ARRIVE' | 'LEAVE' | 'STATUS';
  timestamp: string;
  duration?: number;
  revenue?: number;
  detectionMode?: string;
}

export interface Alert {
  alertId: string;
  tenantId: string;
  sensorId?: string;
  zoneId?: string;
  type: string;
  severity: string;
  status: string;
  title: string;
  message?: string;
  openedAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export interface OccupancyAnalytics {
  period: string;
  totalBays: number;
  occupiedBays: number;
  vacantBays: number;
  occupancyRate: number;
  zones: Array<{
    zoneId: string;
    name: string;
    occupancyRate: number;
  }>;
}

// API functions
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Zones
export async function listZones(tenantId?: string): Promise<{ zones: Zone[]; count: number }> {
  const params = tenantId ? `?tenantId=${tenantId}` : '';
  return fetchAPI(`/zones${params}`);
}

export async function getZone(zoneId: string): Promise<Zone> {
  return fetchAPI(`/zones/${zoneId}`);
}

export async function createZone(data: Partial<Zone>): Promise<{ zoneId: string }> {
  return fetchAPI('/zones', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Bays
export async function listBays(zoneId: string): Promise<{ bays: Bay[]; summary: { total: number; occupied: number; vacant: number; unknown: number } }> {
  return fetchAPI(`/zones/${zoneId}/bays`);
}

export async function getBay(zoneId: string, bayNumber: string): Promise<Bay> {
  return fetchAPI(`/zones/${zoneId}/bays/${bayNumber}`);
}

// Sensors
export async function listSensors(zoneId?: string): Promise<{ sensors: Sensor[]; count: number }> {
  const params = zoneId ? `?zoneId=${zoneId}` : '';
  return fetchAPI(`/sensors${params}`);
}

export async function registerSensor(data: {
  sensorId: string;
  zoneId: string;
  bayNumber: string | number;
  model?: string;
}): Promise<{ sensorId: string }> {
  return fetchAPI('/sensors', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Events
export async function queryEvents(options: {
  zoneId?: string;
  from?: string;
  to?: string;
  eventType?: string;
  limit?: number;
}): Promise<{ events: ParkingEvent[]; count: number }> {
  const params = new URLSearchParams();
  if (options.zoneId) params.set('zoneId', options.zoneId);
  if (options.from) params.set('from', options.from);
  if (options.to) params.set('to', options.to);
  if (options.eventType) params.set('eventType', options.eventType);
  if (options.limit) params.set('limit', options.limit.toString());
  
  const queryString = params.toString();
  return fetchAPI(`/events${queryString ? `?${queryString}` : ''}`);
}

export async function getZoneEvents(zoneId: string, options?: {
  from?: string;
  to?: string;
  limit?: number;
}): Promise<{ events: ParkingEvent[]; count: number }> {
  const params = new URLSearchParams();
  if (options?.from) params.set('from', options.from);
  if (options?.to) params.set('to', options.to);
  if (options?.limit) params.set('limit', options.limit.toString());
  
  const queryString = params.toString();
  return fetchAPI(`/zones/${zoneId}/events${queryString ? `?${queryString}` : ''}`);
}

// Analytics
export async function getOccupancyAnalytics(zoneId?: string, period?: string): Promise<OccupancyAnalytics> {
  const params = new URLSearchParams();
  if (zoneId) params.set('zoneId', zoneId);
  if (period) params.set('period', period);
  
  const queryString = params.toString();
  return fetchAPI(`/analytics/occupancy${queryString ? `?${queryString}` : ''}`);
}

// Dashboard stats
export async function getDashboardStats(): Promise<{
  totalZones: number;
  totalBays: number;
  totalSensors: number;
  occupiedBays: number;
  vacantBays: number;
  occupancyRate: number;
  recentEvents: ParkingEvent[];
  activeAlerts: number;
}> {
  // Aggregate data from multiple endpoints
  const [zonesData, sensorsData, eventsData] = await Promise.all([
    listZones(),
    listSensors(),
    queryEvents({ limit: 10 }),
  ]);

  const zones = zonesData.zones;
  const totals = zones.reduce(
    (acc, zone) => ({
      totalBays: acc.totalBays + (zone.totalBays || 0),
      occupiedBays: acc.occupiedBays + (zone.occupiedBays || 0),
    }),
    { totalBays: 0, occupiedBays: 0 }
  );

  return {
    totalZones: zones.length,
    totalBays: totals.totalBays,
    totalSensors: sensorsData.count,
    occupiedBays: totals.occupiedBays,
    vacantBays: totals.totalBays - totals.occupiedBays,
    occupancyRate: totals.totalBays > 0 
      ? Math.round((totals.occupiedBays / totals.totalBays) * 100) 
      : 0,
    recentEvents: eventsData.events,
    activeAlerts: 0, // TODO: Add alerts endpoint
  };
}
