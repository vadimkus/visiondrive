'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

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
    <div className="min-h-screen bg-white md:bg-[#f5f5f7] flex flex-col">
      {/* Mobile-optimized layout */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:py-16">
        
        {/* Logo & Branding */}
        <div className="text-center mb-10 md:mb-12">
          {/* VisionDrive Logo */}
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/images/logo/logo.jpg" 
              alt="VisionDrive" 
              className="w-20 h-20 md:w-24 md:h-24 rounded-[20px] md:rounded-[24px] shadow-2xl shadow-gray-900/20"
            />
          </div>
          
          {/* Brand Name */}
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">
            Vision<span className="text-orange-500">Drive</span>
          </h1>
          <p className="text-base md:text-lg text-gray-500 mt-1">
            Smart Kitchen
          </p>
        </div>

        {/* Login Card - Full width on mobile, constrained on desktop */}
        <div className="w-full max-w-[400px]">
          {/* Card wrapper - no background on mobile, card on desktop */}
          <div className="md:bg-white md:rounded-3xl md:shadow-xl md:shadow-gray-200/60 md:p-8">
            
            {/* Welcome Text */}
            <div className="text-center mb-8">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                Welcome back
              </h2>
              <p className="text-gray-500 mt-1 text-sm md:text-base">
                Sign in to your account
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl">
                <p className="text-sm text-red-600 text-center font-medium">{error}</p>
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
                  inputMode="email"
                  className="
                    w-full px-4 py-4 md:py-3.5
                    bg-gray-50 md:bg-gray-100/80 border-0
                    rounded-2xl
                    text-gray-900 text-[17px] md:text-[16px]
                    placeholder:text-gray-400
                    focus:bg-white focus:ring-2 focus:ring-orange-500/50
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
                      w-full px-4 py-4 md:py-3.5 pr-14
                      bg-gray-50 md:bg-gray-100/80 border-0
                      rounded-2xl
                      text-gray-900 text-[17px] md:text-[16px]
                      placeholder:text-gray-400
                      focus:bg-white focus:ring-2 focus:ring-orange-500/50
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
                      absolute right-2 top-1/2 -translate-y-1/2
                      p-2.5 rounded-xl
                      text-gray-400 hover:text-gray-600
                      active:bg-gray-200
                      transition-colors
                    "
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center cursor-pointer group">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      checked={formData.rememberMe}
                      onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="
                      w-6 h-6 rounded-lg border-2 border-gray-300
                      peer-checked:bg-orange-500 peer-checked:border-orange-500
                      transition-all duration-200
                      flex items-center justify-center
                    ">
                      <svg 
                        className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" 
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path 
                          d="M2 6l3 3 5-6" 
                          stroke="currentColor" 
                          strokeWidth="2.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                  <span className="ml-3 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
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
                  w-full py-4 mt-4
                  bg-orange-500 hover:bg-orange-600
                  active:scale-[0.98]
                  text-white font-semibold text-[17px] md:text-[16px]
                  rounded-2xl
                  shadow-lg shadow-orange-500/30
                  transition-all duration-200
                  disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none
                  flex items-center justify-center gap-2
                "
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white md:bg-white text-sm text-gray-400">or</span>
              </div>
            </div>

            {/* Contact Link */}
            <p className="text-center text-sm md:text-base text-gray-500">
              Don't have an account?{' '}
              <a 
                href="/contact" 
                className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
              >
                Contact us
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Footer - Fixed at bottom on mobile */}
      <footer className="py-6 px-6 text-center border-t border-gray-100 md:border-0">
        <div className="flex flex-col items-center gap-3">
          {/* Compliance Badges */}
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span>🇦🇪</span>
              <span>UAE</span>
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>TDRA Certified</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>DM Compliant</span>
          </div>
          
          {/* Copyright */}
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} VisionDrive. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
