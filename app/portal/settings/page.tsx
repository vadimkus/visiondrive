'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Section from '../../components/common/Section'
import { 
  Settings,
  User,
  Lock,
  Bell,
  Shield,
  ArrowLeft
} from 'lucide-react'

interface User {
  id: string
  email: string
  name: string | null
  role: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        })

        if (!response.ok) {
          router.push('/login')
          return
        }

        const data = await response.json()
        if (data.success && data.user) {
          setUser(data.user)
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  if (loading) {
    return (
      <Section className="pt-32 pb-12">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </Section>
    )
  }

  return (
    <>
      <Section className="pt-6 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Settings
            </h1>
            <p className="text-gray-600">Manage your account settings and preferences</p>
          </div>

          {/* Settings Sections */}
          <div className="space-y-6">
            {/* Profile Settings */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <User className="h-5 w-5 text-gray-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={user?.name || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    value={user?.role || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <Shield className="h-5 w-5 text-gray-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Security</h2>
              </div>
              <div className="space-y-4">
                <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Change Password</p>
                      <p className="text-sm text-gray-600">Update your account password</p>
                    </div>
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                </button>
                <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">Add an extra layer of security</p>
                    </div>
                    <Shield className="h-5 w-5 text-gray-400" />
                  </div>
                </button>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <Bell className="h-5 w-5 text-gray-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
              </div>
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-600">Receive updates via email</p>
                  </div>
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" defaultChecked />
                </label>
                <label className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Push Notifications</p>
                    <p className="text-sm text-gray-600">Receive real-time alerts</p>
                  </div>
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" defaultChecked />
                </label>
              </div>
            </div>

            {/* System Settings */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <Settings className="h-5 w-5 text-gray-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">System</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Settings panel coming soon. This feature is under development.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}




