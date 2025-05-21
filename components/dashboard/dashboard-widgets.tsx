"use client"

import { useApp } from "@/context/app-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { format, isToday, isThisWeek, isBefore, parseISO, compareAsc } from "date-fns"
import { Plus, FileText, BookOpen, Calendar as CalendarIcon } from "lucide-react"

export function DashboardWidgets() {
  const { tasks, classes } = useApp()

  // Quick Links
  const quickLinks = [
    { label: "Add Task", icon: Plus, href: "/tasks" },
    { label: "Add Note", icon: FileText, href: "/notes" },
    { label: "Add Class", icon: BookOpen, href: "/add-class" },
  ]

  // Summary Stats
  const today = new Date()
  const tasksDueToday = tasks.filter(t => t.date && isToday(parseISO(t.date)))
  const tasksDueThisWeek = tasks.filter(t => t.date && isThisWeek(parseISO(t.date), { weekStartsOn: 1 }))
  const overdueTasks = tasks.filter(t => t.date && isBefore(parseISO(t.date), today) && t.status !== "done")
  const completedTasks = tasks.filter(t => t.status === "done")

  // Upcoming Deadlines (next 5 by date)
  const upcoming = tasks
    .filter(t => t.date && t.status !== "done" && compareAsc(parseISO(t.date), today) >= 0)
    .sort((a, b) => compareAsc(parseISO(a.date!), parseISO(b.date!)))
    .slice(0, 5)

  // Class Overview
  const classStats = classes.map(cls => ({
    ...cls,
    pending: tasks.filter(t => t.classId === cls.id && t.status !== "done").length,
  }))

  // Recent Activity (last 5 completed)
  const recent = tasks
    .filter(t => t.status === "done" && t.date)
    .sort((a, b) => compareAsc(parseISO(b.date!), parseISO(a.date!)))
    .slice(0, 5)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Top Row: Quick Links & Summary Stats */}
      <div className="flex flex-col gap-4 md:flex-row md:gap-6 col-span-2">
        <div className="flex-1 flex gap-2">
          {quickLinks.map(link => (
            <Button key={link.label} variant="outline" className="flex-1" onClick={() => window.location.href = link.href}>
              <link.icon className="h-4 w-4 mr-2" />
              {link.label}
            </Button>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2">
          <Card className="p-4 text-center">
            <div className="text-xs text-slate-500">Due Today</div>
            <div className="text-2xl font-bold">{tasksDueToday.length}</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-xs text-slate-500">Due This Week</div>
            <div className="text-2xl font-bold">{tasksDueThisWeek.length}</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-xs text-slate-500">Overdue</div>
            <div className="text-2xl font-bold text-red-600">{overdueTasks.length}</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-xs text-slate-500">Completed</div>
            <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
          </Card>
        </div>
      </div>
      {/* Upcoming Deadlines */}
      <Card className="p-4">
        <div className="font-semibold mb-2 flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" /> Upcoming Deadlines
        </div>
        {upcoming.length === 0 ? (
          <div className="text-xs text-slate-500">No upcoming tasks</div>
        ) : (
          <ul className="space-y-1">
            {upcoming.map(task => (
              <li key={task.id} className="flex justify-between items-center text-sm">
                <span>{task.title}</span>
                <span className="text-xs text-slate-500">{format(parseISO(task.date!), "MMM d")}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
      {/* Class Overview */}
      <Card className="p-4">
        <div className="font-semibold mb-2 flex items-center gap-2">
          <BookOpen className="h-4 w-4" /> Class Overview
        </div>
        {classStats.length === 0 ? (
          <div className="text-xs text-slate-500">No classes</div>
        ) : (
          <ul className="space-y-1">
            {classStats.map(cls => (
              <li key={cls.id} className="flex justify-between items-center text-sm">
                <span>{cls.name}</span>
                <span className="text-xs text-slate-500">{cls.pending} pending</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
      {/* Calendar Glance (placeholder) */}
      <Card className="p-4">
        <div className="font-semibold mb-2 flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" /> Calendar Glance
        </div>
        <div className="text-xs text-slate-500">[Mini calendar coming soon]</div>
      </Card>
      {/* Recent Activity (placeholder) */}
      <Card className="p-4 col-span-2">
        <div className="font-semibold mb-2 flex items-center gap-2">
          <FileText className="h-4 w-4" /> Recent Activity
        </div>
        {recent.length === 0 ? (
          <div className="text-xs text-slate-500">No recent activity</div>
        ) : (
          <ul className="space-y-1">
            {recent.map(task => (
              <li key={task.id} className="flex justify-between items-center text-sm">
                <span>{task.title}</span>
                <span className="text-xs text-slate-500">{format(parseISO(task.date!), "MMM d")}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
} 