'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'

interface MobileOptimizedAnimationProps {
  children: React.ReactNode
  className?: string
  reduceMotion?: boolean
}

export function MobileOptimizedAnimation({ 
  children, 
  className = '',
  reduceMotion = false 
}: MobileOptimizedAnimationProps) {
  const [isMobile, setIsMobile] = useState(false)
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const animationVariants = {
    hidden: { 
      opacity: 0, 
      y: isMobile ? 20 : 60,
      scale: isMobile ? 0.98 : 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: isMobile ? 0.4 : 0.6,
        ease: "easeOut"
      }
    }
  }

  if (reduceMotion || (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
    return <div ref={ref} className={className}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={animationVariants}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface TouchOptimizedButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  variant?: 'primary' | 'secondary' | 'outline'
  disabled?: boolean
}

export function TouchOptimizedButton({ 
  children, 
  onClick, 
  className = '',
  variant = 'primary',
  disabled = false
}: TouchOptimizedButtonProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const variants = {
    primary: 'bg-blue-600 text-white border-2 border-blue-600',
    secondary: 'bg-gray-100 text-gray-900 border-2 border-gray-200',
    outline: 'bg-transparent text-blue-600 border-2 border-blue-600'
  }

  return (
    <motion.button
      whileTap={{ 
        scale: isMobile ? 0.98 : 0.95,
        transition: { duration: 0.1 }
      }}
      whileHover={!isMobile ? { 
        scale: 1.02,
        transition: { duration: 0.2 }
      } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]}
        px-6 py-3 rounded-lg font-semibold
        ${isMobile ? 'min-h-[48px] text-base' : 'min-h-[44px] text-sm'}
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-95 touch-manipulation
        ${className}
      `}
    >
      {children}
    </motion.button>
  )
}

interface SwipeableCardProps {
  children: React.ReactNode
  onSwipe?: (direction: 'left' | 'right') => void
  className?: string
}

export function SwipeableCard({ 
  children, 
  onSwipe, 
  className = '' 
}: SwipeableCardProps) {
  const [isSwiping, setIsSwiping] = useState(false)

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.3}
      onDragStart={() => setIsSwiping(true)}
      onDragEnd={(_, info) => {
        setIsSwiping(false)
        const swipeThreshold = 100
        
        if (info.offset.x > swipeThreshold && onSwipe) {
          onSwipe('right')
        } else if (info.offset.x < -swipeThreshold && onSwipe) {
          onSwipe('left')
        }
      }}
      whileDrag={{ 
        scale: 0.98,
        rotateZ: isSwiping ? 2 : 0
      }}
      className={`
        touch-pan-x select-none
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  threshold?: number
}

export function PullToRefresh({ 
  onRefresh, 
  children, 
  threshold = 80 
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.1}
      onDrag={(_, info) => {
        if (info.offset.y > 0) {
          setPullDistance(Math.min(info.offset.y, threshold * 1.5))
        }
      }}
      onDragEnd={async (_, info) => {
        if (info.offset.y > threshold && !isRefreshing) {
          setIsRefreshing(true)
          await onRefresh()
          setIsRefreshing(false)
        }
        setPullDistance(0)
      }}
      style={{
        y: pullDistance
      }}
      className="w-full"
    >
      {pullDistance > 0 && (
        <motion.div 
          className="flex justify-center py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: pullDistance / threshold }}
        >
          <div className={`
            w-8 h-8 border-2 border-blue-500 rounded-full
            ${pullDistance > threshold ? 'animate-spin border-t-transparent' : ''}
          `} />
        </motion.div>
      )}
      {children}
    </motion.div>
  )
}

export function MobileNavigation({ 
  isOpen, 
  onToggle 
}: { 
  isOpen: boolean
  onToggle: () => void 
}) {
  return (
    <>
      {/* Mobile Menu Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          className="w-6 h-0.5 bg-gray-700 mb-1.5"
        />
        <motion.div
          animate={{ opacity: isOpen ? 0 : 1 }}
          className="w-6 h-0.5 bg-gray-700 mb-1.5"
        />
        <motion.div
          animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -8 : 0 }}
          className="w-6 h-0.5 bg-gray-700"
        />
      </motion.button>

      {/* Mobile Menu Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className={`
          fixed inset-0 bg-black/50 z-40 md:hidden
          ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}
        `}
        onClick={onToggle}
      />

      {/* Mobile Menu Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="fixed top-0 right-0 w-80 h-full bg-white shadow-xl z-50 md:hidden overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-semibold">Menu</h2>
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              ✕
            </button>
          </div>
          
          <nav className="space-y-4">
            <a href="#features" className="block py-3 text-lg hover:text-blue-600 transition-colors">
              Features
            </a>
            <a href="#reports" className="block py-3 text-lg hover:text-blue-600 transition-colors">
              Reports
            </a>
            <a href="#pricing" className="block py-3 text-lg hover:text-blue-600 transition-colors">
              Pricing
            </a>
            <div className="pt-4 border-t">
              <TouchOptimizedButton className="w-full">
                Start Free Trial
              </TouchOptimizedButton>
            </div>
          </nav>
        </div>
      </motion.div>
    </>
  )
}