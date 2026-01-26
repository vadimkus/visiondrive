'use client'

import { useState, useRef, useCallback, ReactNode } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { RefreshCw } from 'lucide-react'

interface PullToRefreshProps {
  children: ReactNode
  onRefresh: () => Promise<void>
  className?: string
  threshold?: number
}

export default function PullToRefresh({ 
  children, 
  onRefresh, 
  className = '',
  threshold = 80 
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const pulling = useRef(false)
  
  const y = useMotionValue(0)
  const pullProgress = useTransform(y, [0, threshold], [0, 1])
  const rotation = useTransform(y, [0, threshold], [0, 180])
  const indicatorOpacity = useTransform(y, [0, 30, threshold], [0, 1, 1])
  const indicatorScale = useTransform(y, [0, threshold * 0.5, threshold], [0.8, 1, 1])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isRefreshing) return
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY
      pulling.current = true
    }
  }, [isRefreshing])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling.current || isRefreshing) return
    
    const currentY = e.touches[0].clientY
    const diff = currentY - startY.current
    
    if (diff > 0 && containerRef.current?.scrollTop === 0) {
      // Apply resistance for natural feel
      const resistance = 0.4
      const pullDistance = Math.min(diff * resistance, threshold * 1.5)
      y.set(pullDistance)
      
      // Prevent default scroll when pulling
      if (diff > 10) {
        e.preventDefault()
      }
    }
  }, [isRefreshing, threshold, y])

  const handleTouchEnd = useCallback(async () => {
    if (!pulling.current) return
    pulling.current = false
    
    const currentY = y.get()
    
    if (currentY >= threshold && !isRefreshing) {
      // Trigger refresh
      setIsRefreshing(true)
      animate(y, 60, { duration: 0.2 })
      
      try {
        await onRefresh()
      } finally {
        // Reset after refresh
        setTimeout(() => {
          animate(y, 0, { 
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94]
          })
          setIsRefreshing(false)
        }, 300)
      }
    } else {
      // Snap back
      animate(y, 0, { 
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      })
    }
  }, [threshold, isRefreshing, onRefresh, y])

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Pull indicator */}
      <motion.div 
        className="absolute left-1/2 -translate-x-1/2 z-10 flex items-center justify-center"
        style={{ 
          top: -40,
          y,
          opacity: indicatorOpacity,
          scale: indicatorScale,
        }}
      >
        <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center">
          <motion.div style={{ rotate: isRefreshing ? 0 : rotation }}>
            <RefreshCw 
              className={`w-5 h-5 text-orange-500 ${isRefreshing ? 'animate-spin' : ''}`}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        ref={containerRef}
        style={{ y }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="h-full overflow-y-auto scroll-touch"
      >
        {children}
      </motion.div>
    </div>
  )
}
