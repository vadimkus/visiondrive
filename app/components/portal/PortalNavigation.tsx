'use client'

import { usePathname, useRouter } from 'next/navigation'
import { 
  MapPin, 
  Activity, 
  Settings, 
  Users, 
  BarChart3,
  ShieldAlert,
  FileText,
  Network,
  LogOut,
  User,
  DollarSign,
  Gauge,
  Languages,
  ChevronDown,
  Thermometer,
  Wind,
  Droplets,
  Cloud,
  Leaf,
  Radio,
  Shield
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

interface User {
  id: string
  email: string
  name: string | null
  role: string
  tenantId?: string | null
}

interface TelemetryData {
  temperature: number
  humidity: number
  windSpeed: number
  windDirection: string
  pm25: number
  co2: number
}

export default function PortalNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)
  const [language, setLanguage] = useState<'EN' | 'AR'>('EN')
  const userMenuRef = useRef<HTMLDivElement>(null)
  const languageMenuRef = useRef<HTMLDivElement>(null)
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    temperature: 24,
    humidity: 65,
    windSpeed: 8,
    windDirection: 'NW',
    pm25: 18,
    co2: 415,
  })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' })
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.user) {
            setUser(data.user)
          }
        }
      } catch {
        // ignore
      }
    }
    fetchUser()
  }, [])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUserMenuOpen])

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setIsLanguageMenuOpen(false)
      }
    }
    if (isLanguageMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isLanguageMenuOpen])

  // Load language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('portal-language') as 'EN' | 'AR' | null
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Simulate real-time telemetry updates with realistic nighttime ranges
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        // Nighttime temperature in Dubai: 20-28°C
        temperature: Math.max(20, Math.min(28, prev.temperature + (Math.random() - 0.5) * 0.3)),
        // Higher humidity at night: 50-75%
        humidity: Math.max(50, Math.min(75, prev.humidity + (Math.random() - 0.5) * 1.5)),
        // Calmer winds at night: 5-15 km/h
        windSpeed: Math.max(5, Math.min(15, prev.windSpeed + (Math.random() - 0.5) * 1.5)),
        windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
        // PM2.5 can be slightly higher at night: 10-30
        pm25: Math.max(10, Math.min(30, prev.pm25 + (Math.random() - 0.5) * 2)),
        // CO2 stable: 400-450
        co2: Math.max(400, Math.min(450, prev.co2 + (Math.random() - 0.5) * 5)),
      }))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleLanguageChange = (lang: 'EN' | 'AR') => {
    setLanguage(lang)
    localStorage.setItem('portal-language', lang)
    setIsLanguageMenuOpen(false)
    // TODO: Implement actual language change logic here
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      router.push('/')
    } catch {
      router.push('/')
    }
  }

  const isAdmin = user?.role === 'MASTER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'CUSTOMER_ADMIN'

  // Helper function to get wind direction full name
  const getWindDirectionName = (direction: string) => {
    const directionNames: { [key: string]: string } = {
      'N': 'North',
      'NE': 'Northeast',
      'E': 'East',
      'SE': 'Southeast',
      'S': 'South',
      'SW': 'Southwest',
      'W': 'West',
      'NW': 'Northwest'
    }
    return directionNames[direction] || direction
  }

  // Calculate comfort level based on all metrics
  const getComfortLevel = () => {
    const { temperature, humidity, pm25, co2 } = telemetry
    let comfortScore = 100
    const issues: string[] = []

    // Temperature comfort: 18-28°C is ideal
    if (temperature < 15) {
      comfortScore -= 30
      issues.push('Too cold')
    } else if (temperature < 18) {
      comfortScore -= 15
      issues.push('Cool')
    } else if (temperature > 35) {
      comfortScore -= 30
      issues.push('Too hot')
    } else if (temperature > 30) {
      comfortScore -= 15
      issues.push('Hot')
    }

    // Humidity comfort: 30-60% is ideal
    if (humidity < 25) {
      comfortScore -= 15
      issues.push('Very dry air')
    } else if (humidity < 30) {
      comfortScore -= 10
      issues.push('Dry air')
    } else if (humidity > 70) {
      comfortScore -= 15
      issues.push('High humidity')
    } else if (humidity > 60) {
      comfortScore -= 10
      issues.push('Humid')
    }

    // PM2.5 air quality
    if (pm25 > 55) {
      comfortScore -= 40
      issues.push('Unhealthy air quality')
    } else if (pm25 > 35) {
      comfortScore -= 25
      issues.push('Poor air quality')
    } else if (pm25 > 12) {
      comfortScore -= 10
      issues.push('Moderate air quality')
    }

    // CO2 levels
    if (co2 > 2000) {
      comfortScore -= 30
      issues.push('Very high CO2')
    } else if (co2 > 1000) {
      comfortScore -= 15
      issues.push('Elevated CO2')
    }

    // Determine comfort category
    if (comfortScore >= 85) {
      return {
        level: 'Excellent',
        color: 'bg-green-50 border-green-200 text-green-700',
        icon: '😊',
        dotColor: 'bg-green-500',
        message: 'Perfect conditions for outdoor activities',
        issues: []
      }
    } else if (comfortScore >= 70) {
      return {
        level: 'Good',
        color: 'bg-blue-50 border-blue-200 text-blue-700',
        icon: '🙂',
        dotColor: 'bg-blue-500',
        message: 'Comfortable conditions',
        issues: issues.slice(0, 2)
      }
    } else if (comfortScore >= 50) {
      return {
        level: 'Fair',
        color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
        icon: '😐',
        dotColor: 'bg-yellow-500',
        message: 'Tolerable conditions, some discomfort',
        issues: issues.slice(0, 2)
      }
    } else {
      return {
        level: 'Poor',
        color: 'bg-red-50 border-red-200 text-red-700',
        icon: '😷',
        dotColor: 'bg-red-500',
        message: 'Uncomfortable/unsafe conditions',
        issues: issues.slice(0, 3)
      }
    }
  }

  const comfortStatus = getComfortLevel()

  // Color coding for air quality
  const getPM25Status = (value: number) => {
    if (value <= 12) return 'text-green-600'
    if (value <= 35) return 'text-yellow-600'
    if (value <= 55) return 'text-orange-600'
    return 'text-red-600'
  }

  const getCO2Status = (value: number) => {
    if (value <= 450) return 'text-green-600'
    if (value <= 700) return 'text-yellow-600'
    return 'text-orange-600'
  }

  const windDirectionMap: { [key: string]: number } = {
    N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      {/* Full-width header so brand/logo stays left-aligned (matches dashboard references) */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side: Live Indicator + Telemetry Data */}
          <div className="flex items-center gap-3 flex-1">
            {/* Live Indicator */}
            <div className="flex items-center gap-2 pr-3 border-r border-gray-200 relative group">
              <div className="relative">
                <Radio className="h-3 w-3 text-green-600" />
                <span className="absolute inset-0 animate-ping">
                  <Radio className="h-3 w-3 text-green-600 opacity-75" />
                </span>
              </div>
              <span className="text-[9px] font-mono font-semibold text-green-600 uppercase tracking-wider hidden sm:inline">
                LIVE
              </span>
              
              {/* Live Data Tooltip */}
              <div className="absolute top-full left-0 mt-2 px-4 py-3 bg-white text-gray-800 text-xs rounded-xl shadow-2xl border-2 border-green-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none min-w-[260px]">
                <div className="flex items-center gap-2 mb-3">
                  <div className="relative">
                    <Radio className="h-5 w-5 text-green-600" />
                    <span className="absolute inset-0 animate-ping">
                      <Radio className="h-5 w-5 text-green-600 opacity-75" />
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-sm text-green-700">Live Data Feed</div>
                    <div className="text-gray-500 text-[10px]">Real-time environmental monitoring</div>
                  </div>
                </div>
                
                <div className="space-y-2 text-gray-600 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Updates every 5 seconds from IoT sensors deployed across Dubai</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Includes temperature, humidity, wind, air quality, and CO2 measurements</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Data aggregated from multiple weather stations for accurate readings</span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-[10px]">Data Source:</span>
                    <span className="font-semibold text-gray-700 text-[10px]">VisionDrive IoT Network</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-gray-500 text-[10px]">Update Frequency:</span>
                    <span className="font-semibold text-gray-700 text-[10px]">5 seconds</span>
                  </div>
                </div>
                
                <div className="absolute bottom-full left-6 mb-0.5 border-8 border-transparent border-b-white"></div>
                <div className="absolute bottom-full left-6 -mb-0.5 border-[9px] border-transparent border-b-green-100"></div>
              </div>
            </div>

            {/* Compact Telemetry Data */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Temperature */}
              <div 
                className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded border border-blue-100 relative group"
              >
                <Thermometer className="h-3 w-3 text-blue-600" />
                <span className="font-mono text-xs font-bold text-blue-700">
                  {telemetry.temperature.toFixed(1)}°C
                </span>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-3 bg-white text-gray-800 text-xs rounded-xl shadow-2xl border-2 border-blue-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none min-w-[200px]">
                  <div className="flex items-center gap-2 font-bold text-sm text-blue-700 mb-2">
                    <Thermometer className="h-4 w-4" />
                    Temperature
                  </div>
                  <div className="text-gray-600 leading-relaxed">
                    <div>Real-time ambient temperature</div>
                    <div>from environmental sensors</div>
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-0.5 border-8 border-transparent border-b-white"></div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-0.5 border-[9px] border-transparent border-b-blue-100"></div>
                </div>
              </div>

              {/* Humidity */}
              <div 
                className="flex items-center gap-1 bg-cyan-50 px-2 py-1 rounded border border-cyan-100 relative group"
              >
                <Droplets className="h-3 w-3 text-cyan-600" />
                <span className="font-mono text-xs font-bold text-cyan-700">
                  {telemetry.humidity.toFixed(0)}%
                </span>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-3 bg-white text-gray-800 text-xs rounded-xl shadow-2xl border-2 border-cyan-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none min-w-[200px]">
                  <div className="flex items-center gap-2 font-bold text-sm text-cyan-700 mb-2">
                    <Droplets className="h-4 w-4" />
                    Relative Humidity
                  </div>
                  <div className="text-gray-600 leading-relaxed">
                    <div>Moisture in the air (0-100%)</div>
                    <div className="mt-1 px-2 py-1 bg-cyan-50 text-cyan-700 rounded font-semibold inline-block">Optimal: 30-60%</div>
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-0.5 border-8 border-transparent border-b-white"></div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-0.5 border-[9px] border-transparent border-b-cyan-100"></div>
                </div>
              </div>

              {/* Wind */}
              <div 
                className="flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded border border-indigo-100 relative group"
              >
                <Wind 
                  className="h-3 w-3 text-indigo-600 transition-transform duration-500" 
                  style={{ transform: `rotate(${windDirectionMap[telemetry.windDirection] || 0}deg)` }}
                />
                <span className="font-mono text-xs font-bold text-indigo-700">
                  {telemetry.windDirection} {telemetry.windSpeed.toFixed(0)}
                </span>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-3 bg-white text-gray-800 text-xs rounded-xl shadow-2xl border-2 border-indigo-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none min-w-[200px]">
                  <div className="flex items-center gap-2 font-bold text-sm text-indigo-700 mb-2">
                    <Wind className="h-4 w-4" />
                    Wind Conditions
                  </div>
                  <div className="text-gray-600 leading-relaxed space-y-1">
                    <div><span className="font-semibold text-gray-700">Direction:</span> {telemetry.windDirection} ({getWindDirectionName(telemetry.windDirection)})</div>
                    <div><span className="font-semibold text-gray-700">Speed:</span> {telemetry.windSpeed.toFixed(1)} km/h</div>
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-0.5 border-8 border-transparent border-b-white"></div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-0.5 border-[9px] border-transparent border-b-indigo-100"></div>
                </div>
              </div>

              {/* PM2.5 */}
              <div 
                className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded border border-green-100 relative group"
              >
                <Leaf className="h-3 w-3 text-green-600" />
                <span className={`font-mono text-xs font-bold ${getPM25Status(telemetry.pm25)}`}>
                  PM2.5: {telemetry.pm25.toFixed(0)}
                </span>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-3 bg-white text-gray-800 text-xs rounded-xl shadow-2xl border-2 border-green-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none min-w-[220px]">
                  <div className="flex items-center gap-2 font-bold text-sm text-green-700 mb-2">
                    <Leaf className="h-4 w-4" />
                    Air Quality PM2.5
                  </div>
                  <div className="text-gray-600 leading-relaxed">
                    <div>Particulate Matter 2.5μm</div>
                    <div className="font-semibold text-gray-700 mt-1">Current: {telemetry.pm25.toFixed(1)} μg/m³</div>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Good: 0-12</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span>Moderate: 12-35</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>Unhealthy: 35+</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-0.5 border-8 border-transparent border-b-white"></div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-0.5 border-[9px] border-transparent border-b-green-100"></div>
                </div>
              </div>

              {/* CO2 */}
              <div 
                className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded border border-gray-100 relative group"
              >
                <Cloud className="h-3 w-3 text-gray-600" />
                <span className={`font-mono text-xs font-bold ${getCO2Status(telemetry.co2)}`}>
                  {telemetry.co2.toFixed(0)} ppm
                </span>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-3 bg-white text-gray-800 text-xs rounded-xl shadow-2xl border-2 border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none min-w-[220px]">
                  <div className="flex items-center gap-2 font-bold text-sm text-gray-700 mb-2">
                    <Cloud className="h-4 w-4" />
                    CO2 Concentration
                  </div>
                  <div className="text-gray-600 leading-relaxed">
                    <div>Carbon dioxide level</div>
                    <div className="font-semibold text-gray-700 mt-1">Current: {telemetry.co2.toFixed(0)} ppm</div>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Normal: 400-1000</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span>High: 1000-2000</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>Very High: 2000+</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-0.5 border-8 border-transparent border-b-white"></div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-0.5 border-[9px] border-transparent border-b-gray-200"></div>
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="h-6 w-px bg-gray-300"></div>

              {/* Comfort/Safety Indicator */}
              <div 
                className={`flex items-center gap-2 px-3 py-1 rounded-lg border-2 ${comfortStatus.color} relative group transition-all`}
              >
                <div className="relative">
                  <div className={`w-2 h-2 ${comfortStatus.dotColor} rounded-full`}></div>
                  <div className={`absolute inset-0 ${comfortStatus.dotColor} rounded-full animate-ping opacity-75`}></div>
                </div>
                <span className="text-xs font-bold">{comfortStatus.icon}</span>
                <span className="text-xs font-bold hidden xl:inline">{comfortStatus.level}</span>
                
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-3 bg-white text-gray-800 text-xs rounded-xl shadow-2xl border-2 border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none min-w-[280px]">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{comfortStatus.icon}</span>
                    <div>
                      <div className="font-bold text-sm">{comfortStatus.level} Conditions</div>
                      <div className="text-gray-600 text-xs">{comfortStatus.message}</div>
                    </div>
                  </div>
                  
                  {comfortStatus.issues.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="font-semibold text-gray-700 mb-2 text-xs">Current Issues:</div>
                      <div className="space-y-1">
                        {comfortStatus.issues.map((issue, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-gray-600">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                            <span>{issue}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-gray-500 text-[10px] leading-relaxed">
                      Analysis based on temperature, humidity, air quality (PM2.5), and CO2 levels
                    </div>
                  </div>
                  
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-0.5 border-8 border-transparent border-b-white"></div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-0.5 border-[9px] border-transparent border-b-gray-200"></div>
                </div>
              </div>
            </div>
          </div>

          {/* User Menu & Language Toggle */}
          <div className="flex items-center space-x-3">
            {/* Language Toggle */}
            <div className="relative" ref={languageMenuRef}>
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                <span>{language}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={() => handleLanguageChange('EN')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                      language === 'EN' ? 'text-primary-600 font-medium bg-primary-50' : 'text-gray-700'
                    }`}
                  >
                    <span>English</span>
                    {language === 'EN' && <span className="text-primary-600">✓</span>}
                  </button>
                  <button
                    onClick={() => handleLanguageChange('AR')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                      language === 'AR' ? 'text-primary-600 font-medium bg-primary-50' : 'text-gray-700'
                    }`}
                  >
                    <span>العربية</span>
                    {language === 'AR' && <span className="text-primary-600">✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <User className={`h-5 w-5 ${isAdmin ? 'text-blue-600' : ''}`} />
                <span className="hidden sm:inline">{user?.name || user?.email || 'User'}</span>
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={() => {
                      router.push('/portal/settings')
                      setIsUserMenuOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsUserMenuOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button - Shows sidebar items */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-gray-700 hover:bg-gray-50 rounded-lg"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation - Includes sidebar items */}
        {isOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4 max-h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="space-y-1">
              {/* Sidebar items for mobile */}
              <div className="pt-2 border-t border-gray-200 mt-2">
                <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Core</p>
                {[
                  { icon: ShieldAlert, label: 'Alerts', path: '/portal/alerts', color: 'text-orange-600' },
                  { icon: MapPin, label: 'Map', path: '/portal/map', color: 'text-green-600' },
                  { icon: Activity, label: 'Events', path: '/portal/events', color: 'text-purple-600' },
                  { icon: FileText, label: 'Replay', path: '/portal/replay', color: 'text-amber-600' },
                ].map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.path || (item.path !== '/portal' && pathname?.startsWith(item.path))
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        router.push(item.path)
                        setIsOpen(false)
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
                        isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`h-6 w-6 ${isActive ? item.color : 'text-gray-500'}`} />
                      <span>{item.label}</span>
                    </button>
                  )
                })}

                {user?.role === 'MASTER_ADMIN' ? (
                  <>
                    <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Finance</p>
                    <button
                      onClick={() => {
                        router.push('/portal/admin/finance')
                        setIsOpen(false)
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
                        pathname?.startsWith('/portal/admin/finance') ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <DollarSign className="h-6 w-6 text-green-600" />
                      <span>Finance</span>
                    </button>
                  </>
                ) : null}

                <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Reports</p>
                {[
                  { icon: BarChart3, label: 'Sensor Reports', path: '/portal/reports/sensors', color: 'text-teal-600' },
                  { icon: Network, label: 'Gateway Reports', path: '/portal/reports/gateways', color: 'text-slate-700' },
                  { icon: Network, label: 'Network Overview', path: '/portal/reports/network', color: 'text-gray-700' },
                ].map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.path || pathname?.startsWith(item.path)
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        router.push(item.path)
                        setIsOpen(false)
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
                        isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`h-6 w-6 ${isActive ? item.color : 'text-gray-500'}`} />
                      <span>{item.label}</span>
                    </button>
                  )
                })}

                <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Operations</p>
                {[
                  { icon: Users, label: 'Sensors', path: '/portal/sensors', color: 'text-indigo-600' },
                  { icon: Gauge, label: 'Calibration', path: '/portal/calibration', color: 'text-pink-600', adminOnly: true },
                ]
                  .filter((i) => (!i.adminOnly ? true : isAdmin))
                  .map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.path || pathname?.startsWith(item.path)
                    return (
                      <button
                        key={item.path}
                        onClick={() => {
                          router.push(item.path)
                          setIsOpen(false)
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
                          isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className={`h-6 w-6 ${isActive ? item.color : 'text-gray-500'}`} />
                        <span>{item.label}</span>
                      </button>
                    )
                  })}

                <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Network</p>
                <button
                  onClick={() => {
                    router.push('/portal/reports/network')
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
                    pathname?.startsWith('/portal/reports/network') ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Network className="h-6 w-6 text-gray-700" />
                  <span>Network</span>
                </button>
              </div>

              <div className="pt-2 border-t border-gray-200 mt-2">
                <button
                  onClick={() => {
                    router.push('/portal/settings')
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Settings className="h-6 w-6 text-gray-500" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={() => {
                    handleLogout()
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-6 w-6" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

