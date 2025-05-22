"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useApp } from "@/context/app-context"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function TaskPreferences() {
  const [archiveDelay, setArchiveDelay] = useState(2)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const { user, setTasks } = useApp()
  const supabase = createClientComponentClient()

  // Load preferences on mount
  useEffect(() => {
    loadPreferences()
  }, [user])

  const loadPreferences = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('archive_delay_days')
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      if (data) {
        setArchiveDelay(data.archive_delay_days)
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
      toast({
        title: 'Error',
        description: 'Failed to load preferences. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleSavePreferences = async () => {
    if (!user) return
    setIsSaving(true)

    try {
      // If archiveDelay is empty or invalid, set it to 1
      const finalArchiveDelay = archiveDelay || 1

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          id: user.id,
          user_id: user.id,
          archive_delay_days: finalArchiveDelay,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      // Update the state with the final value
      setArchiveDelay(finalArchiveDelay)

      // Check for tasks that should be unarchived
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - finalArchiveDelay)

      // Find archived tasks that should be unarchived
      const { data: tasksToUnarchive, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('archived', true)
        .gt('date', cutoffDate.toISOString())

      if (fetchError) {
        console.error('Error fetching tasks to unarchive:', fetchError)
        throw new Error(`Failed to fetch tasks: ${fetchError.message}`)
      }

      // Unarchive the tasks if any are found
      if (tasksToUnarchive && tasksToUnarchive.length > 0) {
        const { error: updateError } = await supabase
          .from('tasks')
          .update({ archived: false })
          .in('id', tasksToUnarchive.map(task => task.id))

        if (updateError) {
          console.error('Error unarchiving tasks:', updateError)
          throw new Error(`Failed to update tasks: ${updateError.message}`)
        }
      }

      // Check for tasks that should be archived
      const { data: tasksToArchive, error: archiveFetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'done')
        .eq('archived', false)
        .lt('date', cutoffDate.toISOString())

      if (archiveFetchError) {
        console.error('Error fetching tasks to archive:', archiveFetchError)
        throw new Error(`Failed to fetch tasks: ${archiveFetchError.message}`)
      }

      // Archive the tasks if any are found
      if (tasksToArchive && tasksToArchive.length > 0) {
        const { error: archiveUpdateError } = await supabase
          .from('tasks')
          .update({ archived: true })
          .in('id', tasksToArchive.map(task => task.id))

        if (archiveUpdateError) {
          console.error('Error archiving tasks:', archiveUpdateError)
          throw new Error(`Failed to update tasks: ${archiveUpdateError.message}`)
        }
      }

      // Reload all tasks to reflect the changes
      const { data: updatedTasks, error: reloadError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)

      if (reloadError) {
        console.error('Error reloading tasks:', reloadError)
        throw new Error(`Failed to reload tasks: ${reloadError.message}`)
      }

      // Update the tasks in the app context
      setTasks(updatedTasks)

      toast({
        title: 'Success',
        description: 'Preferences saved successfully.',
      })
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast({
        title: 'Error',
        description: 'Failed to save preferences. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="glass-morphism">
      <CardHeader>
        <CardTitle className="dark:text-white">Task Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <Label className="text-base dark:text-white">Archive Delay</Label>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Number of days after completion before a task is automatically archived
            </p>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={30}
                value={archiveDelay || ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? '' : parseInt(e.target.value)
                  setArchiveDelay(value)
                }}
                className="w-24"
              />
              <span className="text-sm text-slate-500 dark:text-slate-400">days</span>
            </div>
          </div>

          <Button
            onClick={handleSavePreferences}
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 