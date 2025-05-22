/**
 * TaskCard Component
 * 
 * A card component that displays individual task information:
 * - Task title
 * - Due date and time
 * - Task type with color coding
 * - Class assignment with color
 * - Status indicators (Overdue, Due Soon)
 * - Edit and delete actions (only for non-archived tasks)
 * 
 * The component includes animations for smooth transitions and
 * hover effects for better user interaction.
 */

"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, X } from "lucide-react"
import { format, parseISO, isBefore, addHours } from "date-fns"
import { capitalizeWords } from '../task-utils'
import { motion } from "framer-motion"
import type { Task } from "@/lib/data"

interface TaskCardProps {
  task: Task
  typeColors: Record<string, string>
  classes: Array<{ id: string, name: string, code: string, color: string }>
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  highlight?: 'due-soon' | 'overdue' | null
  isArchived?: boolean
}

export function TaskCard({ task, typeColors, classes, onEdit, onDelete, highlight, isArchived }: TaskCardProps) {
  // Helper function to get class color
  const getClassColor = (classId: string) => {
    const cls = classes.find(c => c.id === classId)
    return cls ? cls.color : '#000'
  }

  // Format date and time
  const formatDateTime = (dateString: string) => {
    try {
      const date = parseISO(dateString)
      return {
        date: format(date, 'MMMM d, yyyy'),
        time: format(date, 'h:mm a')
      }
    } catch (e) {
      return { date: dateString, time: '' }
    }
  }

  const { date, time } = formatDateTime(task.date)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ 
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 1
      }}
      className={
        "bg-white rounded-lg border border-slate-200 p-3 hover:border-slate-300 transition-colors relative group" +
        (highlight === 'due-soon' ? ' ring-2 ring-yellow-400 border-yellow-300' : '') +
        (highlight === 'overdue' ? ' ring-2 ring-red-400 border-red-300' : '') +
        (isArchived ? ' opacity-75' : '')
      }
    >
      {/* Task title and date section */}
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <h3 className="font-medium text-foreground">{task.title}</h3>
          {task.date && (
            <span className="text-xs text-slate-500 mt-1 block">
              {date}
              {time && ` • ${time}`}
            </span>
          )}
        </div>
      </div>

      {/* Task type and class badges */}
      <div className="flex items-center gap-1 mt-2">
        {/* Task type badge */}
        <Badge
          variant="outline"
          className={`text-xs px-2 py-1 border-0`}
          style={{
            backgroundColor: typeColors[task.type] || '#f5f5f5',
            color: '#000000',
            fontWeight: 600,
          }}
        >
          {capitalizeWords(task.type)}
        </Badge>

        {/* Class badge */}
        {task.class_id && (
          <Badge
            variant="outline"
            className="text-xs cursor-pointer transition-all px-2.5 py-1 min-w-[56px] flex justify-center"
            style={{
              backgroundColor: getClassColor(task.class_id),
              color: '#000000',
              borderColor: getClassColor(task.class_id),
              fontWeight: 600,
            }}
          >
            {classes.find((c) => c.id === task.class_id)?.code || task.class_id}
          </Badge>
        )}
      </div>

      {/* Action buttons - only show for non-archived tasks */}
      {!isArchived && (
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </motion.div>
  )
} 