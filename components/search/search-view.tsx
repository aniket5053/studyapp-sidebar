"use client"

import { Calendar } from "@/components/ui/calendar"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FileText, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useApp } from "@/context/app-context"

export function SearchView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<{
    classes: any[]
    tasks: any[]
    homework: any[]
    labs: any[]
  }>({
    classes: [],
    tasks: [],
    homework: [],
    labs: [],
  })
  const { classes, tasks } = useApp()
  const router = useRouter()
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Load recent searches from localStorage
  useEffect(() => {
    const storedSearches = localStorage.getItem("recent-searches")
    if (storedSearches) {
      setRecentSearches(JSON.parse(storedSearches))
    }
  }, [])

  // Save recent searches to localStorage
  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return

    const updatedSearches = [query, ...recentSearches.filter((search) => search !== query).slice(0, 4)]
    setRecentSearches(updatedSearches)
    localStorage.setItem("recent-searches", JSON.stringify(updatedSearches))
  }

  // Handle search
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults({
        classes: [],
        tasks: [],
        homework: [],
        labs: [],
      })
      return
    }

    const query = searchQuery.toLowerCase()
    saveRecentSearch(searchQuery)

    // Search classes
    const matchedClasses = classes.filter(
      (cls) => cls.name.toLowerCase().includes(query) || cls.code.toLowerCase().includes(query),
    )

    // Search tasks
    const matchedTasks = tasks.filter(
      (task) => task.title.toLowerCase().includes(query) || task.type.toLowerCase().includes(query),
    )

    // Search homework (using tasks with type "homework")
    const matchedHomework = tasks.filter(
      (task) => task.type.toLowerCase() === "homework" && task.title.toLowerCase().includes(query),
    )

    // Search labs (using tasks with type "lab")
    const matchedLabs = tasks.filter(
      (task) => task.type.toLowerCase() === "lab" && task.title.toLowerCase().includes(query),
    )

    setSearchResults({
      classes: matchedClasses,
      tasks: matchedTasks,
      homework: matchedHomework,
      labs: matchedLabs,
    })
  }

  // Handle key press (Enter)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  // Handle recent search click
  const handleRecentSearchClick = (query: string) => {
    setSearchQuery(query)
    setTimeout(() => {
      handleSearch()
    }, 100)
  }

  // Navigate to class
  const handleClassClick = (classId: string) => {
    router.push(`/class/${classId}`)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-display mb-6 dark:text-white">Search</h1>
          <div className="relative">
            <Input
              className="pl-10 h-12 text-lg glass-morphism"
              placeholder="Search for classes, tasks, homework..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Button className="absolute right-1 top-1/2 transform -translate-y-1/2" onClick={handleSearch}>
              Search
            </Button>
          </div>
        </div>

        {searchQuery ? (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-1 rounded-full mb-6">
              <TabsTrigger
                value="all"
                className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                All Results
              </TabsTrigger>
              <TabsTrigger
                value="classes"
                className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Classes
              </TabsTrigger>
              <TabsTrigger
                value="tasks"
                className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Tasks
              </TabsTrigger>
              <TabsTrigger
                value="homework"
                className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Homework
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="space-y-6">
                {searchResults.classes.length > 0 && (
                  <Card className="glass-morphism">
                    <CardHeader>
                      <CardTitle className="dark:text-white">Classes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {searchResults.classes.map((cls) => (
                          <motion.div
                            key={cls.id}
                            className="flex items-center gap-3 p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleClassClick(cls.id)}
                          >
                            <div
                              className="w-8 h-8 rounded-md flex items-center justify-center text-white"
                              style={{ backgroundColor: cls.color }}
                            >
                              {cls.initial}
                            </div>
                            <div>
                              <p className="font-medium dark:text-white">
                                {cls.code}: {cls.name}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {searchResults.tasks.length > 0 && (
                  <Card className="glass-morphism">
                    <CardHeader>
                      <CardTitle className="dark:text-white">Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {searchResults.tasks.map((task) => (
                          <motion.div
                            key={task.id}
                            className="flex items-center justify-between p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-slate-400" />
                              <div>
                                <p className="font-medium dark:text-white">{task.title}</p>
                                {task.date && <p className="text-xs text-slate-500 dark:text-slate-400">{task.date}</p>}
                              </div>
                            </div>
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
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {searchResults.classes.length === 0 && searchResults.tasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium mb-2 dark:text-white">No results found</h3>
                    <p className="text-slate-500 dark:text-slate-400">
                      Try searching for something else or check your spelling
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="classes">
              <Card className="glass-morphism">
                <CardHeader>
                  <CardTitle className="dark:text-white">Classes</CardTitle>
                </CardHeader>
                <CardContent>
                  {searchResults.classes.length > 0 ? (
                    <div className="space-y-3">
                      {searchResults.classes.map((cls) => (
                        <motion.div
                          key={cls.id}
                          className="flex items-center gap-3 p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleClassClick(cls.id)}
                        >
                          <div
                            className="w-8 h-8 rounded-md flex items-center justify-center text-white"
                            style={{ backgroundColor: cls.color }}
                          >
                            {cls.initial}
                          </div>
                          <div>
                            <p className="font-medium dark:text-white">
                              {cls.code}: {cls.name}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Search className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                      <h3 className="text-lg font-medium mb-2 dark:text-white">No classes found</h3>
                      <p className="text-slate-500 dark:text-slate-400">
                        Try searching for something else or check your spelling
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks">
              <Card className="glass-morphism">
                <CardHeader>
                  <CardTitle className="dark:text-white">Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  {searchResults.tasks.length > 0 ? (
                    <div className="space-y-3">
                      {searchResults.tasks.map((task) => (
                        <motion.div
                          key={task.id}
                          className="flex items-center justify-between p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-slate-400" />
                            <div>
                              <p className="font-medium dark:text-white">{task.title}</p>
                              {task.date && <p className="text-xs text-slate-500 dark:text-slate-400">{task.date}</p>}
                            </div>
                          </div>
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
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Search className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                      <h3 className="text-lg font-medium mb-2 dark:text-white">No tasks found</h3>
                      <p className="text-slate-500 dark:text-slate-400">
                        Try searching for something else or check your spelling
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="homework">
              <Card className="glass-morphism">
                <CardHeader>
                  <CardTitle className="dark:text-white">Homework</CardTitle>
                </CardHeader>
                <CardContent>
                  {searchResults.homework.length > 0 ? (
                    <div className="space-y-3">
                      {searchResults.homework.map((hw) => (
                        <motion.div
                          key={hw.id}
                          className="flex items-center justify-between p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-slate-400" />
                            <div>
                              <p className="font-medium dark:text-white">{hw.title}</p>
                              {hw.date && <p className="text-xs text-slate-500 dark:text-slate-400">{hw.date}</p>}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={`
                              ${
                                hw.status === "not-started"
                                  ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800"
                                  : hw.status === "to-submit"
                                    ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800"
                                    : "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                              }
                            `}
                          >
                            {hw.status === "not-started"
                              ? "Not Started"
                              : hw.status === "to-submit"
                                ? "To Submit"
                                : "Done"}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Search className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                      <h3 className="text-lg font-medium mb-2 dark:text-white">No homework found</h3>
                      <p className="text-slate-500 dark:text-slate-400">
                        Try searching for something else or check your spelling
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div>
            {recentSearches.length > 0 && (
              <Card className="glass-morphism mb-6">
                <CardHeader>
                  <CardTitle className="dark:text-white">Recent Searches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={() => handleRecentSearchClick(search)}
                      >
                        {search}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="glass-morphism">
              <CardHeader>
                <CardTitle className="dark:text-white">Quick Access</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto p-4 justify-start flex-col items-start"
                    onClick={() => router.push("/tasks")}
                  >
                    <div className="flex items-center w-full mb-2">
                      <FileText className="h-5 w-5 mr-2" />
                      <span className="font-medium">Tasks</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-left">
                      View and manage all your tasks
                    </p>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 justify-start flex-col items-start"
                    onClick={() => router.push("/calendar")}
                  >
                    <div className="flex items-center w-full mb-2">
                      <Calendar className="h-5 w-5 mr-2" />
                      <span className="font-medium">Calendar</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-left">
                      View your schedule and events
                    </p>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 justify-start flex-col items-start"
                    onClick={() => router.push("/homework")}
                  >
                    <div className="flex items-center w-full mb-2">
                      <FileText className="h-5 w-5 mr-2" />
                      <span className="font-medium">Homework</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-left">
                      View and manage your homework
                    </p>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 justify-start flex-col items-start"
                    onClick={() => router.push("/labs")}
                  >
                    <div className="flex items-center w-full mb-2">
                      <FileText className="h-5 w-5 mr-2" />
                      <span className="font-medium">Labs</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-left">
                      View and manage your lab assignments
                    </p>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>
    </div>
  )
}
