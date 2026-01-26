'use client'

import { useEffect, useRef, memo } from 'react'

interface TradingViewChartProps {
  symbol?: string
  height?: number
  theme?: 'dark' | 'light'
}

function TradingViewChartComponent({ 
  symbol = 'BINANCE:BTCUSDT', 
  height = 400,
  theme = 'dark'
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Clear previous widget
    containerRef.current.innerHTML = ''

    // Create script for the advanced chart widget
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      symbol: symbol,
      interval: 'D',
      width: '100%',
      height: height,
      theme: theme,
      style: '1',
      locale: 'en',
      toolbar_bg: theme === 'dark' ? '#1a1a2e' : '#ffffff',
      enable_publishing: false,
      hide_side_toolbar: false,
      allow_symbol_change: true,
      withdateranges: true,
      hide_volume: false,
      support_host: 'https://www.tradingview.com',
    })

    containerRef.current.appendChild(script)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [symbol, height, theme])

  return (
    <div 
      ref={containerRef} 
      className="tradingview-widget-container rounded-xl overflow-hidden"
      style={{ minHeight: height }}
    />
  )
}

// Mini chart widget for smaller displays
function TradingViewMiniChartComponent({
  symbol = 'BINANCE:BTCUSDT',
  height = 220,
  theme = 'dark'
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    containerRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      symbol: symbol,
      width: '100%',
      height: height,
      locale: 'en',
      dateRange: '1M',
      colorTheme: theme,
      isTransparent: true,
      autosize: true,
      largeChartUrl: '',
      chartOnly: false,
    })

    containerRef.current.appendChild(script)
  }, [symbol, height, theme])

  return (
    <div 
      ref={containerRef}
      className="tradingview-widget-container"
      style={{ minHeight: height }}
    />
  )
}

// Ticker tape for price ribbon
function TradingViewTickerTapeComponent({ theme = 'dark' }: { theme?: 'dark' | 'light' }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    containerRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: 'BINANCE:BTCUSDT', title: 'BTC/USDT' },
        { proName: 'BINANCE:ETHUSDT', title: 'ETH/USDT' },
        { proName: 'SP:SPX', title: 'S&P 500' },
        { proName: 'CBOE:VIX', title: 'VIX' },
        { proName: 'FX:EURUSD', title: 'EUR/USD' },
        { proName: 'COMEX:GC1!', title: 'Gold' },
      ],
      showSymbolLogo: true,
      colorTheme: theme,
      isTransparent: true,
      displayMode: 'adaptive',
      locale: 'en',
    })

    containerRef.current.appendChild(script)
  }, [theme])

  return (
    <div 
      ref={containerRef}
      className="tradingview-widget-container"
    />
  )
}

// Technical analysis widget
function TradingViewTechnicalAnalysisComponent({
  symbol = 'BINANCE:BTCUSDT',
  height = 400,
  theme = 'dark'
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    containerRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      interval: '1D',
      width: '100%',
      height: height,
      symbol: symbol,
      showIntervalTabs: true,
      locale: 'en',
      colorTheme: theme,
      isTransparent: true,
    })

    containerRef.current.appendChild(script)
  }, [symbol, height, theme])

  return (
    <div 
      ref={containerRef}
      className="tradingview-widget-container"
      style={{ minHeight: height }}
    />
  )
}

// Export memoized components
export const TradingViewChart = memo(TradingViewChartComponent)
export const TradingViewMiniChart = memo(TradingViewMiniChartComponent)
export const TradingViewTickerTape = memo(TradingViewTickerTapeComponent)
export const TradingViewTechnicalAnalysis = memo(TradingViewTechnicalAnalysisComponent)
