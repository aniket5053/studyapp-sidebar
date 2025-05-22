"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, Check, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { useApp } from "@/context/app-context"
import { initiateGoogleAuth } from "@/lib/calendar-service"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function CalendarIntegration() {
  const [isGoogleConnecting, setGoogleConnecting] = useState(false)
  const [googleConnected, setGoogleConnected] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const { toast } = useToast()
  const { user } = useApp()
  const supabase = createClientComponentClient()

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus()
  }, [])

  const checkConnectionStatus = async () => {
    if (!user) return

    const { data: connections } = await supabase
      .from('calendar_connections')
      .select('*')
      .eq('user_id', user.id)

    if (connections) {
      setGoogleConnected(connections.some(c => c.type === 'google'))
    }
  }

  const handleGoogleConnect = async () => {
    setGoogleConnecting(true)
    try {
      initiateGoogleAuth()
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error)
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect to Google Calendar. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setGoogleConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('calendar_connections')
        .delete()
        .eq('user_id', user.id)
        .eq('type', 'google')

      if (error) throw error

      setGoogleConnected(false)
      toast({
        title: 'Disconnected',
        description: 'Successfully disconnected from Google Calendar.',
      })
    } catch (error) {
      console.error('Error disconnecting Google Calendar:', error)
      toast({
        title: 'Disconnection Failed',
        description: 'Failed to disconnect from Google Calendar. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleSync = async () => {
    if (isSyncing) return

    setIsSyncing(true)
    try {
      const response = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync calendar')
      }

      toast({
        title: 'Sync Successful',
        description: `Successfully synced ${data.syncedTasks?.length || 0} tasks from Google Calendar.`,
      })
    } catch (error) {
      console.error('Error syncing calendar:', error)
      toast({
        title: 'Sync Failed',
        description: 'Failed to sync calendar. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <Card className="glass-morphism">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 dark:text-white">
          <Calendar className="h-5 w-5" />
          Calendar Integration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Google Calendar Integration */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base dark:text-white">Google Calendar</Label>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Connect your Google Calendar to sync events as tasks
              </p>
            </div>
            {googleConnected ? (
              <Button
                variant="destructive"
                onClick={handleDisconnect}
                disabled={isSyncing}
              >
                Disconnect
              </Button>
            ) : (
              <Button
                onClick={handleGoogleConnect}
                disabled={isGoogleConnecting}
              >
                {isGoogleConnecting ? 'Connecting...' : 'Connect'}
              </Button>
            )}
          </div>

          {/* Manual Sync Button */}
          {googleConnected && (
            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="outline"
                onClick={handleSync}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Now
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 