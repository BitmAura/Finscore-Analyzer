'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface ParticleData {
  id: number
  initialX: number
  initialY: number
  animateX: number
  animateY: number
  duration: number
}

export default function AnimatedParticles() {
  const [particles, setParticles] = useState<ParticleData[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Generate particles data only on client side to avoid hydration mismatch
    const particleData = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      initialX: Math.random() * 1200,
      initialY: Math.random() * 800,
      animateX: Math.random() * 1200,
      animateY: Math.random() * 800,
      duration: Math.random() * 10 + 10,
    }))
    setParticles(particleData)
  }, [])

  if (!isClient) {
    return null // Return nothing during SSR
  }

  return (
    <div className="absolute inset-0 opacity-5">
      <div className="absolute top-0 left-0 w-full h-full">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-2 h-2 bg-blue-500 rounded-full"
            initial={{
              x: particle.initialX,
              y: particle.initialY,
            }}
            animate={{
              x: particle.animateX,
              y: particle.animateY,
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>
    </div>
  )
}