'use client'

import { useEffect, useState } from 'react'
import { testConnection } from '@/lib/test-connection'

export default function TestConnection() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function checkConnection() {
      try {
        const result = await testConnection()
        setStatus(result ? 'success' : 'error')
        setMessage(result ? 'Successfully connected to Supabase!' : 'Failed to connect to Supabase')
      } catch (err) {
        setStatus('error')
        setMessage('Error testing connection: ' + (err as Error).message)
      }
    }

    checkConnection()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      <div className={`p-4 rounded-lg ${
        status === 'loading' ? 'bg-yellow-100 text-yellow-800' :
        status === 'success' ? 'bg-green-100 text-green-800' :
        'bg-red-100 text-red-800'
      }`}>
        {status === 'loading' ? 'Testing connection...' : message}
      </div>
    </div>
  )
} 