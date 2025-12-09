'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  suffix?: string
  prefix?: string
  decimals?: number
  duration?: number
  className?: string
}

export default function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  duration = 2,
  className = '',
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref as React.RefObject<Element>, { once: true, margin: '-100px' })
  const [displayValue, setDisplayValue] = useState(0)
  const [opacity, setOpacity] = useState(0)
  const [translateY, setTranslateY] = useState(20)

  useEffect(() => {
    if (isInView) {
      setOpacity(1)
      setTranslateY(0)
    }
  }, [isInView])

  useEffect(() => {
    if (!isInView) return

    const startTime = Date.now()
    const startValue = 0
    const endValue = value

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / (duration * 1000), 1)
      
      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = startValue + (endValue - startValue) * eased
      
      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setDisplayValue(endValue)
      }
    }

    animate()
  }, [isInView, value, duration])

  const formatNumber = (num: number) => {
    return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  return (
    <span 
      ref={ref} 
      className={className}
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
        display: 'inline-block',
      }}
    >
      {prefix}
      {formatNumber(displayValue)}
      {suffix}
    </span>
  )
}

