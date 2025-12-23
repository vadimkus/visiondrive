'use client'

import { 
  Thermometer, 
  Wind, 
  Droplets, 
  Cloud, 
  Leaf,
  Activity,
  Radio
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface TelemetryData {
  temperature: number
  humidity: number
  windSpeed: number
  windDirection: string
  pm25: number
  pm10: number
  co2: number
}

export default function HeaderTelemetry() {
  const [data, setData] = useState<TelemetryData>({
    temperature: 34,
    humidity: 42,
    windSpeed: 12,
    windDirection: 'NW',
    pm25: 12,
    pm10: 18,
    co2: 420,
  })

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => ({
        temperature: prev.temperature + (Math.random() - 0.5) * 0.5,
        humidity: Math.max(0, Math.min(100, prev.humidity + (Math.random() - 0.5) * 2)),
        windSpeed: Math.max(0, prev.windSpeed + (Math.random() - 0.5) * 2),
        windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
        pm25: Math.max(0, prev.pm25 + (Math.random() - 0.5) * 3),
        pm10: Math.max(0, prev.pm10 + (Math.random() - 0.5) * 4),
        co2: Math.max(400, prev.co2 + (Math.random() - 0.5) * 10),
      }))
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  // Color coding for air quality
  const getPM25Status = (value: number) => {
    if (value <= 12) return { color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', label: 'GOOD' }
    if (value <= 35) return { color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', label: 'MODERATE' }
    if (value <= 55) return { color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', label: 'UNHEALTHY' }
    return { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', label: 'HAZARDOUS' }
  }

  const getCO2Status = (value: number) => {
    if (value <= 450) return { color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' }
    if (value <= 700) return { color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' }
    return { color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' }
  }

  const pm25Status = getPM25Status(data.pm25)
  const co2Status = getCO2Status(data.co2)

  // Wind direction arrow rotation
  const windDirectionMap: { [key: string]: number } = {
    N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315
  }

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 overflow-x-auto scrollbar-hide">
          {/* Live Indicator */}
          <div className="flex items-center gap-2 flex-shrink-0 pr-4 border-r border-gray-200">
            <div className="relative">
              <Radio className="h-3.5 w-3.5 text-green-600" />
              <span className="absolute inset-0 animate-ping">
                <Radio className="h-3.5 w-3.5 text-green-600 opacity-75" />
              </span>
            </div>
            <span className="text-[10px] font-mono font-semibold text-green-600 uppercase tracking-wider hidden sm:inline">
              LIVE
            </span>
          </div>

          {/* Temperature & Humidity */}
          <div className="flex items-center gap-2 flex-shrink-0 px-4 border-r border-gray-200">
            <div className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
              <Thermometer className="h-3.5 w-3.5 text-blue-600" />
              <div className="flex flex-col items-start">
                <span className="font-mono text-xs font-bold text-blue-700 leading-none">
                  {data.temperature.toFixed(1)}°C
                </span>
                <span className="font-mono text-[9px] text-blue-600 leading-none hidden md:inline">
                  TEMP
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-cyan-50 px-2.5 py-1 rounded-md border border-cyan-100">
              <Droplets className="h-3.5 w-3.5 text-cyan-600" />
              <div className="flex flex-col items-start">
                <span className="font-mono text-xs font-bold text-cyan-700 leading-none">
                  {data.humidity.toFixed(0)}%
                </span>
                <span className="font-mono text-[9px] text-cyan-600 leading-none hidden md:inline">
                  RH
                </span>
              </div>
            </div>
          </div>

          {/* Wind */}
          <div className="flex items-center gap-2 flex-shrink-0 px-4 border-r border-gray-200">
            <div className="flex items-center gap-1.5 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
              <Wind 
                className="h-3.5 w-3.5 text-indigo-600 transition-transform duration-500" 
                style={{ transform: `rotate(${windDirectionMap[data.windDirection] || 0}deg)` }}
              />
              <div className="flex flex-col items-start">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-xs font-bold text-indigo-700 leading-none">
                    {data.windDirection}
                  </span>
                  <span className="font-mono text-[10px] text-indigo-600 leading-none">
                    {data.windSpeed.toFixed(1)}
                  </span>
                  <span className="font-mono text-[9px] text-indigo-500 leading-none hidden sm:inline">
                    km/h
                  </span>
                </div>
                <span className="font-mono text-[9px] text-indigo-600 leading-none hidden md:inline">
                  WIND
                </span>
              </div>
            </div>
          </div>

          {/* Air Quality - PM2.5 & PM10 */}
          <div className="flex items-center gap-2 flex-shrink-0 px-4 border-r border-gray-200">
            <div className={`flex items-center gap-1.5 ${pm25Status.bg} px-2.5 py-1 rounded-md border ${pm25Status.border} relative`}>
              <Leaf className={`h-3.5 w-3.5 ${pm25Status.color}`} />
              <div className="flex flex-col items-start">
                <div className="flex items-baseline gap-1">
                  <span className={`font-mono text-[9px] ${pm25Status.color} leading-none`}>
                    PM2.5
                  </span>
                  <span className={`font-mono text-xs font-bold ${pm25Status.color} leading-none`}>
                    {data.pm25.toFixed(0)}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={`font-mono text-[9px] ${pm25Status.color} leading-none`}>
                    PM10
                  </span>
                  <span className={`font-mono text-[10px] font-semibold ${pm25Status.color} leading-none`}>
                    {data.pm10.toFixed(0)}
                  </span>
                </div>
              </div>
              {/* Pulse indicator for status */}
              <div className="absolute -top-0.5 -right-0.5">
                <div className={`w-1.5 h-1.5 ${pm25Status.bg} rounded-full animate-pulse`}>
                  <div className={`w-1.5 h-1.5 ${pm25Status.color.replace('text-', 'bg-')} rounded-full`} />
                </div>
              </div>
            </div>
            <span className={`font-mono text-[8px] font-bold ${pm25Status.color} uppercase tracking-wider hidden lg:inline`}>
              {pm25Status.label}
            </span>
          </div>

          {/* CO2 Levels */}
          <div className="flex items-center gap-2 flex-shrink-0 px-4 border-r border-gray-200">
            <div className={`flex items-center gap-1.5 ${co2Status.bg} px-2.5 py-1 rounded-md border ${co2Status.border}`}>
              <Cloud className={`h-3.5 w-3.5 ${co2Status.color}`} />
              <div className="flex flex-col items-start">
                <span className={`font-mono text-xs font-bold ${co2Status.color} leading-none`}>
                  {data.co2.toFixed(0)}
                </span>
                <span className={`font-mono text-[9px] ${co2Status.color} leading-none`}>
                  ppm CO₂
                </span>
              </div>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 flex-shrink-0 pl-4">
            <Activity className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
            <span className="font-mono text-[10px] font-semibold text-emerald-700 uppercase tracking-wider hidden xl:inline">
              ALL SYSTEMS NOMINAL
            </span>
          </div>
        </div>
      </div>

      {/* Add scrollbar hide utility to global CSS if needed */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

