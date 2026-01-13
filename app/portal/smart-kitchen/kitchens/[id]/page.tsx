'use client'

import { useState, useEffect } from 'react'
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
  ShieldCheck
} from 'lucide-react'
import TemperatureChart from '../../components/TemperatureChart'

interface Equipment {
  id: string
  name: string
  type: string
  serialNumber: string | null
  brand: string | null
  model: string | null
  sensorDevEui: string | null
  minTemp: number
  maxTemp: number
  isFreezer: boolean
  location: string | null
  status: string
  lastReading: number | null
  lastReadingAt: string | null
  batteryLevel: number | null
  signalStrength: number | null
  installDate: string | null
  createdAt: string
}

interface Owner {
  id: string
  name: string
  email: string
  phone: string | null
  isPrimary: boolean
  canManage: boolean
  canViewReports: boolean
  notifyEmail: boolean
  notifyWhatsApp: boolean
  notifyOnAlert: boolean
  createdAt: string
}

interface KitchenDetails {
  id: string
  name: string
  address: string
  emirate: string
  tradeLicense: string | null
  dmPermitNumber: string | null
  contactName: string | null
  contactPhone: string | null
  contactEmail: string | null
  sensorCount: number
  ownerCount: number
  activeAlerts: number
  avgTemperature: number | null
  minTemperature: number | null
  maxTemperature: number | null
  status: 'normal' | 'warning' | 'critical'
  equipment: Equipment[]
  owners: Owner[]
  createdAt: string
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
  
  const [kitchen, setKitchen] = useState<KitchenDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [error, setError] = useState<string | null>(null)
  
  // Equipment modal state
  const [showEquipmentModal, setShowEquipmentModal] = useState(false)
  const [isSubmittingEquipment, setIsSubmittingEquipment] = useState(false)
  const [equipmentForm, setEquipmentForm] = useState({
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

  // Owner modal state
  const [showOwnerModal, setShowOwnerModal] = useState(false)
  const [isSubmittingOwner, setIsSubmittingOwner] = useState(false)
  const [ownerForm, setOwnerForm] = useState({
    name: '',
    email: '',
    phone: '',
    emiratesId: '',
    isPrimary: false,
    canManage: false,
    canViewReports: true,
    notifyEmail: true,
    notifyWhatsApp: false,
    notifyOnAlert: true,
    notifyDailyReport: false
  })

  useEffect(() => {
    loadKitchenData()
  }, [kitchenId])

  const loadKitchenData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/portal/smart-kitchen/kitchens/${kitchenId}`)
      const data = await response.json()
      
      if (data.success) {
        setKitchen(data.kitchen)
      } else {
        setError(data.error || 'Failed to load kitchen')
      }
    } catch (err) {
      console.error('Failed to load kitchen:', err)
      setError('Failed to connect to server')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingEquipment(true)
    setError(null)

    try {
      const response = await fetch(`/api/portal/smart-kitchen/kitchens/${kitchenId}/equipment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(equipmentForm)
      })

      const data = await response.json()

      if (data.success) {
        setShowEquipmentModal(false)
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
        loadKitchenData()
      } else {
        setError(data.error || 'Failed to add equipment')
      }
    } catch (err) {
      console.error('Failed to add equipment:', err)
      setError('Failed to connect to server')
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
      } else {
        setError(data.error || 'Failed to delete equipment')
      }
    } catch (err) {
      console.error('Failed to delete equipment:', err)
      setError('Failed to connect to server')
    }
  }

  const handleAddOwner = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingOwner(true)
    setError(null)

    try {
      const response = await fetch(`/api/portal/smart-kitchen/kitchens/${kitchenId}/owners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ownerForm)
      })

      const data = await response.json()

      if (data.success) {
        setShowOwnerModal(false)
        setOwnerForm({
          name: '',
          email: '',
          phone: '',
          emiratesId: '',
          isPrimary: false,
          canManage: false,
          canViewReports: true,
          notifyEmail: true,
          notifyWhatsApp: false,
          notifyOnAlert: true,
          notifyDailyReport: false
        })
        loadKitchenData()
      } else {
        setError(data.error || 'Failed to add owner')
      }
    } catch (err) {
      console.error('Failed to add owner:', err)
      setError('Failed to connect to server')
    } finally {
      setIsSubmittingOwner(false)
    }
  }

  const handleDeleteOwner = async (ownerId: string) => {
    if (!confirm('Are you sure you want to remove this owner?')) return

    try {
      const response = await fetch(`/api/portal/smart-kitchen/kitchens/${kitchenId}/owners/${ownerId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        loadKitchenData()
      } else {
        setError(data.error || 'Failed to remove owner')
      }
    } catch (err) {
      console.error('Failed to remove owner:', err)
      setError('Failed to connect to server')
    }
  }

  // Update temp thresholds when equipment type changes
  const handleEquipmentTypeChange = (type: string) => {
    const isFreezer = type === 'FREEZER' || type === 'BLAST_CHILLER'
    setEquipmentForm({
      ...equipmentForm,
      type,
      minTemp: isFreezer ? -25 : 0,
      maxTemp: isFreezer ? -15 : 5
    })
  }

  if (isLoading || !kitchen) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
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
          {getStatusBadge(kitchen.status)}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

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
            { id: 'equipment', label: 'Equipment', icon: Package, count: kitchen.sensorCount },
            { id: 'owners', label: 'Owners', icon: Users, count: kitchen.ownerCount }
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
                  <p className="text-2xl font-bold text-gray-900">{kitchen.sensorCount}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Alerts</p>
                  <p className={`text-2xl font-bold ${kitchen.activeAlerts > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {kitchen.activeAlerts}
                  </p>
                </div>
                {kitchen.activeAlerts > 0 ? (
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
                      {kitchen.avgTemperature !== null ? `${kitchen.avgTemperature.toFixed(1)}°C` : '—'}
                    </span>
                    <span className="text-xs text-cyan-600">avg</span>
                  </div>
                  {kitchen.minTemperature !== null && kitchen.maxTemperature !== null && (
                    <div className="flex items-center gap-2 text-xs text-cyan-600 mt-1">
                      <TrendingDown className="h-3 w-3" /> {kitchen.minTemperature.toFixed(1)}°C
                      <span>-</span>
                      <TrendingUp className="h-3 w-3" /> {kitchen.maxTemperature.toFixed(1)}°C
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
              onClick={() => setShowEquipmentModal(true)}
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
                onClick={() => setShowEquipmentModal(true)}
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
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
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
                    {equip.lastReading !== null && (
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="text-gray-500">Current Temp</span>
                        <span className={`text-lg font-bold ${
                          equip.lastReading > equip.maxTemp || equip.lastReading < equip.minTemp
                            ? 'text-red-600'
                            : 'text-emerald-600'
                        }`}>
                          {equip.lastReading.toFixed(1)}°C
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
          <div className="flex justify-end">
            <button
              onClick={() => setShowOwnerModal(true)}
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
                onClick={() => setShowOwnerModal(true)}
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
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit2 className="h-4 w-4 text-gray-400" />
                      </button>
                      <button 
                        onClick={() => handleDeleteOwner(owner.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
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

      {/* Add Equipment Modal */}
      {showEquipmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Add Equipment</h2>
                <p className="text-sm text-gray-500 mt-1">Register new equipment with sensor</p>
              </div>
              <button
                onClick={() => setShowEquipmentModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAddEquipment} className="p-6 space-y-4">
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
                    onChange={(e) => handleEquipmentTypeChange(e.target.value)}
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
                  onClick={() => setShowEquipmentModal(false)}
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
                    <><Loader2 className="h-4 w-4 animate-spin" /> Adding...</>
                  ) : (
                    <><Plus className="h-4 w-4" /> Add Equipment</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Owner Modal */}
      {showOwnerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Add Kitchen Owner</h2>
                <p className="text-sm text-gray-500 mt-1">Owner will receive alerts and can access portal</p>
              </div>
              <button
                onClick={() => setShowOwnerModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAddOwner} className="p-6 space-y-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emirates ID</label>
                  <input
                    type="text"
                    value={ownerForm.emiratesId}
                    onChange={(e) => setOwnerForm({ ...ownerForm, emiratesId: e.target.value })}
                    placeholder="784-XXXX-XXXXXXX-X"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
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
                  onClick={() => setShowOwnerModal(false)}
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
                    <><Loader2 className="h-4 w-4 animate-spin" /> Adding...</>
                  ) : (
                    <><Plus className="h-4 w-4" /> Add Owner</>
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
