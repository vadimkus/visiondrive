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
  LogOut,
  User,
  DollarSign,
  Gauge,
  Languages,
  ChevronDown,
  Radio,
  Shield,
  Thermometer,
  Wind,
  Droplets,
  Leaf,
  Sun
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

interface User {
  id: string
  email: string
  name: string | null
  role: string
  tenantId?: string | null
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
  
  // Weather/Environmental telemetry state
  const [weather, setWeather] = useState({
    temperature: 34,
    humidity: 42,
    windSpeed: 12,
    windDirection: 'NW',
    pm25: 18,
    pm10: 32,
    uv: 8,
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

  // Simulate real-time weather updates
  useEffect(() => {
    const interval = setInterval(() => {
      setWeather(prev => ({
        temperature: prev.temperature + (Math.random() - 0.5) * 0.3,
        humidity: Math.max(20, Math.min(90, prev.humidity + (Math.random() - 0.5) * 2)),
        windSpeed: Math.max(0, prev.windSpeed + (Math.random() - 0.5) * 1.5),
        windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
        pm25: Math.max(5, Math.min(100, prev.pm25 + (Math.random() - 0.5) * 4)),
        pm10: Math.max(10, Math.min(150, prev.pm10 + (Math.random() - 0.5) * 6)),
        uv: Math.max(1, Math.min(11, prev.uv + (Math.random() - 0.5) * 0.5)),
      }))
    }, 8000) // Update every 8 seconds
    return () => clearInterval(interval)
  }, [])

  // Calculate outdoor comfort level based on temperature, humidity, and wind
  const getOutdoorComfort = () => {
    const temp = weather.temperature
    const humidity = weather.humidity
    const wind = weather.windSpeed

    // Heat index calculation (simplified)
    let heatIndex = temp
    if (temp > 27 && humidity > 40) {
      heatIndex = temp + (humidity - 40) * 0.1
    }

    // Wind chill effect (minor in UAE climate)
    if (wind > 20) {
      heatIndex -= wind * 0.05
    }

    // Determine comfort level
    if (heatIndex >= 45 || wind > 50) {
      return { 
        level: '🔥', 
        color: 'text-red-700', 
        bg: 'bg-red-50', 
        border: 'border-red-200',
        icon: '🔥',
        label: 'DANGER',
        advice: 'Stay indoors. Extreme heat or sandstorm risk.'
      }
    }
    if (heatIndex >= 40) {
      return { 
        level: '🥵', 
        color: 'text-orange-700', 
        bg: 'bg-orange-50', 
        border: 'border-orange-200',
        icon: '🥵',
        label: 'CAUTION',
        advice: 'Limit outdoor exposure. Very hot conditions.'
      }
    }
    if (heatIndex >= 35) {
      return { 
        level: '☀️', 
        color: 'text-yellow-700', 
        bg: 'bg-yellow-50', 
        border: 'border-yellow-200',
        icon: '☀️',
        label: 'WARM',
        advice: 'Hot but manageable. Stay hydrated.'
      }
    }
    if (heatIndex >= 25 && heatIndex < 35 && humidity < 70) {
      return { 
        level: '😊', 
        color: 'text-green-700', 
        bg: 'bg-green-50', 
        border: 'border-green-200',
        icon: '😊',
        label: 'PLEASANT',
        advice: 'Comfortable outdoor conditions.'
      }
    }
    return { 
      level: '🌴', 
      color: 'text-emerald-700', 
      bg: 'bg-emerald-50', 
      border: 'border-emerald-200',
      icon: '🌴',
      label: 'PERFECT',
      advice: 'Ideal conditions for outdoor activity.'
    }
  }

  const comfort = getOutdoorComfort()

  // Air Quality Index based on PM2.5
  const getAirQuality = () => {
    const pm = weather.pm25
    if (pm <= 12) return { level: 'GOOD', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' }
    if (pm <= 35) return { level: 'MODERATE', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' }
    if (pm <= 55) return { level: 'UNHEALTHY', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' }
    if (pm <= 150) return { level: 'POOR', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' }
    return { level: 'HAZARDOUS', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' }
  }

  // UV Index status
  const getUVStatus = () => {
    const uv = weather.uv
    if (uv <= 2) return { level: 'LOW', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' }
    if (uv <= 5) return { level: 'MODERATE', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' }
    if (uv <= 7) return { level: 'HIGH', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' }
    if (uv <= 10) return { level: 'VERY HIGH', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' }
    return { level: 'EXTREME', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' }
  }

  const airQuality = getAirQuality()
  const uvStatus = getUVStatus()


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

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      {/* Full-width header so brand/logo stays left-aligned (matches dashboard references) */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side: Live Indicator */}
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
                    <div className="font-bold text-sm text-green-700">Live Status</div>
                    <div className="text-gray-500 text-[10px]">Portal session active</div>
                  </div>
                </div>
                
                <div className="space-y-2 text-gray-600 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Indicates the portal UI is online and responsive</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Environmental telemetry shows simulated weather data</span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-[10px]">Data Source:</span>
                    <span className="font-semibold text-gray-700 text-[10px]">VisionDrive Portal</span>
                  </div>
                </div>
                
                <div className="absolute bottom-full left-6 mb-0.5 border-8 border-transparent border-b-white"></div>
                <div className="absolute bottom-full left-6 -mb-0.5 border-[9px] border-transparent border-b-green-100"></div>
              </div>
            </div>

            {/* Weather/Environmental Telemetry */}
            <div className="hidden lg:flex items-center gap-3 pl-3">
              {/* Temperature */}
              <div className="relative group">
                <div className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 cursor-default">
                  <Thermometer className="h-3.5 w-3.5 text-blue-600" />
                  <div className="flex flex-col items-start">
                    <span className="font-mono text-xs font-bold text-blue-700 leading-none">
                      {weather.temperature.toFixed(1)}°C
                    </span>
                    <span className="font-mono text-[9px] text-blue-600 leading-none">
                      TEMP
                    </span>
                  </div>
                </div>
                {/* Temperature Tooltip */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-3 bg-white text-gray-800 text-xs rounded-xl shadow-2xl border-2 border-blue-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none min-w-[240px]">
                  <div className="flex items-center gap-2 mb-3">
                    <Thermometer className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-bold text-sm text-blue-700">Ambient Temperature</div>
                      <div className="text-gray-500 text-[10px]">Current: {weather.temperature.toFixed(1)}°C</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-gray-600 leading-relaxed">
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Air temperature at sensor deployment site</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Affects sensor battery performance and detection accuracy</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Optimal range: 15°C - 40°C</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-[10px]">Data Source:</span>
                      <span className="font-semibold text-gray-700 text-[10px]">UAE Weather Station</span>
                    </div>
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-0.5 border-8 border-transparent border-b-white"></div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-0.5 border-[9px] border-transparent border-b-blue-100"></div>
                </div>
              </div>
              
              {/* Humidity */}
              <div className="relative group">
                <div className="flex items-center gap-1.5 bg-cyan-50 px-2.5 py-1 rounded-md border border-cyan-100 cursor-default">
                  <Droplets className="h-3.5 w-3.5 text-cyan-600" />
                  <div className="flex flex-col items-start">
                    <span className="font-mono text-xs font-bold text-cyan-700 leading-none">
                      {weather.humidity.toFixed(0)}%
                    </span>
                    <span className="font-mono text-[9px] text-cyan-600 leading-none">
                      RH
                    </span>
                  </div>
                </div>
                {/* Humidity Tooltip */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-3 bg-white text-gray-800 text-xs rounded-xl shadow-2xl border-2 border-cyan-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none min-w-[240px]">
                  <div className="flex items-center gap-2 mb-3">
                    <Droplets className="h-5 w-5 text-cyan-600" />
                    <div>
                      <div className="font-bold text-sm text-cyan-700">Relative Humidity</div>
                      <div className="text-gray-500 text-[10px]">Current: {weather.humidity.toFixed(0)}%</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-gray-600 leading-relaxed">
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Moisture level in the air as percentage</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>High humidity may affect radar-based detection</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Typical UAE range: 30% - 80%</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-[10px]">Data Source:</span>
                      <span className="font-semibold text-gray-700 text-[10px]">UAE Weather Station</span>
                    </div>
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-0.5 border-8 border-transparent border-b-white"></div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-0.5 border-[9px] border-transparent border-b-cyan-100"></div>
                </div>
              </div>
              
              {/* Wind */}
              <div className="relative group">
                <div className="flex items-center gap-1.5 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 cursor-default">
                  <Wind className="h-3.5 w-3.5 text-indigo-600" />
                  <div className="flex flex-col items-start">
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-xs font-bold text-indigo-700 leading-none">
                        {weather.windDirection}
                      </span>
                      <span className="font-mono text-[10px] text-indigo-600 leading-none">
                        {weather.windSpeed.toFixed(1)} km/h
                      </span>
                    </div>
                    <span className="font-mono text-[9px] text-indigo-600 leading-none">
                      WIND
                    </span>
                  </div>
                </div>
                {/* Wind Tooltip */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-3 bg-white text-gray-800 text-xs rounded-xl shadow-2xl border-2 border-indigo-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none min-w-[260px]">
                  <div className="flex items-center gap-2 mb-3">
                    <Wind className="h-5 w-5 text-indigo-600" />
                    <div>
                      <div className="font-bold text-sm text-indigo-700">Wind Conditions</div>
                      <div className="text-gray-500 text-[10px]">Direction: {weather.windDirection} | Speed: {weather.windSpeed.toFixed(1)} km/h</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-gray-600 leading-relaxed">
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Wind direction (N/S/E/W) and speed in km/h</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Strong winds may carry dust affecting sensor optics</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Alert threshold: &gt;50 km/h (sandstorm risk)</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-[10px]">Data Source:</span>
                      <span className="font-semibold text-gray-700 text-[10px]">UAE Weather Station</span>
                    </div>
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-0.5 border-8 border-transparent border-b-white"></div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-0.5 border-[9px] border-transparent border-b-indigo-100"></div>
                </div>
              </div>
              
              {/* Air Quality (PM2.5/PM10) */}
              <div className="relative group">
                <div className={`flex items-center gap-1.5 ${airQuality.bg} px-2.5 py-1 rounded-md border ${airQuality.border} cursor-default`}>
                  <Leaf className={`h-3.5 w-3.5 ${airQuality.color}`} />
                  <div className="flex flex-col items-start">
                    <div className="flex items-baseline gap-1">
                      <span className={`font-mono text-xs font-bold ${airQuality.color} leading-none`}>
                        {weather.pm25.toFixed(0)}
                      </span>
                      <span className={`font-mono text-[9px] ${airQuality.color} leading-none`}>
                        µg/m³
                      </span>
                    </div>
                    <span className={`font-mono text-[9px] ${airQuality.color} leading-none`}>
                      PM2.5
                    </span>
                  </div>
                </div>
                {/* Air Quality Tooltip */}
                <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-3 bg-white text-gray-800 text-xs rounded-xl shadow-2xl border-2 ${airQuality.border} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none min-w-[280px]`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Leaf className={`h-5 w-5 ${airQuality.color}`} />
                    <div>
                      <div className={`font-bold text-sm ${airQuality.color}`}>Air Quality Index</div>
                      <div className="text-gray-500 text-[10px]">Status: {airQuality.level}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className={`p-2 rounded-lg ${airQuality.bg}`}>
                      <div className={`font-mono text-lg font-bold ${airQuality.color}`}>{weather.pm25.toFixed(0)}</div>
                      <div className={`text-[10px] ${airQuality.color}`}>PM2.5 (µg/m³)</div>
                    </div>
                    <div className={`p-2 rounded-lg ${airQuality.bg}`}>
                      <div className={`font-mono text-lg font-bold ${airQuality.color}`}>{weather.pm10.toFixed(0)}</div>
                      <div className={`text-[10px] ${airQuality.color}`}>PM10 (µg/m³)</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-gray-600 leading-relaxed">
                    <div className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 ${airQuality.color.replace('text-', 'bg-')} rounded-full mt-1.5 flex-shrink-0`}></div>
                      <span>PM2.5: Fine particles (&lt;2.5µm) - penetrate deep into lungs</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 ${airQuality.color.replace('text-', 'bg-')} rounded-full mt-1.5 flex-shrink-0`}></div>
                      <span>PM10: Coarse particles (&lt;10µm) - dust and sand</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 ${airQuality.color.replace('text-', 'bg-')} rounded-full mt-1.5 flex-shrink-0`}></div>
                      <span>High PM levels may affect sensor optics</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-[10px]">Data Source:</span>
                      <span className="font-semibold text-gray-700 text-[10px]">UAE Air Quality Network</span>
                    </div>
                  </div>
                  <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-0.5 border-8 border-transparent border-b-white`}></div>
                  <div className={`absolute bottom-full left-1/2 -translate-x-1/2 -mb-0.5 border-[9px] border-transparent ${airQuality.border.replace('border-', 'border-b-')}`}></div>
                </div>
              </div>
              
              {/* UV Index */}
              <div className="relative group">
                <div className={`flex items-center gap-1.5 ${uvStatus.bg} px-2.5 py-1 rounded-md border ${uvStatus.border} cursor-default`}>
                  <Sun className={`h-3.5 w-3.5 ${uvStatus.color}`} />
                  <div className="flex flex-col items-start">
                    <span className={`font-mono text-xs font-bold ${uvStatus.color} leading-none`}>
                      {weather.uv.toFixed(0)}
                    </span>
                    <span className={`font-mono text-[9px] ${uvStatus.color} leading-none`}>
                      UV
                    </span>
                  </div>
                </div>
                {/* UV Tooltip */}
                <div className={`absolute top-full right-0 mt-2 px-4 py-3 bg-white text-gray-800 text-xs rounded-xl shadow-2xl border-2 ${uvStatus.border} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none min-w-[260px]`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Sun className={`h-5 w-5 ${uvStatus.color}`} />
                    <div>
                      <div className={`font-bold text-sm ${uvStatus.color}`}>UV Index</div>
                      <div className="text-gray-500 text-[10px]">Level: {uvStatus.level}</div>
                    </div>
                  </div>
                  <div className={`p-2 rounded-lg ${uvStatus.bg} mb-3 text-center`}>
                    <div className={`font-mono text-2xl font-bold ${uvStatus.color}`}>{weather.uv.toFixed(1)}</div>
                    <div className={`text-[10px] ${uvStatus.color}`}>Current UV Index</div>
                  </div>
                  <div className="space-y-2 text-gray-600 leading-relaxed">
                    <div className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 ${uvStatus.color.replace('text-', 'bg-')} rounded-full mt-1.5 flex-shrink-0`}></div>
                      <span>Measures solar UV radiation intensity</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 ${uvStatus.color.replace('text-', 'bg-')} rounded-full mt-1.5 flex-shrink-0`}></div>
                      <span>UAE peak: 10-11+ during summer midday</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 ${uvStatus.color.replace('text-', 'bg-')} rounded-full mt-1.5 flex-shrink-0`}></div>
                      <span>Protection needed when UV &gt;3</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-[10px]">Data Source:</span>
                      <span className="font-semibold text-gray-700 text-[10px]">UAE Weather Station</span>
                    </div>
                  </div>
                  <div className={`absolute bottom-full right-6 mb-0.5 border-8 border-transparent border-b-white`}></div>
                  <div className={`absolute bottom-full right-6 -mb-0.5 border-[9px] border-transparent ${uvStatus.border.replace('border-', 'border-b-')}`}></div>
                </div>
              </div>
              
              {/* Outdoor Comfort Indicator */}
              <div className="relative group">
                <div className={`flex items-center gap-1.5 ${comfort.bg} px-2.5 py-1 rounded-md border ${comfort.border} cursor-default`}>
                  <span className="text-base">{comfort.icon}</span>
                  <div className="flex flex-col items-start">
                    <span className={`font-mono text-xs font-bold ${comfort.color} leading-none`}>
                      {comfort.label}
                    </span>
                    <span className={`font-mono text-[9px] ${comfort.color} leading-none`}>
                      OUTDOOR
                    </span>
                  </div>
                </div>
                {/* Comfort Tooltip */}
                <div className={`absolute top-full right-0 mt-2 px-4 py-3 bg-white text-gray-800 text-xs rounded-xl shadow-2xl border-2 ${comfort.border} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none min-w-[280px]`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-3xl">{comfort.icon}</span>
                    <div>
                      <div className={`font-bold text-sm ${comfort.color}`}>Outdoor Comfort Level</div>
                      <div className="text-gray-500 text-[10px]">Status: {comfort.label}</div>
                    </div>
                  </div>
                  <div className={`p-2 rounded-lg ${comfort.bg} mb-3`}>
                    <p className={`${comfort.color} font-medium text-sm`}>{comfort.advice}</p>
                  </div>
                  <div className="space-y-2 text-gray-600 leading-relaxed">
                    <div className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 ${comfort.color.replace('text-', 'bg-')} rounded-full mt-1.5 flex-shrink-0`}></div>
                      <span>Based on temperature, humidity, and wind speed</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 ${comfort.color.replace('text-', 'bg-')} rounded-full mt-1.5 flex-shrink-0`}></div>
                      <span>Heat index: {(weather.temperature + (weather.humidity > 40 ? (weather.humidity - 40) * 0.1 : 0)).toFixed(1)}°C</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 ${comfort.color.replace('text-', 'bg-')} rounded-full mt-1.5 flex-shrink-0`}></div>
                      <span>Recommended for field technicians and installation teams</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-[10px]">Last Updated:</span>
                      <span className="font-semibold text-gray-700 text-[10px]">Just now</span>
                    </div>
                  </div>
                  <div className={`absolute bottom-full right-6 mb-0.5 border-8 border-transparent border-b-white`}></div>
                  <div className={`absolute bottom-full right-6 -mb-0.5 border-[9px] border-transparent ${comfort.border.replace('border-', 'border-b-')}`}></div>
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

                {/* Weather telemetry shown in desktop header only */}
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


