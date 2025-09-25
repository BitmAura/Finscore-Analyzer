'use client'

import React, { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { motion } from 'framer-motion'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface ChartProps {
  type: 'line' | 'bar' | 'doughnut'
  title: string
  data: any
  options?: any
  height?: number
}

export const RealTimeChart: React.FC<ChartProps> = ({
  type,
  title,
  data,
  options = {},
  height = 300
}) => {
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#e5e7eb',
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: title,
        color: '#f9fafb',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: type !== 'doughnut' ? {
      x: {
        ticks: {
          color: '#9ca3af'
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        }
      },
      y: {
        ticks: {
          color: '#9ca3af'
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        }
      }
    } : {},
    ...options
  }

  const renderChart = () => {
    switch (type) {
      case 'line':
        return <Line data={data} options={defaultOptions} height={height} />
      case 'bar':
        return <Bar data={data} options={defaultOptions} height={height} />
      case 'doughnut':
        return <Doughnut data={data} options={defaultOptions} height={height} />
      default:
        return <Line data={data} options={defaultOptions} height={height} />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full p-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl"
    >
      <div className="relative" style={{ height: `${height}px` }}>
        {isAnimating && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800/70 rounded-lg z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
        {renderChart()}
      </div>
    </motion.div>
  )
}