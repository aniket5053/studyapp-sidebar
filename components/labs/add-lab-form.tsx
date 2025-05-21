"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Calendar, Clock, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useApp } from "@/context/app-context"

export function AddLabForm({ classId }: { classId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const { getClassById } = useApp()
  const classData = getClassById(classId)

  const [lab, setLab] = useState({
    title: "",
    description: "",
    dueDate: "",
    dueTime: "",
    status: "not-started",
    files: [] as File[],
  })

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!lab.title || !lab.dueDate) {
      toast({
        title: "Missing information",
        description: "Please provide a title and due date for the lab",
        variant: "destructive",
      })
      return
    }

    // Get existing labs from localStorage
    const existingLabs = localStorage.getItem(`${classId}-labs`)
    const labs = existingLabs ? JSON.parse(existingLabs) : []

    // Create new lab
    const newLab = {
      id: `lab-${Date.now()}`,
      title: lab.title,
      description: lab.description,
      dueDate: lab.dueDate,
      dueTime: lab.dueTime,
      status: lab.status,
      dateCreated: new Date().toLocaleDateString(),
      files: lab.files.map((file) => ({
        name: file.name,
        size: `${Math.round(file.size / 1024)} KB`,
        type: file.type,
        url: URL.createObjectURL(file),
      })),
    }

    // Add to localStorage
    localStorage.setItem(`${classId}-labs`, JSON.stringify([...labs, newLab]))

    toast({
      title: "Lab added",
      description: "Your lab has been added successfully",
    })

    // Navigate back to class page
    router.push(`/class/${classId}`)
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setLab({
        ...lab,
        files: [...lab.files, ...Array.from(e.target.files)],
      })
    }
  }

  // Remove file from selection
  const removeFile = (index: number) => {
    setLab({
      ...lab,
      files: lab.files.filter((_, i) => i !== index),
    })
  }

  if (!classData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 dark:text-white">Class not found</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-4">The class you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/")}>Go back to dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/class/${classId}`)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {classData.name}
          </Button>
          <h1 className="text-3xl font-bold font-display dark:text-white">Add Lab</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Create a new lab assignment for {classData.code}: {classData.name}
          </p>
        </div>

        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle className="dark:text-white">Lab Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Lab #1: Circuit Design"
                  value={lab.title}
                  onChange={(e) => setLab({ ...lab, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Enter a description of the lab assignment..."
                  value={lab.description}
                  onChange={(e) => setLab({ ...lab, description: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Due Date
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={lab.dueDate}
                    onChange={(e) => setLab({ ...lab, dueDate: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueTime" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Due Time (Optional)
                  </Label>
                  <Input
                    id="dueTime"
                    type="time"
                    value={lab.dueTime}
                    onChange={(e) => setLab({ ...lab, dueTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  value={lab.status}
                  onChange={(e) => setLab({ ...lab, status: e.target.value })}
                >
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="files" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Attach Files (Optional)
                </Label>
                <Input id="files" type="file" multiple onChange={handleFileChange} />

                {lab.files.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <p className="text-sm font-medium dark:text-white">Selected Files:</p>
                    <div className="space-y-1">
                      {lab.files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-md"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                              <FileIcon fileType={file.type} />
                            </div>
                            <div>
                              <p className="text-sm font-medium dark:text-white">{file.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {Math.round(file.size / 1024)} KB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => router.push(`/class/${classId}`)}>
                  Cancel
                </Button>
                <Button type="submit">Add Lab</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// Helper component to display file type icon
function FileIcon({ fileType }: { fileType: string }) {
  if (fileType.includes("pdf")) {
    return <div className="text-red-500 text-xs font-medium">PDF</div>
  } else if (fileType.includes("word") || fileType.includes("document")) {
    return <div className="text-blue-500 text-xs font-medium">DOC</div>
  } else if (fileType.includes("sheet") || fileType.includes("excel")) {
    return <div className="text-green-500 text-xs font-medium">XLS</div>
  } else if (fileType.includes("image")) {
    return <div className="text-purple-500 text-xs font-medium">IMG</div>
  } else {
    return <div className="text-slate-500 text-xs font-medium">FILE</div>
  }
}
