/**
 * ArchivedTasksView Component
 * 
 * A view component that displays all archived tasks:
 * - Shows tasks that were completed more than 2 days ago
 * - Tasks are view-only (no unarchive/re-archive functionality)
 * - Maintains the same styling as the main task view
 */

"use client"

import { TaskCard } from './TaskCard'
import { Archive } from "lucide-react"
import type { Task } from "@/lib/data"

interface ArchivedTasksViewProps {
  tasks: Task[]
  typeColors: Record<string, string>
  getTaskTypeColors: (type: string) => { bg: string, text: string }
  classes: Array<{ id: string, name: string, code: string, color: string }>
}

export function ArchivedTasksView({
  tasks,
  typeColors,
  getTaskTypeColors,
  classes,
}: ArchivedTasksViewProps) {
  // Filter for archived tasks
  const archivedTasks = tasks.filter(task => task.archived)

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Archive className="h-5 w-5 text-slate-500" />
          <h2 className="text-lg font-semibold">Archived Tasks</h2>
        </div>
        <div className="text-sm text-slate-500">
          {archivedTasks.length} {archivedTasks.length === 1 ? 'task' : 'tasks'}
        </div>
      </div>

      {archivedTasks.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          No archived tasks yet
        </div>
      ) : (
        <div className="grid gap-4">
          {archivedTasks.map(task => (
            <div key={task.id} className="relative group flex flex-col">
              <TaskCard
                task={task}
                typeColors={typeColors}
                classes={classes}
                onEdit={() => {}} // Disable edit for archived tasks
                onDelete={() => {}} // Disable delete for archived tasks
                isArchived={true} // Mark as archived to disable actions
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 