'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

interface ScrollRevealProps {
  children: React.ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  className?: string
}

export function ScrollReveal({ 
  children, 
  delay = 0, 
  direction = 'up',
  className = '' 
}: ScrollRevealProps) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  })
  const controls = useAnimation()

  const directions = {
    up: { y: 60 },
    down: { y: -60 },
    left: { x: 60 },
    right: { x: -60 }
  }

  useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [inView, controls])

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      transition={{ 
        duration: 0.8, 
        delay,
        ease: [0.16, 1, 0.3, 1]
      }}
      variants={{
        hidden: { 
          opacity: 0, 
          ...directions[direction]
        },
        visible: { 
          opacity: 1, 
          x: 0,
          y: 0
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface StaggeredRevealProps {
  children: React.ReactNode[]
  staggerDelay?: number
  className?: string
}

export function StaggeredReveal({ 
  children, 
  staggerDelay = 0.1,
  className = '' 
}: StaggeredRevealProps) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  return (
    <div ref={ref} className={className}>
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ 
            duration: 0.6,
            delay: index * staggerDelay,
            ease: [0.16, 1, 0.3, 1]
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  )
}

interface HoverEffectProps {
  children: React.ReactNode
  scale?: number
  rotate?: number
  className?: string
}

export function HoverEffect({ 
  children, 
  scale = 1.05,
  rotate = 2,
  className = '' 
}: HoverEffectProps) {
  return (
    <motion.div
      whileHover={{ 
        scale,
        rotate,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      whileTap={{ scale: 0.95 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface FloatingElementProps {
  children: React.ReactNode
  intensity?: number
  speed?: number
  className?: string
}

export function FloatingElement({ 
  children, 
  intensity = 20,
  speed = 4,
  className = '' 
}: FloatingElementProps) {
  return (
    <motion.div
      animate={{
        y: [-intensity/2, intensity/2, -intensity/2],
        x: [-intensity/4, intensity/4, -intensity/4],
      }}
      transition={{
        duration: speed,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface PulseGlowProps {
  children: React.ReactNode
  color?: string
  intensity?: number
  className?: string
}

export function PulseGlow({ 
  children, 
  color = '#3B82F6',
  intensity = 20,
  className = '' 
}: PulseGlowProps) {
  return (
    <motion.div
      className={`animate-pulse-glow ${className}`}
      whileHover={{
        scale: 1.05
      }}
      transition={{
        duration: 0.3
      }}
    >
      {children}
    </motion.div>
  )
}

interface TypewriterProps {
  text: string
  speed?: number
  className?: string
  onComplete?: () => void
}

export function Typewriter({ 
  text, 
  speed = 50,
  className = '',
  onComplete
}: TypewriterProps) {
  return (
    <motion.span
      initial={{ width: 0 }}
      animate={{ width: "100%" }}
      transition={{
        duration: text.length * speed / 1000,
        ease: "linear"
      }}
      onAnimationComplete={onComplete}
      className={`inline-block overflow-hidden whitespace-nowrap ${className}`}
    >
      {text}
    </motion.span>
  )
}

interface CountUpProps {
  from: number
  to: number
  duration?: number
  className?: string
  prefix?: string
  suffix?: string
}

export function CountUp({ 
  from, 
  to, 
  duration = 2,
  className = '',
  prefix = '',
  suffix = ''
}: CountUpProps) {
  const [count, setCount] = useState(from)
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true
  })

  useEffect(() => {
    if (inView) {
      const timer = setInterval(() => {
        setCount(prev => {
          const increment = (to - from) / (duration * 10)
          const next = prev + increment
          return next >= to ? to : next
        })
      }, 100)

      setTimeout(() => {
        setCount(to)
        clearInterval(timer)
      }, duration * 1000)

      return () => clearInterval(timer)
    }
  }, [inView, from, to, duration])

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {prefix}{Math.floor(count).toLocaleString()}{suffix}
    </motion.span>
  )
}