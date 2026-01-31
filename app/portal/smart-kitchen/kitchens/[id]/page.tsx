'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft,
  Thermometer, 
  AlertTriangle, 
  CheckCircle, 
  MapPin,
  Settings,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Plus,
  X,
  Loader2,
  Package,
  Users,
  Edit2,
  Trash2,
  Mail,
  Phone,
  MessageCircle,
  Bell,
  FileText,
  Crown,
  ShieldCheck,
  Eye,
  EyeOff,
  Key,
  Save
} from 'lucide-react'
import TemperatureChart from '../../components/TemperatureChart'

// Kitchen types matching the API response
interface KitchenEquipment {
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

interface KitchenOwner {
  id: string
  name: string
  email: string
  phone: string | null
  whatsApp: string | null
  emiratesId: string | null
  password: string
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

interface KitchenAlert {
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

interface Kitchen {
  id: string
  name: string
  address: string
  emirate: string
  tradeLicense: string | null
  dmPermitNumber: string | null
  contactName: string | null
  contactPhone: string | null
  contactEmail: string | null
  subscription?: {
    plan: string
    status: string
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

type TabType = 'overview' | 'equipment' | 'owners'

const equipmentTypes = [
  { value: 'FRIDGE', label: 'Fridge' },
  { value: 'FREEZER', label: 'Freezer' },
  { value: 'DISPLAY_FRIDGE', label: 'Display Fridge' },
  { value: 'COLD_ROOM', label: 'Cold Room' },
  { value: 'BLAST_CHILLER', label: 'Blast Chiller' },
  { value: 'OTHER', label: 'Other' }
]

export default function KitchenDetailPage() {
  const router = useRouter()
  const params = useParams()
  const kitchenId = params.id as string
  
  const [kitchen, setKitchen] = useState<Kitchen | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // Equipment modal state
  const [showEquipmentModal, setShowEquipmentModal] = useState(false)
  const [editingEquipment, setEditingEquipment] = useState<KitchenEquipment | null>(null)
  const [isSubmittingEquipment, setIsSubmittingEquipment] = useState(false)
  const [equipmentForm, setEquipmentForm] = useState({
    name: '',
    type: 'FRIDGE' as KitchenEquipment['type'],
    serialNumber: '',
    brand: '',
    model: '',
    sensorDevEui: '',
    sensorImei: '',
    location: '',
    minTemp: 0,
    maxTemp: 5
  })

  // Owner modal state
  const [showOwnerModal, setShowOwnerModal] = useState(false)
  const [editingOwner, setEditingOwner] = useState<KitchenOwner | null>(null)
  const [isSubmittingOwner, setIsSubmittingOwner] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [ownerForm, setOwnerForm] = useState({
    name: '',
    email: '',
    phone: '',
    whatsApp: '',
    emiratesId: '',
    password: '',
    isPrimary: false,
    canManage: false,
    canViewReports: true,
    notifyEmail: true,
    notifyWhatsApp: false,
    notifyOnAlert: true,
    notifyDailyReport: false
  })

  // Fetch kitchen data from API
  const loadKitchenData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/portal/smart-kitchen/kitchens/${kitchenId}`)
      const data = await response.json()
      
      if (data.success && data.kitchen) {
        // Ensure arrays exist
        const kitchenData: Kitchen = {
          ...data.kitchen,
          equipment: data.kitchen.equipment || [],
          owners: data.kitchen.owners || [],
          alerts: data.kitchen.alerts || []
        }
        setKitchen(kitchenData)
      } else {
        setError(data.error || 'Kitchen not found')
      }
    } catch (err) {
      console.error('Failed to load kitchen:', err)
      setError('Failed to load kitchen data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [kitchenId])

  useEffect(() => {
    loadKitchenData()
  }, [loadKitchenData])

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const openEditOwner = (owner: KitchenOwner) => {
    setEditingOwner(owner)
    setOwnerForm({
      name: owner.name,
      email: owner.email,
      phone: owner.phone || '',
      whatsApp: owner.whatsApp || '',
      emiratesId: owner.emiratesId || '',
      password: owner.password,
      isPrimary: owner.isPrimary,
      canManage: owner.canManage,
      canViewReports: owner.canViewReports,
      notifyEmail: owner.notifyEmail,
      notifyWhatsApp: owner.notifyWhatsApp,
      notifyOnAlert: owner.notifyOnAlert,
      notifyDailyReport: owner.notifyDailyReport
    })
    setShowOwnerModal(true)
  }

  const openAddOwner = () => {
    setEditingOwner(null)
    setOwnerForm({
      name: '',
      email: '',
      phone: '',
      whatsApp: '',
      emiratesId: '',
      password: generatePassword(),
      isPrimary: false,
      canManage: false,
      canViewReports: true,
      notifyEmail: true,
      notifyWhatsApp: false,
      notifyOnAlert: true,
      notifyDailyReport: false
    })
    setShowOwnerModal(true)
  }

  const openEditEquipment = (equipment: KitchenEquipment) => {
    setEditingEquipment(equipment)
    setEquipmentForm({
      name: equipment.name,
      type: equipment.type,
      serialNumber: equipment.serialNumber || '',
      brand: equipment.brand || '',
      model: equipment.model || '',
      sensorDevEui: equipment.sensorDevEui || '',
      sensorImei: equipment.sensorImei || '',
      location: equipment.location || '',
      minTemp: equipment.minTemp,
      maxTemp: equipment.maxTemp
    })
    setShowEquipmentModal(true)
  }

  const openAddEquipment = () => {
    setEditingEquipment(null)
    setEquipmentForm({
      name: '',
      type: 'FRIDGE',
      serialNumber: '',
      brand: '',
      model: '',
      sensorDevEui: '',
      sensorImei: '',
      location: '',
      minTemp: 0,
      maxTemp: 5
    })
    setShowEquipmentModal(true)
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    let password = ''
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const handleSubmitOwner = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingOwner(true)
    setError(null)

    try {
      const ownerData = {
        id: editingOwner?.id,
        name: ownerForm.name,
        email: ownerForm.email,
        phone: ownerForm.phone || null,
        whatsApp: ownerForm.whatsApp || null,
        emiratesId: ownerForm.emiratesId || null,
        password: ownerForm.password,
        isPrimary: ownerForm.isPrimary,
        canManage: ownerForm.canManage,
        canViewReports: ownerForm.canViewReports,
        notifyEmail: ownerForm.notifyEmail,
        notifyWhatsApp: ownerForm.notifyWhatsApp,
        notifyOnAlert: ownerForm.notifyOnAlert,
        notifyDailyReport: ownerForm.notifyDailyReport
      }

      const url = editingOwner?.id 
        ? `/api/portal/smart-kitchen/kitchens/${kitchenId}/owners/${editingOwner.id}`
        : `/api/portal/smart-kitchen/kitchens/${kitchenId}/owners`
      
      const response = await fetch(url, {
        method: editingOwner?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ownerData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setShowOwnerModal(false)
        setEditingOwner(null)
        loadKitchenData()
        setSuccessMessage(editingOwner ? 'Owner updated successfully!' : 'Owner added successfully!')
      } else {
        setError(data.error || 'Failed to save owner')
      }
    } catch (err) {
      console.error('Failed to save owner:', err)
      setError('Failed to save owner')
    } finally {
      setIsSubmittingOwner(false)
    }
  }

  const handleDeleteOwner = async (ownerId: string) => {
    if (!confirm('Are you sure you want to remove this owner? They will no longer be able to access the kitchen portal.')) return

    try {
      const response = await fetch(`/api/portal/smart-kitchen/kitchens/${kitchenId}/owners/${ownerId}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      
      if (data.success) {
        loadKitchenData()
        setSuccessMessage('Owner removed successfully!')
      } else {
        setError(data.error || 'Failed to remove owner')
      }
    } catch (err) {
      console.error('Failed to delete owner:', err)
      setError('Failed to remove owner')
    }
  }

  const handleSubmitEquipment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingEquipment(true)
    setError(null)

    try {
      const isFreezer = equipmentForm.type === 'FREEZER' || equipmentForm.type === 'BLAST_CHILLER'
      
      const equipmentData = {
        id: editingEquipment?.id,
        name: equipmentForm.name,
        type: equipmentForm.type,
        serialNumber: equipmentForm.serialNumber || null,
        brand: equipmentForm.brand || null,
        model: equipmentForm.model || null,
        sensorDevEui: equipmentForm.sensorDevEui || null,
        sensorImei: equipmentForm.sensorImei || null,
        location: equipmentForm.location || null,
        minTemp: equipmentForm.minTemp,
        maxTemp: equipmentForm.maxTemp,
        isFreezer
      }

      const url = editingEquipment?.id 
        ? `/api/portal/smart-kitchen/kitchens/${kitchenId}/equipment/${editingEquipment.id}`
        : `/api/portal/smart-kitchen/kitchens/${kitchenId}/equipment`
      
      const response = await fetch(url, {
        method: editingEquipment?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(equipmentData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setShowEquipmentModal(false)
        setEditingEquipment(null)
        loadKitchenData()
        setSuccessMessage(editingEquipment ? 'Equipment updated successfully!' : 'Equipment added successfully!')
      } else {
        setError(data.error || 'Failed to save equipment')
      }
    } catch (err) {
      console.error('Failed to save equipment:', err)
      setError('Failed to save equipment')
    } finally {
      setIsSubmittingEquipment(false)
    }
  }

  const handleDeleteEquipment = async (equipmentId: string) => {
    if (!confirm('Are you sure you want to delete this equipment?')) return

    try {
      const response = await fetch(`/api/portal/smart-kitchen/kitchens/${kitchenId}/equipment/${equipmentId}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      
      if (data.success) {
        loadKitchenData()
        setSuccessMessage('Equipment deleted successfully!')
      } else {
        setError(data.error || 'Failed to delete equipment')
      }
    } catch (err) {
      console.error('Failed to delete equipment:', err)
      setError('Failed to delete equipment')
    }
  }

  // Update temp thresholds when equipment type changes
  const handleEquipmentTypeChange = (type: KitchenEquipment['type']) => {
    const isFreezer = type === 'FREEZER' || type === 'BLAST_CHILLER'
    setEquipmentForm({
      ...equipmentForm,
      type,
      minTemp: isFreezer ? -25 : 0,
      maxTemp: isFreezer ? -18 : 5
    })
  }

  if (isLoading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
        <p className="text-gray-500">Loading kitchen data...</p>
      </div>
    )
  }

  if (error || !kitchen) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Kitchen not found'}
          </h2>
          <p className="text-gray-500 mb-4">
            The kitchen data could not be loaded. Please try again.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/portal/smart-kitchen')}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => loadKitchenData()}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'normal':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Normal</span>
      case 'warning':
        return <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> Warning</span>
      case 'critical':
        return <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> Critical</span>
      default:
        return null
    }
  }

  const getEquipmentStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-500'
      case 'MAINTENANCE': return 'bg-amber-500'
      case 'FAULT': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

  // Calculate status from alerts
  const kitchenStatus = kitchen.alerts.filter(a => !a.acknowledged).length > 0 
    ? kitchen.alerts.some(a => a.severity === 'critical' && !a.acknowledged) ? 'critical' : 'warning'
    : 'normal'

  // Calculate average temperature
  const activeEquipment = kitchen.equipment.filter(e => e.currentTemp !== null)
  const avgTemp = activeEquipment.length > 0 
    ? activeEquipment.reduce((sum, e) => sum + (e.currentTemp || 0), 0) / activeEquipment.length
    : null
  const minTemp = activeEquipment.length > 0 
    ? Math.min(...activeEquipment.map(e => e.currentTemp || 0))
    : null
  const maxTemp = activeEquipment.length > 0 
    ? Math.max(...activeEquipment.map(e => e.currentTemp || 0))
    : null

  return (
    <div className="p-6 space-y-6">
      {/* Back Button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/portal/smart-kitchen/kitchens')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{kitchen.name}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <MapPin className="h-4 w-4" />
              {kitchen.address}, {kitchen.emirate}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(kitchenStatus)}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {[
            { id: 'overview', label: 'Overview', icon: Thermometer },
            { id: 'equipment', label: 'Equipment', icon: Package, count: kitchen.equipment.length },
            { id: 'owners', label: 'Owners', icon: Users, count: kitchen.owners.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  activeTab === tab.id ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <p className="font-medium text-gray-900">{kitchen.contactName || 'Not set'}</p>
                  <p className="text-xs text-gray-500">{kitchen.contactPhone || '—'}</p>
                </div>
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium">
                    {kitchen.contactName?.split(' ').map(n => n[0]).join('') || '?'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Equipment</p>
                  <p className="text-2xl font-bold text-gray-900">{kitchen.equipment.length}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Alerts</p>
                  <p className={`text-2xl font-bold ${kitchen.alerts.filter(a => !a.acknowledged).length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {kitchen.alerts.filter(a => !a.acknowledged).length}
                  </p>
                </div>
                {kitchen.alerts.filter(a => !a.acknowledged).length > 0 ? (
                  <AlertTriangle className="h-8 w-8 text-amber-500" />
                ) : (
                  <CheckCircle className="h-8 w-8 text-emerald-500" />
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border border-cyan-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-cyan-700">Temperature Range</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-cyan-700">
                      {avgTemp !== null ? `${avgTemp.toFixed(1)}°C` : '—'}
                    </span>
                    <span className="text-xs text-cyan-600">avg</span>
                  </div>
                  {minTemp !== null && maxTemp !== null && (
                    <div className="flex items-center gap-2 text-xs text-cyan-600 mt-1">
                      <TrendingDown className="h-3 w-3" /> {minTemp.toFixed(1)}°C
                      <span>-</span>
                      <TrendingUp className="h-3 w-3" /> {maxTemp.toFixed(1)}°C
                    </div>
                  )}
                </div>
                <Thermometer className="h-8 w-8 text-cyan-500" />
              </div>
            </div>
          </div>

          {/* Temperature Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Temperature History (24h)</h2>
            <TemperatureChart />
          </div>
        </>
      )}

      {activeTab === 'equipment' && (
        <div className="space-y-4">
          {/* Add Equipment Button */}
          <div className="flex justify-end">
            <button
              onClick={openAddEquipment}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Equipment
            </button>
          </div>

          {/* Equipment List */}
          {kitchen.equipment.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No equipment added yet</p>
              <button
                onClick={openAddEquipment}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-full hover:bg-orange-600 transition-all"
              >
                <Plus className="h-4 w-4" />
                Add First Equipment
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {kitchen.equipment.map(equip => (
                <div key={equip.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${getEquipmentStatusColor(equip.status)}`} />
                      <div>
                        <h3 className="font-semibold text-gray-900">{equip.name}</h3>
                        <p className="text-xs text-gray-500">{equip.type} {equip.isFreezer && '(Freezer)'}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => openEditEquipment(equip)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="h-4 w-4 text-gray-400" />
                      </button>
                      <button 
                        onClick={() => handleDeleteEquipment(equip.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    {equip.serialNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Serial #</span>
                        <span className="text-gray-900 font-mono">{equip.serialNumber}</span>
                      </div>
                    )}
                    {equip.sensorDevEui && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Sensor DevEUI</span>
                        <span className="text-gray-900 font-mono text-xs">{equip.sensorDevEui}</span>
                      </div>
                    )}
                    {equip.location && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Location</span>
                        <span className="text-gray-900">{equip.location}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Safe Range</span>
                      <span className="text-gray-900">{equip.minTemp}°C to {equip.maxTemp}°C</span>
                    </div>
                    {equip.currentTemp !== null && (
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="text-gray-500">Current Temp</span>
                        <span className={`text-lg font-bold ${
                          equip.currentTemp > equip.maxTemp || equip.currentTemp < equip.minTemp
                            ? 'text-red-600'
                            : 'text-emerald-600'
                        }`}>
                          {equip.currentTemp.toFixed(1)}°C
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'owners' && (
        <div className="space-y-4">
          {/* Add Owner Button */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Owners can access the Kitchen Owner Portal using their email and password
            </p>
            <button
              onClick={openAddOwner}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Owner
            </button>
          </div>

          {/* Owners List */}
          {kitchen.owners.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No owners added yet</p>
              <button
                onClick={openAddOwner}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-full hover:bg-orange-600 transition-all"
              >
                <Plus className="h-4 w-4" />
                Add First Owner
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {kitchen.owners.map(owner => (
                <div key={owner.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {owner.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{owner.name}</h3>
                          {owner.isPrimary && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                              <Crown className="h-3 w-3" />
                              Primary
                            </span>
                          )}
                          {owner.canManage && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                              <ShieldCheck className="h-3 w-3" />
                              Manager
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5" />
                            {owner.email}
                          </span>
                          {owner.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3.5 w-3.5" />
                              {owner.phone}
                            </span>
                          )}
                          {owner.whatsApp && (
                            <span className="flex items-center gap-1 text-emerald-600">
                              <MessageCircle className="h-3.5 w-3.5" />
                              WhatsApp
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => openEditOwner(owner)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit Owner"
                      >
                        <Edit2 className="h-4 w-4 text-gray-400" />
                      </button>
                      <button 
                        onClick={() => handleDeleteOwner(owner.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove Owner"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  </div>

                  {/* Login Credentials */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-gray-400" />
                        <span className="text-xs font-medium text-gray-500">Portal Login</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Last login: {owner.lastLogin ? new Date(owner.lastLogin).toLocaleDateString() : 'Never'}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm">
                      <span className="text-gray-600">{owner.email}</span>
                      <span className="text-gray-400">•</span>
                      <span className="font-mono text-gray-600">{owner.password}</span>
                    </div>
                  </div>

                  {/* Notification Preferences */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Notifications:</span>
                    {owner.notifyEmail && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                        <Mail className="h-3 w-3" /> Email
                      </span>
                    )}
                    {owner.notifyWhatsApp && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-600 text-xs rounded-lg">
                        <MessageCircle className="h-3 w-3" /> WhatsApp
                      </span>
                    )}
                    {owner.notifyOnAlert && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-600 text-xs rounded-lg">
                        <Bell className="h-3 w-3" /> Alerts
                      </span>
                    )}
                    {owner.canViewReports && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-lg">
                        <FileText className="h-3 w-3" /> Reports
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Equipment Modal */}
      {showEquipmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingEquipment ? 'Edit Equipment' : 'Add Equipment'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {editingEquipment ? 'Update equipment details' : 'Register new equipment with sensor'}
                </p>
              </div>
              <button
                onClick={() => { setShowEquipmentModal(false); setEditingEquipment(null) }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmitEquipment} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Equipment Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={equipmentForm.name}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, name: e.target.value })}
                    placeholder="e.g., Walk-in Fridge 1"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={equipmentForm.type}
                    onChange={(e) => handleEquipmentTypeChange(e.target.value as KitchenEquipment['type'])}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  >
                    {equipmentTypes.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={equipmentForm.serialNumber}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, serialNumber: e.target.value })}
                    placeholder="Equipment serial number"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={equipmentForm.location}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, location: e.target.value })}
                    placeholder="e.g., Back storage"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <input
                    type="text"
                    value={equipmentForm.brand}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, brand: e.target.value })}
                    placeholder="Equipment brand"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input
                    type="text"
                    value={equipmentForm.model}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, model: e.target.value })}
                    placeholder="Equipment model"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl space-y-4">
                <h4 className="text-sm font-medium text-gray-700">Sensor Configuration (Dragino PS-NB-GE)</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sensor DevEUI</label>
                    <input
                      type="text"
                      value={equipmentForm.sensorDevEui}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, sensorDevEui: e.target.value })}
                      placeholder="16-char hex ID"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sensor IMEI</label>
                    <input
                      type="text"
                      value={equipmentForm.sensorImei}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, sensorImei: e.target.value })}
                      placeholder="NB-IoT IMEI"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-cyan-50 rounded-xl space-y-4">
                <h4 className="text-sm font-medium text-cyan-700">Temperature Thresholds (Dubai Municipality)</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Safe Temp (°C)</label>
                    <input
                      type="number"
                      value={equipmentForm.minTemp}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, minTemp: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Safe Temp (°C)</label>
                    <input
                      type="number"
                      value={equipmentForm.maxTemp}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, maxTemp: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setShowEquipmentModal(false); setEditingEquipment(null) }}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEquipment}
                  className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {isSubmittingEquipment ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="h-4 w-4" /> {editingEquipment ? 'Save Changes' : 'Add Equipment'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Owner Modal */}
      {showOwnerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingOwner ? 'Edit Owner' : 'Add Kitchen Owner'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {editingOwner ? 'Update owner details and portal access' : 'Owner will receive alerts and can access portal'}
                </p>
              </div>
              <button
                onClick={() => { setShowOwnerModal(false); setEditingOwner(null) }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmitOwner} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={ownerForm.name}
                    onChange={(e) => setOwnerForm({ ...ownerForm, name: e.target.value })}
                    placeholder="Owner name"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={ownerForm.email}
                    onChange={(e) => setOwnerForm({ ...ownerForm, email: e.target.value })}
                    placeholder="owner@example.com"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={ownerForm.phone}
                    onChange={(e) => setOwnerForm({ ...ownerForm, phone: e.target.value })}
                    placeholder="+971-50-XXX-XXXX"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                  <input
                    type="tel"
                    value={ownerForm.whatsApp}
                    onChange={(e) => setOwnerForm({ ...ownerForm, whatsApp: e.target.value })}
                    placeholder="+971-50-XXX-XXXX"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emirates ID</label>
                <input
                  type="text"
                  value={ownerForm.emiratesId}
                  onChange={(e) => setOwnerForm({ ...ownerForm, emiratesId: e.target.value })}
                  placeholder="784-XXXX-XXXXXXX-X"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              {/* Portal Login Credentials */}
              <div className="p-4 bg-blue-50 rounded-xl space-y-4">
                <h4 className="text-sm font-medium text-blue-700 flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Kitchen Owner Portal Login
                </h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={ownerForm.password}
                      onChange={(e) => setOwnerForm({ ...ownerForm, password: e.target.value })}
                      placeholder="Portal password"
                      className="w-full px-4 py-2.5 pr-20 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setOwnerForm({ ...ownerForm, password: generatePassword() })}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-xs text-blue-600 font-medium"
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Owner will use this password to login at visiondrive.ae/kitchen-owner
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl space-y-4">
                <h4 className="text-sm font-medium text-gray-700">Permissions</h4>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ownerForm.isPrimary}
                      onChange={(e) => setOwnerForm({ ...ownerForm, isPrimary: e.target.checked })}
                      className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Primary Owner</span>
                      <p className="text-xs text-gray-500">Main point of contact for this kitchen</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ownerForm.canManage}
                      onChange={(e) => setOwnerForm({ ...ownerForm, canManage: e.target.checked })}
                      className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Can Manage Equipment</span>
                      <p className="text-xs text-gray-500">Add, edit, or remove equipment</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ownerForm.canViewReports}
                      onChange={(e) => setOwnerForm({ ...ownerForm, canViewReports: e.target.checked })}
                      className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Can View Reports</span>
                      <p className="text-xs text-gray-500">Access temperature reports and analytics</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl space-y-4">
                <h4 className="text-sm font-medium text-amber-700">Notification Preferences</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ownerForm.notifyEmail}
                      onChange={(e) => setOwnerForm({ ...ownerForm, notifyEmail: e.target.checked })}
                      className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">Email notifications</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ownerForm.notifyWhatsApp}
                      onChange={(e) => setOwnerForm({ ...ownerForm, notifyWhatsApp: e.target.checked })}
                      className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">WhatsApp alerts</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ownerForm.notifyOnAlert}
                      onChange={(e) => setOwnerForm({ ...ownerForm, notifyOnAlert: e.target.checked })}
                      className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">Temperature alerts</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ownerForm.notifyDailyReport}
                      onChange={(e) => setOwnerForm({ ...ownerForm, notifyDailyReport: e.target.checked })}
                      className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">Daily summary</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setShowOwnerModal(false); setEditingOwner(null) }}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOwner}
                  className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {isSubmittingOwner ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="h-4 w-4" /> {editingOwner ? 'Save Changes' : 'Add Owner'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
