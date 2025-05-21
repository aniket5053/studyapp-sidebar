"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, Filter, Plus, X, Calendar as CalendarIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
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
import { format, addDays, addWeeks, addMonths, startOfDay, endOfDay, isWithinInterval, parseISO } from "date-fns"

type DateRange = {
  start: Date
  end: Date
}

export function ClassesOverview() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    status: "not-started",
    type: "",
    date: "",
  })
  const [filterType, setFilterType] = useState<string | null>(null)
  const [filterClass, setFilterClass] = useState<string | null>(null)
  const [filterDateRange, setFilterDateRange] = useState<DateRange | null>(null)
  
  const { classes, tasks, addTask, updateTask, deleteTask, getTasksByStatus, updateClass } = useApp()
  const router = useRouter()

  // Local state for drag-and-drop ordering
  const [columns, setColumns] = useState({
    'not-started': getTasksByStatus('not-started'),
    'to-submit': getTasksByStatus('to-submit'),
    'done': getTasksByStatus('done'),
  })

  // Keep columns in sync with context tasks
  useEffect(() => {
    setColumns({
      'not-started': getTasksByStatus('not-started'),
      'to-submit': getTasksByStatus('to-submit'),
      'done': getTasksByStatus('done'),
    })
  }, [tasks])

  // Handle drag end
  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result
    if (!destination) return
    const sourceCol = source.droppableId
    const destCol = destination.droppableId
    if (sourceCol === destCol) {
      // Reorder within column
      const newTasks = Array.from(columns[sourceCol])
      const [removed] = newTasks.splice(source.index, 1)
      newTasks.splice(destination.index, 0, removed)
      setColumns({
        ...columns,
        [sourceCol]: newTasks,
      })
    } else {
      // Move to another column (status change)
      const sourceTasks = Array.from(columns[sourceCol])
      const [removed] = sourceTasks.splice(source.index, 1)
      removed.status = destCol as Task['status']
      updateTask(draggableId, { status: destCol as Task['status'] })
      const destTasks = Array.from(columns[destCol])
      destTasks.splice(destination.index, 0, removed)
      setColumns({
        ...columns,
        [sourceCol]: sourceTasks,
        [destCol]: destTasks,
      })
    }
  }

  // Handle task creation
  const handleCreateTask = () => {
    if (newTask.title && newTask.type && newTask.date) {
      addTask(newTask as Omit<Task, "id">)
      setNewTask({
        title: "",
        status: "not-started",
        type: "",
        date: "",
      })
      setIsAddTaskOpen(false)
    }
  }

  // Handle task deletion
  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId)
  }

  // Get unique task types for filter
  const taskTypes = Array.from(new Set(tasks.map(task => task.type)))

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString)
      return format(date, 'MMMM d, yyyy')
    } catch (e) {
      return dateString
    }
  }

  // Filter tasks based on selected filters
  const filterTasks = (tasks: Task[]) => {
    return tasks.filter(task => {
      // Filter by type
      if (filterType && task.type !== filterType) return false
      
      // Filter by class
      if (filterClass && task.classId !== filterClass) return false
      
      // Filter by date range
      if (filterDateRange && task.date) {
        const taskDate = parseISO(task.date)
        if (!isWithinInterval(taskDate, {
          start: startOfDay(filterDateRange.start),
          end: endOfDay(filterDateRange.end)
        })) return false
      }
      
      return true
    })
  }

  // Get date range display text
  const getDateRangeText = () => {
    if (!filterDateRange) return 'Due date'
    const today = startOfDay(new Date())
    const tomorrow = addDays(today, 1)
    const nextWeek = addWeeks(today, 1)
    const nextMonth = addMonths(today, 1)

    if (filterDateRange.start.getTime() === today.getTime() && 
        filterDateRange.end.getTime() === today.getTime()) {
      return 'Today'
    }
    if (filterDateRange.start.getTime() === tomorrow.getTime() && 
        filterDateRange.end.getTime() === tomorrow.getTime()) {
      return 'Tomorrow'
    }
    if (filterDateRange.start.getTime() === today.getTime() && 
        filterDateRange.end.getTime() === nextWeek.getTime()) {
      return 'Next week'
    }
    if (filterDateRange.start.getTime() === today.getTime() && 
        filterDateRange.end.getTime() === nextMonth.getTime()) {
      return 'Next month'
    }
    return `${format(filterDateRange.start, 'MMM d')} - ${format(filterDateRange.end, 'MMM d')}`
  }

  // Add capitalizeWords function
  function capitalizeWords(str: string) {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  // Update the task type and class selection UI
  const getClassColor = (classId: string) => {
    const cls = classes.find(c => c.id === classId)
    return cls ? cls.color : '#000'
  }

  // Update the task card badges to use proper capitalization
  const getTaskTypeColors = (type: string) => {
    // Implement your logic to determine the color based on the task type
    return 'bg-blue-50 text-blue-700'
  }

  const [editClassColorId, setEditClassColorId] = useState<string | null>(null)
  const [colorPickerValue, setColorPickerValue] = useState<string>("")

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <motion.h1
          className="text-4xl font-bold font-display"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Dashboard
        </motion.h1>
        <div className="flex items-center gap-2">
          <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Task Type</Label>
                  <Input
                    id="type"
                    placeholder="e.g., homework, quiz, lab"
                    value={newTask.type}
                    onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Due Date (required)</Label>
                  <Input
                    id="date"
                    type="date"
                    required
                    value={newTask.date}
                    onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class">Class (optional)</Label>
                  <select
                    id="class"
                    className="w-full p-2 rounded-md border border-slate-200"
                    value={newTask.classId || ""}
                    onChange={(e) => setNewTask({ ...newTask, classId: e.target.value })}
                  >
                    <option value="">Select a class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button onClick={handleCreateTask} className="w-full">
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full text-xs"
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
              className="rounded-full text-xs"
            >
              {filterClass ? classes.find(c => c.id === filterClass)?.name : 'All Classes'}
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="space-y-1">
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
                  onClick={() => setFilterClass(cls.id)}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: getClassColor(cls.id) }}
                    />
                    {capitalizeWords(cls.name)}
                  </div>
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
              className="rounded-full text-xs"
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
                <Button
                  key={type}
                  variant="ghost"
                  size="sm"
                  className={`w-full justify-start ${filterType === type ? 'bg-blue-50 text-blue-700' : ''} ${getTaskTypeColors(type)}`}
                  onClick={() => setFilterType(type)}
                >
                  {capitalizeWords(type)}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['not-started', 'to-submit', 'done'].map((col) => (
            <div key={col} className={
              (col === 'not-started'
                ? "bg-white/80 backdrop-blur-sm rounded-xl border border-slate-100 shadow-lg"
                : col === 'to-submit'
                  ? "bg-white/80 backdrop-blur-sm rounded-xl border border-slate-100 shadow-lg"
                  : "bg-white/80 backdrop-blur-sm rounded-xl border border-slate-100 shadow-lg"
              )
            }>
              <div className={
                col === 'not-started'
                  ? "bg-rose-100 p-3 font-medium text-rose-800 dark:bg-rose-900/40 dark:text-rose-100"
                  : col === 'to-submit'
                    ? "bg-purple-100 p-3 font-medium text-purple-800 dark:bg-purple-900/40 dark:text-purple-100"
                    : "bg-green-100 p-3 font-medium text-green-800 dark:bg-green-900/40 dark:text-green-100"
              }>
                {col === 'not-started' ? 'Not started' : col === 'to-submit' ? 'Yet to submit' : 'Done'}
              </div>
              <Droppable droppableId={col}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-3 space-y-3 min-h-[100px] ${snapshot.isDraggingOver ? 'bg-slate-50/50' : ''}`}
                  >
                    {filterTasks(columns[col]).map((task, idx) => (
                      <Draggable draggableId={task.id} index={idx} key={task.id}>
                        {(provided, snapshot) => (
                          <motion.div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              position: snapshot.isDragging ? 'fixed' : 'static',
                              zIndex: snapshot.isDragging ? 9999 : 'auto',
                              transform: snapshot.isDragging ? provided.draggableProps.style?.transform : 'none',
                              width: snapshot.isDragging ? 'calc(100% - 2rem)' : 'auto'
                            }}
                            layout
                            className={
                              `bg-white rounded-lg border border-slate-200 p-3 cursor-grab relative group transition-shadow ` +
                              (snapshot.isDragging ? 'shadow-2xl' : '')
                            }
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2, layout: { duration: 0.3, type: 'spring' } }}
                          >
                            <h3 className="font-medium text-foreground">{task.title}</h3>
                            {task.date && <p className="text-xs text-slate-500 mt-1">{formatDate(task.date)}</p>}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className={`text-xs ${getTaskTypeColors(task.type)}`}>
                                {capitalizeWords(task.type)}
                              </Badge>
                              {task.classId && (
                                <>
                                  <Badge
                                    variant="outline"
                                    className="text-xs cursor-pointer transition-all"
                                    style={{
                                      backgroundColor: getClassColor(task.classId),
                                      color: '#222',
                                      borderColor: getClassColor(task.classId),
                                      fontWeight: 600,
                                    }}
                                    onClick={e => {
                                      e.stopPropagation();
                                      setEditClassColorId(task.classId);
                                      setColorPickerValue(getClassColor(task.classId));
                                    }}
                                  >
                                    {capitalizeWords(classes.find((c) => c.id === task.classId)?.name || task.classId)}
                                  </Badge>
                                  <Dialog open={editClassColorId === task.classId} onOpenChange={open => {
                                    if (!open) setEditClassColorId(null)
                                  }}>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Pick Class Color</DialogTitle>
                                      </DialogHeader>
                                      <div className="flex items-center gap-4 py-4">
                                        <input
                                          type="color"
                                          value={colorPickerValue}
                                          onChange={e => setColorPickerValue(e.target.value)}
                                          className="w-12 h-12 rounded-full border-2 border-slate-200 cursor-pointer"
                                          aria-label="Pick class color"
                                          style={{ background: colorPickerValue }}
                                        />
                                        <span
                                          className="px-3 py-1 rounded-full font-semibold"
                                          style={{ background: colorPickerValue, color: '#222', border: '1px solid #eee' }}
                                        >
                                          Preview
                                        </span>
                                      </div>
                                      <DialogFooter>
                                        <Button variant="outline" onClick={() => setEditClassColorId(null)}>Cancel</Button>
                                        <Button onClick={() => {
                                          const cls = classes.find(c => c.id === task.classId)
                                          if (cls) {
                                            updateClass(cls.id, { ...cls, color: colorPickerValue })
                                          }
                                          setEditClassColorId(null)
                                        }}>Save Color</Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                </>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteTask(task.id)
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </motion.div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-slate-500"
                      onClick={() => {
                        setNewTask({ ...newTask, status: col })
                        setIsAddTaskOpen(true)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New task
                    </Button>
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}
