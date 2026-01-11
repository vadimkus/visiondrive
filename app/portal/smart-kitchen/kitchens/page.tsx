'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, MapPin, Thermometer, AlertTriangle, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface Kitchen {
  id: string
  name: string
  address: string
  manager: string
  phone: string
  sensorCount: number
  activeAlerts: number
  avgTemperature: number
  status: 'normal' | 'warning' | 'critical'
  createdAt: string
}

export default function KitchensPage() {
  const [kitchens, setKitchens] = useState<Kitchen[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadKitchens()
  }, [])

  const loadKitchens = async () => {
    setIsLoading(true)
    // Mock data - replace with API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    setKitchens([
      { 
        id: 'kitchen-001', 
        name: 'Main Kitchen', 
        address: 'Marina Walk, Dubai Marina, Dubai', 
        manager: 'Ahmed Hassan',
        phone: '+971-50-123-4567',
        sensorCount: 5, 
        activeAlerts: 0, 
        avgTemperature: 4.2, 
        status: 'normal',
        createdAt: '2026-01-01'
      },
      { 
        id: 'kitchen-002', 
        name: 'Cloud Kitchen A', 
        address: 'Business Bay, Dubai', 
        manager: 'Sara Ali',
        phone: '+971-50-234-5678',
        sensorCount: 3, 
        activeAlerts: 1, 
        avgTemperature: 6.8, 
        status: 'warning',
        createdAt: '2026-01-05'
      },
      { 
        id: 'kitchen-003', 
        name: 'Restaurant Kitchen', 
        address: 'Cluster D, JLT, Dubai', 
        manager: 'Mohammed Khan',
        phone: '+971-50-345-6789',
        sensorCount: 4, 
        activeAlerts: 0, 
        avgTemperature: 3.5, 
        status: 'normal',
        createdAt: '2026-01-08'
      },
    ])
    setIsLoading(false)
  }

  const filteredKitchens = kitchens.filter(k => 
    k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    k.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const statusColors = {
    normal: 'bg-emerald-500',
    warning: 'bg-amber-500',
    critical: 'bg-red-500',
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Kitchens</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your kitchen locations</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#1d1d1f] text-white text-sm font-medium rounded-full hover:bg-[#2d2d2f] transition-all">
          <Plus className="h-4 w-4" />
          Add Kitchen
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search kitchens..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
        />
      </div>

      {/* Kitchens List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 mt-4">Loading kitchens...</p>
        </div>
      ) : filteredKitchens.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No kitchens found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredKitchens.map(kitchen => (
            <Link key={kitchen.id} href={`/portal/smart-kitchen/kitchens/${kitchen.id}`}>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  {/* Status Indicator */}
                  <div className={`w-3 h-3 rounded-full ${statusColors[kitchen.status]} flex-shrink-0`} />
                  
                  {/* Kitchen Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                        {kitchen.name}
                      </h3>
                      {kitchen.activeAlerts > 0 && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                          <AlertTriangle className="h-3 w-3" />
                          {kitchen.activeAlerts}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {kitchen.address}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="hidden md:flex items-center gap-8 text-center">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{kitchen.avgTemperature.toFixed(1)}°C</p>
                      <p className="text-xs text-gray-500">Avg Temp</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{kitchen.sensorCount}</p>
                      <p className="text-xs text-gray-500">Sensors</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{kitchen.manager}</p>
                      <p className="text-xs text-gray-400">{kitchen.phone}</p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-orange-500 transition-colors flex-shrink-0" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
