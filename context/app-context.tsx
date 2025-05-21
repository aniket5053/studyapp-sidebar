"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Database } from '@/lib/database.types'
import type { Task, Class } from '@/lib/data'
import { toast } from 'react-hot-toast'
import { Session, User } from '@supabase/supabase-js'

interface AppContextType {
  tasks: Task[]
  classes: Class[]
  addTask: (task: Task) => void
  updateTask: (id: string, task: Partial<Task>) => void
  deleteTask: (id: string) => void
  getTasksByStatus: (status: Task['status']) => Task[]
  updateClass: (id: string, cls: Partial<Class>) => void
  user: User | null
  signOut: () => Promise<void>
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
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

  const addTask = (task: Task) => {
    setTasks(prev => [...prev, task])
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
      user,
      signOut,
      setTasks,
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
