'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ReactNode } from 'react'

interface SkeletonLoaderProps {
  width?: string
  height?: string
  radius?: string
  className?: string
  children?: ReactNode
}

export function SkeletonLoader({ width = '100%', height = '1.5rem', radius = '0.75rem', className = '', children }: SkeletonLoaderProps) {
  const prefersReducedMotion = useReducedMotion()
  return (
    <motion.div
      className={`bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 ${!prefersReducedMotion ? 'animate-pulse shimmer' : ''} rounded-lg ${className}`}
      style={{ width, height, borderRadius: radius }}
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      transition={{ duration: prefersReducedMotion ? 0.2 : 0.8, repeat: prefersReducedMotion ? 0 : Infinity, repeatType: 'reverse' }}
    >
      {children}
    </motion.div>
  )
}

export default SkeletonLoader;
