'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MinimalAuth() {
  const [email, setEmail] = useState('admin@finscore.com')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const router = useRouter()

  const testAuth = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      console.log('🟡 Making direct call to auth callback')
      
      // Direct API call to test authentication
      const response = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email,
          password,
          callbackUrl: '/dashboard',
          redirect: 'false'
        })
      })
      
      console.log('🟡 Response status:', response.status)
      console.log('🟡 Response headers:', Object.fromEntries(response.headers.entries()))
      
      const text = await response.text()
      console.log('🟡 Response body:', text)
      
      setResult({
        status: response.status,
        body: text,
        headers: Object.fromEntries(response.headers.entries())
      })
      
      if (response.ok) {
        // Test session endpoint
        const sessionResponse = await fetch('/api/auth/session')
        const sessionData = await sessionResponse.json()
        console.log('🟡 Session data:', sessionData)
        
        setResult((prev: any) => ({
          ...prev,
          session: sessionData
        }))
      }
      
    } catch (error) {
      console.error('🟡 Auth test error:', error)
      setResult({
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Minimal Auth Test
          </h2>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <button
              onClick={testAuth}
              disabled={loading}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Authentication'}
            </button>
          </div>
        </div>
        
        {result && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Result</h3>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}