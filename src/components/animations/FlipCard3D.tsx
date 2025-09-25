'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ReactNode } from 'react'

interface FlipCard3DProps {
  frontContent: ReactNode
  backContent: ReactNode
  className?: string
  flipDirection?: 'horizontal' | 'vertical'
  autoFlip?: boolean
  flipDuration?: number
}

export function FlipCard3D({ 
  frontContent, 
  backContent, 
  className = '',
  flipDirection = 'horizontal',
  autoFlip = false,
  flipDuration = 0.6
}: FlipCard3DProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const isTouchDevice = typeof window !== 'undefined' && matchMedia('(hover: none)').matches

  const flipVariants = {
    front: {
      rotateY: flipDirection === 'horizontal' ? 0 : 0,
      rotateX: flipDirection === 'vertical' ? 0 : 0,
    },
    back: {
      rotateY: flipDirection === 'horizontal' ? 180 : 0,
      rotateX: flipDirection === 'vertical' ? 180 : 0,
    }
  }

  const handleClick = () => {
    // Always allow tap/click to flip; reduce duration via prefersReducedMotion above
    if (!autoFlip) {
      setIsFlipped(!isFlipped)
    }
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (prefersReducedMotion || isTouchDevice) return
    if (autoFlip) {
      setIsFlipped(true)
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (prefersReducedMotion || isTouchDevice) return
    if (autoFlip) {
      setIsFlipped(false)
    }
  }

  return (
    <motion.div
      className={`relative w-full h-full cursor-pointer ${className}`}
      style={{ perspective: 1000 }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={{ 
        scale: (prefersReducedMotion || isTouchDevice) ? 1 : 1.05,
        z: (prefersReducedMotion || isTouchDevice) ? 0 : 20
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Card Container */}
      <motion.div
        className="relative w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
        }}
        animate={isFlipped ? 'back' : 'front'}
        variants={flipVariants}
        transition={{ 
          duration: prefersReducedMotion ? 0.2 : flipDuration, 
          ease: [0.25, 0.46, 0.45, 0.94] 
        }}
      >
        {/* Front Side */}
        <motion.div
          className="absolute inset-0 w-full h-full backface-hidden rounded-xl overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
          animate={{
            boxShadow: isHovered 
              ? '0 20px 40px rgba(0, 0, 0, 0.15), 0 0 20px rgba(59, 130, 246, 0.1)'
              : '0 10px 30px rgba(0, 0, 0, 0.08)'
          }}
          transition={{ duration: 0.3 }}
        >
          {frontContent}
        </motion.div>

        {/* Back Side */}
        <motion.div
          className="absolute inset-0 w-full h-full backface-hidden rounded-xl overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: flipDirection === 'horizontal' ? 'rotateY(180deg)' : 'rotateX(180deg)'
          }}
          animate={{
            boxShadow: isHovered 
              ? '0 20px 40px rgba(0, 0, 0, 0.15), 0 0 20px rgba(147, 51, 234, 0.1)'
              : '0 10px 30px rgba(0, 0, 0, 0.08)'
          }}
          transition={{ duration: 0.3 }}
        >
          {backContent}
        </motion.div>
      </motion.div>

      {/* Flip Indicator */}
      <motion.div
        className="absolute top-4 right-4 z-20 w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
        animate={{
          opacity: isHovered ? 1 : 0.6,
          scale: isHovered ? 1.1 : 1
        }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="w-3 h-3 border-2 border-white rounded-sm"
          animate={{
            rotateY: isFlipped ? 180 : 0
          }}
          transition={{ duration: prefersReducedMotion ? 0.2 : flipDuration }}
        />
      </motion.div>

      {/* Tap to flip hint (touch devices only) */}
      {isTouchDevice && !isFlipped && (
        <motion.div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 px-2.5 py-1 rounded-full bg-black/40 text-white text-[10px] font-medium tracking-wide backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: prefersReducedMotion ? 0.7 : [0.4, 0.8, 0.4] }}
          transition={{ duration: prefersReducedMotion ? 0.2 : 2, repeat: prefersReducedMotion ? 0 : Infinity }}
        >
          Tap to flip
        </motion.div>
      )}
    </motion.div>
  )
}

// Tilt Card Component with mouse tracking
interface TiltCardProps {
  children: ReactNode
  className?: string
  tiltIntensity?: number
  glareEffect?: boolean
}

export function TiltCard({ 
  children, 
  className = '',
  tiltIntensity = 15,
  glareEffect = true
}: TiltCardProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const isTouchDevice = typeof window !== 'undefined' && matchMedia('(hover: none)').matches

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setMousePosition({ x, y })
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setMousePosition({ x: 0.5, y: 0.5 })
  }

  const effectiveIntensity = prefersReducedMotion || isTouchDevice ? 0 : tiltIntensity
  const tiltX = isHovered ? (mousePosition.y - 0.5) * effectiveIntensity : 0
  const tiltY = isHovered ? (mousePosition.x - 0.5) * -effectiveIntensity : 0

  return (
    <motion.div
      className={`relative transform-gpu ${className}`}
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d'
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: tiltX,
        rotateY: tiltY,
        scale: isHovered ? 1.02 : 1
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }}
    >
      {children}
      
      {/* Glare Effect */}
      {glareEffect && !prefersReducedMotion && !isTouchDevice && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background: `radial-gradient(
              circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, 
              rgba(255, 255, 255, 0.1) 0%, 
              transparent 50%
            )`
          }}
          animate={{
            opacity: isHovered ? 1 : 0
          }}
          transition={{ duration: 0.2 }}
        />
      )}
    </motion.div>
  )
}

export default FlipCard3D