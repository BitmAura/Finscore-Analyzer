'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface GlassMorphismCardProps {
  children: ReactNode
  className?: string
  variant?: 'light' | 'dark'
  onClick?: () => void
}

export function GlassMorphismCard({ 
  children, 
  className = '',
  variant = 'light',
  onClick
}: GlassMorphismCardProps) {
  const baseClasses = variant === 'light' 
    ? 'glass-morphism' 
    : 'glass-morphism-dark'
    
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      onClick={onClick}
      className={`${baseClasses} rounded-xl p-6 ${className}`}
    >
      {children}
    </motion.div>
  )
}

interface NeonButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'accent'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
  href?: string
}

export function NeonButton({ 
  children, 
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  href
}: NeonButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white',
    secondary: 'bg-gradient-to-r from-purple-500 to-pink-600 text-white',
    accent: 'bg-gradient-to-r from-green-500 to-teal-600 text-white'
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  // If href is provided, render a Link-styled button for client-side navigation
  if (href) {
    // Use a motion.div wrapper for hover/tap animations and a Link for navigation
    // We avoid nesting interactive elements improperly.
    const content = (
      <span className="relative z-10">{children}</span>
    )
    return (
      <motion.div
        whileHover={!disabled ? { scale: 1.05 } : {}}
        whileTap={!disabled ? { scale: 0.95 } : {}}
        className={className}
      >
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href={href}
          onClick={onClick}
          className={`
            ${variants[variant]}
            ${sizes[size]}
            rounded-lg font-semibold transition-all duration-300
            hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
            relative overflow-hidden inline-flex items-center justify-center
          `}
          aria-disabled={disabled}
        >
          <span className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-200" />
          {content}
        </a>
      </motion.div>
    )
  }

  return (
    <motion.button
      whileHover={!disabled ? { 
        scale: 1.05
      } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      disabled={disabled}
      onClick={onClick}
      className={`
        ${variants[variant]} 
        ${sizes[size]}
        rounded-lg font-semibold transition-all duration-300
        hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
        relative overflow-hidden
        ${className}
      `}
    >
      <motion.div
        className="absolute inset-0 bg-white opacity-0"
        whileHover={!disabled ? { opacity: 0.1 } : {}}
        transition={{ duration: 0.2 }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  hoverEffect?: boolean
  delay?: number
}

export function AnimatedCard({ 
  children, 
  className = '',
  hoverEffect = true,
  delay = 0
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: [0.16, 1, 0.3, 1]
      }}
      whileHover={hoverEffect ? {
        y: -8,
        transition: { duration: 0.2 }
      } : {}}
      className={`
        bg-white rounded-xl shadow-lg border border-gray-100
        transition-all duration-300
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}

interface GradientTextProps {
  children: ReactNode
  gradient?: string
  className?: string
}

export function GradientText({ 
  children, 
  gradient = 'from-blue-600 to-purple-600',
  className = ''
}: GradientTextProps) {
  return (
    <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  )
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
  className?: string
}

export function LoadingSpinner({ 
  size = 'md',
  color = 'border-blue-500',
  className = ''
}: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={`
        ${sizes[size]}
        border-2 border-gray-200 ${color} border-t-transparent
        rounded-full
        ${className}
      `}
    />
  )
}

interface ParticleBackgroundProps {
  className?: string
  particleCount?: number
}

export function ParticleBackground({ 
  className = '',
  particleCount = 50
}: ParticleBackgroundProps) {
  const particles = Array.from({ length: particleCount }, (_, i) => i)

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle}
          className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-20"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  )
}

interface ProgressBarProps {
  progress: number
  className?: string
  showLabel?: boolean
  animated?: boolean
}

export function ProgressBar({ 
  progress, 
  className = '',
  showLabel = true,
  animated = true
}: ProgressBarProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-2">
        {showLabel && (
          <span className="text-sm text-gray-600">Progress</span>
        )}
        {showLabel && (
          <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={animated ? { duration: 1, ease: "easeOut" } : { duration: 0 }}
        />
      </div>
    </div>
  )
}

interface TooltipProps {
  children: ReactNode
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export function Tooltip({ 
  children, 
  content,
  position = 'top',
  className = ''
}: TooltipProps) {
  const positions = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  }

  return (
    <div className={`relative group ${className}`}>
      {children}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileHover={{ opacity: 1, scale: 1 }}
        className={`
          absolute ${positions[position]}
          bg-gray-900 text-white text-sm rounded-lg px-3 py-2
          pointer-events-none opacity-0 group-hover:opacity-100
          transition-all duration-200 z-50
          whitespace-nowrap
        `}
      >
        {content}
        <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45" />
      </motion.div>
    </div>
  )
}