"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useApp } from "@/context/app-context"
import type { Task } from "@/lib/data"

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
  const { tasks, addTask, classes } = useApp()

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
      addTask(newEvent as Omit<Task, "id">)
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

  // Format date for display
  const formatDate = (date: Date | undefined) => {
    if (!date) return ""
    return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
  }

  // Get events for the selected date
  const selectedDateEvents = getEventsForDate(date)
  const monthEvents = getEventsForMonth()

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <motion.h1
          className="text-4xl font-bold font-display dark:text-white"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Calendar
        </motion.h1>
        <div className="flex items-center gap-2">
          <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter event title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Event Type</Label>
                  <Input
                    id="type"
                    placeholder="e.g., meeting, appointment"
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class">Class (optional)</Label>
                  <select
                    id="class"
                    className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    value={newEvent.classId || ""}
                    onChange={(e) => setNewEvent({ ...newEvent, classId: e.target.value })}
                  >
                    <option value="">Select a class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button onClick={handleCreateEvent} className="w-full">
                  Create Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass-morphism">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-medium dark:text-white">
              {month ? month.toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "Select a month"}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              month={month}
              onMonthChange={setMonth}
              className="rounded-md"
              components={
                {
                  DayContent: (props: DayContentProps) => {
                    const day = props.date
                    const hasEvents = monthEvents.some((event) => {
                      if (!event.date) return false
                      const eventDate = new Date(event.date)
                      return (
                        eventDate.getDate() === day.getDate() &&
                        eventDate.getMonth() === day.getMonth() &&
                        eventDate.getFullYear() === day.getFullYear()
                      )
                    })
                    return (
                      <div className="relative flex h-9 w-9 items-center justify-center">
                        <span>{day.getDate()}</span>
                        {hasEvents && (
                          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"></div>
                        )}
                      </div>
                    )
                  }
                } as any
              }
            />
          </CardContent>
        </Card>

        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle className="text-xl font-medium dark:text-white">
              {date ? formatDate(date) : "Select a date"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedDateEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg task-card"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <h3 className="font-medium text-foreground">{event.title}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            event.classId && classes.find((c) => c.id === event.classId)
                              ? classes.find((c) => c.id === event.classId)?.color
                              : "#6366F1",
                        }}
                      ></div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{event.type}</p>
                      {event.classId && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {classes.find((c) => c.id === event.classId)?.name}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-slate-500 dark:text-slate-400 mb-4">No events for this date</p>
                <Button
                  onClick={() => {
                    if (date) {
                      setNewEvent({
                        ...newEvent,
                        date: date.toISOString().split("T")[0],
                      })
                      setIsAddEventOpen(true)
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 glass-morphism">
        <CardHeader>
          <CardTitle className="text-xl font-medium dark:text-white">Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tasks
              .filter((task) => task.date)
              .sort((a, b) => new Date(a.date || "").getTime() - new Date(b.date || "").getTime())
              .slice(0, 5)
              .map((task) => (
                <motion.div
                  key={task.id}
                  className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg task-card"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <h3 className="font-medium text-foreground">{task.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor:
                          task.classId && classes.find((c) => c.id === task.classId)
                            ? classes.find((c) => c.id === task.classId)?.color
                            : "#6366F1",
                      }}
                    ></div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{task.date}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{task.type}</p>
                  </div>
                </motion.div>
              ))}
            {tasks.filter((task) => task.date).length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-slate-500 dark:text-slate-400 mb-4">No upcoming events</p>
                <Button onClick={() => setIsAddEventOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
