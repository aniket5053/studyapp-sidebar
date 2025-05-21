"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface TaskBoardHeaderProps {
  onAddTask: () => void
  title: string
}

/**
 * TaskBoardHeader Component
 * Renders the header section of the task board with title and add task button
 */
export function TaskBoardHeader({ onAddTask, title }: TaskBoardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <Button
        onClick={onAddTask}
        size="sm"
        className="rounded-full"
      >
        <Plus className="h-4 w-4 mr-1" />
        Add Task
      </Button>
    </div>
  )
} 