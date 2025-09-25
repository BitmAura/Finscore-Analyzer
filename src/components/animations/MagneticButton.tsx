'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useSpring, useMotionValue, useTransform, useReducedMotion } from 'framer-motion'
import { ReactNode } from 'react'

interface MagneticButtonProps {
  children: ReactNode
  strength?: number
  range?: number
  className?: string
  onClick?: () => void
}

export function MagneticButton({ 
  children, 
  strength = 0.3, 
  range = 200,
  className = '',
  onClick 
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const isTouchDevice = typeof window !== 'undefined' && matchMedia('(hover: none)').matches
  
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const x = useSpring(0, { stiffness: 300, damping: 30 })
  const y = useSpring(0, { stiffness: 300, damping: 30 })
  
  const scale = useSpring(1, { stiffness: 400, damping: 25 })
  const rotate = useSpring(0, { stiffness: 300, damping: 30 })
  
  // Transform values for magnetic effect
  const magneticX = useTransform(mouseX, [-range, range], [-strength * 100, strength * 100])
  const magneticY = useTransform(mouseY, [-range, range], [-strength * 100, strength * 100])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current || prefersReducedMotion || isTouchDevice) return
      
      const rect = ref.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      const deltaX = e.clientX - centerX
      const deltaY = e.clientY - centerY
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      
      if (distance < range) {
        mouseX.set(deltaX)
        mouseY.set(deltaY)
        
        if (isHovered) {
          x.set(deltaX * strength)
          y.set(deltaY * strength)
          rotate.set((deltaX / range) * 10) // Subtle rotation based on mouse position
        }
      } else {
        mouseX.set(0)
        mouseY.set(0)
        x.set(0)
        y.set(0)
        rotate.set(0)
      }
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY, x, y, rotate, strength, range, isHovered, prefersReducedMotion, isTouchDevice])

  const handleMouseEnter = () => {
    if (prefersReducedMotion || isTouchDevice) return
    setIsHovered(true)
    scale.set(1.05)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    scale.set(1)
    x.set(0)
    y.set(0)
    rotate.set(0)
  }

  return (
    <motion.button
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={{
        x,
        y,
        scale,
        rotate
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
    >
      {/* Animated background glow */}
      <motion.div
        className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0"
        animate={{
          opacity: (prefersReducedMotion || isTouchDevice) ? 0 : (isHovered ? 0.2 : 0),
          scale: (prefersReducedMotion || isTouchDevice) ? 1 : (isHovered ? 1.1 : 1)
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Ripple effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-lg"
        animate={{
          boxShadow: (prefersReducedMotion || isTouchDevice) ? '0 0 0 rgba(0,0,0,0)' : (isHovered 
            ? '0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(147, 51, 234, 0.2)' 
            : '0 0 0px rgba(59, 130, 246, 0)')
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
        animate={{
          x: (prefersReducedMotion || isTouchDevice) ? '0%' : (isHovered ? ['0%', '100%'] : '0%'),
          opacity: (prefersReducedMotion || isTouchDevice) ? 0 : (isHovered ? [0, 0.1, 0] : 0)
        }}
        transition={{
          x: { duration: 1.5, ease: "easeInOut" },
          opacity: { duration: 1.5, ease: "easeInOut" }
        }}
      />
      
      {/* Content */}
      <motion.div
        className="relative z-10"
        animate={{
          y: (prefersReducedMotion || isTouchDevice) ? 0 : (isHovered ? -2 : 0)
        }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </motion.button>
  )
}

// Enhanced floating elements with 3D transforms
interface Enhanced3DFloatingProps {
  children: ReactNode
  intensity?: number
  speed?: number
  rotationIntensity?: number
  className?: string
}

export function Enhanced3DFloating({ 
  children, 
  intensity = 20, 
  speed = 2,
  rotationIntensity = 5,
  className = ''
}: Enhanced3DFloatingProps) {
  const [isHovered, setIsHovered] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const isTouchDevice = typeof window !== 'undefined' && matchMedia('(hover: none)').matches
  
  return (
    <motion.div
      className={`transform-gpu ${className}`}
      animate={{
        y: prefersReducedMotion ? 0 : [-intensity, intensity, -intensity],
        rotateX: prefersReducedMotion ? 0 : [-rotationIntensity, rotationIntensity, -rotationIntensity],
        rotateY: prefersReducedMotion ? 0 : [-rotationIntensity/2, rotationIntensity/2, -rotationIntensity/2],
      }}
      transition={{
        duration: prefersReducedMotion ? 0 : speed * 2,
        repeat: prefersReducedMotion ? 0 : Infinity,
        ease: "easeInOut"
      }}
      whileHover={{
        scale: (prefersReducedMotion || isTouchDevice) ? 1 : 1.05,
        rotateX: (prefersReducedMotion || isTouchDevice) ? 0 : 15,
        rotateY: (prefersReducedMotion || isTouchDevice) ? 0 : 15,
        z: (prefersReducedMotion || isTouchDevice) ? 0 : 50
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000
      }}
    >
      <motion.div
        animate={{
          boxShadow: (prefersReducedMotion || isTouchDevice)
            ? '0 10px 20px rgba(0, 0, 0, 0.05)'
            : (isHovered
              ? '0 25px 50px rgba(0, 0, 0, 0.15), 0 0 30px rgba(59, 130, 246, 0.1)'
              : '0 10px 30px rgba(0, 0, 0, 0.1)')
        }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

export default MagneticButton