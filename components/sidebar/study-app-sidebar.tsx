"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  FileText,
  Home,
  ListTodo,
  Plus,
  Search,
  Settings,
  Star,
  Sparkles,
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useApp } from "@/context/app-context"
import { ThemeToggle } from "@/components/theme-toggle"

export function StudyAppSidebar({ className }: { className?: string }) {
  const [collapsed, setCollapsed] = useState(false)
  const { classes, activeClassId, setActiveClassId, user } = useApp()
  const router = useRouter()
  const pathname = usePathname()

  // Quick filter data
  const quickFilters = [
    { id: 1, name: "This Week", icon: Calendar, path: "/this-week" },
    { id: 2, name: "Urgent", icon: Star, path: "/urgent" },
    { id: 3, name: "AI Summaries", icon: Sparkles, path: "/ai-summaries" },
  ]

  // Check if the path is active
  const isActive = (path: string) => {
    return pathname === path
  }

  // Handle class click
  const handleClassClick = (classId: string) => {
    setActiveClassId(classId)
    router.push(`/class/${classId}`)
  }

  // Load collapsed state from localStorage
  useEffect(() => {
    const storedCollapsed = localStorage.getItem("sidebar-collapsed")
    if (storedCollapsed) {
      setCollapsed(JSON.parse(storedCollapsed))
    }
  }, [])

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed))
  }, [collapsed])

  return (
    <TooltipProvider delayDuration={300}>
      <motion.div
        className={cn(
          "flex flex-col h-screen bg-white/80 dark:bg-slate-900/90 backdrop-blur-md border-r border-slate-100 dark:border-slate-800",
          "transition-all duration-300 ease-out-back",
          collapsed ? "w-20" : "w-72",
          className,
        )}
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
      >
        {/* Header with logo and collapse button */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          {!collapsed && (
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="bg-gradient-to-r from-violet-400 to-indigo-400 w-8 h-8 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <h1 className="font-bold text-lg font-display dark:text-white">StudyApp</h1>
            </motion.div>
          )}
          {collapsed && (
            <div className="bg-gradient-to-r from-violet-400 to-indigo-400 w-10 h-10 rounded-lg flex items-center justify-center mx-auto">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:scale-105"
          >
            <ChevronLeft
              className={cn(
                "h-5 w-5 text-slate-500 dark:text-slate-400 transition-transform",
                collapsed && "rotate-180",
              )}
            />
          </Button>
        </div>

        {/* Main navigation */}
        <div className="flex flex-col gap-1 p-3">
          <NavItem icon={Home} label="Dashboard" path="/" collapsed={collapsed} isActive={isActive("/")} />
          <NavItem icon={ListTodo} label="Tasks" path="/tasks" collapsed={collapsed} isActive={isActive("/tasks")} />
          <NavItem
            icon={Calendar}
            label="Calendar"
            path="/calendar"
            collapsed={collapsed}
            isActive={isActive("/calendar")}
          />
          <NavItem icon={FileText} label="Notes" path="/notes" collapsed={collapsed} isActive={isActive("/notes")} />
          <NavItem icon={Search} label="Search" path="/search" collapsed={collapsed} isActive={isActive("/search")} />
        </div>

        {/* Class workspaces */}
        <div className="flex-1 overflow-auto px-3 py-4">
          {!collapsed && (
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400">MY CLASSES</h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-110 transition-all"
                onClick={() => router.push("/add-class")}
              >
                <Plus className="h-4 w-4 dark:text-slate-400" />
                <span className="sr-only">Add class</span>
              </Button>
            </div>
          )}

          <div className="space-y-2">
            {classes.map((classItem) => (
              <ClassWorkspaceItem
                key={classItem.id}
                classData={classItem}
                collapsed={collapsed}
                isActive={activeClassId === classItem.id}
                onClick={() => handleClassClick(classItem.id)}
              />
            ))}
          </div>

          {/* Quick filters */}
          {!collapsed && (
            <>
              <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-6 mb-3">QUICK FILTERS</h2>
              <div className="space-y-1">
                {quickFilters.map((filter) => (
                  <Button
                    key={filter.id}
                    variant="ghost"
                    className="w-full justify-start text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg h-9 px-3 font-normal"
                    onClick={() => router.push(filter.path)}
                  >
                    <filter.icon className="mr-2 h-4 w-4" />
                    {filter.name}
                  </Button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* User profile */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <div
            className={cn(
              "flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer",
              collapsed && "justify-center",
            )}
            onClick={() => router.push("/profile")}
          >
            <Avatar className="h-9 w-9 border-2 border-white dark:border-slate-700 shadow-sm">
              <AvatarImage src="/placeholder.svg?height=36&width=36" alt="User" />
              <AvatarFallback className="bg-gradient-to-br from-violet-400 to-indigo-400 text-white">
                {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium dark:text-white">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user?.email || 'No email'}
                </p>
              </div>
            )}
            {!collapsed && (
              <div className="flex items-center gap-1">
                <ThemeToggle />
                <Settings className="h-4 w-4 text-slate-400" />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  )
}

// Navigation item component
function NavItem({
  icon: Icon,
  label,
  path,
  collapsed,
  isActive,
}: {
  icon: React.ElementType
  label: string
  path: string
  collapsed: boolean
  isActive: boolean
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href={path}>
          <Button
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all hover:scale-[1.02]",
              collapsed && "justify-center px-0",
              isActive &&
                "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground hover:bg-primary/20 dark:hover:bg-primary/30 hover:text-primary",
            )}
          >
            <Icon className={cn("h-5 w-5", !collapsed && "mr-3")} />
            {!collapsed && <span>{label}</span>}
          </Button>
        </Link>
      </TooltipTrigger>
      {collapsed && <TooltipContent side="right">{label}</TooltipContent>}
    </Tooltip>
  )
}

// Class workspace item component
function ClassWorkspaceItem({
  classData,
  collapsed,
  isActive,
  onClick,
}: {
  classData: { id: string; name: string; color: string; initial: string; tasks: number }
  collapsed: boolean
  isActive: boolean
  onClick: () => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          className={cn(
            "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all",
            isActive ? "bg-slate-100 dark:bg-slate-800" : "hover:bg-slate-50 dark:hover:bg-slate-800/50",
            collapsed && "justify-center p-2",
          )}
          onClick={onClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div
            className="flex-shrink-0 w-9 h-9 rounded-md flex items-center justify-center text-sm font-medium text-white"
            style={{ backgroundColor: classData.color }}
          >
            {classData.initial}
          </div>

          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-white">{classData.name}</p>
              </div>

              {classData.tasks > 0 && (
                <Badge variant="outline" className="bg-white dark:bg-slate-700 text-xs font-medium">
                  {classData.tasks}
                </Badge>
              )}
            </>
          )}
        </motion.div>
      </TooltipTrigger>
      {collapsed && (
        <TooltipContent side="right" className="flex flex-col gap-1">
          <p className="font-medium">{classData.name}</p>
          {classData.tasks > 0 && <p className="text-xs text-slate-500">{classData.tasks} tasks pending</p>}
        </TooltipContent>
      )}
    </Tooltip>
  )
}
