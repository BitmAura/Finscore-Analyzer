import React from 'react'
import Link from 'next/link';

export default function Debug() {
  const currentTime = new Date().toLocaleString()
  
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: 'green' }}>✅ Next.js is Working!</h1>
      <div style={{ marginTop: '20px' }}>
        <p><strong>Time:</strong> {currentTime}</p>
        <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
        <p><strong>React Version:</strong> {React.version || 'React is working'}</p>
      </div>
      <div style={{ marginTop: '20px' }}>
        <Link href="/" style={{ 
          padding: '10px 20px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          textDecoration: 'none',
          borderRadius: '5px'
        }}>
          Back to Home
        </Link>
      </div>
    </div>
  )
}