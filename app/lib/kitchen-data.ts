/**
 * Shared Kitchen Data Store
 * 
 * This module provides a centralized data store for kitchen data
 * that is shared between the Admin Portal and Kitchen Owner Portal.
 * 
 * In production, this would be backed by a database.
 * For demo purposes, we use in-memory storage with localStorage persistence.
 */

export interface KitchenEquipment {
  id: string
  name: string
  type: 'FRIDGE' | 'FREEZER' | 'DISPLAY_FRIDGE' | 'COLD_ROOM' | 'BLAST_CHILLER' | 'OTHER'
  serialNumber: string | null
  brand: string | null
  model: string | null
  sensorDevEui: string | null
  sensorImei: string | null
  minTemp: number
  maxTemp: number
  isFreezer: boolean
  location: string | null
  status: 'ACTIVE' | 'MAINTENANCE' | 'FAULT' | 'OFFLINE'
  currentTemp: number | null
  lastReadingAt: string | null
  batteryLevel: number | null
  signalStrength: number | null
  installDate: string | null
  createdAt: string
  updatedAt: string
}

export interface KitchenOwner {
  id: string
  name: string
  email: string
  phone: string | null
  whatsApp: string | null
  emiratesId: string | null
  password: string // In production, this would be hashed
  isPrimary: boolean
  canManage: boolean
  canViewReports: boolean
  notifyEmail: boolean
  notifyWhatsApp: boolean
  notifyOnAlert: boolean
  notifyDailyReport: boolean
  lastLogin: string | null
  createdAt: string
  updatedAt: string
}

export interface KitchenAlert {
  id: string
  equipmentId: string
  equipmentName: string
  type: 'temperature' | 'battery' | 'offline' | 'maintenance'
  severity: 'info' | 'warning' | 'critical'
  message: string
  acknowledged: boolean
  acknowledgedBy: string | null
  acknowledgedAt: string | null
  createdAt: string
}

export interface Kitchen {
  id: string
  name: string
  address: string
  emirate: string
  tradeLicense: string | null
  dmPermitNumber: string | null
  contactName: string | null
  contactPhone: string | null
  contactEmail: string | null
  subscription: {
    plan: 'starter' | 'standard' | 'professional' | 'enterprise'
    status: 'active' | 'trial' | 'past_due' | 'cancelled'
    monthlyFee: number
    startDate: string
    nextBillingDate: string
  }
  equipment: KitchenEquipment[]
  owners: KitchenOwner[]
  alerts: KitchenAlert[]
  createdAt: string
  updatedAt: string
}

// Default Abdul's Kitchen data
const DEFAULT_KITCHEN: Kitchen = {
  id: 'kitchen-abdul-001',
  name: "Abdul's Kitchen",
  address: 'Marina Walk',
  emirate: 'Dubai Marina',
  tradeLicense: 'TL-2025-123456',
  dmPermitNumber: 'DM-FK-2025-7890',
  contactName: 'Abdul Rahman',
  contactPhone: '+971-50-123-4567',
  contactEmail: 'abdul@kitchen.ae',
  subscription: {
    plan: 'professional',
    status: 'active',
    monthlyFee: 1396, // 4 sensors × 349 AED
    startDate: '2026-01-15',
    nextBillingDate: '2026-02-15'
  },
  equipment: [
    {
      id: 'sensor-a1',
      name: 'Walk-in Fridge',
      type: 'COLD_ROOM',
      serialNumber: 'WF-2025-001',
      brand: 'Carrier',
      model: 'ColdMaster Pro',
      sensorDevEui: 'A84041F5318254E1',
      sensorImei: '867322040012345',
      minTemp: 0,
      maxTemp: 5,
      isFreezer: false,
      location: 'Back Storage',
      status: 'ACTIVE',
      currentTemp: 3.2,
      lastReadingAt: new Date().toISOString(),
      batteryLevel: 85,
      signalStrength: -75,
      installDate: '2026-01-15',
      createdAt: '2026-01-15T10:00:00Z',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'sensor-a2',
      name: 'Main Freezer',
      type: 'FREEZER',
      serialNumber: 'MF-2025-002',
      brand: 'Liebherr',
      model: 'ProFreeze 500',
      sensorDevEui: 'A84041F5318254E2',
      sensorImei: '867322040012346',
      minTemp: -25,
      maxTemp: -18,
      isFreezer: true,
      location: 'Back Storage',
      status: 'ACTIVE',
      currentTemp: -19.5,
      lastReadingAt: new Date().toISOString(),
      batteryLevel: 92,
      signalStrength: -68,
      installDate: '2026-01-15',
      createdAt: '2026-01-15T10:00:00Z',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'sensor-a3',
      name: 'Prep Fridge',
      type: 'FRIDGE',
      serialNumber: 'PF-2025-003',
      brand: 'True',
      model: 'T-49',
      sensorDevEui: 'A84041F5318254E3',
      sensorImei: '867322040012347',
      minTemp: 0,
      maxTemp: 5,
      isFreezer: false,
      location: 'Prep Area',
      status: 'ACTIVE',
      currentTemp: 4.8,
      lastReadingAt: new Date().toISOString(),
      batteryLevel: 78,
      signalStrength: -72,
      installDate: '2026-01-15',
      createdAt: '2026-01-15T10:00:00Z',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'sensor-a4',
      name: 'Display Cooler',
      type: 'DISPLAY_FRIDGE',
      serialNumber: 'DC-2025-004',
      brand: 'Turbo Air',
      model: 'TGM-48R',
      sensorDevEui: 'A84041F5318254E4',
      sensorImei: '867322040012348',
      minTemp: 0,
      maxTemp: 5,
      isFreezer: false,
      location: 'Front Counter',
      status: 'MAINTENANCE',
      currentTemp: 6.2,
      lastReadingAt: new Date().toISOString(),
      batteryLevel: 65,
      signalStrength: -80,
      installDate: '2026-01-15',
      createdAt: '2026-01-15T10:00:00Z',
      updatedAt: new Date().toISOString()
    }
  ],
  owners: [
    {
      id: 'owner-abdul-001',
      name: 'Abdul Rahman',
      email: 'abdul@kitchen.ae',
      phone: '+971-50-123-4567',
      whatsApp: '+971-50-123-4567',
      emiratesId: '784-1990-1234567-1',
      password: 'demo123', // In production, this would be hashed
      isPrimary: true,
      canManage: true,
      canViewReports: true,
      notifyEmail: true,
      notifyWhatsApp: true,
      notifyOnAlert: true,
      notifyDailyReport: true,
      lastLogin: new Date().toISOString(),
      createdAt: '2026-01-15T10:00:00Z',
      updatedAt: new Date().toISOString()
    }
  ],
  alerts: [
    {
      id: 'alert-001',
      equipmentId: 'sensor-a4',
      equipmentName: 'Display Cooler',
      type: 'temperature',
      severity: 'warning',
      message: 'Temperature above 5°C threshold (currently 6.2°C)',
      acknowledged: false,
      acknowledgedBy: null,
      acknowledgedAt: null,
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString() // 15 min ago
    }
  ],
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: new Date().toISOString()
}

// Storage key for localStorage
const STORAGE_KEY = 'visiondrive_kitchens'

// In-memory cache
let kitchensCache: Kitchen[] | null = null

/**
 * Initialize the data store
 */
export function initKitchenStore(): Kitchen[] {
  if (typeof window === 'undefined') {
    // Server-side: return default data
    return [DEFAULT_KITCHEN]
  }
  
  if (kitchensCache) {
    return kitchensCache
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      kitchensCache = JSON.parse(stored)
      return kitchensCache!
    }
  } catch (e) {
    console.error('Failed to load kitchen data from storage:', e)
  }
  
  // Initialize with default data
  kitchensCache = [DEFAULT_KITCHEN]
  saveKitchenStore()
  return kitchensCache
}

/**
 * Save the data store to localStorage
 */
function saveKitchenStore(): void {
  if (typeof window === 'undefined' || !kitchensCache) return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(kitchensCache))
  } catch (e) {
    console.error('Failed to save kitchen data:', e)
  }
}

/**
 * Get all kitchens
 */
export function getKitchens(): Kitchen[] {
  return initKitchenStore()
}

/**
 * Get a single kitchen by ID
 */
export function getKitchen(id: string): Kitchen | null {
  const kitchens = initKitchenStore()
  return kitchens.find(k => k.id === id) || null
}

/**
 * Update a kitchen
 */
export function updateKitchen(id: string, updates: Partial<Kitchen>): Kitchen | null {
  const kitchens = initKitchenStore()
  const index = kitchens.findIndex(k => k.id === id)
  
  if (index === -1) return null
  
  kitchens[index] = {
    ...kitchens[index],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  kitchensCache = kitchens
  saveKitchenStore()
  
  // Dispatch custom event for cross-portal sync
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kitchenDataUpdated', { 
      detail: { kitchenId: id, kitchen: kitchens[index] }
    }))
  }
  
  return kitchens[index]
}

/**
 * Add or update an owner
 */
export function upsertOwner(kitchenId: string, owner: Partial<KitchenOwner> & { id?: string }): KitchenOwner | null {
  const kitchen = getKitchen(kitchenId)
  if (!kitchen) return null
  
  const now = new Date().toISOString()
  
  if (owner.id) {
    // Update existing owner
    const ownerIndex = kitchen.owners.findIndex(o => o.id === owner.id)
    if (ownerIndex === -1) return null
    
    kitchen.owners[ownerIndex] = {
      ...kitchen.owners[ownerIndex],
      ...owner,
      updatedAt: now
    }
  } else {
    // Add new owner
    const newOwner: KitchenOwner = {
      id: `owner-${Date.now()}`,
      name: owner.name || '',
      email: owner.email || '',
      phone: owner.phone || null,
      whatsApp: owner.whatsApp || null,
      emiratesId: owner.emiratesId || null,
      password: owner.password || 'changeme123',
      isPrimary: owner.isPrimary || false,
      canManage: owner.canManage || false,
      canViewReports: owner.canViewReports || true,
      notifyEmail: owner.notifyEmail || true,
      notifyWhatsApp: owner.notifyWhatsApp || false,
      notifyOnAlert: owner.notifyOnAlert || true,
      notifyDailyReport: owner.notifyDailyReport || false,
      lastLogin: null,
      createdAt: now,
      updatedAt: now
    }
    kitchen.owners.push(newOwner)
    owner.id = newOwner.id
  }
  
  updateKitchen(kitchenId, { owners: kitchen.owners })
  return kitchen.owners.find(o => o.id === owner.id) || null
}

/**
 * Delete an owner
 */
export function deleteOwner(kitchenId: string, ownerId: string): boolean {
  const kitchen = getKitchen(kitchenId)
  if (!kitchen) return false
  
  const initialLength = kitchen.owners.length
  kitchen.owners = kitchen.owners.filter(o => o.id !== ownerId)
  
  if (kitchen.owners.length === initialLength) return false
  
  updateKitchen(kitchenId, { owners: kitchen.owners })
  return true
}

/**
 * Add or update equipment
 */
export function upsertEquipment(kitchenId: string, equipment: Partial<KitchenEquipment> & { id?: string }): KitchenEquipment | null {
  const kitchen = getKitchen(kitchenId)
  if (!kitchen) return null
  
  const now = new Date().toISOString()
  
  if (equipment.id) {
    // Update existing equipment
    const equipIndex = kitchen.equipment.findIndex(e => e.id === equipment.id)
    if (equipIndex === -1) return null
    
    kitchen.equipment[equipIndex] = {
      ...kitchen.equipment[equipIndex],
      ...equipment,
      updatedAt: now
    }
  } else {
    // Add new equipment
    const newEquip: KitchenEquipment = {
      id: `sensor-${Date.now()}`,
      name: equipment.name || '',
      type: equipment.type || 'FRIDGE',
      serialNumber: equipment.serialNumber || null,
      brand: equipment.brand || null,
      model: equipment.model || null,
      sensorDevEui: equipment.sensorDevEui || null,
      sensorImei: equipment.sensorImei || null,
      minTemp: equipment.minTemp ?? 0,
      maxTemp: equipment.maxTemp ?? 5,
      isFreezer: equipment.isFreezer || false,
      location: equipment.location || null,
      status: equipment.status || 'ACTIVE',
      currentTemp: null,
      lastReadingAt: null,
      batteryLevel: null,
      signalStrength: null,
      installDate: now.split('T')[0],
      createdAt: now,
      updatedAt: now
    }
    kitchen.equipment.push(newEquip)
    equipment.id = newEquip.id
  }
  
  updateKitchen(kitchenId, { equipment: kitchen.equipment })
  return kitchen.equipment.find(e => e.id === equipment.id) || null
}

/**
 * Delete equipment
 */
export function deleteEquipment(kitchenId: string, equipmentId: string): boolean {
  const kitchen = getKitchen(kitchenId)
  if (!kitchen) return false
  
  const initialLength = kitchen.equipment.length
  kitchen.equipment = kitchen.equipment.filter(e => e.id !== equipmentId)
  
  if (kitchen.equipment.length === initialLength) return false
  
  updateKitchen(kitchenId, { equipment: kitchen.equipment })
  return true
}

/**
 * Acknowledge an alert
 */
export function acknowledgeAlert(kitchenId: string, alertId: string, acknowledgedBy: string): boolean {
  const kitchen = getKitchen(kitchenId)
  if (!kitchen) return false
  
  const alert = kitchen.alerts.find(a => a.id === alertId)
  if (!alert) return false
  
  alert.acknowledged = true
  alert.acknowledgedBy = acknowledgedBy
  alert.acknowledgedAt = new Date().toISOString()
  
  updateKitchen(kitchenId, { alerts: kitchen.alerts })
  return true
}

/**
 * Validate owner login credentials
 */
export function validateOwnerLogin(email: string, password: string): { kitchen: Kitchen, owner: KitchenOwner } | null {
  const kitchens = initKitchenStore()
  
  for (const kitchen of kitchens) {
    const owner = kitchen.owners.find(o => o.email === email && o.password === password)
    if (owner) {
      // Update last login
      owner.lastLogin = new Date().toISOString()
      updateKitchen(kitchen.id, { owners: kitchen.owners })
      return { kitchen, owner }
    }
  }
  
  return null
}

/**
 * Get owner by email
 */
export function getOwnerByEmail(email: string): { kitchen: Kitchen, owner: KitchenOwner } | null {
  const kitchens = initKitchenStore()
  
  for (const kitchen of kitchens) {
    const owner = kitchen.owners.find(o => o.email === email)
    if (owner) {
      return { kitchen, owner }
    }
  }
  
  return null
}

/**
 * Reset data to default (for testing)
 */
export function resetKitchenStore(): void {
  kitchensCache = [DEFAULT_KITCHEN]
  saveKitchenStore()
}
