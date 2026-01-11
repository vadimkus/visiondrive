'use client'

import { useRouter } from 'next/navigation'
import { 
  Thermometer, 
  AlertTriangle, 
  CheckCircle, 
  MapPin,
  ChevronRight,
  Activity
} from 'lucide-react'

interface Kitchen {
  id: string
  name: string
  location: string
  sensorCount: number
  activeAlerts: number
  avgTemperature: number
  status: 'normal' | 'warning' | 'critical'
}

export default function KitchenCard({ kitchen }: { kitchen: Kitchen }) {
  const router = useRouter()

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'normal':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-700',
          icon: CheckCircle,
          label: 'Normal'
        }
      case 'warning':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-700',
          icon: AlertTriangle,
          label: 'Warning'
        }
      case 'critical':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: AlertTriangle,
          label: 'Critical'
        }
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          icon: Activity,
          label: 'Unknown'
        }
    }
  }

  const statusConfig = getStatusConfig(kitchen.status)
  const StatusIcon = statusConfig.icon

  const getTempColor = (temp: number) => {
    if (temp < 0) return 'text-blue-600'
    if (temp <= 4) return 'text-emerald-600'
    if (temp <= 8) return 'text-amber-600'
    return 'text-red-600'
  }

  return (
    <div 
      onClick={() => router.push(`/portal/smart-kitchen/kitchens/${kitchen.id}`)}
      className={`
        bg-white rounded-xl border border-gray-200 p-5 
        hover:shadow-md hover:border-gray-300 
        transition-all cursor-pointer group
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {kitchen.name}
          </h3>
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <MapPin className="h-3.5 w-3.5" />
            {kitchen.location}
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
          <StatusIcon className="h-3.5 w-3.5" />
          {statusConfig.label}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Temperature */}
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <Thermometer className={`h-5 w-5 mx-auto mb-1 ${getTempColor(kitchen.avgTemperature)}`} />
          <p className={`text-lg font-bold ${getTempColor(kitchen.avgTemperature)}`}>
            {kitchen.avgTemperature.toFixed(1)}°C
          </p>
          <p className="text-xs text-gray-500">Avg Temp</p>
        </div>

        {/* Sensors */}
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <Activity className="h-5 w-5 mx-auto mb-1 text-blue-500" />
          <p className="text-lg font-bold text-gray-900">{kitchen.sensorCount}</p>
          <p className="text-xs text-gray-500">Sensors</p>
        </div>

        {/* Alerts */}
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          {kitchen.activeAlerts > 0 ? (
            <>
              <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-amber-500" />
              <p className="text-lg font-bold text-amber-600">{kitchen.activeAlerts}</p>
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
              <p className="text-lg font-bold text-emerald-600">0</p>
            </>
          )}
          <p className="text-xs text-gray-500">Alerts</p>
        </div>
      </div>

      {/* View Details Link */}
      <div className="flex items-center justify-end mt-4 text-sm text-blue-600 font-medium group-hover:text-blue-700">
        View Details
        <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  )
}
