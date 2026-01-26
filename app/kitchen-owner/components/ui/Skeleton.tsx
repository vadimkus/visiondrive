'use client'

import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

export default function Skeleton({ 
  className = '', 
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse'
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700'
  
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-2xl',
  }

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: '',
    none: '',
  }

  const style = {
    width: width,
    height: height,
  }

  if (animation === 'wave') {
    return (
      <div 
        className={`${baseClasses} ${variantClasses[variant]} ${className} overflow-hidden relative`}
        style={style}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ 
            repeat: Infinity, 
            duration: 1.5,
            ease: 'easeInOut',
          }}
        />
      </div>
    )
  }

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  )
}

// Pre-built skeleton components for common patterns
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`p-4 rounded-2xl bg-white dark:bg-[#1c1c1e] ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="circular" className="w-10 h-10" />
        <div className="flex-1">
          <Skeleton variant="text" className="w-3/4 mb-2" />
          <Skeleton variant="text" className="w-1/2 h-3" />
        </div>
      </div>
      <Skeleton variant="rounded" className="w-full h-20 mb-3" />
      <div className="flex gap-2">
        <Skeleton variant="rounded" className="flex-1 h-8" />
        <Skeleton variant="rounded" className="flex-1 h-8" />
      </div>
    </div>
  )
}

export function SkeletonSensorCard({ className = '' }: { className?: string }) {
  return (
    <div className={`w-[160px] flex-shrink-0 rounded-2xl p-4 bg-white dark:bg-[#1c1c1e] ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <Skeleton variant="circular" className="w-8 h-8" />
        <Skeleton variant="text" className="w-8 h-3" />
      </div>
      <Skeleton variant="text" className="w-16 h-8 mb-2" />
      <Skeleton variant="text" className="w-full h-4 mb-1" />
      <Skeleton variant="text" className="w-2/3 h-3 mb-3" />
      <Skeleton variant="rounded" className="w-full h-1" />
    </div>
  )
}

export function SkeletonAlertItem({ className = '' }: { className?: string }) {
  return (
    <div className={`px-4 py-3.5 flex items-center gap-3 ${className}`}>
      <Skeleton variant="circular" className="w-10 h-10 flex-shrink-0" />
      <div className="flex-1">
        <Skeleton variant="text" className="w-3/4 mb-2" />
        <Skeleton variant="text" className="w-1/2 h-3" />
      </div>
      <div className="text-right">
        <Skeleton variant="text" className="w-12 h-3 mb-1.5" />
        <Skeleton variant="text" className="w-16 h-4" />
      </div>
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="px-4 py-4">
      {/* Greeting */}
      <div className="mb-5">
        <Skeleton variant="text" className="w-32 h-4 mb-2" />
        <Skeleton variant="text" className="w-48 h-8" />
      </div>
      
      {/* Status Card */}
      <Skeleton variant="rounded" className="w-full h-44 mb-5" />
      
      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Skeleton variant="rounded" className="h-24" />
        <Skeleton variant="rounded" className="h-24" />
        <Skeleton variant="rounded" className="h-24" />
      </div>
      
      {/* Sensors Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <Skeleton variant="text" className="w-28 h-5" />
          <Skeleton variant="text" className="w-16 h-4" />
        </div>
        <div className="flex gap-3 overflow-hidden">
          <SkeletonSensorCard />
          <SkeletonSensorCard />
          <SkeletonSensorCard />
        </div>
      </div>
      
      {/* Alerts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Skeleton variant="text" className="w-28 h-5" />
          <Skeleton variant="text" className="w-16 h-4" />
        </div>
        <div className="rounded-2xl overflow-hidden bg-white dark:bg-[#1c1c1e]">
          <SkeletonAlertItem />
          <SkeletonAlertItem />
        </div>
      </div>
    </div>
  )
}
