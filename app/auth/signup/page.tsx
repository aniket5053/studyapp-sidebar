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
import { CheckCircle2, XCircle } from 'lucide-react'

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    university: '',
    major: '',
    year: '',
  })
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  })
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string) => {
    return passwordValidation.length && 
           passwordValidation.uppercase && 
           passwordValidation.lowercase && 
           passwordValidation.number
  }

  useEffect(() => {
    const password = formData.password
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
    })
  }, [formData.password])

  useEffect(() => {
    if (formData.confirmPassword) {
      setPasswordsMatch(formData.password === formData.confirmPassword)
    } else {
      setPasswordsMatch(null)
    }
  }, [formData.password, formData.confirmPassword])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validate email
    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid email address')
      setIsLoading(false)
      return
    }

    // Validate password
    if (!validatePassword(formData.password)) {
      toast.error('Password does not meet all requirements')
      setIsLoading(false)
      return
    }

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      setIsLoading(false)
      return
    }

    // Validate required fields
    if (!formData.name || !formData.university || !formData.major || !formData.year) {
      toast.error('Please fill in all required fields')
      setIsLoading(false)
      return
    }

    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            university: formData.university,
            major: formData.major,
            year: formData.year,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (authError) {
        console.error('Auth error:', authError)
        if (authError.message.includes('User already registered')) {
          toast.error('This email is already registered. Please sign in instead.')
        } else if (authError.message.includes('Password')) {
          toast.error('Password is too weak. Please make it stronger.')
        } else {
          toast.error(`Failed to create account: ${authError.message}`)
        }
        setIsLoading(false)
        return
      }

      if (!authData.user) {
        console.error('No user data returned from auth signup')
        toast.error('Failed to create account. Please try again.')
        setIsLoading(false)
        return
      }

      console.log('Auth successful, handling profile for user:', authData.user.id)

      // First check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authData.user.id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking profile:', checkError)
        toast.error('Failed to create profile. Please try again.')
        setIsLoading(false)
        return
      }

      let profileError = null

      if (!existingProfile) {
        // Profile doesn't exist, create it
        const { error: insertError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            name: formData.name,
            university: formData.university,
            major: formData.major,
            year: formData.year,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'id'
          })
        profileError = insertError
      } else {
        // Profile exists, update it
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            name: formData.name,
            university: formData.university,
            major: formData.major,
            year: formData.year,
            updated_at: new Date().toISOString(),
          })
          .eq('id', authData.user.id)
        profileError = updateError
      }

      if (profileError) {
        console.error('Profile operation error details:', {
          error: profileError,
          user: authData.user.id,
          profileData: {
            name: formData.name,
            university: formData.university,
            major: formData.major,
            year: formData.year,
          }
        })
        
        toast.error('Account created but profile setup failed. Please try signing in and updating your profile.')
        router.push('/auth/login')
        return
      }

      toast.success('Account created successfully! Please check your email for verification.')
      router.push('/auth/login')
    } catch (error: any) {
      console.error('Unexpected error during signup:', {
        error,
        errorMessage: error.message,
        errorStack: error.stack,
        formData: {
          email: formData.email,
          name: formData.name,
          university: formData.university,
          major: formData.major,
          year: formData.year,
        }
      })
      toast.error('An unexpected error occurred. Please try again or contact support.')
    } finally {
      setIsLoading(false)
    }
  }

  const ValidationIcon = ({ isValid }: { isValid: boolean }) => {
    return isValid ? (
      <CheckCircle2 className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="university">University</Label>
              <Input
                id="university"
                name="university"
                type="text"
                placeholder="Enter your university"
                value={formData.university}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="major">Major</Label>
              <Input
                id="major"
                name="major"
                type="text"
                placeholder="Enter your major"
                value={formData.major}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <select
                id="year"
                name="year"
                className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={formData.year}
                onChange={handleInputChange}
                required
              >
                <option value="">Select your year</option>
                <option value="Freshman">Freshman</option>
                <option value="Sophomore">Sophomore</option>
                <option value="Junior">Junior</option>
                <option value="Senior">Senior</option>
                <option value="Graduate">Graduate</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={8}
              />
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <ValidationIcon isValid={passwordValidation.length} />
                  <span>At least 8 characters long</span>
                </div>
                <div className="flex items-center gap-2">
                  <ValidationIcon isValid={passwordValidation.uppercase} />
                  <span>Contains uppercase letter</span>
                </div>
                <div className="flex items-center gap-2">
                  <ValidationIcon isValid={passwordValidation.lowercase} />
                  <span>Contains lowercase letter</span>
                </div>
                <div className="flex items-center gap-2">
                  <ValidationIcon isValid={passwordValidation.number} />
                  <span>Contains number</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
              {formData.confirmPassword && (
                <div className="flex items-center gap-2 text-sm">
                  <ValidationIcon isValid={passwordsMatch || false} />
                  <span className={passwordsMatch ? 'text-green-500' : 'text-red-500'}>
                    {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                  </span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !validatePassword(formData.password) || !passwordsMatch}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>

            <div className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 