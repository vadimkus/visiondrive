'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, MapPin, Thermometer, AlertTriangle, ChevronRight, X, Building2, Users, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Kitchen {
  id: string
  name: string
  address: string
  emirate: string
  contactName: string | null
  contactPhone: string | null
  sensorCount: number
  ownerCount: number
  activeAlerts: number
  avgTemperature: number | null
  status: 'normal' | 'warning' | 'critical'
  createdAt: string
}

interface AddKitchenForm {
  name: string
  address: string
  emirate: string
  tradeLicense: string
  dmPermitNumber: string
  contactName: string
  contactPhone: string
  contactEmail: string
}

const initialFormState: AddKitchenForm = {
  name: '',
  address: '',
  emirate: 'Dubai',
  tradeLicense: '',
  dmPermitNumber: '',
  contactName: '',
  contactPhone: '',
  contactEmail: ''
}

export default function KitchensPage() {
  const [kitchens, setKitchens] = useState<Kitchen[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<AddKitchenForm>(initialFormState)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadKitchens()
  }, [])

  const loadKitchens = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/portal/smart-kitchen/kitchens')
      const data = await response.json()
      
      if (data.success) {
        setKitchens(data.kitchens)
      } else {
        setError(data.error || 'Failed to load kitchens')
      }
    } catch (err) {
      console.error('Failed to load kitchens:', err)
      setError('Failed to connect to server')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/portal/smart-kitchen/kitchens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        setShowAddModal(false)
        setFormData(initialFormState)
        loadKitchens()
      } else {
        setError(data.error || 'Failed to create kitchen')
      }
    } catch (err) {
      console.error('Failed to create kitchen:', err)
      setError('Failed to connect to server')
    } finally {
      setIsSubmitting(false)
    }
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

  const emirates = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain']

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Kitchens</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your kitchen locations</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1d1d1f] text-white text-sm font-medium rounded-full hover:bg-[#2d2d2f] transition-all"
        >
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

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Kitchens List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 mt-4">Loading kitchens...</p>
        </div>
      ) : filteredKitchens.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No kitchens found</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-full hover:bg-orange-600 transition-all"
          >
            <Plus className="h-4 w-4" />
            Add Your First Kitchen
          </button>
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
                      <p className="text-lg font-semibold text-gray-900">
                        {kitchen.avgTemperature !== null ? `${kitchen.avgTemperature.toFixed(1)}°C` : '—'}
                      </p>
                      <p className="text-xs text-gray-500">Avg Temp</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{kitchen.sensorCount}</p>
                      <p className="text-xs text-gray-500">Equipment</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{kitchen.ownerCount}</p>
                      <p className="text-xs text-gray-500">Owners</p>
                    </div>
                    {kitchen.contactName && (
                      <div>
                        <p className="text-sm text-gray-500">{kitchen.contactName}</p>
                        <p className="text-xs text-gray-400">{kitchen.contactPhone}</p>
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-orange-500 transition-colors flex-shrink-0" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Add Kitchen Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Add New Kitchen</h2>
                <p className="text-sm text-gray-500 mt-1">Enter the kitchen details below</p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setFormData(initialFormState)
                  setError(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Error in modal */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Kitchen Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kitchen Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Main Kitchen"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emirate
                    </label>
                    <select
                      value={formData.emirate}
                      onChange={(e) => setFormData({ ...formData, emirate: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    >
                      {emirates.map(em => (
                        <option key={em} value={em}>{em}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g., Building A, Street Name, Area"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trade License
                    </label>
                    <input
                      type="text"
                      value={formData.tradeLicense}
                      onChange={(e) => setFormData({ ...formData, tradeLicense: e.target.value })}
                      placeholder="License number"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      DM Permit Number
                    </label>
                    <input
                      type="text"
                      value={formData.dmPermitNumber}
                      onChange={(e) => setFormData({ ...formData, dmPermitNumber: e.target.value })}
                      placeholder="Dubai Municipality permit"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Contact Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      placeholder="Manager name"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      placeholder="+971-50-XXX-XXXX"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="manager@example.com"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setFormData(initialFormState)
                    setError(null)
                  }}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create Kitchen
                    </>
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
