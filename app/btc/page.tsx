'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { TradingViewChart, TradingViewTechnicalAnalysis } from '@/components/TradingViewWidget'

// Types
interface MarketData {
  price: number
  change24h: number
  high24h: number
  low24h: number
  volume24h: number
  fundingRate: number
  nextFunding: string
  markPrice: number
}

interface Alert {
  id: string
  type: 'funding' | 'price' | 'support' | 'resistance'
  condition: string
  value: number
  triggered: boolean
  active: boolean
}

interface CalculatorInputs {
  capital: number
  leverage: number
  fundingRate: number
  positionSize: number
}

interface FundingHistoryPoint {
  timestamp: string
  rate: number
  time: string
}

// Generate mock historical funding data (last 7 days, 3 readings per day)
const generateMockFundingHistory = (): FundingHistoryPoint[] => {
  const history: FundingHistoryPoint[] = []
  const now = new Date()
  
  for (let i = 20; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 8 * 60 * 60 * 1000) // 8 hours apart
    const baseRate = 0.008 + Math.sin(i / 3) * 0.005 // Oscillating pattern
    const noise = (Math.random() - 0.5) * 0.004
    const rate = Math.max(-0.01, Math.min(0.03, baseRate + noise))
    
    history.push({
      timestamp: date.toISOString(),
      rate: rate,
      time: date.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit',
        hour12: false 
      })
    })
  }
  
  return history
}

// Mock data - in production, connect to Binance API
const getMockMarketData = (): MarketData => ({
  price: 92450 + Math.random() * 500 - 250,
  change24h: -1.2 + Math.random() * 2,
  high24h: 94200,
  low24h: 91800,
  volume24h: 28.5,
  fundingRate: 0.0085 + Math.random() * 0.005,
  nextFunding: '02:14:33',
  markPrice: 92480 + Math.random() * 100,
})


// Signal Card Component
function SignalCard({ 
  title, 
  value, 
  status, 
  description 
}: { 
  title: string
  value: string
  status: 'bullish' | 'bearish' | 'neutral'
  description: string 
}) {
  const statusColors = {
    bullish: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    bearish: 'text-rose-400 bg-rose-400/10 border-rose-400/30',
    neutral: 'text-amber-400 bg-amber-400/10 border-amber-400/30'
  }

  const statusIcons = {
    bullish: '↑',
    bearish: '↓',
    neutral: '→'
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl border ${statusColors[status]} backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wider text-gray-400">{title}</span>
        <span className={`text-lg font-bold ${status === 'bullish' ? 'text-emerald-400' : status === 'bearish' ? 'text-rose-400' : 'text-amber-400'}`}>
          {statusIcons[status]}
        </span>
      </div>
      <div className="text-2xl font-mono font-bold text-white mb-1">{value}</div>
      <p className="text-xs text-gray-500">{description}</p>
    </motion.div>
  )
}

// Price Display Component
function PriceDisplay({ data }: { data: MarketData }) {
  const isPositive = data.change24h >= 0

  return (
    <div className="bg-gray-900/80 rounded-2xl p-6 border border-gray-800">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <span className="text-xl font-bold text-gray-900">₿</span>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Bitcoin</h2>
          <span className="text-xs text-gray-500">BTC/USDT Perpetual</span>
        </div>
      </div>
      
      <div className="flex items-end gap-4 mb-6">
        <span className="text-4xl font-mono font-bold text-white">
          ${data.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className={`text-lg font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isPositive ? '+' : ''}{data.change24h.toFixed(2)}%
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">24h High</span>
          <p className="font-mono text-emerald-400">${data.high24h.toLocaleString()}</p>
        </div>
        <div>
          <span className="text-gray-500">24h Low</span>
          <p className="font-mono text-rose-400">${data.low24h.toLocaleString()}</p>
        </div>
        <div>
          <span className="text-gray-500">Mark Price</span>
          <p className="font-mono text-white">${data.markPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
        <div>
          <span className="text-gray-500">24h Volume</span>
          <p className="font-mono text-white">{data.volume24h}B USDT</p>
        </div>
      </div>
    </div>
  )
}

// Funding Rate Component
function FundingRateCard({ data }: { data: MarketData }) {
  const fundingPercent = (data.fundingRate * 100).toFixed(4)
  const isPositive = data.fundingRate > 0
  const annualizedAPY = (data.fundingRate * 3 * 365 * 100).toFixed(1)

  return (
    <div className="bg-gray-900/80 rounded-2xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Funding Rate</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Next in</span>
          <span className="font-mono text-amber-400 bg-amber-400/10 px-2 py-1 rounded">{data.nextFunding}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <span className={`text-3xl font-mono font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isPositive ? '+' : ''}{fundingPercent}%
        </span>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${isPositive ? 'bg-emerald-400/20 text-emerald-400' : 'bg-rose-400/20 text-rose-400'}`}>
          {isPositive ? 'LONGS PAY SHORTS' : 'SHORTS PAY LONGS'}
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Annualized APY</span>
          <span className={`text-xl font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {annualizedAPY}%
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {isPositive 
            ? '✓ Favorable for neutral strategy (short perp + long spot)' 
            : '✗ Unfavorable - consider closing positions'}
        </p>
      </div>
    </div>
  )
}

// Historical Funding Rate Chart Component
function FundingRateChart({ 
  history, 
  currentRate 
}: { 
  history: FundingHistoryPoint[]
  currentRate: number 
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [timeRange, setTimeRange] = useState<'24h' | '3d' | '7d'>('7d')

  // Filter data based on time range
  const filteredHistory = useMemo(() => {
    if (history.length === 0) return []
    const now = Date.now()
    const ranges = {
      '24h': 24 * 60 * 60 * 1000,
      '3d': 3 * 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000
    }
    return history.filter(h => now - new Date(h.timestamp).getTime() < ranges[timeRange])
  }, [history, timeRange])

  // Show loading state if no data
  if (filteredHistory.length < 2) {
    return (
      <div className="bg-gray-900/80 rounded-2xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">📈 Funding Rate History</h3>
        </div>
        <div className="h-48 flex items-center justify-center">
          <div className="text-gray-500 text-sm">Loading chart data... ({history.length} points, {filteredHistory.length} filtered)</div>
        </div>
      </div>
    )
  }

  // Chart dimensions
  const width = 100
  const height = 60
  const padding = { top: 10, right: 5, bottom: 20, left: 5 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Calculate min/max for scaling
  const rates = filteredHistory.map(h => h.rate)
  const minRate = Math.min(...rates, 0) - 0.002
  const maxRate = Math.max(...rates, 0) + 0.002
  const rateRange = maxRate - minRate

  // Scale functions
  const scaleX = (index: number) => padding.left + (index / (filteredHistory.length - 1)) * chartWidth
  const scaleY = (rate: number) => padding.top + chartHeight - ((rate - minRate) / rateRange) * chartHeight

  // Generate path
  const pathData = filteredHistory
    .map((point, index) => {
      const x = scaleX(index)
      const y = scaleY(point.rate)
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  // Generate area path (for gradient fill)
  const areaPath = `${pathData} L ${scaleX(filteredHistory.length - 1)} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`

  // Zero line position
  const zeroY = scaleY(0)

  // Statistics
  const avgRate = rates.reduce((a, b) => a + b, 0) / rates.length
  const maxRateValue = Math.max(...rates)
  const minRateValue = Math.min(...rates)
  const positiveCount = rates.filter(r => r > 0).length
  const positivePercent = ((positiveCount / rates.length) * 100).toFixed(0)

  return (
    <div className="bg-gray-900/80 rounded-2xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">📈 Funding Rate History</h3>
        <div className="flex gap-1">
          {(['24h', '3d', '7d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                timeRange === range
                  ? 'bg-amber-400/20 text-amber-400'
                  : 'bg-gray-800 text-gray-500 hover:text-gray-300'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative mb-4">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-48"
          preserveAspectRatio="none"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            {/* Gradient for positive area */}
            <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(52, 211, 153)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(52, 211, 153)" stopOpacity="0" />
            </linearGradient>
            {/* Gradient for line */}
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgb(251, 191, 36)" />
              <stop offset="50%" stopColor="rgb(52, 211, 153)" />
              <stop offset="100%" stopColor="rgb(251, 191, 36)" />
            </linearGradient>
            {/* Glow filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((ratio) => (
            <line
              key={ratio}
              x1={padding.left}
              y1={padding.top + chartHeight * ratio}
              x2={width - padding.right}
              y2={padding.top + chartHeight * ratio}
              stroke="rgba(255,255,255,0.05)"
              strokeDasharray="2,2"
            />
          ))}

          {/* Zero line */}
          <line
            x1={padding.left}
            y1={zeroY}
            x2={width - padding.right}
            y2={zeroY}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="0.3"
          />
          <text
            x={padding.left + 1}
            y={zeroY - 1}
            fill="rgba(255,255,255,0.3)"
            fontSize="3"
          >
            0%
          </text>

          {/* Area fill */}
          <path
            d={areaPath}
            fill="url(#positiveGradient)"
          />

          {/* Main line */}
          <path
            d={pathData}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />

          {/* Data points */}
          {filteredHistory.map((point, index) => {
            const x = scaleX(index)
            const y = scaleY(point.rate)
            const isPositive = point.rate > 0
            const isHovered = hoveredIndex === index

            return (
              <g key={index}>
                {/* Hover detection area */}
                <rect
                  x={x - 2}
                  y={padding.top}
                  width={4}
                  height={chartHeight}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIndex(index)}
                  style={{ cursor: 'crosshair' }}
                />
                
                {/* Point */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 1.5 : 0.8}
                  fill={isPositive ? 'rgb(52, 211, 153)' : 'rgb(251, 113, 133)'}
                  className="transition-all duration-150"
                />

                {/* Hover tooltip line */}
                {isHovered && (
                  <>
                    <line
                      x1={x}
                      y1={padding.top}
                      x2={x}
                      y2={padding.top + chartHeight}
                      stroke="rgba(251, 191, 36, 0.5)"
                      strokeWidth="0.3"
                      strokeDasharray="1,1"
                    />
                  </>
                )}
              </g>
            )
          })}

          {/* X-axis labels */}
          {filteredHistory
            .filter((_, i) => i % Math.ceil(filteredHistory.length / 5) === 0 || i === filteredHistory.length - 1)
            .map((point, idx, arr) => {
              const originalIndex = filteredHistory.indexOf(point)
              return (
                <text
                  key={originalIndex}
                  x={scaleX(originalIndex)}
                  y={height - 2}
                  fill="rgba(255,255,255,0.3)"
                  fontSize="2.5"
                  textAnchor="middle"
                >
                  {point.time.split(',')[0]}
                </text>
              )
            })}
        </svg>

        {/* Tooltip */}
        <AnimatePresence>
          {hoveredIndex !== null && filteredHistory[hoveredIndex] && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute top-2 left-1/2 -translate-x-1/2 bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-lg px-3 py-2 pointer-events-none z-10"
            >
              <div className="text-xs text-gray-400">{filteredHistory[hoveredIndex].time}</div>
              <div className={`text-lg font-mono font-bold ${
                filteredHistory[hoveredIndex].rate > 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {filteredHistory[hoveredIndex].rate > 0 ? '+' : ''}
                {(filteredHistory[hoveredIndex].rate * 100).toFixed(4)}%
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Avg Rate</div>
          <div className={`font-mono font-semibold ${avgRate > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {avgRate > 0 ? '+' : ''}{(avgRate * 100).toFixed(3)}%
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Max</div>
          <div className="font-mono font-semibold text-emerald-400">
            +{(maxRateValue * 100).toFixed(3)}%
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Min</div>
          <div className={`font-mono font-semibold ${minRateValue > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {minRateValue > 0 ? '+' : ''}{(minRateValue * 100).toFixed(3)}%
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Positive</div>
          <div className="font-mono font-semibold text-amber-400">
            {positivePercent}%
          </div>
        </div>
      </div>

      {/* Insight */}
      <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-amber-400/10 to-transparent border-l-2 border-amber-400">
        <p className="text-xs text-gray-400">
          {Number(positivePercent) >= 80 
            ? '🟢 Funding has been consistently positive — ideal conditions for neutral strategy.'
            : Number(positivePercent) >= 50
            ? '🟡 Mixed funding rates — monitor closely before entering positions.'
            : '🔴 Funding has been mostly negative — not recommended for long shorts.'}
        </p>
      </div>
    </div>
  )
}

// Calculator Component
function ArbitrageCalculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    capital: 10000,
    leverage: 1,
    fundingRate: 0.01,
    positionSize: 50
  })

  const positionValue = inputs.capital * (inputs.positionSize / 100)
  const dailyIncome = positionValue * (inputs.fundingRate / 100) * 3
  const monthlyIncome = dailyIncome * 30
  const annualIncome = dailyIncome * 365
  const apy = (annualIncome / inputs.capital) * 100
  const tradingFees = positionValue * 0.0004 * 4 // 0.04% × 4 trades (open/close both sides)

  return (
    <div className="bg-gray-900/80 rounded-2xl p-6 border border-gray-800">
      <h3 className="text-lg font-semibold text-white mb-6">💰 Arbitrage Calculator</h3>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Capital (USDT)</label>
          <input
            type="number"
            value={inputs.capital}
            onChange={(e) => setInputs({ ...inputs, capital: Number(e.target.value) })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white font-mono focus:border-amber-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Position Size ({inputs.positionSize}%)</label>
          <input
            type="range"
            min="10"
            max="100"
            value={inputs.positionSize}
            onChange={(e) => setInputs({ ...inputs, positionSize: Number(e.target.value) })}
            className="w-full accent-amber-400"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Funding Rate (%)</label>
          <input
            type="number"
            step="0.001"
            value={inputs.fundingRate}
            onChange={(e) => setInputs({ ...inputs, fundingRate: Number(e.target.value) })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white font-mono focus:border-amber-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-700">
        <div className="flex justify-between">
          <span className="text-gray-400">Position Value</span>
          <span className="font-mono text-white">${positionValue.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Est. Trading Fees</span>
          <span className="font-mono text-rose-400">-${tradingFees.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Daily Income</span>
          <span className="font-mono text-emerald-400">+${dailyIncome.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Monthly Income</span>
          <span className="font-mono text-emerald-400">+${monthlyIncome.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-700">
          <span className="text-white">Estimated APY</span>
          <span className="text-amber-400">{apy.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  )
}

// Alert Manager Component
function AlertManager({ 
  alerts, 
  onToggle, 
  onRemove 
}: { 
  alerts: Alert[]
  onToggle: (id: string) => void
  onRemove: (id: string) => void
}) {
  return (
    <div className="bg-gray-900/80 rounded-2xl p-6 border border-gray-800">
      <h3 className="text-lg font-semibold text-white mb-4">🔔 Active Alerts</h3>
      
      <div className="space-y-3">
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              alert.triggered 
                ? 'bg-amber-400/10 border-amber-400/30' 
                : 'bg-gray-800/50 border-gray-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => onToggle(alert.id)}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  alert.active 
                    ? 'bg-emerald-400 border-emerald-400' 
                    : 'border-gray-600'
                }`}
              >
                {alert.active && <span className="text-xs text-gray-900">✓</span>}
              </button>
              <div>
                <span className="text-sm text-white">{alert.condition}</span>
                <p className="text-xs text-gray-500">
                  {alert.type === 'funding' && 'Funding Rate Alert'}
                  {alert.type === 'price' && 'Price Alert'}
                  {alert.type === 'support' && 'Support Level'}
                  {alert.type === 'resistance' && 'Resistance Level'}
                </p>
              </div>
            </div>
            <button
              onClick={() => onRemove(alert.id)}
              className="text-gray-500 hover:text-rose-400 transition-colors"
            >
              ×
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Strategy Decision Component
function StrategyDecision({ data }: { data: MarketData }) {
  const fundingPositive = data.fundingRate > 0
  const fundingStrong = data.fundingRate > 0.0001
  const priceInRange = data.price > 85000 && data.price < 95000

  let recommendation: 'open' | 'hold' | 'close' | 'wait'
  let description: string

  if (fundingStrong && priceInRange) {
    recommendation = 'open'
    description = 'Funding rate is attractive and price is stable. Good time to enter neutral position.'
  } else if (fundingPositive && priceInRange) {
    recommendation = 'hold'
    description = 'Conditions are favorable. Maintain existing positions.'
  } else if (!fundingPositive) {
    recommendation = 'close'
    description = 'Funding has flipped negative. Consider closing positions to avoid losses.'
  } else {
    recommendation = 'wait'
    description = 'Market conditions are uncertain. Wait for clearer signals.'
  }

  const colors = {
    open: 'from-emerald-500 to-emerald-600',
    hold: 'from-blue-500 to-blue-600',
    close: 'from-rose-500 to-rose-600',
    wait: 'from-amber-500 to-amber-600'
  }

  const labels = {
    open: 'OPEN POSITION',
    hold: 'HOLD',
    close: 'CLOSE POSITION',
    wait: 'WAIT'
  }

  return (
    <div className="bg-gray-900/80 rounded-2xl p-6 border border-gray-800">
      <h3 className="text-lg font-semibold text-white mb-4">📊 Strategy Decision</h3>
      
      <motion.div
        key={recommendation}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`bg-gradient-to-r ${colors[recommendation]} rounded-xl p-6 text-center mb-4`}
      >
        <span className="text-3xl font-bold text-white">{labels[recommendation]}</span>
      </motion.div>

      <p className="text-sm text-gray-400">{description}</p>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Quick Checklist</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={fundingStrong ? 'text-emerald-400' : 'text-rose-400'}>
              {fundingStrong ? '✓' : '✗'}
            </span>
            <span className="text-sm text-gray-400">Funding &gt; 0.01%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={priceInRange ? 'text-emerald-400' : 'text-amber-400'}>
              {priceInRange ? '✓' : '⚠'}
            </span>
            <span className="text-sm text-gray-400">Price in safe range ($85K-$95K)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={fundingPositive ? 'text-emerald-400' : 'text-rose-400'}>
              {fundingPositive ? '✓' : '✗'}
            </span>
            <span className="text-sm text-gray-400">Funding rate positive</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Page Component
export default function BTCTradingDashboard() {
  const [mounted, setMounted] = useState(false)
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [fundingHistory, setFundingHistory] = useState<FundingHistoryPoint[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: '1', type: 'funding', condition: 'Funding < 0%', value: 0, triggered: false, active: true },
    { id: '2', type: 'support', condition: 'Price < $85,000', value: 85000, triggered: false, active: true },
    { id: '3', type: 'resistance', condition: 'Price > $95,000', value: 95000, triggered: false, active: true },
    { id: '4', type: 'funding', condition: 'Funding > 0.03%', value: 0.0003, triggered: false, active: true },
  ])

  // Initialize client-side data
  useEffect(() => {
    setMounted(true)
    setMarketData(getMockMarketData())
    setFundingHistory(generateMockFundingHistory())
  }, [])

  // Simulate real-time updates
  useEffect(() => {
    if (!mounted) return
    
    const interval = setInterval(() => {
      const newData = getMockMarketData()
      setMarketData(newData)
      
      // Add new funding point every update (simulating real-time)
      setFundingHistory(prev => {
        const newPoint: FundingHistoryPoint = {
          timestamp: new Date().toISOString(),
          rate: newData.fundingRate,
          time: new Date().toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit',
            hour12: false 
          })
        }
        // Keep last 21 points
        return [...prev.slice(-20), newPoint]
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [mounted])

  const toggleAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a))
  }, [])

  const removeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }, [])

  // Use default data during SSR to avoid hydration mismatch
  const displayMarketData = marketData || {
    price: 92450,
    change24h: 0,
    high24h: 94200,
    low24h: 91800,
    volume24h: 28.5,
    fundingRate: 0.01,
    nextFunding: '02:14:33',
    markPrice: 92480,
  }

  // Determine signal statuses
  const fundingStatus = displayMarketData.fundingRate > 0.0001 ? 'bullish' : displayMarketData.fundingRate > 0 ? 'neutral' : 'bearish'
  const priceStatus = displayMarketData.price > 95000 ? 'bullish' : displayMarketData.price < 85000 ? 'bearish' : 'neutral'
  const trendStatus = displayMarketData.change24h > 1 ? 'bullish' : displayMarketData.change24h < -1 ? 'bearish' : 'neutral'

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-transparent" />
      
      {/* Grid pattern */}
      <div 
        className="fixed inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="relative z-10 px-4 pt-24 pb-8 max-w-7xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex gap-3 mb-6">
          <div className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-gray-900">
            <span>₿</span>
            <span>BTC Strategy</span>
          </div>
          <Link
            href="/btc/spx"
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            <span>📈</span>
            <span>SPX Influence</span>
          </Link>
        </div>

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">₿</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">BTC Neutral Strategy</h1>
              <p className="text-gray-500">Funding Rate Arbitrage Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-gray-500">Live • Updates every 3s</span>
          </div>
        </motion.div>

        {/* Signal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <SignalCard
            title="Funding Rate"
            value={`${(displayMarketData.fundingRate * 100).toFixed(4)}%`}
            status={fundingStatus}
            description={fundingStatus === 'bullish' ? 'Strong positive - shorts receive payment' : fundingStatus === 'neutral' ? 'Weak positive - minimal profit' : 'Negative - close positions'}
          />
          <SignalCard
            title="Price Zone"
            value={`$${Math.round(displayMarketData.price).toLocaleString()}`}
            status={priceStatus}
            description={priceStatus === 'neutral' ? 'Safe trading range' : priceStatus === 'bullish' ? 'Near resistance - watch for rejection' : 'Near support - caution advised'}
          />
          <SignalCard
            title="24h Trend"
            value={`${displayMarketData.change24h >= 0 ? '+' : ''}${displayMarketData.change24h.toFixed(2)}%`}
            status={trendStatus}
            description={trendStatus === 'bullish' ? 'Bullish momentum' : trendStatus === 'bearish' ? 'Bearish pressure' : 'Consolidating'}
          />
        </div>

        {/* Funding Rate History Chart */}
        {fundingHistory.length > 1 && (
          <div className="mb-8">
            <FundingRateChart history={fundingHistory} currentRate={displayMarketData.fundingRate} />
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <PriceDisplay data={displayMarketData} />
            <FundingRateCard data={displayMarketData} />
          </div>

          {/* Center Column */}
          <div className="space-y-6">
            <StrategyDecision data={displayMarketData} />
            <AlertManager alerts={alerts} onToggle={toggleAlert} onRemove={removeAlert} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <ArbitrageCalculator />
            
            {/* Key Levels */}
            <div className="bg-gray-900/80 rounded-2xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">📍 Key Levels</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-400" />
                    <span className="text-gray-400">Resistance</span>
                  </div>
                  <span className="font-mono text-rose-400">$95,000</span>
                </div>
                <div className="relative h-24 bg-gray-800/50 rounded-lg overflow-hidden">
                  <div 
                    className="absolute inset-x-0 h-1 bg-rose-400/50"
                    style={{ top: '10%' }}
                  />
                  <div 
                    className="absolute inset-x-0 h-1 bg-emerald-400/50"
                    style={{ bottom: '10%' }}
                  />
                  <motion.div 
                    className="absolute inset-x-0 h-0.5 bg-amber-400"
                    animate={{
                      top: `${100 - ((displayMarketData.price - 85000) / (95000 - 85000)) * 80 - 10}%`
                    }}
                    transition={{ duration: 0.5 }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-gray-500">Current: ${Math.round(displayMarketData.price).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-gray-400">Support</span>
                  </div>
                  <span className="font-mono text-emerald-400">$85,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TradingView Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* BTC Price Chart */}
          <div className="bg-gray-900/80 rounded-2xl p-4 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>📈</span> BTC/USDT Chart
            </h3>
            <TradingViewChart symbol="BINANCE:BTCUSDT" height={400} theme="dark" />
          </div>

          {/* Technical Analysis */}
          <div className="bg-gray-900/80 rounded-2xl p-4 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>🔬</span> Technical Analysis
            </h3>
            <TradingViewTechnicalAnalysis symbol="BINANCE:BTCUSDT" height={400} theme="dark" />
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-xs text-gray-600">
            ⚠️ This is a strategy tool only. Not financial advice. Always DYOR.
          </p>
          <p className="text-xs text-gray-700 mt-1">
            Data shown is simulated. Connect to Binance API for real-time data.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
