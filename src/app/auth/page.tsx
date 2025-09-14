'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { AuthModal } from '../../components/auth/AuthModal'
import { useAuth } from '../../hooks/useAuth'

function AuthPageInner() {
  const [isModalOpen, setIsModalOpen] = useState(true)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      router.push('/dashboard')
      return
    }

    // Check for error from callback
    const error = searchParams.get('error')
    if (error) {
      console.error('Auth error:', error)
    }

    // Check if should show signup
    const mode = searchParams.get('mode')
    if (mode === 'signup') {
      setAuthMode('signup')
    }
  }, [user, router, searchParams])

  const handleCloseModal = () => {
    setIsModalOpen(false)
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            y: [-20, 20, -20],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            y: [20, -20, 20],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl"
        />
      </div>

      <AuthModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-600">Loading…</div>}>
      <AuthPageInner />
    </Suspense>
  )
}