'use client'

import { useState, useEffect, useRef } from 'react'

interface DataPoint {
  time: string
  temperature: number
  deviceId: string
}

export default function TemperatureChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedDevice, setSelectedDevice] = useState<string>('all')
  const [hoveredPoint, setHoveredPoint] = useState<{x: number, y: number, data: DataPoint} | null>(null)

  // Mock data - replace with actual API data
  const devices = ['sensor-001', 'sensor-002', 'sensor-003']
  const generateMockData = () => {
    const now = Date.now()
    const data: DataPoint[] = []
    
    devices.forEach(deviceId => {
      for (let i = 24; i >= 0; i--) {
        const time = new Date(now - i * 3600000).toISOString()
        // Generate realistic temperature fluctuations
        const baseTemp = deviceId === 'sensor-001' ? 4 : deviceId === 'sensor-002' ? 5 : 3.5
        const variation = Math.sin(i / 3) * 1.5 + (Math.random() - 0.5)
        const temperature = Math.round((baseTemp + variation) * 10) / 10
        data.push({ time, temperature, deviceId })
      }
    })
    
    return data
  }

  const [data] = useState<DataPoint[]>(generateMockData())

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // High DPI support
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const width = rect.width
    const height = rect.height
    const padding = { top: 20, right: 20, bottom: 40, left: 50 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Filter data
    const filteredData = selectedDevice === 'all' 
      ? data 
      : data.filter(d => d.deviceId === selectedDevice)

    if (filteredData.length === 0) return

    // Calculate scales
    const temps = filteredData.map(d => d.temperature)
    const minTemp = Math.floor(Math.min(...temps) - 1)
    const maxTemp = Math.ceil(Math.max(...temps) + 1)
    const tempRange = maxTemp - minTemp

    const xScale = (i: number) => padding.left + (i / 24) * chartWidth
    const yScale = (temp: number) => padding.top + chartHeight - ((temp - minTemp) / tempRange) * chartHeight

    // Draw grid
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1

    // Horizontal grid lines
    for (let temp = minTemp; temp <= maxTemp; temp += 2) {
      const y = yScale(temp)
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(width - padding.right, y)
      ctx.stroke()

      // Y-axis labels
      ctx.fillStyle = '#6b7280'
      ctx.font = '11px system-ui'
      ctx.textAlign = 'right'
      ctx.fillText(`${temp}°C`, padding.left - 8, y + 4)
    }

    // Threshold lines
    ctx.strokeStyle = '#fbbf24'
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(padding.left, yScale(8))
    ctx.lineTo(width - padding.right, yScale(8))
    ctx.stroke()
    
    ctx.strokeStyle = '#3b82f6'
    ctx.beginPath()
    ctx.moveTo(padding.left, yScale(0))
    ctx.lineTo(width - padding.right, yScale(0))
    ctx.stroke()
    ctx.setLineDash([])

    // Draw data lines for each device
    const colors: Record<string, string> = {
      'sensor-001': '#3b82f6',
      'sensor-002': '#10b981',
      'sensor-003': '#f59e0b'
    }

    const deviceGroups = selectedDevice === 'all' 
      ? devices 
      : [selectedDevice]

    deviceGroups.forEach(deviceId => {
      const deviceData = filteredData.filter(d => d.deviceId === deviceId)
      if (deviceData.length === 0) return

      ctx.strokeStyle = colors[deviceId] || '#6b7280'
      ctx.lineWidth = 2
      ctx.beginPath()

      deviceData.forEach((point, i) => {
        const x = xScale(i)
        const y = yScale(point.temperature)
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()

      // Draw points
      deviceData.forEach((point, i) => {
        const x = xScale(i)
        const y = yScale(point.temperature)
        
        ctx.fillStyle = colors[deviceId] || '#6b7280'
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fill()
      })
    })

    // X-axis labels
    ctx.fillStyle = '#6b7280'
    ctx.font = '11px system-ui'
    ctx.textAlign = 'center'
    for (let i = 0; i <= 24; i += 6) {
      const x = xScale(i)
      ctx.fillText(`${24 - i}h`, x, height - padding.bottom + 20)
    }

    // Legend
    if (selectedDevice === 'all') {
      let legendX = padding.left
      const legendY = height - 10
      
      devices.forEach(deviceId => {
        ctx.fillStyle = colors[deviceId]
        ctx.beginPath()
        ctx.arc(legendX, legendY, 4, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.fillStyle = '#374151'
        ctx.font = '11px system-ui'
        ctx.textAlign = 'left'
        ctx.fillText(deviceId, legendX + 8, legendY + 4)
        legendX += 90
      })
    }

  }, [data, selectedDevice])

  return (
    <div className="space-y-4">
      {/* Device Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Device:</span>
        <select
          value={selectedDevice}
          onChange={(e) => setSelectedDevice(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Devices</option>
          {devices.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <div className="flex items-center gap-4 ml-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-0.5 bg-amber-400"></div>
            <span className="text-gray-500">Max (8°C)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-0.5 bg-blue-400"></div>
            <span className="text-gray-500">Min (0°C)</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <canvas 
          ref={canvasRef}
          className="w-full h-[300px]"
          style={{ width: '100%', height: '300px' }}
        />
        
        {/* Tooltip */}
        {hoveredPoint && (
          <div 
            className="absolute bg-gray-900 text-white text-xs px-2 py-1 rounded pointer-events-none"
            style={{ left: hoveredPoint.x, top: hoveredPoint.y - 30 }}
          >
            {hoveredPoint.data.temperature}°C
          </div>
        )}
      </div>
    </div>
  )
}
