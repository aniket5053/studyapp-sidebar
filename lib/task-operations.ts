import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/database.types'
import type { Task } from '@/lib/data'

const supabase = createClientComponentClient<Database>()

export async function loadTaskTypes(userId: string): Promise<Record<string, string>> {
  const { data: taskTypes, error } = await supabase
    .from('task_types')
    .select('*')
    .eq('user_id', userId)
    .throwOnError()
  
  if (error) throw error
  
  const colors: Record<string, string> = {}
  taskTypes.forEach((type: { name: string; color: string }) => {
    colors[type.name] = type.color
  })
  return colors
}

export async function createTask(taskData: {
  title: string
  type: string
  status: Task['status']
  date: string
  class_id: string
  user_id: string
}): Promise<Task> {
  // First check if task type exists
  const { data: existingType } = await supabase
    .from('task_types')
    .select('*')
    .eq('name', taskData.type)
    .eq('user_id', taskData.user_id)
    .single()

  // If type doesn't exist, create it
  if (!existingType) {
    const { error: typeError } = await supabase
      .from('task_types')
      .insert({
        name: taskData.type,
        color: '#f5f5f5', // Default color
        user_id: taskData.user_id
      })
    
    if (typeError) throw typeError
  }

  // Create the task with all required fields
  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      ...taskData,
      archived: false,
      created_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) throw error
  return task as Task
}

export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
  
  if (error) throw error
}

export async function deleteTasksByType(type: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('type', type)
  
  if (error) throw error
}

export async function getUserPreferences(userId: string) {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data
}

export async function updateTask(
  taskId: string, 
  taskData: Partial<Task>
): Promise<Task> {
  // Ensure we don't update the created_at field
  const { created_at, ...updateData } = taskData
  
  const { data: task, error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', taskId)
    .select()
    .single()
  
  if (error) throw error
  return task as Task
}

export async function createTaskType(type: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('task_types')
    .insert({
      name: type,
      color: '#f5f5f5', // Default color
      user_id: userId
    })
  
  if (error) throw error
}

export async function updateTaskTypeColor(type: string, color: string): Promise<void> {
  const { error } = await supabase
    .from('task_types')
    .update({ color })
    .eq('name', type)
  
  if (error) throw error
}

export async function removeTaskType(type: string, removeTasks: boolean = false): Promise<void> {
  if (removeTasks) {
    // First delete all tasks of this type
    const { error: tasksError } = await supabase
      .from('tasks')
      .delete()
      .eq('type', type)
    
    if (tasksError) throw tasksError
  }

  // Then delete the type
  const { error } = await supabase
    .from('task_types')
    .delete()
    .eq('name', type)
  
  if (error) throw error
}

export async function restoreTaskType(type: string, userId: string, tasks: Task[]): Promise<void> {
  // First restore the type
  const { error: typeError } = await supabase
    .from('task_types')
    .insert({
      name: type,
      color: '#f5f5f5',
      user_id: userId
    })
  
  if (typeError) throw typeError

  // Then restore tasks if any
  if (tasks.length > 0) {
    const { error: tasksError } = await supabase
      .from('tasks')
      .insert(tasks.map(t => ({
        title: t.title,
        status: t.status,
        type: t.type,
        date: t.date,
        class_id: t.class_id,
        user_id: userId
      })))
    
    if (tasksError) throw tasksError
  }
}

export async function archiveCompletedTasks(userId: string | undefined) {
  if (!userId) return []

  try {
    // Get user preferences
    const preferences = await getUserPreferences(userId)
    const archiveDelay = preferences?.archive_delay_days || 2 // Default to 2 days if not set

    // Calculate the cutoff date
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - archiveDelay)

    // Find completed tasks that are older than the cutoff date
    const { data: tasksToArchive, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'done')
      .eq('archived', false)
      .lt('date', cutoffDate.toISOString())

    if (fetchError) {
      console.error('Error fetching tasks to archive:', fetchError)
      throw new Error(`Failed to fetch tasks: ${fetchError.message}`)
    }

    // Archive the tasks
    if (tasksToArchive && tasksToArchive.length > 0) {
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ archived: true })
        .in('id', tasksToArchive.map(task => task.id))

      if (updateError) {
        console.error('Error updating tasks:', updateError)
        throw new Error(`Failed to update tasks: ${updateError.message}`)
      }
    }

    return tasksToArchive || []
  } catch (error) {
    console.error('Error archiving tasks:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to archive tasks: ${error.message}`)
    }
    throw new Error('Failed to archive tasks: Unknown error')
  }
} 