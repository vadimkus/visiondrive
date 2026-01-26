'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ChefHat } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
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
        setError(data.error || 'Invalid credentials')
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
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-4">
      {/* Background subtle gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-orange-50/50 via-white to-emerald-50/30 pointer-events-none" />
      
      {/* Login Card */}
      <div className="relative w-full max-w-[400px]">
        {/* Logo & Welcome */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[22px] bg-gradient-to-br from-orange-500 to-red-500 shadow-xl shadow-orange-500/25 mb-6">
            <ChefHat className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-[28px] font-semibold text-gray-900 tracking-tight">
            Smart Kitchen
          </h1>
          <p className="text-gray-500 mt-1">
            Sign in to your account
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                type="text"
                id="email"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                className="
                  w-full px-4 py-3.5
                  bg-gray-50 border border-gray-200
                  rounded-xl
                  text-gray-900 text-[16px]
                  placeholder:text-gray-400
                  focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10
                  transition-all duration-200
                  outline-none
                "
                placeholder="name@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* Password Field */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  className="
                    w-full px-4 py-3.5 pr-12
                    bg-gray-50 border border-gray-200
                    rounded-xl
                    text-gray-900 text-[16px]
                    placeholder:text-gray-400
                    focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10
                    transition-all duration-200
                    outline-none
                  "
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="
                    absolute right-3 top-1/2 -translate-y-1/2
                    p-1.5 rounded-lg
                    text-gray-400 hover:text-gray-600
                    hover:bg-gray-100
                    transition-colors
                  "
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="
                    w-5 h-5 rounded-md border-2 border-gray-300
                    peer-checked:bg-orange-500 peer-checked:border-orange-500
                    transition-all duration-200
                    flex items-center justify-center
                  ">
                    <svg 
                      className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" 
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path 
                        d="M2 6l3 3 5-6" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
                <span className="ml-2.5 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  Remember me
                </span>
              </label>
              <a 
                href="#" 
                className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full py-4 mt-2
                bg-gray-900 hover:bg-gray-800
                active:scale-[0.98]
                text-white font-semibold text-[15px]
                rounded-xl
                transition-all duration-200
                disabled:opacity-60 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
              "
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-sm text-gray-400">or</span>
            </div>
          </div>

          {/* Contact Link */}
          <p className="text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <a 
              href="/contact" 
              className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
            >
              Contact us
            </a>
          </p>
        </div>

        {/* Footer Branding */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img 
              src="/images/logo/logo.jpg" 
              alt="VisionDrive" 
              className="w-6 h-6 rounded-md"
            />
            <span className="text-sm font-medium text-gray-600">
              Vision<span className="text-orange-500">Drive</span>
            </span>
          </div>
          <p className="text-xs text-gray-400">
            🇦🇪 UAE • TDRA Certified • Dubai Municipality Compliant
          </p>
        </div>
      </div>
    </div>
  )
}
