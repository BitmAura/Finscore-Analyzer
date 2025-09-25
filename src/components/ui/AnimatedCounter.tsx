'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
}

export function AnimatedCounter({ value, duration = 2, prefix = '', suffix = '', className = '' }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    let start = 0
    let end = value
    let startTime: number | null = null
    if (prefersReducedMotion) {
      setDisplayValue(end)
      return
    }
    function animateCounter(timestamp: number) {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / ((prefersReducedMotion ? 0.2 : duration) * 1000), 1)
      setDisplayValue(Math.floor(progress * (end - start) + start))
      if (progress < 1) {
        requestAnimationFrame(animateCounter)
      } else {
        setDisplayValue(end)
      }
    }
    requestAnimationFrame(animateCounter)
    return () => setDisplayValue(end)
  }, [value, duration, prefersReducedMotion])

  return (
    <motion.span
      className={`font-bold text-4xl md:text-5xl text-blue-700 ${className}`}
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0.2 : 0.8 }}
    >
      {prefix}{displayValue.toLocaleString()}{suffix}
    </motion.span>
  )
}

export default AnimatedCounter;
