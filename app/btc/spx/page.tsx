'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { TradingViewChart } from '@/components/TradingViewWidget'

interface SPXData {
  price: number
  change24h: number
  changeWeek: number
  changeMonth: number
  high52w: number
  low52w: number
  vix: number
  vixChange: number
  marketStatus: 'open' | 'closed' | 'pre-market' | 'after-hours'
  correlation30d: number
  correlation7d: number
}

interface BTCData {
  price: number
  change24h: number
}

const getMockSPXData = (): SPXData => {
  const hour = new Date().getHours()
  const isWeekend = [0, 6].includes(new Date().getDay())
  let marketStatus: 'open' | 'closed' | 'pre-market' | 'after-hours' = 'closed'
  
  if (!isWeekend) {
    if (hour >= 9 && hour < 16) marketStatus = 'open'
    else if (hour >= 4 && hour < 9) marketStatus = 'pre-market'
    else if (hour >= 16 && hour < 20) marketStatus = 'after-hours'
  }

  return {
    price: 5890 + Math.random() * 20 - 10,
    change24h: -0.3 + Math.random() * 0.8,
    changeWeek: -1.2 + Math.random() * 2,
    changeMonth: 2.5 + Math.random() * 1.5,
    high52w: 6100,
    low52w: 4950,
    vix: 16 + Math.random() * 4,
    vixChange: -2 + Math.random() * 4,
    marketStatus,
    correlation30d: 0.72 + Math.random() * 0.1,
    correlation7d: 0.65 + Math.random() * 0.15,
  }
}

const getMockBTCData = (): BTCData => ({
  price: 92450 + Math.random() * 500 - 250,
  change24h: -1.2 + Math.random() * 2,
})

export default function SPXInfluencePage() {
  const [mounted, setMounted] = useState(false)
  const [spxData, setSPXData] = useState<SPXData | null>(null)
  const [btcData, setBTCData] = useState<BTCData | null>(null)

  useEffect(() => {
    setMounted(true)
    setSPXData(getMockSPXData())
    setBTCData(getMockBTCData())
  }, [])

  useEffect(() => {
    if (!mounted) return
    const interval = setInterval(() => {
      setSPXData(getMockSPXData())
      setBTCData(getMockBTCData())
    }, 5000)
    return () => clearInterval(interval)
  }, [mounted])

  const displaySPX = spxData || {
    price: 5890, change24h: 0, changeWeek: 0, changeMonth: 0,
    high52w: 6100, low52w: 4950, vix: 16, vixChange: 0,
    marketStatus: 'closed' as const, correlation30d: 0.72, correlation7d: 0.65,
  }
  
  const displayBTC = btcData || { price: 92450, change24h: 0 }

  const correlationStatus = displaySPX.correlation30d > 0.7 ? 'high' : displaySPX.correlation30d > 0.4 ? 'moderate' : 'low'
  const vixStatus = displaySPX.vix > 25 ? 'high' : displaySPX.vix > 18 ? 'elevated' : 'low'
  
  const marketStatusColors = {
    'open': 'bg-emerald-400',
    'closed': 'bg-gray-500',
    'pre-market': 'bg-amber-400',
    'after-hours': 'bg-blue-400'
  }

  const marketStatusLabels = {
    'open': 'Market Open',
    'closed': 'Market Closed',
    'pre-market': 'Pre-Market',
    'after-hours': 'After Hours'
  }

  let btcOutlook: 'bullish' | 'bearish' | 'neutral' = 'neutral'
  let outlookDescription = ''
  
  if (displaySPX.correlation30d > 0.6) {
    if (displaySPX.change24h > 0.5) {
      btcOutlook = 'bullish'
      outlookDescription = 'SPX rising with high correlation — BTC likely to follow'
    } else if (displaySPX.change24h < -0.5) {
      btcOutlook = 'bearish'
      outlookDescription = 'SPX falling with high correlation — BTC may follow down'
    } else {
      outlookDescription = 'SPX flat — BTC may consolidate'
    }
  } else {
    outlookDescription = 'Low correlation period — BTC moving independently'
  }

  if (displaySPX.vix > 25) {
    outlookDescription += '. High VIX = elevated fear — risk-off environment'
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent" />
      
      <div className="relative z-10 px-4 pt-24 pb-8 max-w-7xl mx-auto">
        {/* Navigation */}
        <div className="flex gap-3 mb-6">
          <Link
            href="/btc"
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            <span>₿</span>
            <span>BTC Strategy</span>
          </Link>
          <div className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
            <span>📈</span>
            <span>SPX Influence</span>
          </div>
        </div>

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">S</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">SPX Influence on BTC</h1>
              <p className="text-gray-500">Track how S&P 500 affects Bitcoin</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-xs text-gray-500">Live • Updates every 5s</span>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* SPX & VIX Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SPX Price Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/80 rounded-2xl p-6 border border-gray-800"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">S</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">S&P 500</h2>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${marketStatusColors[displaySPX.marketStatus]}`} />
                    <span className="text-xs text-gray-500">{marketStatusLabels[displaySPX.marketStatus]}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-end gap-4 mb-6">
                <span className="text-4xl font-mono font-bold text-white">
                  {displaySPX.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`text-lg font-semibold ${displaySPX.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {displaySPX.change24h >= 0 ? '+' : ''}{displaySPX.change24h.toFixed(2)}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Week</span>
                  <p className={`font-mono ${displaySPX.changeWeek >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {displaySPX.changeWeek >= 0 ? '+' : ''}{displaySPX.changeWeek.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Month</span>
                  <p className={`font-mono ${displaySPX.changeMonth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {displaySPX.changeMonth >= 0 ? '+' : ''}{displaySPX.changeMonth.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">52W High</span>
                  <p className="font-mono text-emerald-400">{displaySPX.high52w.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-500">52W Low</span>
                  <p className="font-mono text-rose-400">{displaySPX.low52w.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>

            {/* VIX Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900/80 rounded-2xl p-6 border border-gray-800"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  vixStatus === 'high' ? 'bg-gradient-to-br from-rose-400 to-red-500' :
                  vixStatus === 'elevated' ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                  'bg-gradient-to-br from-emerald-400 to-green-500'
                }`}>
                  <span className="text-lg font-bold text-white">V</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">VIX (Fear Index)</h2>
                  <span className={`text-xs ${
                    vixStatus === 'high' ? 'text-rose-400' :
                    vixStatus === 'elevated' ? 'text-amber-400' :
                    'text-emerald-400'
                  }`}>
                    {vixStatus === 'high' ? '⚠️ High Volatility' :
                     vixStatus === 'elevated' ? '📊 Elevated' :
                     '✓ Low / Calm'}
                  </span>
                </div>
              </div>

              <div className="flex items-end gap-4 mb-6">
                <span className={`text-4xl font-mono font-bold ${
                  vixStatus === 'high' ? 'text-rose-400' :
                  vixStatus === 'elevated' ? 'text-amber-400' :
                  'text-emerald-400'
                }`}>
                  {displaySPX.vix.toFixed(2)}
                </span>
                <span className={`text-lg font-semibold ${displaySPX.vixChange >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {displaySPX.vixChange >= 0 ? '+' : ''}{displaySPX.vixChange.toFixed(2)}%
                </span>
              </div>

              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-2">VIX Levels Guide</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-emerald-400">0-15</span>
                    <span className="text-gray-500">Low fear, bullish</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-amber-400">15-25</span>
                    <span className="text-gray-500">Normal range</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-rose-400">25+</span>
                    <span className="text-gray-500">High fear, volatile</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Correlation Analysis */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/80 rounded-2xl p-6 border border-gray-800"
          >
            <h3 className="text-lg font-semibold text-white mb-4">📊 BTC-SPX Correlation</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                <div className="text-xs text-gray-500 mb-1">30-Day Correlation</div>
                <div className={`text-3xl font-mono font-bold ${
                  displaySPX.correlation30d > 0.7 ? 'text-emerald-400' :
                  displaySPX.correlation30d > 0.4 ? 'text-amber-400' :
                  'text-gray-400'
                }`}>
                  {(displaySPX.correlation30d * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {correlationStatus === 'high' ? 'Highly Correlated' :
                   correlationStatus === 'moderate' ? 'Moderately Correlated' :
                   'Weakly Correlated'}
                </div>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                <div className="text-xs text-gray-500 mb-1">7-Day Correlation</div>
                <div className={`text-3xl font-mono font-bold ${
                  displaySPX.correlation7d > 0.7 ? 'text-emerald-400' :
                  displaySPX.correlation7d > 0.4 ? 'text-amber-400' :
                  'text-gray-400'
                }`}>
                  {(displaySPX.correlation7d * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-gray-500 mt-1">Recent trend</div>
              </div>

              <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                <div className="text-xs text-gray-500 mb-1">BTC Beta to SPX</div>
                <div className="text-3xl font-mono font-bold text-blue-400">
                  {(1.2 + Math.random() * 0.3).toFixed(2)}x
                </div>
                <div className="text-xs text-gray-500 mt-1">BTC moves faster</div>
              </div>
            </div>

            {/* Side by side comparison */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-4 border border-amber-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">₿</span>
                  <span className="text-sm font-semibold text-white">Bitcoin</span>
                </div>
                <div className="text-2xl font-mono font-bold text-white mb-1">
                  ${displayBTC.price.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
                <div className={`text-sm font-semibold ${displayBTC.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {displayBTC.change24h >= 0 ? '+' : ''}{displayBTC.change24h.toFixed(2)}%
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl p-4 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">📈</span>
                  <span className="text-sm font-semibold text-white">S&P 500</span>
                </div>
                <div className="text-2xl font-mono font-bold text-white mb-1">
                  {displaySPX.price.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
                <div className={`text-sm font-semibold ${displaySPX.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {displaySPX.change24h >= 0 ? '+' : ''}{displaySPX.change24h.toFixed(2)}%
                </div>
              </div>
            </div>
          </motion.div>

          {/* BTC Outlook */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/80 rounded-2xl p-6 border border-gray-800"
          >
            <h3 className="text-lg font-semibold text-white mb-4">🎯 BTC Outlook (Based on SPX)</h3>
            
            <div className={`rounded-xl p-6 text-center mb-4 ${
              btcOutlook === 'bullish' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
              btcOutlook === 'bearish' ? 'bg-gradient-to-r from-rose-500 to-rose-600' :
              'bg-gradient-to-r from-gray-600 to-gray-700'
            }`}>
              <span className="text-2xl font-bold text-white">
                {btcOutlook === 'bullish' ? '📈 BULLISH BIAS' :
                 btcOutlook === 'bearish' ? '📉 BEARISH BIAS' :
                 '➡️ NEUTRAL / WATCH'}
              </span>
            </div>

            <p className="text-sm text-gray-400 mb-4">{outlookDescription}</p>

            <div className="border-t border-gray-700 pt-4">
              <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Key Factors</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={displaySPX.change24h > 0 ? 'text-emerald-400' : displaySPX.change24h < 0 ? 'text-rose-400' : 'text-gray-400'}>
                    {displaySPX.change24h > 0 ? '✓' : displaySPX.change24h < 0 ? '✗' : '→'}
                  </span>
                  <span className="text-sm text-gray-400">SPX daily trend: {displaySPX.change24h >= 0 ? 'positive' : 'negative'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={displaySPX.vix < 20 ? 'text-emerald-400' : displaySPX.vix < 25 ? 'text-amber-400' : 'text-rose-400'}>
                    {displaySPX.vix < 20 ? '✓' : displaySPX.vix < 25 ? '⚠' : '✗'}
                  </span>
                  <span className="text-sm text-gray-400">VIX level: {displaySPX.vix.toFixed(1)} ({vixStatus})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={displaySPX.correlation30d > 0.6 ? 'text-emerald-400' : 'text-amber-400'}>
                    {displaySPX.correlation30d > 0.6 ? '✓' : '⚠'}
                  </span>
                  <span className="text-sm text-gray-400">
                    Correlation: {(displaySPX.correlation30d * 100).toFixed(0)}% ({correlationStatus})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={displaySPX.marketStatus === 'open' ? 'text-emerald-400' : 'text-gray-400'}>
                    {displaySPX.marketStatus === 'open' ? '✓' : '○'}
                  </span>
                  <span className="text-sm text-gray-400">
                    US Market: {marketStatusLabels[displaySPX.marketStatus]}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Trading Insight */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl p-4 border border-blue-500/20"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">SPX Trading Insight</h4>
                <p className="text-xs text-gray-400">
                  {displaySPX.marketStatus === 'open' 
                    ? 'US market is open. Watch for SPX movements to impact BTC in real-time. Major moves in SPX often lead BTC by 15-30 minutes.'
                    : displaySPX.marketStatus === 'pre-market'
                    ? 'Pre-market session active. SPX futures indicate market sentiment. BTC may react to significant overnight moves.'
                    : displaySPX.marketStatus === 'after-hours'
                    ? 'After-hours trading active. Lower liquidity may cause exaggerated moves. BTC often trades more independently.'
                    : 'US market closed. BTC typically shows lower correlation during weekends/holidays. Watch Asian markets for direction.'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* TradingView Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* BTC Chart */}
          <div className="bg-gray-900/80 rounded-2xl p-4 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>₿</span> BTC/USDT Chart
            </h3>
            <TradingViewChart symbol="BINANCE:BTCUSDT" height={350} theme="dark" />
          </div>

          {/* ETH Chart for Comparison */}
          <div className="bg-gray-900/80 rounded-2xl p-4 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>Ξ</span> ETH/USDT Chart (Correlation)
            </h3>
            <TradingViewChart symbol="BINANCE:ETHUSDT" height={350} theme="dark" />
          </div>
        </motion.div>

        {/* Market Info Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <div className="bg-blue-900/30 rounded-2xl p-4 border border-blue-700/50">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <h4 className="text-white font-semibold mb-1">SPX & VIX Charts</h4>
                <p className="text-gray-400 text-sm">
                  S&P 500 (SPX) and VIX charts require TradingView Pro access. 
                  Visit <a href="https://tradingview.com/chart/?symbol=SP:SPX" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">TradingView</a> for live SPX/VIX charts.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-xs text-gray-600">
            ⚠️ This is a correlation tool only. Not financial advice. Always DYOR.
          </p>
          <p className="text-xs text-gray-700 mt-1">
            Data shown is simulated. Connect to real market data APIs for accurate information.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
