'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, ChefHat, Thermometer, Shield, ArrowRight } from 'lucide-react'

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

      // Redirect based on user role
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
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col">
      {/* Mobile-optimized login */}
      <div className="flex-1 flex flex-col">
        
        {/* Header Area - Gradient background */}
        <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 px-6 pt-16 pb-12 md:pt-20 md:pb-16 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3" />
          
          <div className="relative z-10 max-w-md mx-auto text-center">
            {/* Logo */}
            <div className="w-20 h-20 mx-auto mb-5 bg-white rounded-3xl shadow-xl flex items-center justify-center">
              <img 
                src="/images/logo/logo.jpg" 
                alt="VisionDrive" 
                className="w-14 h-14 object-contain rounded-2xl"
              />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Smart Kitchen
            </h1>
            <p className="text-orange-100 text-base">
              Temperature Monitoring Portal
            </p>
          </div>
        </div>

        {/* Form Area - White card that overlaps the gradient */}
        <div className="flex-1 bg-[#f5f5f7] -mt-6 rounded-t-[2rem] relative z-20">
          <div className="max-w-md mx-auto px-6 pt-8 pb-10">
            
            {/* Features pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full shadow-sm">
                <Thermometer className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-medium text-gray-700">Live Monitoring</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full shadow-sm">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-medium text-gray-700">DM Compliant</span>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl">
                <p className="text-sm text-red-600 text-center">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Portal Badge */}
              <div className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-orange-50 border-2 border-orange-200 mb-6">
                <ChefHat className="h-5 w-5 text-orange-600" />
                <span className="font-semibold text-orange-700">Kitchen Owner Portal</span>
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email or Username
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="email"
                    required
                    autoComplete="username"
                    autoCapitalize="none"
                    className="
                      w-full pl-12 pr-4 py-4
                      bg-white border border-gray-200 
                      rounded-2xl
                      text-gray-900 text-base
                      placeholder:text-gray-400
                      focus:ring-2 focus:ring-orange-500 focus:border-transparent
                      transition-all duration-200
                    "
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    required
                    autoComplete="current-password"
                    className="
                      w-full pl-12 pr-14 py-4
                      bg-white border border-gray-200 
                      rounded-2xl
                      text-gray-900 text-base
                      placeholder:text-gray-400
                      focus:ring-2 focus:ring-orange-500 focus:border-transparent
                      transition-all duration-200
                    "
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded-lg border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer" 
                  />
                  <span className="ml-2.5 text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="
                  w-full py-4 mt-4
                  bg-gradient-to-r from-orange-500 to-orange-600
                  hover:from-orange-600 hover:to-orange-700
                  active:scale-[0.98]
                  text-white font-semibold text-base
                  rounded-2xl
                  shadow-lg shadow-orange-500/30
                  transition-all duration-200
                  disabled:opacity-70 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2
                "
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Contact Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Don't have an account?{' '}
                <a href="/contact" className="text-orange-600 hover:text-orange-700 font-semibold">
                  Contact us
                </a>
              </p>
            </div>

            {/* VisionDrive Branding */}
            <div className="mt-10 pt-6 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-400 mb-1">Powered by</p>
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-sm font-semibold text-gray-600">Vision</span>
                <span className="text-sm font-semibold text-orange-500">Drive</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                🇦🇪 Made in UAE • TDRA Certified
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
