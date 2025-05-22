"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Database } from '@/lib/database.types'
import type { Task, Class } from '@/lib/data'
import { toast } from 'react-hot-toast'
import { Session, User } from '@supabase/supabase-js'
import { loadTaskTypes } from '@/lib/task-operations'

interface AppContextType {
  tasks: Task[]
  classes: Class[]
  addTask: (task: Task) => void
  updateTask: (id: string, task: Partial<Task>) => void
  deleteTask: (id: string) => void
  getTasksByStatus: (status: Task['status']) => Task[]
  updateClass: (id: string, cls: Partial<Class>) => void
  addClassWorkspace: (cls: Omit<Class, 'id' | 'created_at' | 'user_id'>) => Promise<void>
  user: User | null
  signOut: () => Promise<void>
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
  activeClassId: string | null
  setActiveClassId: React.Dispatch<React.SetStateAction<string | null>>
  getClassById: (id: string) => Class | undefined
  typeColors: Record<string, string>
  setTypeColors: React.Dispatch<React.SetStateAction<Record<string, string>>>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [activeClassId, setActiveClassId] = useState<string | null>(null)
  const [typeColors, setTypeColors] = useState<Record<string, string>>({})
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

  // Handle auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: string, session: Session | null) => {
      if (event === 'SIGNED_IN') {
        setUser(session?.user ?? null)
        loadData()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setTasks([])
        setClasses([])
        router.push('/auth/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Load initial session
  useEffect(() => {
    const loadSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        if (session?.user) {
          await loadData()
        }
      } catch (error) {
        console.error('Error loading session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSession()
  }, [])

  // Load tasks and classes
  const loadData = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) return

      // Load tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', currentUser.id)
      
      if (tasksError) throw tasksError
      setTasks(tasksData as Task[])

      // Load classes
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .eq('user_id', currentUser.id)
      
      if (classesError) throw classesError
      setClasses(classesData as Class[])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    }
  }

  // Load type colors from Supabase when user is set
  useEffect(() => {
    const fetchTypeColors = async () => {
      if (user) {
        try {
          const colors = await loadTaskTypes(user.id)
          setTypeColors(colors)
        } catch (error) {
          console.error('Failed to load type colors', error)
        }
      }
    }
    fetchTypeColors()
  }, [user])

  const addTask = (task: Omit<Task, "id" | "user_id">) => {
    const newTask = {
      ...task,
      id: crypto.randomUUID(),
      user_id: "default-user" // Add a default user_id
    }
    setTasks(prev => [...prev, newTask])
  }

  const updateTask = (id: string, task: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...task } : t))
  }

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(t => t.status === status)
  }

  const updateClass = (id: string, cls: Partial<Class>) => {
    setClasses(prev => prev.map(c => c.id === id ? { ...c, ...cls } : c))
  }

  const addClassWorkspace = async (cls: Omit<Class, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) {
      toast.error('You must be logged in to create a class')
      return
    }

    try {
      console.log('Creating class with data:', { ...cls, user_id: user.id })
      
      const { data, error } = await supabase
        .from('classes')
        .insert({
          ...cls,
          user_id: user.id
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      if (!data) {
        throw new Error('No data returned from insert')
      }

      console.log('Class created successfully:', data)
      setClasses(prev => [...prev, data as Class])
      toast.success('Class created successfully')
    } catch (error) {
      console.error('Error creating class:', error)
      if (error instanceof Error) {
        toast.error(`Failed to create class: ${error.message}`)
      } else {
        toast.error('Failed to create class')
      }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/auth/login')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Failed to sign out')
    }
  }

  const getClassById = (id: string) => {
    return classes.find(c => c.id === id)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <AppContext.Provider value={{
      tasks,
      classes,
      addTask,
      updateTask,
      deleteTask,
      getTasksByStatus,
      updateClass,
      addClassWorkspace,
      user,
      signOut,
      setTasks,
      activeClassId,
      setActiveClassId,
      getClassById,
      typeColors,
      setTypeColors,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
