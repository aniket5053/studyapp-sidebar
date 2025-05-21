"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, Calendar, CheckCircle2, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useApp } from "@/context/app-context"
import type { Task } from "@/lib/data"

export function UrgentView() {
  const { tasks, updateTask, classes } = useApp()
  const [urgentTasks, setUrgentTasks] = useState<Task[]>([])
  const [todayString, setTodayString] = useState('')

  // Get urgent tasks (due within 3 days and not done)
  useEffect(() => {
    const today = new Date()
    const threeDaysFromNow = new Date(today)
    threeDaysFromNow.setDate(today.getDate() + 3)

    const filtered = tasks.filter((task) => {
      if (!task.date || task.status === "done") return false

      const taskDate = new Date(task.date)
      return taskDate <= threeDaysFromNow && taskDate >= today
    })

    // Sort by date (closest first)
    filtered.sort((a, b) => {
      if (!a.date || !b.date) return 0
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })

    setUrgentTasks(filtered)
  }, [tasks])

  useEffect(() => {
    setTodayString(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }))
  }, [])

  // Mark task as done
  const markAsDone = (taskId: string) => {
    updateTask(taskId, { status: "done" })
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow"
    } else {
      return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
    }
  }

  // Calculate days remaining
  const getDaysRemaining = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()

    // Reset time to compare just dates
    date.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)

    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold font-display dark:text-white">Urgent Tasks</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1 text-sm bg-white dark:bg-slate-800 dark:text-white">
              <Calendar className="h-4 w-4 mr-2" />
              {todayString}
            </Badge>
          </div>
        </div>

        {urgentTasks.length > 0 ? (
          <div className="space-y-4">
            {urgentTasks.map((task) => (
              <motion.div
                key={task.id}
                className="glass-morphism rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden"
                whileHover={{ scale: 1.01 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className={`p-4 flex items-center justify-between ${
                    getDaysRemaining(task.date || "") === 0
                      ? "bg-red-100 dark:bg-red-900/20"
                      : getDaysRemaining(task.date || "") === 1
                        ? "bg-orange-100 dark:bg-orange-900/20"
                        : "bg-yellow-100 dark:bg-yellow-900/20"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      className={`h-5 w-5 ${
                        getDaysRemaining(task.date || "") === 0
                          ? "text-red-600 dark:text-red-400"
                          : getDaysRemaining(task.date || "") === 1
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-yellow-600 dark:text-yellow-400"
                      }`}
                    />
                    <span
                      className={`font-medium ${
                        getDaysRemaining(task.date || "") === 0
                          ? "text-red-800 dark:text-red-300"
                          : getDaysRemaining(task.date || "") === 1
                            ? "text-orange-800 dark:text-orange-300"
                            : "text-yellow-800 dark:text-yellow-300"
                      }`}
                    >
                      Due {formatDate(task.date || "")}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${
                      getDaysRemaining(task.date || "") === 0
                        ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
                        : getDaysRemaining(task.date || "") === 1
                          ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800"
                          : "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800"
                    }`}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {getDaysRemaining(task.date || "") === 0
                      ? "Due today"
                      : getDaysRemaining(task.date || "") === 1
                        ? "Due tomorrow"
                        : `${getDaysRemaining(task.date || "")} days left`}
                  </Badge>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-foreground">{task.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className="bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                        >
                          {task.type}
                        </Badge>
                        {task.classId && (
                          <Badge
                            variant="outline"
                            className="bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                            style={{
                              backgroundColor: classes.find((c) => c.id === task.classId)?.color + "20",
                              color: classes.find((c) => c.id === task.classId)?.color,
                              borderColor: classes.find((c) => c.id === task.classId)?.color + "40",
                            }}
                          >
                            {classes.find((c) => c.id === task.classId)?.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button onClick={() => markAsDone(task.id)} className="dark:text-white">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark as Done
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="glass-morphism">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium mb-2 dark:text-white">No urgent tasks</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                You don't have any urgent tasks due in the next 3 days
              </p>
              <Button onClick={() => (window.location.href = "/tasks")} className="dark:text-white">View All Tasks</Button>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  )
}
