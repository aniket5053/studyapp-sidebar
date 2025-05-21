import type { Task } from "@/lib/data"
import { UnifiedTaskBoard } from "./unified-task-board"

// Types
export interface UnifiedTaskBoardProps {
  title?: string
  showAddButton?: boolean
  showFilters?: boolean
}

export type TaskStatus = 'not-started' | 'in-progress' | 'to-submit' | 'done'

export interface TaskType {
  type: string
  color: string
}

export interface TaskWithType extends Task {
  type: string
  color?: string
}

export interface TaskValidation {
  title: boolean
  type: boolean
  date: boolean
}

export interface DeleteTypeWithTasks {
  type: string
  count: number
}

export interface RecentlyDeletedType {
  type: string
  tasks: Task[]
  timer: NodeJS.Timeout | null
}

export function TasksBoard() {
  return <UnifiedTaskBoard title="Tasks" />
}
