'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft,
  Thermometer, 
  AlertTriangle, 
  CheckCircle, 
  MapPin,
  Activity,
  Settings,
  RefreshCw,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import SensorGrid from '../../components/SensorGrid'
import TemperatureChart from '../../components/TemperatureChart'

interface KitchenDetails {
  id: string
  name: string
  address: string
  manager: string
  phone: string
  sensorCount: number
  activeAlerts: number
  avgTemperature: number
  minTemperature: number
  maxTemperature: number
  status: 'normal' | 'warning' | 'critical'
  createdAt: string
}

export default function KitchenDetailPage() {
  const router = useRouter()
  const params = useParams()
  const kitchenId = params.id as string
  
  const [kitchen, setKitchen] = useState<KitchenDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadKitchenData()
  }, [kitchenId])

  const loadKitchenData = async () => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/portal/smart-kitchen/kitchens/${kitchenId}`)
      // const data = await response.json()
      
      // Mock data
      setKitchen({
        id: kitchenId,
        name: 'Main Kitchen',
        address: 'Dubai Marina, Building A, Floor 1',
        manager: 'Ahmed Hassan',
        phone: '+971-50-123-4567',
        sensorCount: 5,
        activeAlerts: 0,
        avgTemperature: 4.2,
        minTemperature: 3.1,
        maxTemperature: 5.8,
        status: 'normal',
        createdAt: '2026-01-01T00:00:00Z'
      })
    } catch (error) {
      console.error('Failed to load kitchen data:', error)
    } finally {
      setIsLoading(false)
    }
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

  return (
    <div className="p-6 space-y-6">
      {/* Back Button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/portal/smart-kitchen')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{kitchen.name}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <MapPin className="h-4 w-4" />
              {kitchen.address}
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

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Manager</p>
              <p className="font-medium text-gray-900">{kitchen.manager}</p>
              <p className="text-xs text-gray-500">{kitchen.phone}</p>
            </div>
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-medium">
                {kitchen.manager.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Sensors</p>
              <p className="text-2xl font-bold text-gray-900">{kitchen.sensorCount}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-500" />
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
                <span className="text-2xl font-bold text-cyan-700">{kitchen.avgTemperature.toFixed(1)}°C</span>
                <span className="text-xs text-cyan-600">avg</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-cyan-600 mt-1">
                <TrendingDown className="h-3 w-3" /> {kitchen.minTemperature}°C
                <span>-</span>
                <TrendingUp className="h-3 w-3" /> {kitchen.maxTemperature}°C
              </div>
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

      {/* Sensors in this Kitchen */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sensors in {kitchen.name}</h2>
        <SensorGrid />
      </div>
    </div>
  )
}
