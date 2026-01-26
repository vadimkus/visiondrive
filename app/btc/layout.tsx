import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BTC Neutral Strategy | VisionDrive',
  description: 'Bitcoin funding rate arbitrage calculator and alert system for daily trading. Track signals, calculate profits, and execute delta-neutral strategies.',
  keywords: 'bitcoin trading, BTC arbitrage, funding rate, neutral strategy, crypto trading, Binance',
  openGraph: {
    title: 'BTC Neutral Strategy Dashboard',
    description: 'Professional Bitcoin trading tool for funding rate arbitrage',
    type: 'website',
  },
}

export default function BTCLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
