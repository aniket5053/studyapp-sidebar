/**
 * Tasks Board Types and Component
 * 
 * This file contains:
 * - Type definitions for the task management system
 * - The main TasksBoard component that serves as the entry point
 * 
 * The types define the structure for:
 * - Task board properties
 * - Task statuses
 * - Task types
 * - Task validation
 * - Type deletion operations
 */

import type { Task } from "@/lib/data"
import { UnifiedTaskBoard } from "./unified-task-board"

// Type definitions for the task management system
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

/**
 * Main TasksBoard component that serves as the entry point for the task management system
 * @returns UnifiedTaskBoard component with default title "Tasks"
 */
export function TasksBoard() {
  return <UnifiedTaskBoard title="Tasks" />
}
