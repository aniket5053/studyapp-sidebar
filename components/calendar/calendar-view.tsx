"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Plus, Check, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useApp } from "@/context/app-context"
import type { Task } from "@/lib/data"
import { getTaskTypeColors, getClassColor } from "@/lib/constants"
import { formatDate, format12HourTime, capitalizeWords } from "@/components/tasks/task-utils"
import { parseISO, isBefore, addHours } from 'date-fns'
import { AddTaskDialog } from "@/components/tasks/components/AddTaskDialog"
import { EditTaskDialog } from "@/components/tasks/components/EditTaskDialog"

// Represents the props for the DayContent component in react-day-picker v8
type DayContentProps = {
  /** The date representing the day. */
  date: Date;
  /** The month where the day is displayed. */
  displayMonth: Date;
  /** The active modifiers for the given date. */
  activeModifiers: Record<string, true>;
};

export function CalendarView() {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [month, setMonth] = useState<Date | undefined>(undefined)
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [newEvent, setNewEvent] = useState<Partial<Task>>({
    title: "",
    type: "event",
    status: "not-started",
    date: "",
  })
  const { tasks, addTask, classes, typeColors, updateTask } = useApp()
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    status: "not-started",
    type: "",
    date: "",
  })
  const [validation, setValidation] = useState({ title: false, type: false, date: false })
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [showClassDropdown, setShowClassDropdown] = useState(false)
  const typeInputRef = useRef<HTMLInputElement | null>(null)
  const classInputRef = useRef<HTMLInputElement | null>(null)
  const [editTask, setEditTask] = useState<Partial<Task> | null>(null)
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false)
  const [editValidation, setEditValidation] = useState({ title: false, type: false, date: false })
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const statusInputRef = useRef<HTMLInputElement | null>(null)

  // Set initial date and month on client only
  useEffect(() => {
    const now = new Date()
    setDate(now)
    setMonth(now)
    setNewEvent((prev) => ({
      ...prev,
      date: now.toISOString().split("T")[0],
    }))
  }, [])

  // Get events for the selected date
  const getEventsForDate = (date: Date | undefined) => {
    if (!date) return []

    const dateString = date.toISOString().split("T")[0]
    return tasks.filter((task) => {
      if (!task.date) return false
      return task.date.includes(dateString)
    })
  }

  // Get all events for the current month
  const getEventsForMonth = () => {
    if (!month) return []
    const currentMonth = month.getMonth()
    const currentYear = month.getFullYear()

    return tasks.filter((task) => {
      if (!task.date) return false
      const taskDate = new Date(task.date)
      return taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear
    })
  }

  // Handle event creation
  const handleCreateEvent = () => {
    if (newEvent.title && newEvent.date) {
      addTask({ ...(newEvent as Omit<Task, 'id' | 'user_id'>) } as Task)
      setNewEvent({
        title: "",
        type: "event",
        status: "not-started",
        date: new Date().toISOString().split("T")[0],
      })
      setIsAddEventOpen(false)
    }
  }

  // Navigate to previous month
  const previousMonth = () => {
    if (!month) return
    const newMonth = new Date(month)
    newMonth.setMonth(newMonth.getMonth() - 1)
    setMonth(newMonth)
  }

  // Navigate to next month
  const nextMonth = () => {
    if (!month) return
    const newMonth = new Date(month)
    newMonth.setMonth(newMonth.getMonth() + 1)
    setMonth(newMonth)
  }

  // Format date for display (accepts string or Date)
  const formatDate = (date: string | Date | undefined) => {
    if (!date) return ""
    const d = typeof date === "string" ? new Date(date) : date
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
  }

  // Get events for the selected date
  const selectedDateEvents = getEventsForDate(date)
  const monthEvents = getEventsForMonth()

  // Add handleCreateTask logic (copied from Tasks page, simplified for calendar)
  const handleCreateTask = () => {
    const missing = {
      title: !newTask.title?.trim(),
      type: !newTask.type?.trim(),
      date: !newTask.date,
    }
    setValidation(missing)
    if (missing.title || missing.type || missing.date) return
    addTask({ ...(newTask as Omit<Task, 'id' | 'user_id'>) } as Task)
    setNewTask({ title: "", status: "not-started", type: "", date: "" })
    setIsAddTaskOpen(false)
  }

  // Provide a getTaskTypeColors function for AddTaskDialog
  const getTaskTypeColors = (type: string) => {
    if (typeColors[type]) {
      return { bg: typeColors[type], text: '#000000' }
    }
    return { bg: '#f5f5f5', text: '#000000' }
  }

  // Add edit task state and handlers
  const handleEditTask = () => {
    if (!editTask) return
    const missing = {
      title: !editTask.title?.trim(),
      type: !editTask.type?.trim(),
      date: !editTask.date,
    }
    setEditValidation(missing)
    if (missing.title || missing.type || missing.date) return
    updateTask(editTask.id!, {
      title: editTask.title!,
      type: editTask.type!,
      status: editTask.status!,
      date: editTask.date!,
      class_id: editTask.class_id,
    })
    setIsEditTaskOpen(false)
  }

  return (
    <div className="max-w-5xl mx-auto p-2 lg:p-2">
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <motion.h1
          className="text-3xl lg:text-4xl font-bold font-display dark:text-white"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Calendar
        </motion.h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-4 w-full">
        <Card className="glass-morphism shadow-lg lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-0 mb-0 border-b-0 border-none dark:border-none">
            <CardTitle className="text-lg lg:text-xl font-semibold dark:text-white">
              {month ? month.toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "Select a month"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-0 lg:pt-0 lg:pb-0 flex flex-col items-center justify-center min-h-[400px] lg:min-h-[500px] flex items-center justify-center">
            <Calendar
              numberOfMonths={2}
              classNames={{
                root: "w-full mx-auto",
                months: "flex flex-row space-x-4 justify-center",
                cell: "h-10 w-10 text-center text-base p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-10 w-10 p-0 font-normal aria-selected:opacity-100 text-slate-700 dark:text-white rounded-full",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full",
                day_today: "bg-accent text-accent-foreground",
                day_outside: "text-slate-500 opacity-50 dark:text-slate-400",
                day_disabled: "text-slate-500 opacity-50 dark:text-slate-400",
                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible"
              }}
              mode="single"
              selected={date}
              onSelect={setDate}
              month={month}
              onMonthChange={setMonth}
              className="rounded-md w-full space-y-2"
              components={{
                DayContent: (props: DayContentProps) => {
                  const day = props.date
                  const events = monthEvents.filter((task) => {
                    if (!task.date) return false
                    const taskDate = new Date(task.date)
                    return (
                      taskDate.getDate() === day.getDate() &&
                      taskDate.getMonth() === day.getMonth() &&
                      taskDate.getFullYear() === day.getFullYear()
                    )
                  })
                  const hasEvents = events.length > 0
                  return (
                    <div className="relative flex flex-col h-12 w-full items-center justify-center group">
                      <span className={`text-sm ${hasEvents ? 'font-medium' : ''}`}>{day.getDate()}</span>
                      {hasEvents && (
                        <div className="flex gap-1 mt-1">
                          {events.slice(0, 3).map((_, index) => (
                            <div key={index} className="w-1 h-1 rounded-full bg-primary"></div>
                          ))}
                          {events.length > 3 && (
                            <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                }
              } as any}
            />
          </CardContent>
        </Card>

        <Card className="glass-morphism shadow-lg h-fit">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700">
            <CardTitle className="text-xl font-semibold dark:text-white">
              {date ? formatDate(date) : "Select a date"}
            </CardTitle>
            {selectedDateEvents.length > 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {selectedDateEvents.length} task{selectedDateEvents.length !== 1 ? 's' : ''} scheduled
              </p>
            )}
          </CardHeader>
          <CardContent className="pt-4">
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-4">
                {selectedDateEvents.map((task) => {
                  const now = new Date();
                  const taskDate = task.date ? parseISO(task.date) : null;
                  let highlightClass = "";
                  if (taskDate && task.status !== 'done') {
                    if (isBefore(taskDate, now)) {
                      highlightClass = "ring-2 ring-red-400 border-red-300";
                    } else if (isBefore(taskDate, addHours(now, 24))) {
                      highlightClass = "ring-2 ring-yellow-400 border-yellow-300";
                    }
                  }
                  return (
                    <motion.div
                      key={task.id}
                      className={`p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary/50 dark:hover:border-primary/50 transition-colors shadow-2xl ${highlightClass} relative group`}
                      whileHover={{ scale: 1.02 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Action buttons: done and edit */}
                      {task.status !== 'done' && (
                        <div className="absolute bottom-2 right-2 flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              setEditTask(task)
                              setIsEditTaskOpen(true)
                            }}
                            title="Edit task"
                          >
                            <Pencil className="h-3 w-3 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => updateTask(task.id!, { ...task, status: 'done' })}
                            title="Mark as done"
                          >
                            <Check className="h-3 w-3 text-green-600" />
                          </Button>
                        </div>
                      )}
                      <div className="flex items-start justify-between gap-4 group">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-slate-900 dark:text-white">{task.title}</h3>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span
                              className="px-2 py-0.5 text-xs font-medium rounded-full"
                              style={{ backgroundColor: typeColors[task.type] || '#f5f5f5', color: '#000', fontWeight: 600 }}
                            >
                              {capitalizeWords(task.type)}
                            </span>
                            {task.class_id && (() => {
                              const cls = classes.find(c => c.id === task.class_id)
                              return cls ? (
                                <span className="px-2 py-0.5 text-xs font-medium rounded-full" style={{ backgroundColor: cls.color, color: '#000', fontWeight: 600 }}>
                                  {cls.code}
                                </span>
                              ) : null
                            })()}
                            {(() => {
                              const now = new Date();
                              const taskDate = task.date ? parseISO(task.date) : null;
                              let tag = null;
                              if (taskDate && task.status !== 'done') {
                                if (isBefore(taskDate, now)) {
                                  tag = <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">Overdue</span>;
                                } else if (isBefore(taskDate, addHours(now, 24))) {
                                  tag = <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">Due Soon</span>;
                                }
                              }
                              return tag;
                            })()}
                          </div>
                          {(task as any).description?.length > 0 && (
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{(task as any).description}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap mt-2 sm:mt-0">
                            {format12HourTime(task.date)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-slate-500 dark:text-slate-400 mb-4">No tasks for this date</p>
              </div>
            )}
            <div className="flex justify-center mt-4">
              <Button
                onClick={() => {
                  if (date) {
                    setNewTask({
                      ...newTask,
                      date: date.toISOString().split("T")[0],
                    })
                    setIsAddTaskOpen(true)
                  }
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 glass-morphism">
        <CardHeader>
          <CardTitle className="text-xl font-medium dark:text-white">Upcoming Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tasks
              .filter((task) => task.date)
              .sort((a, b) => new Date(a.date || "").getTime() - new Date(b.date || "").getTime())
              .slice(0, 5)
              .map((task) => {
                const now = new Date();
                const taskDate = task.date ? parseISO(task.date) : null;
                let highlightClass = "";
                if (taskDate && task.status !== 'done') {
                  if (isBefore(taskDate, now)) {
                    highlightClass = "ring-2 ring-red-400 border-red-300";
                  } else if (isBefore(taskDate, addHours(now, 24))) {
                    highlightClass = "ring-2 ring-yellow-400 border-yellow-300";
                  }
                }
                return (
                  <motion.div
                    key={task.id}
                    className={`p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary/50 dark:hover:border-primary/50 transition-colors shadow-2xl ${highlightClass}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <h3 className="font-medium text-foreground">{task.title}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className="px-2 py-0.5 text-xs font-medium rounded-full"
                        style={{ backgroundColor: typeColors[task.type] || '#f5f5f5', color: '#000', fontWeight: 600 }}
                      >
                        {capitalizeWords(task.type)}
                      </span>
                      {task.class_id && (() => {
                        const cls = classes.find(c => c.id === task.class_id)
                        return cls ? (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full" style={{ backgroundColor: cls.color, color: '#000', fontWeight: 600 }}>
                            {cls.code}
                          </span>
                        ) : null
                      })()}
                      <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(task.date)}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{format12HourTime(task.date)}</span>
                      {(() => {
                        const now = new Date();
                        const taskDate = task.date ? parseISO(task.date) : null;
                        let tag = null;
                        if (taskDate && task.status !== 'done') {
                          if (isBefore(taskDate, now)) {
                            tag = <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">Overdue</span>;
                          } else if (isBefore(taskDate, addHours(now, 24))) {
                            tag = <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">Due Soon</span>;
                          }
                        }
                        return tag;
                      })()}
                    </div>
                    {(task as any).description?.length > 0 && (
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{(task as any).description}</p>
                    )}
                  </motion.div>
                );
              })}
            {tasks.filter((task) => task.date).length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-slate-500 dark:text-slate-400 mb-4">No upcoming tasks</p>
                <Button onClick={() => setIsAddEventOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AddTaskDialog
        isOpen={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
        newTask={newTask}
        setNewTask={setNewTask}
        validation={validation}
        setValidation={setValidation}
        handleCreateTask={handleCreateTask}
        taskTypes={Object.keys(typeColors)}
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
        taskTypes={Object.keys(typeColors)}
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
    </div>
  )
}
