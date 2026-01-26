'use client'

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection'

interface HapticFeedback {
  trigger: (type?: HapticType) => void
  isSupported: boolean
}

/**
 * Hook for haptic feedback on supported devices
 * Uses Vibration API where available
 */
export function useHaptic(): HapticFeedback {
  const isSupported = typeof window !== 'undefined' && 'vibrate' in navigator

  const patterns: Record<HapticType, number | number[]> = {
    light: 10,
    medium: 25,
    heavy: 50,
    success: [10, 50, 10],
    warning: [20, 30, 20],
    error: [50, 30, 50, 30, 50],
    selection: 5,
  }

  const trigger = (type: HapticType = 'light') => {
    if (!isSupported) return
    
    try {
      navigator.vibrate(patterns[type])
    } catch (e) {
      // Silently fail if vibration not available
    }
  }

  return { trigger, isSupported }
}

/**
 * Simple haptic utility for one-off use
 */
export function haptic(type: HapticType = 'light') {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) return
  
  const patterns: Record<HapticType, number | number[]> = {
    light: 10,
    medium: 25,
    heavy: 50,
    success: [10, 50, 10],
    warning: [20, 30, 20],
    error: [50, 30, 50, 30, 50],
    selection: 5,
  }
  
  try {
    navigator.vibrate(patterns[type])
  } catch (e) {
    // Silently fail
  }
}
