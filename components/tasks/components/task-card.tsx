"use client"

import { X, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { formatDate } from "../task-utils"
import type { Task } from "@/lib/data"
import { isBefore, addHours, parseISO } from "date-fns"

interface TaskCardProps {
  task: Task
  typeColors: Record<string, string>
  getClassColor: (classId: string) => string
  classes: any[]
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
}

/**
 * Determines the status tag for a task based on its due date and status
 */
function getTaskStatusTag(task: Task): { text: string; color: string } | null {
  console.log('Checking task status:', {
    taskId: task.id,
    title: task.title,
    date: task.date,
    status: task.status
  });

  if (task.status === 'done' || !task.date) {
    console.log('Task is done or has no date, returning null');
    return null;
  }

  const dueDate = parseISO(task.date);
  const now = new Date();
  console.log('Date comparison:', {
    dueDate: dueDate.toISOString(),
    now: now.toISOString(),
    isOverdue: isBefore(dueDate, now),
    isDueSoon: isBefore(dueDate, addHours(now, 24))
  });

  if (isBefore(dueDate, now)) {
    console.log('Task is overdue');
    return { text: 'Overdue', color: 'bg-red-100 text-red-700' };
  }

  if (isBefore(dueDate, addHours(now, 24))) {
    console.log('Task is due soon');
    return { text: 'Due Soon', color: 'bg-yellow-100 text-yellow-700' };
  }

  console.log('Task is not overdue or due soon');
  return null;
}

/**
 * TaskCard Component
 * Renders an individual task card with its details and actions
 */
export function TaskCard({ task, typeColors, getClassColor, classes, onEdit, onDelete }: TaskCardProps) {
  console.log('Rendering TaskCard:', {
    taskId: task.id,
    title: task.title,
    date: task.date,
    status: task.status
  });
  
  const statusTag = getTaskStatusTag(task);
  console.log('Status tag result:', statusTag);
  
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
      className="bg-white rounded-lg border border-slate-200 p-3 hover:border-slate-300 transition-colors relative group"
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <h3 className="font-medium text-foreground">{task.title}</h3>
          {task.date && (
            <span className="text-xs text-slate-500 mt-1 block">
              {formatDate(task.date)}
              {(() => {
                const d = parseISO(task.date);
                const h = d.getHours();
                const m = d.getMinutes();
                if (!isNaN(h) && !isNaN(m)) {
                  return ` • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                }
                return '';
              })()}
            </span>
          )}
        </div>
        {statusTag && (
          <Badge
            variant="outline"
            className={`text-xs px-2 py-1 border-0 font-semibold ${statusTag.color}`}
            style={{
              backgroundColor: statusTag.text === 'Overdue' ? '#fee2e2' : '#fef9c3',
              color: statusTag.text === 'Overdue' ? '#dc2626' : '#ca8a04',
              border: `1px solid ${statusTag.text === 'Overdue' ? '#fecaca' : '#fef08a'}`,
            }}
          >
            {statusTag.text}
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <Badge
          variant="outline"
          className={`text-xs px-2 py-1 border-0`}
          style={{
            backgroundColor: typeColors[task.type] || '#f5f5f5',
            color: '#000000',
            fontWeight: 600,
          }}
        >
          {task.type}
        </Badge>
        {task.class_id && (
          <Badge
            variant="outline"
            className="text-xs cursor-pointer transition-all"
            style={{
              backgroundColor: getClassColor(task.class_id),
              color: '#000000',
              borderColor: getClassColor(task.class_id),
              fontWeight: 600,
            }}
          >
            {classes.find((c) => c.id === task.class_id)?.name || task.class_id}
          </Badge>
        )}
      </div>
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
    </motion.div>
  )
} 