'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DirectLoginTest() {
  const [email, setEmail] = useState('admin@finscore.com')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const router = useRouter()

  const performDirectLogin = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      console.log('🚀 [DIRECT LOGIN] Starting direct authentication...')
      
      // Call our direct authentication API
      const response = await fetch('/api/direct-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      
      const data = await response.json()
      console.log('🚀 [DIRECT LOGIN] Response:', data)
      
      setResult(data)
      
      if (data.success) {
        console.log('✅ [DIRECT LOGIN] Authentication successful!')
        console.log('✅ [DIRECT LOGIN] Redirecting to dashboard...')
        
        // Wait a moment for cookie to be set
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh();
        }, 1000);

      } else {
        console.log('❌ [DIRECT LOGIN] Authentication failed:', data.error)
      }
      
    } catch (error) {
      console.error('❌ [DIRECT LOGIN] Error:', error)
      setResult({ success: false, error: 'Network error' })
    } finally {
      setLoading(false)
    }
  }

  const testSession = async () => {
    try {
      console.log('🔍 [SESSION TEST] Checking current session...')
      
      const response = await fetch('/api/direct-auth/session')
      const data = await response.json()
      
      console.log('🔍 [SESSION TEST] Session data:', data)
      setResult((prev: any) => ({ ...prev, sessionCheck: data }))
      
    } catch (error) {
      console.error('❌ [SESSION TEST] Error:', error)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
            🚀 Direct Authentication Test
          </h2>
          <p className="mt-2 text-sm text-center text-gray-600">
            Bypassing NextAuth for reliable login
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={(e) => { e.preventDefault(); performDirectLogin(); }}>
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md group hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? `🔄 Authenticating...` : `🚀 Direct Login`}
            </button>
            
            <button
              type="button"
              onClick={testSession}
              className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md group hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              🔍 Test Current Session
            </button>
          </div>
        </form>

        {/* Results */}
        {result && (
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="mb-2 text-lg font-semibold">
              {result.success ? '✅ Success' : '❌ Failed'}
            </h3>
            <pre className="p-2 overflow-auto text-xs bg-gray-100 rounded max-h-48">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {/* Direct Navigation Test */}
        <div className="p-4 rounded-lg bg-blue-50">
          <h3 className="mb-2 text-lg font-semibold">Direct Navigation</h3>
          <div className="space-y-2">
            <button
              onClick={() => router.push('/analyst-dashboard')}
              className="w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Go to Dashboard (Test Protection)
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 rounded-lg bg-yellow-50">
          <h3 className="mb-2 text-lg font-semibold">🎯 Instructions</h3>
          <ul className="space-y-1 text-sm">
            <li>1. Click 🚀 Direct Login to authenticate</li>
            <li>2. Check console for detailed logs</li>
            <li>3. It should redirect to dashboard automatically</li>
            <li>4. Use 🔍 Test Current Session to verify</li>
          </ul>
        </div>
      </div>
    </div>
  )
}