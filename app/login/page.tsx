'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Section from '../components/common/Section'
import Button from '../components/common/Button'
import { Mail, Lock, Eye, EyeOff, ChefHat } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.email || !formData.password) {
        setError('Please enter both email and password')
        setLoading(false)
        return
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          portal: 'kitchen',
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || 'Login failed. Please check your credentials.')
        setLoading(false)
        return
      }

      // Token is stored in HTTP-only cookie, no need for localStorage
      // Redirect based on user role - kitchen owners go to owner dashboard, admins go to admin dashboard
      if (data.isOwner) {
        router.push('/kitchen-owner')
      } else {
        router.push('/portal/smart-kitchen')
      }
      router.refresh()
    } catch (err) {
      console.error('Login error:', err)
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-50 px-4 sm:px-6 lg:px-8" style={{ paddingTop: '9.6rem', paddingBottom: '7.5rem' }}>
      <div className="max-w-7xl w-full mx-auto">
        {/* Image-based login panel (form is visually part of the image) */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Background image (centered + not cropped) - 20% bigger */}
          <div 
            className="h-[816px] sm:h-[840px] md:h-[768px] lg:h-[720px] w-full bg-gray-50 bg-no-repeat bg-center"
            style={{ backgroundImage: "url('/images/portal.png')", backgroundSize: 'cover' }}
          />

          {/* Subtle overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/35 to-transparent" />

          {/* Form overlay */}
          <div className="absolute inset-0 flex items-center">
            <div className="w-full px-6 sm:px-10">
              {/* Slightly smaller panel (~20%) */}
              <div className="max-w-sm">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                      Login
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-600 mb-5 sm:mb-6">
                      Vision Drive dashboard
                    </p>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Portal Indicator */}
              <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-orange-500 bg-orange-50 text-orange-700">
                <ChefHat className="h-5 w-5" />
                <span className="font-medium">Smart Kitchen Portal</span>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Username / Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="email"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="admin"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    required
                    className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-sm text-primary-600 hover:text-primary-700">
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                size="md"
                variant="outline"
                className="w-full bg-white/30 border-white/60 backdrop-blur hover:bg-white/40 text-gray-900"
                onClick={() => {}}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="/contact" className="text-primary-600 hover:text-primary-700 font-medium">
                  Contact us
                </a>
              </p>
            </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

