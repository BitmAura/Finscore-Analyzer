'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/auth?error=callback_error')
          return
        }

        if (data.session) {
          // Check if user profile exists
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single()

          // If no profile exists, create one
          if (!profile) {
            const { error: profileError } = await supabase
              .from('user_profiles')
              .insert([
                {
                  id: data.session.user.id,
                  email: data.session.user.email!,
                  full_name: data.session.user.user_metadata?.full_name || 
                             data.session.user.user_metadata?.name || 
                             'User',
                  subscription_tier: 'free'
                }
              ])

            if (profileError) {
              console.error('Error creating profile:', profileError)
            }
          }

          router.push('/dashboard')
        } else {
          router.push('/auth')
        }
      } catch (error) {
        console.error('Unexpected error:', error)
        router.push('/auth?error=unexpected')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  )
}