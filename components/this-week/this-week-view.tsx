"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, CheckCircle2, Clock, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useApp } from "@/context/app-context"
import type { Task } from "@/lib/data"

export function ThisWeekView() {
  const { tasks, updateTask, classes } = useApp()
  const [thisWeekTasks, setThisWeekTasks] = useState<Task[]>([])
  const [completionRate, setCompletionRate] = useState(0)

  // Get tasks for this week
  useEffect(() => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Start of week (Sunday)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6) // End of week (Saturday)

    const filteredTasks = tasks.filter((task) => {
      if (!task.date) return false

      const taskDate = new Date(task.date)
      return taskDate >= startOfWeek && taskDate <= endOfWeek
    })

    setThisWeekTasks(filteredTasks)

    // Calculate completion rate
    if (filteredTasks.length > 0) {
      const completedTasks = filteredTasks.filter((task) => task.status === "done").length
      setCompletionRate(Math.round((completedTasks / filteredTasks.length) * 100))
    } else {
      setCompletionRate(0)
    }
  }, [tasks])

  // Mark task as done
  const markAsDone = (taskId: string) => {
    updateTask(taskId, { status: "done" })
  }

  // Group tasks by day
  const tasksByDay = thisWeekTasks.reduce(
    (acc, task) => {
      if (!task.date) return acc

      const date = new Date(task.date)
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" })

      if (!acc[dayName]) {
        acc[dayName] = []
      }

      acc[dayName].push(task)
      return acc
    },
    {} as Record<string, Task[]>,
  )

  // Sort days of the week
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const sortedDays = Object.keys(tasksByDay).sort((a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b))

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold font-display dark:text-white">This Week</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1 text-sm bg-white dark:bg-slate-800 dark:text-white">
              <Calendar className="h-4 w-4 mr-2" />
              {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </Badge>
          </div>
        </div>

        <Card className="glass-morphism mb-6">
          <CardHeader>
            <CardTitle className="dark:text-white">Weekly Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium dark:text-white">Completion Rate</p>
                  <p className="text-3xl font-bold dark:text-white">{completionRate}%</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {thisWeekTasks.filter((task) => task.status === "done").length} Completed
                  </Badge>
                  <Badge variant="outline" className="bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300">
                    <Clock className="h-3 w-3 mr-1" />
                    {thisWeekTasks.filter((task) => task.status !== "done").length} Remaining
                  </Badge>
                </div>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {sortedDays.length > 0 ? (
          <div className="space-y-6">
            {sortedDays.map((day) => (
              <Card key={day} className="glass-morphism">
                <CardHeader>
                  <CardTitle>{day}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tasksByDay[day].map((task) => (
                      <motion.div
                        key={task.id}
                        className="flex items-center justify-between p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-slate-400" />
                          <div>
                            <p className="font-medium text-foreground">{task.title}</p>
                            {task.classId && (
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {classes.find((c) => c.id === task.classId)?.name}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`
                              ${
                                task.status === "not-started"
                                  ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800"
                                  : task.status === "to-submit"
                                    ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800"
                                    : "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                              }
                            `}
                          >
                            {task.status === "not-started"
                              ? "Not Started"
                              : task.status === "to-submit"
                                ? "To Submit"
                                : "Done"}
                          </Badge>
                          {task.status !== "done" && (
                            <Button size="sm" variant="outline" onClick={() => markAsDone(task.id)} className="dark:text-white">
                              Mark Done
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass-morphism">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-medium mb-2 dark:text-white">No tasks for this week</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                You don't have any tasks scheduled for this week
              </p>
              <Button onClick={() => (window.location.href = "/tasks")}>Go to Tasks</Button>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  )
}
