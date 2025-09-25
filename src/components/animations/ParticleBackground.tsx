'use client'

import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  hue: number
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>()
  const mouseRef = useRef({ x: 0, y: 0 })
  const inViewRef = useRef<boolean>(true)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const createParticles = () => {
      const particles: Particle[] = []
      const isSmall = window.innerWidth < 640
      // Reduce particle count on small screens and when reduced motion is preferred
      const maxParticles = prefersReducedMotion ? 0 : (isSmall ? 30 : 80)
      const particleCount = Math.min(maxParticles, Math.floor(window.innerWidth / (isSmall ? 30 : 20)))
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          id: i,
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.5 + 0.2,
          hue: Math.random() * 60 + 200 // Blue to purple range
        })
      }
      
      particlesRef.current = particles
    }

    const updateParticles = () => {
      const particles = particlesRef.current
      const mouse = mouseRef.current

      particles.forEach(particle => {
        // Update position
        particle.x += particle.speedX
        particle.y += particle.speedY

        // Mouse interaction - attract particles to mouse
        const dx = mouse.x - particle.x
        const dy = mouse.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (!prefersReducedMotion && distance < 150) {
          const force = (150 - distance) / 150
          particle.speedX += (dx / distance) * force * 0.01
          particle.speedY += (dy / distance) * force * 0.01
        }

        // Boundary collision
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.speedX *= -1
          particle.x = Math.max(0, Math.min(canvas.width, particle.x))
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.speedY *= -1
          particle.y = Math.max(0, Math.min(canvas.height, particle.y))
        }

        // Gradual speed dampening
        particle.speedX *= 0.99
        particle.speedY *= 0.99
      })
    }

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const particles = particlesRef.current

      // Draw connections between nearby particles
      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (!prefersReducedMotion && distance < 120) {
            const opacity = (120 - distance) / 120 * 0.2
            ctx.strokeStyle = `hsla(${particle.hue}, 70%, 60%, ${opacity})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.stroke()
          }
        })
      })

      // Draw particles
      particles.forEach(particle => {
        ctx.fillStyle = `hsla(${particle.hue}, 70%, 60%, ${particle.opacity})`
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()

        // Add glow effect (skip on reduced motion for performance)
        if (!prefersReducedMotion) {
          ctx.shadowColor = `hsla(${particle.hue}, 70%, 60%, 0.8)`
          ctx.shadowBlur = 10
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0
        }
      })
    }

    const animate = () => {
      if (inViewRef.current && document.visibilityState === 'visible') {
        updateParticles()
        drawParticles()
      }
      animationRef.current = requestAnimationFrame(animate)
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    }

    const handleResize = () => {
      resizeCanvas()
      createParticles()
    }

    // Initialize
    resizeCanvas()
    createParticles()
    if (!prefersReducedMotion) {
      animate()
    } else {
      // Draw a single frame for a subtle static background
      drawParticles()
    }

    // Event listeners
    window.addEventListener('resize', handleResize)
    canvas.addEventListener('mousemove', handleMouseMove)
    const io = new IntersectionObserver((entries) => {
      inViewRef.current = entries[0]?.isIntersecting ?? true
    })
    io.observe(canvas)
    const handleVisibility = () => {
      // No-op; animate loop checks visibilityState
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('resize', handleResize)
      canvas.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('visibilitychange', handleVisibility)
      io.disconnect()
    }
  }, [prefersReducedMotion])

  return (
    <motion.canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration:  prefersReducedMotion ? 0.3 : 2 }}
      style={{ 
        background: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.03) 0%, transparent 50%)'
      }}
    />
  )
}

export default ParticleBackground