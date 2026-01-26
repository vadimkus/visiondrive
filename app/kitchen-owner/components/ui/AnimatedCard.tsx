'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
  delay?: number
  enableTap?: boolean
}

export default function AnimatedCard({ 
  children, 
  delay = 0,
  enableTap = true,
  className = '',
  ...props 
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94], // Apple easing
      }}
      whileTap={enableTap ? { scale: 0.97 } : undefined}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Animated list item for stagger effects
interface AnimatedListItemProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
  index?: number
}

export function AnimatedListItem({ 
  children, 
  index = 0,
  className = '',
  ...props 
}: AnimatedListItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Animated number counter
interface AnimatedNumberProps {
  value: number
  className?: string
  duration?: number
  suffix?: string
  prefix?: string
}

export function AnimatedNumber({ 
  value, 
  className = '',
  duration = 0.8,
  suffix = '',
  prefix = '',
}: AnimatedNumberProps) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {prefix}
      </motion.span>
      <motion.span
        initial={{ filter: 'blur(10px)' }}
        animate={{ filter: 'blur(0px)' }}
        transition={{ duration }}
      >
        {value}
      </motion.span>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: duration * 0.5 }}
      >
        {suffix}
      </motion.span>
    </motion.span>
  )
}

// Animated badge with scale effect
interface AnimatedBadgeProps {
  children: ReactNode
  className?: string
  show?: boolean
}

export function AnimatedBadge({ 
  children, 
  className = '',
  show = true,
}: AnimatedBadgeProps) {
  return (
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      animate={show ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 25,
      }}
      className={className}
    >
      {children}
    </motion.span>
  )
}
