/**
 * UnifiedTaskBoard Component
 * 
 * This is the main task management component that provides a Kanban-style board interface
 * for managing tasks. It includes features like:
 * - Drag and drop task management
 * - Task filtering and sorting
 * - Task type management with colors
 * - Task creation, editing, and deletion
 * - Date-based task organization
 * - Class assignment for tasks
 * 
 * The component uses a column-based layout with four status columns:
 * - Not Started
 * - In Progress
 * - Yet to Submit
 * - Done
 */

"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, Plus, X, Calendar as CalendarIcon, Paintbrush, Pencil, Settings } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useApp } from "@/context/app-context"
import type { Task, Class } from "@/lib/data"
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
  removeTaskType,
  archiveCompletedTasks
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
import { FiltersBar } from './components/FiltersBar'
import { TaskColumn } from './components/TaskColumn'
import { AddTaskDialog } from './components/AddTaskDialog'
import { EditTaskDialog } from './components/EditTaskDialog'
import { ArchivedTasksView } from './components/ArchivedTasksView'
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { supabase } from '@/lib/supabase'


// Main Component
export function UnifiedTaskBoard({ title = "Tasks", showAddButton = true, showFilters = true }: UnifiedTaskBoardProps) {
  // State management for task creation and editing
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    status: "not-started",
    type: "",
    date: "",
  })
  
  // State management for filters
  const [filterType, setFilterType] = useState<string | null>(null)
  const [filterClass, setFilterClass] = useState<string | null>(null)
  const [filterDateRange, setFilterDateRange] = useState<{ start: Date, end: Date } | null>(null)
  
  // State management for task editing
  const [editTask, setEditTask] = useState<Partial<Task> | null>(null)
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false)
  
  // State management for type colors
  const [editTypeColor, setEditTypeColor] = useState<string | null>(null)
  const [typeColorValue, setTypeColorValue] = useState<string>("")
  const [typeColors, setTypeColors] = useState<Record<string, string>>({})
  
  // State management for class colors
  const [editClassColorId, setEditClassColorId] = useState<string | null>(null)
  const [classColorPickerValue, setClassColorPickerValue] = useState<string>("")
  
  // State management for dropdowns
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [showClassDropdown, setShowClassDropdown] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  
  // Refs for input elements
  const typeInputRef = useRef<HTMLInputElement>(null)
  const classInputRef = useRef<HTMLInputElement>(null)
  const statusInputRef = useRef<HTMLInputElement>(null)
  
  // State management for deletion confirmations
  const [deleteTypeConfirm, setDeleteTypeConfirm] = useState<string | null>(null)
  const [deleteTypeWithTasks, setDeleteTypeWithTasks] = useState<{type: string, count: number} | null>(null)
  const [deleteTaskConfirm, setDeleteTaskConfirm] = useState<string | null>(null)
  
  // State management for new type input
  const [newTypeInput, setNewTypeInput] = useState("")
  
  // State management for recently deleted types
  const [recentlyDeletedType, setRecentlyDeletedType] = useState<{type: string, tasks: Task[], timer: NodeJS.Timeout | null}>({type: '', tasks: [], timer: null})
  
  // State management for form validation
  const [validation, setValidation] = useState<{title: boolean, type: boolean, date: boolean}>({title: false, type: false, date: false});
  const [editValidation, setEditValidation] = useState<{title: boolean, type: boolean, date: boolean}>({title: false, type: false, date: false});
  
  // State management for sorting
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'type'>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true)

  // Get app context
  const { classes, tasks, addTask, updateTask, deleteTask, getTasksByStatus, updateClass, user, setTasks, setClasses } = useApp()

  // State management for archived tasks view
  const [showArchived, setShowArchived] = useState(false)

  // Load tasks and classes
  const loadData = async () => {
    try {
      if (!user?.id) return

      // Load tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
      
      if (tasksError) throw tasksError
      setTasks(tasksData as Task[])

      // Load classes
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .eq('user_id', user.id)
      
      if (classesError) throw classesError
      setClasses(classesData as Class[])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    }
  }

  // Check for tasks to archive periodically
  useEffect(() => {
    if (!user?.id) return

    const checkAndArchiveTasks = async () => {
      try {
        if (!user?.id) return
        const archivedTasks = await archiveCompletedTasks(user.id)
        if (archivedTasks.length > 0) {
          // Reload tasks after archiving
          await loadData()
          toast.success(`Archived ${archivedTasks.length} completed tasks`)
        }
      } catch (error) {
        console.error('Error archiving tasks:', error)
        if (error instanceof Error) {
          toast.error(error.message)
        } else {
          toast.error('Failed to archive tasks')
        }
      }
    }

    // Check immediately on mount
    checkAndArchiveTasks()

    // Then check every hour
    const interval = setInterval(checkAndArchiveTasks, 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [user])

  // Load task types and their colors on component mount
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

  // Initialize columns with tasks
  const [columns, setColumns] = useState({
    'not-started': getTasksByStatus('not-started'),
    'in-progress': getTasksByStatus('in-progress'),
    'to-submit': getTasksByStatus('to-submit'),
    'done': getTasksByStatus('done'),
  })

  // Update columns when tasks change
  useEffect(() => {
    setColumns({
      'not-started': getTasksByStatus('not-started'),
      'in-progress': getTasksByStatus('in-progress'),
      'to-submit': getTasksByStatus('to-submit'),
      'done': getTasksByStatus('done'),
    })
  }, [tasks])

  // Handle drag and drop functionality
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
      // Update the task in the columns with the new status immediately
      taskToMove.status = destCol
      
      // Update the task in the main tasks array immediately
      const updatedTasks = tasks.map(t => t.id === taskToMove.id ? { ...t, status: destCol } : t)
      setTasks(updatedTasks)
      
      // Update the columns state immediately
      const destTasks = Array.from(newColumns[destCol])
      destTasks.splice(destination.index, 0, taskToMove)
      newColumns[destCol] = destTasks
      setColumns(newColumns)

      // Then handle the database update asynchronously
      try {
        await updateTaskInDB(taskToMove.id!, { 
          status: destCol,
          user_id: user.id
        })
      } catch (error) {
        console.error('Error updating task status:', error)
        toast.error('Failed to update task status')
        
        // Revert the changes if the database update fails
        const revertedTasks = tasks.map(t => t.id === taskToMove.id ? { ...t, status: sourceCol } : t)
        setTasks(revertedTasks)
        setColumns(columns)
      }
    } else {
      // If moving within the same column, just update the order
      const destTasks = Array.from(newColumns[destCol])
      destTasks.splice(destination.index, 0, taskToMove)
      newColumns[destCol] = destTasks
      setColumns(newColumns)
    }
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
        class_id: newTask.class_id || '',
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

  // Get unique task types
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

  // Color helper functions
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

  // Reset new task form
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
        <div className="flex items-center gap-2">
          {showAddButton && (
            <Button onClick={() => setIsAddTaskOpen(true)}>
              Add Task
            </Button>
          )}
          <Drawer open={showArchived} onOpenChange={setShowArchived}>
            <DrawerTrigger asChild>
              <Button variant="outline">
                View Archived Tasks
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-w-lg ml-auto">
              <DialogTitle className="sr-only">Archived Tasks</DialogTitle>
              <ArchivedTasksView
                tasks={tasks}
                typeColors={typeColors}
                getTaskTypeColors={getTaskTypeColors}
                classes={classes}
              />
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <>
          {showFilters && (
            <FiltersBar
              filterDateRange={filterDateRange}
              setFilterDateRange={setFilterDateRange}
              filterClass={filterClass}
              setFilterClass={setFilterClass}
              filterType={filterType}
              setFilterType={setFilterType}
              classes={classes}
              taskTypes={taskTypes}
              typeColors={typeColors}
              getTaskTypeColors={getTaskTypeColors}
              setEditTypeColor={setEditTypeColor}
              setTypeColorValue={setTypeColorValue}
              setDeleteTypeWithTasks={setDeleteTypeWithTasks}
              setDeleteTypeConfirm={setDeleteTypeConfirm}
              newTypeInput={newTypeInput}
              setNewTypeInput={setNewTypeInput}
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortDirection={sortDirection}
              setSortDirection={setSortDirection}
              tasks={tasks}
            />
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
              {[
                { id: 'not-started', title: 'Not started' },
                { id: 'in-progress', title: 'In Progress' },
                { id: 'to-submit', title: 'Yet to submit' },
                { id: 'done', title: 'Done' }
              ].map(({ id, title }) => (
                <TaskColumn
                  key={id}
                  id={id}
                  title={title}
                  tasks={filterTasks(columns[id as keyof typeof columns])}
                  onNewTaskClick={() => {
                    setNewTask({ ...newTask, status: id as Task['status'] });
                    setIsAddTaskOpen(true);
                  }}
                  onEditTask={(task) => {
                    setEditTask(task);
                    setIsEditTaskOpen(true);
                  }}
                  onDeleteTask={(taskId) => setDeleteTaskConfirm(taskId)}
                  typeColors={typeColors}
                  getTaskTypeColors={getTaskTypeColors}
                  classes={classes}
                />
              ))}
            </div>
          </DragDropContext>
        </>
      )}

      <AddTaskDialog
        isOpen={isAddTaskOpen}
        onOpenChange={(open) => {
          setIsAddTaskOpen(open);
          if (!open) {
            resetNewTaskForm();
          }
        }}
        newTask={newTask}
        setNewTask={setNewTask}
        validation={validation}
        setValidation={setValidation}
        handleCreateTask={handleCreateTask}
        taskTypes={taskTypes}
        typeColors={typeColors}
        getTaskTypeColors={getTaskTypeColors}
        classes={classes}
        showTypeDropdown={showTypeDropdown}
        setShowTypeDropdown={setShowTypeDropdown}
        showClassDropdown={showClassDropdown}
        setShowClassDropdown={setShowClassDropdown}
        typeInputRef={typeInputRef}
        classInputRef={classInputRef}
      />

      <EditTaskDialog
        isOpen={isEditTaskOpen}
        onOpenChange={setIsEditTaskOpen}
        editTask={editTask}
        setEditTask={setEditTask}
        editValidation={editValidation}
        setEditValidation={setEditValidation}
        handleEditTask={handleEditTask}
        taskTypes={taskTypes}
        typeColors={typeColors}
        getTaskTypeColors={getTaskTypeColors}
        classes={classes}
        showTypeDropdown={showTypeDropdown}
        setShowTypeDropdown={setShowTypeDropdown}
        showClassDropdown={showClassDropdown}
        setShowClassDropdown={setShowClassDropdown}
        showStatusDropdown={showStatusDropdown}
        setShowStatusDropdown={setShowStatusDropdown}
        typeInputRef={typeInputRef}
        classInputRef={classInputRef}
        statusInputRef={statusInputRef}
      />

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