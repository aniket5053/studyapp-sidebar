'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [cooldownTime, setCooldownTime] = useState(0)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Add cooldown timer effect
  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setInterval(() => {
        setCooldownTime(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [cooldownTime])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isLoading || cooldownTime > 0) return // Prevent multiple submissions
    
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        console.error('Login error:', error)
        
        // Handle specific error cases
        if (error.message.includes('429') || error.message.includes('rate limit')) {
          setCooldownTime(30) // Set 30 second cooldown
          toast.error('Too many login attempts. Please wait 30 seconds before trying again.')
        } else if (error.message.includes('Invalid login credentials')) {
          setCooldownTime(5) // Set 5 second cooldown for invalid credentials
          toast.error('Invalid email or password')
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please verify your email before signing in')
        } else {
          toast.error(`Login failed: ${error.message}`)
        }
        return
      }

      if (data?.user) {
        toast.success('Logged in successfully!')
        router.push('/')
        router.refresh()
      }
    } catch (error: any) {
      console.error('Unexpected error during login:', error)
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Sign in to your account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading || cooldownTime > 0}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading || cooldownTime > 0}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || cooldownTime > 0}
            >
              {isLoading ? 'Signing in...' : cooldownTime > 0 ? `Please wait ${cooldownTime}s` : 'Sign in'}
            </Button>

            {cooldownTime > 0 && (
              <div className="text-center text-sm text-red-500">
                Please wait {cooldownTime} seconds before trying again
              </div>
            )}

            <div className="text-center text-sm text-slate-500">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 