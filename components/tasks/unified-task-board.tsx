"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, Plus, X, Calendar as CalendarIcon, Paintbrush, Pencil } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useApp } from "@/context/app-context"
import type { Task } from "@/lib/data"
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, addDays, addWeeks, addMonths, startOfDay, endOfDay, isWithinInterval, parseISO, isBefore, isAfter, isToday, isThisWeek, addHours } from "date-fns"
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import moment from 'moment'
import { toast } from 'react-hot-toast'
import { 
  loadTaskTypes, 
  createTask, 
  deleteTask as deleteTaskFromDB, 
  deleteTasksByType, 
  updateTask as updateTaskInDB, 
  createTaskType, 
  updateTaskTypeColor, 
  removeTaskType 
} from '@/lib/task-operations'
import { CustomTimePicker } from './custom-time-picker'
import type { 
  UnifiedTaskBoardProps,
  TaskStatus,
  TaskType,
  TaskWithType,
  TaskValidation,
  DeleteTypeWithTasks,
  RecentlyDeletedType
} from './tasks-board'
import { format12HourTime, capitalizeWords } from './task-utils'
import { TaskBoardHeader } from "./components/task-board-header"
import { TaskFilters } from "./components/task-filters"
import { TaskBoardColumns } from "./components/task-board-columns"

// Main Component
export function UnifiedTaskBoard({ title = "Tasks", showAddButton = true, showFilters = true }: UnifiedTaskBoardProps) {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    status: "not-started",
    type: "",
    date: "",
  })
  const [filterType, setFilterType] = useState<string | null>(null)
  const [filterClass, setFilterClass] = useState<string | null>(null)
  const [filterDateRange, setFilterDateRange] = useState<{ start: Date, end: Date } | null>(null)
  const [editTask, setEditTask] = useState<Partial<Task> | null>(null)
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false)
  const [editTypeColor, setEditTypeColor] = useState<string | null>(null)
  const [typeColorValue, setTypeColorValue] = useState<string>("")
  const [typeColors, setTypeColors] = useState<Record<string, string>>({})
  const [editClassColorId, setEditClassColorId] = useState<string | null>(null)
  const [classColorPickerValue, setClassColorPickerValue] = useState<string>("")
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [showClassDropdown, setShowClassDropdown] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const typeInputRef = useRef<HTMLInputElement>(null)
  const classInputRef = useRef<HTMLInputElement>(null)
  const statusInputRef = useRef<HTMLInputElement>(null)
  const [deleteTypeConfirm, setDeleteTypeConfirm] = useState<string | null>(null)
  const [deleteTypeWithTasks, setDeleteTypeWithTasks] = useState<{type: string, count: number} | null>(null)
  const [deleteTaskConfirm, setDeleteTaskConfirm] = useState<string | null>(null)
  const [newTypeInput, setNewTypeInput] = useState("")
  const [recentlyDeletedType, setRecentlyDeletedType] = useState<{type: string, tasks: Task[], timer: NodeJS.Timeout | null}>({type: '', tasks: [], timer: null})
  const [validation, setValidation] = useState<{title: boolean, type: boolean, date: boolean}>({title: false, type: false, date: false});
  const [editValidation, setEditValidation] = useState<{title: boolean, type: boolean, date: boolean}>({title: false, type: false, date: false});
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'type'>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [isLoading, setIsLoading] = useState(true)

  const { classes, tasks, addTask, updateTask, deleteTask, getTasksByStatus, updateClass, user, setTasks } = useApp()

  // Load task types and their colors
  useEffect(() => {
    const loadTypes = async () => {
      try {
        if (!user) throw new Error('User not authenticated')
        const colors = await loadTaskTypes(user.id)
        setTypeColors(colors)
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading task types:', error)
        toast.error('Failed to load task types')
        setIsLoading(false)
      }
    }

    if (user) {
      loadTypes()
    }
  }, [user])

  // Local state for drag-and-drop ordering
  const [columns, setColumns] = useState({
    'not-started': getTasksByStatus('not-started'),
    'in-progress': getTasksByStatus('in-progress'),
    'to-submit': getTasksByStatus('to-submit'),
    'done': getTasksByStatus('done'),
  })

  useEffect(() => {
    setColumns({
      'not-started': getTasksByStatus('not-started'),
      'in-progress': getTasksByStatus('in-progress'),
      'to-submit': getTasksByStatus('to-submit'),
      'done': getTasksByStatus('done'),
    })
  }, [tasks])

  // Handle drag end
  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result
    if (!destination || !user) return
    const sourceCol = source.droppableId as keyof typeof columns
    const destCol = destination.droppableId as keyof typeof columns

    // Create new columns object
    const newColumns = { ...columns }
    
    // Find the task in the source column
    const taskToMove = newColumns[sourceCol].find(task => task.id === draggableId)
    if (!taskToMove) return

    // Remove from source column
    newColumns[sourceCol] = newColumns[sourceCol].filter(task => task.id !== draggableId)
    
    // Update task status if moving to different column
    if (sourceCol !== destCol) {
      try {
        // Update in database first using the task-operations function
        const updatedTask = await updateTaskInDB(taskToMove.id!, { 
          status: destCol,
          user_id: user.id // Ensure user_id is included
        })
        
        // Update the task in the main tasks array with the returned updated task
        const updatedTasks = tasks.map(t => t.id === taskToMove.id ? updatedTask : t)
        setTasks(updatedTasks)
        
        // Update the task in the columns with the new status
        taskToMove.status = destCol
      } catch (error) {
        console.error('Error updating task status:', error)
        toast.error('Failed to update task status')
        return
      }
    }

    // Insert into destination column
    const destTasks = Array.from(newColumns[destCol])
    destTasks.splice(destination.index, 0, taskToMove)
    newColumns[destCol] = destTasks

    // Update the columns state
    setColumns(newColumns)
  }

  // Handle task creation
  const handleCreateTask = async () => {
    const missing = {
      title: !newTask.title?.trim(),
      type: !newTask.type?.trim(),
      date: !newTask.date,
    };
    setValidation(missing);
    if (missing.title || missing.type || missing.date) return;
    
    try {
      setIsLoading(true)
      if (!user) throw new Error('User not authenticated')

      const task = await createTask({
        title: newTask.title!,
        type: newTask.type!,
        status: newTask.status!,
        date: newTask.date!,
        class_id: newTask.class_id,
        user_id: user.id
      })

      addTask(task)
      resetNewTaskForm()
      setIsAddTaskOpen(false)
      toast.success('Task created successfully')
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error('Failed to create task')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle task deletion
  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;
    try {
      setIsLoading(true)
      // Delete from database using task-operations
      await deleteTaskFromDB(taskId)
      
      // Then update the UI state by removing the task from all columns
      const updatedTasks = tasks.filter(t => t.id !== taskId)
      setTasks(updatedTasks)
      
      // Update columns state to reflect the deletion
      setColumns({
        'not-started': updatedTasks.filter(t => t.status === 'not-started'),
        'in-progress': updatedTasks.filter(t => t.status === 'in-progress'),
        'to-submit': updatedTasks.filter(t => t.status === 'to-submit'),
        'done': updatedTasks.filter(t => t.status === 'done'),
      })
      
      toast.success('Task deleted successfully')
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Failed to delete task')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle batch task deletion
  const handleDeleteTasksByType = async (type: string) => {
    if (!user) return;
    const tasksToDelete = tasks.filter(t => t.type === type)
    try {
      await deleteTasksByType(type)
      tasksToDelete.forEach(t => deleteTask(t.id))
      toast.success('Tasks deleted successfully')
    } catch (error) {
      console.error('Error deleting tasks:', error)
      toast.error('Failed to delete tasks')
    }
  }

  // Compute taskTypes from tasks and typeColors keys
  const taskTypes = Array.from(new Set([
    ...tasks.map(task => task.type),
    ...Object.keys(typeColors)
  ])).filter(Boolean)

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString)
      return format(date, 'MMMM d, yyyy')
    } catch (e) {
      return dateString
    }
  }

  // Sort tasks based on current sort settings
  const sortTasks = (tasks: Task[]) => {
    return [...tasks].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = a.date && b.date 
            ? parseISO(a.date).getTime() - parseISO(b.date).getTime()
            : 0;
          break;
        case 'title':
          comparison = (a.title || '').localeCompare(b.title || '');
          break;
        case 'type':
          comparison = (a.type || '').localeCompare(b.type || '');
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  // Filter tasks based on selected filters
  const filterTasks = (tasks: Task[]) => {
    return sortTasks(tasks.filter(task => {
      if (filterType && task.type !== filterType) return false
      if (filterClass && task.class_id !== filterClass) return false
      if (filterDateRange && task.date) {
        const taskDate = parseISO(task.date)
        if (!isWithinInterval(taskDate, {
          start: startOfDay(filterDateRange.start),
          end: endOfDay(filterDateRange.end)
        })) return false
      }
      return true
    }))
  }

  // Get date range display text
  const getDateRangeText = () => {
    if (!filterDateRange) return 'Due date'
    const today = startOfDay(new Date())
    const tomorrow = addDays(today, 1)
    const nextWeek = addWeeks(today, 1)
    const nextMonth = addMonths(today, 1)
    if (filterDateRange.start.getTime() === today.getTime() && filterDateRange.end.getTime() === today.getTime()) {
      return 'Today'
    }
    if (filterDateRange.start.getTime() === tomorrow.getTime() && filterDateRange.end.getTime() === tomorrow.getTime()) {
      return 'Tomorrow'
    }
    if (filterDateRange.start.getTime() === today.getTime() && filterDateRange.end.getTime() === nextWeek.getTime()) {
      return 'Next week'
    }
    if (filterDateRange.start.getTime() === today.getTime() && filterDateRange.end.getTime() === nextMonth.getTime()) {
      return 'Next month'
    }
    return `${format(filterDateRange.start, 'MMM d')} - ${format(filterDateRange.end, 'MMM d')}`
  }

  // Color helpers
  const getClassColor = (classId: string) => {
    const cls = classes.find(c => c.id === classId)
    return cls ? cls.color : '#000'
  }
  const getTaskTypeColors = (type: string) => {
    if (typeColors[type]) {
      return { bg: typeColors[type], text: '#000000' }
    }
    return { bg: '#f5f5f5', text: '#000000' }
  }

  // Handle type color update
  const handleTypeColorUpdate = async (type: string, color: string) => {
    if (!user) return;
    try {
      if (!taskTypes.includes(type)) {
        // This is a new task type
        await createTaskType(type, user.id);
        await updateTaskTypeColor(type, color);
      } else {
        // This is an existing task type
        await updateTaskTypeColor(type, color);
      }
      setTypeColors(prev => ({ ...prev, [type]: color }))
      setEditTypeColor(null)
      setNewTypeInput("")
      toast.success('Task type color updated')
    } catch (error) {
      console.error('Error updating task type color:', error)
      toast.error('Failed to update task type color')
    }
  }

  // Handle type removal
  const handleRemoveType = async (type: string, removeTasks: boolean = false) => {
    if (!user) return;
    try {
      await removeTaskType(type, removeTasks)
      setTypeColors(prev => {
        const newColors = { ...prev }
        delete newColors[type]
        return newColors
      })

      if (recentlyDeletedType.timer) clearTimeout(recentlyDeletedType.timer)
      const timer = setTimeout(() => {
        setRecentlyDeletedType({type: '', tasks: [], timer: null})
      }, 10000)
      setRecentlyDeletedType({type, tasks: removeTasks ? tasks.filter(t => t.type === type) : [], timer})
      toast.success('Task type removed successfully')
    } catch (error) {
      console.error('Error removing task type:', error)
      toast.error('Failed to remove task type')
    }
  }

  // Handle new type creation
  const handleCreateType = async (type: string) => {
    if (!user) return;
    try {
      await createTaskType(type, user.id)
      setTypeColors(prev => ({ ...prev, [type]: '#f5f5f5' }))
      setNewTypeInput("")
      toast.success('Task type created successfully')
    } catch (error) {
      console.error('Error creating task type:', error)
      toast.error('Failed to create task type')
    }
  }

  // Handle task edit
  const handleEditTask = async () => {
    if (!user) return;
    if (!editTask) return;

    const missing = {
      title: !editTask.title?.trim(),
      type: !editTask.type?.trim(),
      date: !editTask.date,
    };
    setEditValidation(missing);
    if (missing.title || missing.type || missing.date) return;

    try {
      // Update in database first using the task-operations function
      const updatedTask = await updateTaskInDB(editTask.id!, {
        title: editTask.title!,
        type: editTask.type!,
        status: editTask.status!,
        date: editTask.date!,
        class_id: editTask.class_id,
        user_id: user.id
      });

      // Update the task in the main tasks array
      const updatedTasks = tasks.map(t => t.id === editTask.id ? updatedTask : t);
      setTasks(updatedTasks);

      // Update the columns state
      setColumns({
        'not-started': updatedTasks.filter(t => t.status === 'not-started'),
        'in-progress': updatedTasks.filter(t => t.status === 'in-progress'),
        'to-submit': updatedTasks.filter(t => t.status === 'to-submit'),
        'done': updatedTasks.filter(t => t.status === 'done'),
      });

      setIsEditTaskOpen(false);
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  }

  // Add this new function after the other state declarations
  const resetNewTaskForm = () => {
    setNewTask({
      title: "",
      status: "not-started",
      type: "",
      date: "",
    });
    setValidation({title: false, type: false, date: false});
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <motion.h1
          className="text-4xl font-bold font-display"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {title}
        </motion.h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <>
          {showFilters && (
            <div className="flex items-center gap-2 mb-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`rounded-full text-xs ${filterDateRange ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
                  >
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {getDateRangeText()}
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3" align="start">
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          const today = startOfDay(new Date())
                          setFilterDateRange({ start: today, end: today })
                        }}
                      >
                        Today
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          const tomorrow = addDays(startOfDay(new Date()), 1)
                          setFilterDateRange({ start: tomorrow, end: tomorrow })
                        }}
                      >
                        Tomorrow
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          const today = startOfDay(new Date())
                          const nextWeek = addWeeks(today, 1)
                          setFilterDateRange({ start: today, end: nextWeek })
                        }}
                      >
                        Next week
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          const today = startOfDay(new Date())
                          const nextMonth = addMonths(today, 1)
                          setFilterDateRange({ start: today, end: nextMonth })
                        }}
                      >
                        Next month
                      </Button>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="text-xs text-slate-500 mb-2 px-1">Custom range</div>
                      <Calendar
                        mode="range"
                        selected={{
                          from: filterDateRange?.start,
                          to: filterDateRange?.end
                        }}
                        onSelect={(range) => {
                          if (range?.from && range?.to) {
                            setFilterDateRange({
                              start: startOfDay(range.from),
                              end: endOfDay(range.to)
                            })
                          }
                        }}
                        initialFocus
                        className="rounded-md border"
                      />
                    </div>
                    {filterDateRange && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => setFilterDateRange(null)}
                      >
                        Clear date filter
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`rounded-full text-xs ${filterClass ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
                  >
                    {filterClass ? classes.find(c => c.id === filterClass)?.name : 'All Classes'}
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto px-4 py-2" align="start">
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`w-full justify-start ${!filterClass ? 'bg-blue-50 text-blue-700' : ''}`}
                      onClick={() => setFilterClass(null)}
                    >
                      All Classes
                    </Button>
                    {classes.map((cls) => (
                      <Button
                        key={cls.id}
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-start ${filterClass === cls.id ? 'bg-blue-50 text-blue-700' : ''}`}
                        style={{
                          backgroundColor: cls.color,
                          color: '#222',
                          fontWeight: filterClass === cls.id ? 'bold' : 'normal',
                        }}
                        onClick={() => setFilterClass(cls.id)}
                      >
                        <span className="truncate">{capitalizeWords(cls.name)}</span>
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`rounded-full text-xs ${filterType ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
                  >
                    {filterType ? filterType : 'All Types'}
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start">
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`w-full justify-start ${!filterType ? 'bg-blue-50 text-blue-700' : ''}`}
                      onClick={() => setFilterType(null)}
                    >
                      All Types
                    </Button>
                    {taskTypes.map((type) => (
                      <div key={type} className="flex items-center gap-2 w-full">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`flex-1 w-full justify-start ${filterType === type ? 'ring-2 ring-offset-2 ring-blue-400' : ''}`}
                          style={{
                            backgroundColor: typeColors[type] || getTaskTypeColors(type).bg,
                            color: '#000000',
                            fontWeight: filterType === type ? 'bold' : 'normal',
                          }}
                          onClick={() => setFilterType(type)}
                        >
                          {capitalizeWords(type)}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="p-1"
                          onClick={e => {
                            e.preventDefault();
                            setEditTypeColor(type);
                            setTypeColorValue(typeColors[type] || getTaskTypeColors(type).bg);
                          }}
                          aria-label={`Pick color for ${type}`}
                        >
                          <Paintbrush className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="p-1 text-red-500 hover:text-red-700"
                          onClick={e => {
                            e.stopPropagation();
                            const count = tasks.filter(t => t.type === type).length;
                            if (count > 0) {
                              setDeleteTypeWithTasks({ type, count });
                            } else {
                              setDeleteTypeConfirm(type);
                            }
                          }}
                          aria-label={`Remove ${type} type`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                      <input
                        type="text"
                        value={newTypeInput}
                        onChange={e => setNewTypeInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            const val = newTypeInput.trim().toLowerCase();
                            if (val && !taskTypes.includes(val)) {
                              setEditTypeColor(val);
                              setTypeColorValue('#f5f5f5');
                            }
                          }
                        }}
                        placeholder="Add new type..."
                        className="flex-1 px-2 py-1 border rounded-md text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          const val = newTypeInput.trim().toLowerCase();
                          if (val && !taskTypes.includes(val)) {
                            setEditTypeColor(val);
                            setTypeColorValue('#f5f5f5');
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <div className="flex-1" /> {/* Spacer */}

              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-full text-xs"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-1"
                    >
                      <path d="M3 6h18" />
                      <path d="M7 12h10" />
                      <path d="M10 18h4" />
                    </svg>
                    Sort by {sortBy}
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start">
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`w-full justify-start ${sortBy === 'date' ? 'bg-blue-50 text-blue-700' : ''}`}
                      onClick={() => {
                        setSortBy('date');
                        setSortDirection(sortBy === 'date' ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc');
                      }}
                    >
                      Date {sortBy === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`w-full justify-start ${sortBy === 'title' ? 'bg-blue-50 text-blue-700' : ''}`}
                      onClick={() => {
                        setSortBy('title');
                        setSortDirection(sortBy === 'title' ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc');
                      }}
                    >
                      Title {sortBy === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`w-full justify-start ${sortBy === 'type' ? 'bg-blue-50 text-blue-700' : ''}`}
                      onClick={() => {
                        setSortBy('type');
                        setSortDirection(sortBy === 'type' ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc');
                      }}
                    >
                      Type {sortBy === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {editTypeColor && (
            <Dialog open={!!editTypeColor} onOpenChange={open => { if (!open) setEditTypeColor(null) }}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Pick Color for {capitalizeWords(editTypeColor)}</DialogTitle>
                  <DialogDescription>Choose a color for your task type.</DialogDescription>
                </DialogHeader>
                <div className="flex items-center gap-4 py-4">
                  <input
                    type="color"
                    value={typeColorValue}
                    onChange={e => setTypeColorValue(e.target.value)}
                    className="w-12 h-12 rounded-full border-2 border-slate-200 cursor-pointer"
                    aria-label="Pick type color"
                    style={{ background: typeColorValue }}
                  />
                  <span
                    className="px-3 py-1 rounded-full font-semibold"
                    style={{ background: typeColorValue, color: '#222', border: '1px solid #eee' }}
                  >
                    Preview
                  </span>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditTypeColor(null)}>Cancel</Button>
                  <Button onClick={() => handleTypeColorUpdate(editTypeColor!, typeColorValue)}>Save Color</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {deleteTypeWithTasks && (
            <Dialog open={!!deleteTypeWithTasks} onOpenChange={open => { if (!open) setDeleteTypeWithTasks(null) }}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Remove Task Type and Tasks</DialogTitle>
                  <DialogDescription>Are you sure you want to delete these tasks as well as the type?</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p>There are {deleteTypeWithTasks.count} tasks of type "{capitalizeWords(deleteTypeWithTasks.type)}".</p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteTypeWithTasks(null)}>Cancel</Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setDeleteTypeConfirm(deleteTypeWithTasks.type);
                      setDeleteTypeWithTasks(null);
                    }}
                  >
                    Remove Only Type
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleRemoveType(deleteTypeWithTasks.type, true);
                      setDeleteTypeConfirm(deleteTypeWithTasks.type);
                      setDeleteTypeWithTasks(null);
                    }}
                  >
                    Remove Type and Tasks
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {['not-started', 'in-progress', 'to-submit', 'done'].map((col) => (
                <div key={col} className="bg-white rounded-xl border border-slate-100 shadow-lg">
                  <div className={
                    col === 'not-started'
                      ? "bg-rose-100 p-3 font-medium text-rose-800 dark:bg-rose-900/40 dark:text-rose-100"
                      : col === 'in-progress'
                        ? "bg-yellow-100 p-3 font-medium text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-100"
                        : col === 'to-submit'
                            ? "bg-purple-100 p-3 font-medium text-purple-800 dark:bg-purple-900/40 dark:text-purple-100"
                            : "bg-green-100 p-3 font-medium text-green-800 dark:bg-green-900/40 dark:text-green-100"
                  }>
                    {col === 'not-started' ? 'Not started' : col === 'in-progress' ? 'In Progress' : col === 'to-submit' ? 'Yet to submit' : 'Done'}
                  </div>
                  <Droppable droppableId={col}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`p-3 space-y-3 min-h-[100px] flex flex-col ${snapshot.isDraggingOver ? 'bg-slate-50' : ''}`}
                      >
                        <div className="flex-1">
                          {filterTasks(columns[col as keyof typeof columns]).map((task, idx) => (
                            <Draggable draggableId={task.id} index={idx} key={task.id}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{
                                    ...provided.draggableProps.style,
                                    transform: snapshot.isDragging ? provided.draggableProps.style?.transform : 'none',
                                    zIndex: snapshot.isDragging ? 9999 : 'auto',
                                    transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
                                  }}
                                  className={`${snapshot.isDragging ? 'shadow-xl' : ''}`}
                                >
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
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Badge
                                        variant="outline"
                                        className={`text-xs px-2 py-1 border-0`}
                                        style={{
                                          backgroundColor: typeColors[task.type] || getTaskTypeColors(task.type).bg,
                                          color: '#000000',
                                          fontWeight: 600,
                                        }}
                                      >
                                        {capitalizeWords(task.type)}
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
                                          {capitalizeWords(classes.find((c) => c.id === task.class_id)?.name || task.class_id)}
                                        </Badge>
                                      )}
                                      {task.status !== 'done' && task.date && (() => {
                                        const dueDate = parseISO(task.date);
                                        const now = new Date();
                                        if (isBefore(dueDate, now)) {
                                          return (
                                            <Badge
                                              variant="outline"
                                              className="text-xs px-2 py-1 border-0 font-semibold ml-auto"
                                              style={{
                                                backgroundColor: '#fee2e2',
                                                color: '#dc2626',
                                                border: '1px solid #fecaca',
                                              }}
                                            >
                                              Overdue
                                            </Badge>
                                          );
                                        }
                                        if (isBefore(dueDate, addHours(now, 24))) {
                                          return (
                                            <Badge
                                              variant="outline"
                                              className="text-xs px-2 py-1 border-0 font-semibold ml-auto"
                                              style={{
                                                backgroundColor: '#fef9c3',
                                                color: '#ca8a04',
                                                border: '1px solid #fef08a',
                                              }}
                                            >
                                              Due Soon
                                            </Badge>
                                          );
                                        }
                                        return null;
                                      })()}
                                    </div>
                                    <div className="absolute top-2 right-2 flex items-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditTask(task);
                                          setIsEditTaskOpen(true);
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
                                          setDeleteTaskConfirm(task.id);
                                        }}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </motion.div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                        <Button
                          variant="ghost"
                          className="w-full mt-2 border-dashed border-2 border-slate-200 text-slate-500 hover:bg-slate-50"
                          onClick={() => {
                            setNewTask({ ...newTask, status: col as Task['status'] });
                            setIsAddTaskOpen(true);
                          }}
                        >
                          + New Task
                        </Button>
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        </>
      )}

      <Dialog open={isEditTaskOpen} onOpenChange={setIsEditTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Make changes to your task here.</DialogDescription>
          </DialogHeader>
          {editTask && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Task Title</Label>
                <Input
                  id="edit-title"
                  placeholder="Enter task title"
                  value={editTask.title}
                  onChange={e => {
                    setEditTask({ ...editTask, title: e.target.value });
                    if (editValidation.title && e.target.value.trim()) setEditValidation(v => ({...v, title: false}));
                  }}
                  className={editValidation.title ? "border-red-500 focus:ring-red-400 focus:border-red-400" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Task Type</Label>
                <div className="relative">
                  <Input
                    id="edit-type"
                    ref={typeInputRef}
                    placeholder="e.g., homework, quiz, lab"
                    value={capitalizeWords(editTask.type || "")}
                    onChange={e => {
                      setEditTask({ ...editTask, type: e.target.value.toLowerCase() });
                      setShowTypeDropdown(true);
                      if (editValidation.type && e.target.value.trim()) setEditValidation(v => ({...v, type: false}));
                    }}
                    onFocus={() => setShowTypeDropdown(true)}
                    onBlur={() => setTimeout(() => setShowTypeDropdown(false), 150)}
                    autoComplete="off"
                    className={`cursor-pointer focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm ${editValidation.type ? 'border-red-500 focus:ring-red-400 focus:border-red-400' : ''}`}
                  />
                  {showTypeDropdown && taskTypes.length > 0 && (
                    <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {taskTypes.filter(type => type.toLowerCase().includes((editTask.type || '').toLowerCase())).length === 0 && (
                        <div className="p-2 text-slate-400 text-sm">No matches</div>
                      )}
                      {taskTypes.map(type => (
                        <button
                          key={type}
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-100 text-sm"
                          style={{ backgroundColor: typeColors[type] || getTaskTypeColors(type).bg, color: '#222' }}
                          onMouseDown={e => {
                            e.preventDefault();
                            setEditTask({ ...editTask, type })
                            setShowTypeDropdown(false)
                            typeInputRef.current?.blur()
                          }}
                        >
                          {capitalizeWords(type)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-date">Due Date (required) & Time (optional)</Label>
                <div className="flex flex-row gap-4 items-start">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Input
                        id="edit-date"
                        readOnly
                        value={editTask.date ? format(parseISO(editTask.date), 'yyyy-MM-dd') : ''}
                        placeholder="Pick a date"
                        className={`w-36 cursor-pointer ${editValidation.date ? 'border-red-500 focus:ring-red-400 focus:border-red-400' : ''}`}
                      />
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-auto" align="start">
                      <Calendar
                        mode="single"
                        selected={editTask.date ? parseISO(editTask.date) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            // Preserve the existing time when updating the date
                            const existingDate = editTask.date ? parseISO(editTask.date) : new Date();
                            const newDate = new Date(date);
                            newDate.setHours(existingDate.getHours(), existingDate.getMinutes(), 0, 0);
                            setEditTask({ 
                              ...editTask, 
                              date: newDate.toISOString()
                            });
                          }
                        }}
                        className="rounded-md border"
                        modifiers={{ today: (date) => isToday(date) }}
                        modifiersStyles={{
                          today: {
                            fontWeight: 'bold',
                            border: '2px solid #a78bfa',
                            borderRadius: '50%'
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Input
                        id="edit-time"
                        readOnly
                        value={format12HourTime(editTask.date)}
                        placeholder="Pick time"
                        className="w-24 cursor-pointer"
                      />
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-auto" align="start">
                      <CustomTimePicker
                        value={format12HourTime(editTask.date)}
                        onChange={val => {
                          if (editTask.date) {
                            let date = parseISO(editTask.date);
                            let [h, m] = val.split(":");
                            // Ensure we have valid numbers for hours and minutes
                            const hours = Number(h);
                            const minutes = Number(m);
                            if (!isNaN(hours) && !isNaN(minutes)) {
                              date.setHours(hours, minutes, 0, 0);
                              // Only update if the date is valid
                              if (!isNaN(date.getTime())) {
                                setEditTask({ ...editTask, date: date.toISOString() });
                              }
                            }
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-class">Class (optional)</Label>
                <div className="relative">
                  <Input
                    id="edit-class"
                    ref={classInputRef}
                    placeholder="Select a class"
                    value={classes.find(c => c.id === editTask.class_id)?.name || ""}
                    onChange={e => {
                      setEditTask({ ...editTask, class_id: e.target.value })
                      setShowClassDropdown(true)
                    }}
                    onFocus={() => setShowClassDropdown(true)}
                    onBlur={() => setTimeout(() => setShowClassDropdown(false), 150)}
                    autoComplete="off"
                    className="cursor-pointer focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm"
                  />
                  {showClassDropdown && classes.length > 0 && (
                    <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {classes.length === 0 && (
                        <div className="p-2 text-slate-400 text-sm">No classes available</div>
                      )}
                      {classes.map(cls => (
                        <button
                          key={cls.id}
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-100 text-sm"
                          style={{ backgroundColor: cls.color, color: '#222' }}
                          onMouseDown={e => {
                            e.preventDefault();
                            setEditTask({ ...editTask, class_id: cls.id })
                            setShowClassDropdown(false)
                            classInputRef.current?.blur()
                          }}
                        >
                          {capitalizeWords(cls.name)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <div className="relative">
                  <Input
                    id="edit-status"
                    ref={statusInputRef}
                    placeholder="Select status"
                    value={editTask.status === 'not-started' ? 'Not started' : editTask.status === 'in-progress' ? 'In Progress' : editTask.status === 'to-submit' ? 'Yet to submit' : 'Done'}
                    onChange={e => {
                      setEditTask({ ...editTask, status: e.target.value as Task['status'] })
                      setShowStatusDropdown(true)
                    }}
                    onFocus={() => setShowStatusDropdown(true)}
                    onBlur={() => setTimeout(() => setShowStatusDropdown(false), 150)}
                    autoComplete="off"
                    className="cursor-pointer focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm"
                  />
                  {showStatusDropdown && (
                    <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {[
                        { value: 'not-started', label: 'Not started', color: '#fee2e2' }, // red-100
                        { value: 'in-progress', label: 'In Progress', color: '#fef9c3' }, // yellow-100
                        { value: 'to-submit', label: 'Yet to submit', color: '#f3e8ff' }, // purple-100
                        { value: 'done', label: 'Done', color: '#dcfce7' } // green-100
                      ].map(status => (
                        <button
                          key={status.value}
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-opacity-80 focus:bg-opacity-90 text-sm"
                          style={{ backgroundColor: status.color }}
                          onMouseDown={e => {
                            e.preventDefault();
                            setEditTask({ ...editTask, status: status.value as Task['status'] })
                            setShowStatusDropdown(false)
                            statusInputRef.current?.blur()
                          }}
                        >
                          {status.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <Button 
                onClick={handleEditTask} 
                className="w-full"
              >
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {deleteTaskConfirm && (
        <Dialog open={!!deleteTaskConfirm} onOpenChange={open => { if (!open) setDeleteTaskConfirm(null) }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Task</DialogTitle>
              <DialogDescription>Are you sure you want to delete this task? This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p>Are you sure you want to delete this task?</p>
              <p className="text-sm text-slate-500 mt-2">This action cannot be undone.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteTaskConfirm(null)}>Cancel</Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  handleDeleteTask(deleteTaskConfirm);
                  setDeleteTaskConfirm(null);
                }}
              >
                Delete Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {deleteTypeConfirm && (
        <Dialog open={!!deleteTypeConfirm} onOpenChange={open => { if (!open) setDeleteTypeConfirm(null) }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Task Type</DialogTitle>
              <DialogDescription>Are you sure you want to delete this task type? This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p>Are you sure you want to delete the task type "{capitalizeWords(deleteTypeConfirm)}"?</p>
              <p className="text-sm text-slate-500 mt-2">This action cannot be undone.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteTypeConfirm(null)}>Cancel</Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  handleRemoveType(deleteTypeConfirm);
                  setDeleteTypeConfirm(null);
                }}
              >
                Delete Type
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Snackbar/Toast for Undo */}
      <AnimatePresence>
        {recentlyDeletedType.type && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white shadow-xl rounded-full px-6 py-3 flex items-center gap-4 border border-slate-200"
            style={{ minWidth: 280 }}
          >
            <span className="font-medium text-slate-800">
              {`Task type "${capitalizeWords(recentlyDeletedType.type)}" removed.`}
              {recentlyDeletedType.tasks.length > 0 && ` ${recentlyDeletedType.tasks.length} tasks deleted.`}
            </span>
            <Button
              variant="outline"
              className="border-blue-500 text-blue-700 hover:bg-blue-50 font-semibold px-4 py-1 rounded-full shadow-sm transition-all"
              onClick={() => {
                handleRemoveType(recentlyDeletedType.type, true);
                setRecentlyDeletedType({type: '', tasks: [], timer: null});
              }}
            >
              Undo
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog 
        open={isAddTaskOpen} 
        onOpenChange={(open) => {
          setIsAddTaskOpen(open);
          if (!open) {
            resetNewTaskForm();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>Create a new task with title, type, due date, and optional class assignment.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                placeholder="Enter task title"
                value={newTask.title}
                onChange={e => {
                  setNewTask({ ...newTask, title: e.target.value });
                  if (validation.title && e.target.value.trim()) setValidation(v => ({...v, title: false}));
                }}
                className={validation.title ? "border-red-500 focus:ring-red-400 focus:border-red-400" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Task Type</Label>
              <div className="relative">
                <Input
                  id="type"
                  ref={typeInputRef}
                  placeholder="e.g., homework, quiz, lab"
                  value={capitalizeWords(newTask.type || "")}
                  onChange={e => {
                    setNewTask({ ...newTask, type: e.target.value.toLowerCase() });
                    setShowTypeDropdown(true);
                    if (validation.type && e.target.value.trim()) setValidation(v => ({...v, type: false}));
                  }}
                  onFocus={() => setShowTypeDropdown(true)}
                  onBlur={() => setTimeout(() => setShowTypeDropdown(false), 150)}
                  autoComplete="off"
                  className={`cursor-pointer focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm ${validation.type ? 'border-red-500 focus:ring-red-400 focus:border-red-400' : ''}`}
                />
                {showTypeDropdown && taskTypes.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {taskTypes.filter(type => type.toLowerCase().includes((newTask.type || '').toLowerCase())).length === 0 && (
                      <div className="p-2 text-slate-400 text-sm">No matches</div>
                    )}
                    {taskTypes.map(type => (
                      <button
                        key={type}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-100 text-sm"
                        style={{ backgroundColor: typeColors[type] || getTaskTypeColors(type).bg.replace('bg-', '#'), color: '#222' }}
                        onMouseDown={e => {
                          e.preventDefault();
                          setNewTask({ ...newTask, type })
                          setShowTypeDropdown(false)
                          typeInputRef.current?.blur()
                        }}
                      >
                        {capitalizeWords(type)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Due Date (required) & Time (optional)</Label>
              <div className="flex flex-row gap-4 items-start">
                <Popover>
                  <PopoverTrigger asChild>
                    <Input
                      id="date"
                      readOnly
                      value={newTask.date ? format(parseISO(newTask.date), 'yyyy-MM-dd') : ''}
                      placeholder="Pick a date"
                      className={`w-36 cursor-pointer ${validation.date ? 'border-red-500 focus:ring-red-400 focus:border-red-400' : ''}`}
                    />
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-auto" align="start">
                    <Calendar
                      mode="single"
                      selected={newTask.date ? parseISO(newTask.date) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          // Preserve the existing time when updating the date
                          const existingDate = newTask.date ? parseISO(newTask.date) : new Date();
                          const newDate = new Date(date);
                          newDate.setHours(existingDate.getHours(), existingDate.getMinutes(), 0, 0);
                          setNewTask({ 
                            ...newTask, 
                            date: newDate.toISOString()
                          });
                        }
                      }}
                      className="rounded-md border"
                      modifiers={{ today: (date) => isToday(date) }}
                      modifiersStyles={{
                        today: {
                          fontWeight: 'bold',
                          border: '2px solid #a78bfa',
                          borderRadius: '50%'
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Input
                      id="time"
                      readOnly
                      value={format12HourTime(newTask.date)}
                      placeholder="Pick time"
                      className="w-24 cursor-pointer"
                    />
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-auto" align="start">
                    <CustomTimePicker
                      value={format12HourTime(newTask.date)}
                      onChange={val => {
                        if (newTask.date) {
                          let date = parseISO(newTask.date);
                          let [h, m] = val.split(":");
                          date.setHours(Number(h) || 0, Number(m) || 0, 0, 0);
                          setNewTask({ ...newTask, date: date.toISOString() });
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="class">Class (optional)</Label>
              <div className="relative">
                <Input
                  id="class"
                  ref={classInputRef}
                  placeholder="Select a class"
                  value={classes.find(c => c.id === newTask.class_id)?.name || ""}
                  onChange={e => {
                    setNewTask({ ...newTask, class_id: e.target.value })
                    setShowClassDropdown(true)
                  }}
                  onFocus={() => setShowClassDropdown(true)}
                  onBlur={() => setTimeout(() => setShowClassDropdown(false), 150)}
                  autoComplete="off"
                  className="cursor-pointer focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm"
                />
                {showClassDropdown && classes.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {classes.length === 0 && (
                      <div className="p-2 text-slate-400 text-sm">No classes available</div>
                    )}
                    {classes.map(cls => (
                      <button
                        key={cls.id}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-100 text-sm"
                        style={{ backgroundColor: cls.color, color: '#222' }}
                        onMouseDown={e => {
                          e.preventDefault();
                          setNewTask({ ...newTask, class_id: cls.id })
                          setShowClassDropdown(false)
                          classInputRef.current?.blur()
                        }}
                      >
                        {capitalizeWords(cls.name)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <Button 
              onClick={handleCreateTask} 
              className="w-full"
            >
              Create Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
      .react-datepicker__time-container, .react-datepicker__time, .react-datepicker__time-box {
        border-radius: 1.5rem !important;
        background: #f3e8ff !important;
        font-family: inherit !important;
      }
      .react-datepicker__time-list {
        border-radius: 1.5rem !important;
        background: #f3e8ff !important;
        font-size: 1.1rem !important;
        font-weight: 600 !important;
        color: #6d28d9 !important;
        padding: 0.5rem 0 !important;
      }
      .react-datepicker__time-list-item {
        border-radius: 1.5rem !important;
        margin: 0.15rem 0.5rem !important;
        padding: 0.5rem 1.2rem !important;
        transition: background 0.2s, color 0.2s;
      }
      .react-datepicker__time-list-item--selected,
      .react-datepicker__time-list-item--selected:hover {
        background: #a78bfa !important;
        color: #fff !important;
        font-weight: 700 !important;
        box-shadow: 0 0 0 2px #a78bfa;
      }
      }
      .react-datepicker__time-list-item:hover {
        background: #ede9fe !important;
        color: #6d28d9 !important;
      }
      .react-datepicker__time-container {
        border: 2px solid #a78bfa !important;
        box-shadow: 0 4px 24px 0 #a78bfa33 !important;
      }
      `}</style>
    </div>
  )
} 