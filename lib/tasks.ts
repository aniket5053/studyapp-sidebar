import { supabase } from './supabase'
import type { Database } from './database.types'

export type Task = Database['public']['Tables']['tasks']['Row']
export type TaskType = Database['public']['Tables']['task_types']['Row']

export async function getTasks(userId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true })

  if (error) throw error
  return data
}

export async function getTaskTypes(userId: string) {
  const { data, error } = await supabase
    .from('task_types')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error
  return data
}

export async function createTask(task: Omit<Task, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTask(id: string, updates: Partial<Task>) {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTask(id: string) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function createTaskType(taskType: Omit<TaskType, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('task_types')
    .insert(taskType)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTaskType(id: string, updates: Partial<TaskType>) {
  const { data, error } = await supabase
    .from('task_types')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTaskType(id: string) {
  const { error } = await supabase
    .from('task_types')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Subscribe to real-time changes
export function subscribeToTasks(userId: string, callback: (payload: any) => void) {
  return supabase
    .channel('tasks')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe()
}

export function subscribeToTaskTypes(userId: string, callback: (payload: any) => void) {
  return supabase
    .channel('task_types')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'task_types',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe()
} 