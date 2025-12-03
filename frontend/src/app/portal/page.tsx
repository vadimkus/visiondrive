'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Section from '@/components/common/Section'
import { 
  BarChart3, 
  MapPin, 
  Users, 
  Clock, 
  TrendingUp, 
  Settings,
  LogOut,
  ParkingCircle
} from 'lucide-react'

export default function PortalPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken')
    const email = localStorage.getItem('userEmail')
    
    if (!token) {
      router.push('/login')
      return
    }
    
    setUserEmail(email || '')
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userEmail')
    router.push('/login')
  }

  if (loading) {
    return (
      <Section className="pt-32 pb-12">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </Section>
    )
  }

  const stats = [
    { icon: ParkingCircle, label: 'Total Spaces', value: '500+', color: 'text-blue-600' },
    { icon: MapPin, label: 'Locations', value: '20+', color: 'text-green-600' },
    { icon: Users, label: 'Active Users', value: '10K+', color: 'text-purple-600' },
    { icon: Clock, label: 'Avg. Occupancy', value: '87%', color: 'text-orange-600' },
  ]

  return (
    <>
      <Section className="pt-24 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dashboard Portal
              </h1>
              <p className="text-gray-600">Welcome back, {userEmail}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/portal/settings')}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Analytics Chart */}
            <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Parking Analytics</h2>
              <div className="bg-gray-50 rounded-lg p-8 h-64 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Analytics chart will be displayed here</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Location {item} updated</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <TrendingUp className="h-6 w-6 text-primary-600 mb-2" />
                <p className="font-medium text-gray-900">View Reports</p>
                <p className="text-sm text-gray-600">Access detailed analytics</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <MapPin className="h-6 w-6 text-primary-600 mb-2" />
                <p className="font-medium text-gray-900">Manage Locations</p>
                <p className="text-sm text-gray-600">Add or edit parking locations</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <Users className="h-6 w-6 text-primary-600 mb-2" />
                <p className="font-medium text-gray-900">User Management</p>
                <p className="text-sm text-gray-600">Manage user accounts</p>
              </button>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}

