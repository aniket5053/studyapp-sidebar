"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FileText, MoreHorizontal, Plus, Upload, Beaker, Sparkles, File, PenTool, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useApp } from "@/context/app-context"
import { useToast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function ClassDetail({ id }: { id: string }) {
  const { getClassById, setActiveClassId, updateClass } = useApp()
  const classData = getClassById(id)
  const router = useRouter()
  const { toast } = useToast()

  // State for file uploads and notes
  const [isAddFileOpen, setIsAddFileOpen] = useState(false)
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false)
  const [isAiSummarizing, setIsAiSummarizing] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    type: "markdown", // markdown or latex
  })
  const [notes, setNotes] = useState<any[]>([])
  const [files, setFiles] = useState<any[]>([])
  const [homeworks, setHomeworks] = useState<any[]>([])
  const [labs, setLabs] = useState<any[]>([])
  const [isEditClassOpen, setIsEditClassOpen] = useState(false)
  const [editClass, setEditClass] = useState({
    name: classData.name,
    code: classData.code,
    color: classData.color
  })

  // Set active class when component mounts
  useEffect(() => {
    if (id) {
      setActiveClassId(id)
    }

    // Load data from localStorage if available
    const storedNotes = localStorage.getItem(`${id}-notes`)
    const storedFiles = localStorage.getItem(`${id}-files`)
    const storedHomeworks = localStorage.getItem(`${id}-homeworks`)
    const storedLabs = localStorage.getItem(`${id}-labs`)

    if (storedNotes) setNotes(JSON.parse(storedNotes))
    if (storedFiles) setFiles(JSON.parse(storedFiles))
    if (storedHomeworks) setHomeworks(JSON.parse(storedHomeworks))
    if (storedLabs) setLabs(JSON.parse(storedLabs))
  }, [id, setActiveClassId])

  // Save data to localStorage when it changes
  useEffect(() => {
    if (id) {
      localStorage.setItem(`${id}-notes`, JSON.stringify(notes))
      localStorage.setItem(`${id}-files`, JSON.stringify(files))
      localStorage.setItem(`${id}-homeworks`, JSON.stringify(homeworks))
      localStorage.setItem(`${id}-labs`, JSON.stringify(labs))
    }
  }, [id, notes, files, homeworks, labs])

  // Handle file upload
  const handleFileUpload = () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      })
      return
    }

    const newFile = {
      id: `file-${Date.now()}`,
      name: selectedFile.name,
      size: `${Math.round(selectedFile.size / 1024)} KB`,
      type: selectedFile.type.split("/")[1] || "document",
      dateUploaded: new Date().toLocaleDateString(),
      url: URL.createObjectURL(selectedFile),
    }

    setFiles([...files, newFile])
    setSelectedFile(null)
    setIsAddFileOpen(false)

    toast({
      title: "File uploaded",
      description: `${selectedFile.name} has been uploaded successfully.`,
    })
  }

  // Handle note creation
  const handleCreateNote = () => {
    if (!newNote.title || !newNote.content) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and content for your note",
        variant: "destructive",
      })
      return
    }

    const note = {
      id: `note-${Date.now()}`,
      title: newNote.title,
      content: newNote.content,
      type: newNote.type,
      dateCreated: new Date().toLocaleDateString(),
      lastEdited: new Date().toLocaleDateString(),
    }

    setNotes([...notes, note])
    setNewNote({
      title: "",
      content: "",
      type: "markdown",
    })
    setIsAddNoteOpen(false)

    toast({
      title: "Note created",
      description: "Your note has been created successfully.",
    })
  }

  // Handle AI summarization
  const handleAiSummarize = (content: string) => {
    setIsAiSummarizing(true)

    // Simulate AI processing
    setTimeout(() => {
      const summary = {
        id: `summary-${Date.now()}`,
        title: `AI Summary: ${new Date().toLocaleDateString()}`,
        content:
          "This AI-generated summary provides an overview of the key concepts covered in the document. The material includes important definitions, theoretical frameworks, and practical applications. Several examples were provided to illustrate the main points, and connections were made to previous topics.",
        type: "ai-summary",
        dateCreated: new Date().toLocaleDateString(),
      }

      setNotes([summary, ...notes])
      setIsAiSummarizing(false)

      toast({
        title: "AI Summary generated",
        description: "Your content has been summarized by AI.",
      })
    }, 2000)
  }

  // Handle homework creation
  const handleAddHomework = () => {
    router.push(`/class/${id}/add-homework`)
  }

  // Handle lab creation
  const handleAddLab = () => {
    router.push(`/class/${id}/add-lab`)
  }

  // Redirect if class not found
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
    <div className="max-w-5xl mx-auto p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="h-48 rounded-xl mb-6" style={{ backgroundColor: classData.color }}>
          <div className="flex justify-end p-4">
            <Button variant="ghost" className="text-white hover:bg-white/20">
              Share
            </Button>
            <Button variant="ghost" className="text-white hover:bg-white/20">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold font-display mb-2 dark:text-white">
            {classData.code}: {classData.name}
          </h1>
          <Button variant="outline" size="sm" className="ml-2" onClick={() => setIsEditClassOpen(true)}>
            Edit Class
          </Button>
        </div>

        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-1 rounded-full mb-6">
            <TabsTrigger
              value="overview"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="homework"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Homework
            </TabsTrigger>
            <TabsTrigger
              value="notes"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Notes
            </TabsTrigger>
            <TabsTrigger
              value="labs"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Labs
            </TabsTrigger>
            <TabsTrigger
              value="files"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Files
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-0 space-y-6">
            <Card className="glass-morphism">
              <CardHeader>
                <CardTitle className="dark:text-white">Class Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4 dark:text-white">Quick Stats</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Homework</p>
                          <p className="text-lg font-medium dark:text-white">{homeworks.length} assignments</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                          <Beaker className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Labs</p>
                          <p className="text-lg font-medium dark:text-white">{labs.length} labs</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                          <PenTool className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Notes</p>
                          <p className="text-lg font-medium dark:text-white">{notes.length} notes</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                          <File className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Files</p>
                          <p className="text-lg font-medium dark:text-white">{files.length} files</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4 dark:text-white">Upcoming Deadlines</h3>
                    {homeworks.length > 0 ? (
                      <div className="space-y-3">
                        {homeworks.slice(0, 3).map((hw) => (
                          <div key={hw.id} className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                            <p className="font-medium dark:text-white">{hw.title}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{hw.dueDate}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                        <p className="text-slate-500 dark:text-slate-400">No upcoming deadlines</p>
                      </div>
                    )}

                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-4 dark:text-white">Quick Actions</h3>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => setIsAddNoteOpen(true)}>
                          <PenTool className="h-4 w-4 mr-2" />
                          New Note
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setIsAddFileOpen(true)}>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload File
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleAddHomework}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Homework
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-morphism">
              <CardHeader>
                <CardTitle className="dark:text-white">AI Assistant</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-400 to-indigo-400 flex items-center justify-center mb-4">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-medium mb-2 dark:text-white">AI Study Assistant</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
                    Upload your lecture notes, PDFs, or write in markdown/LaTeX, and let AI help you summarize and
                    understand the material.
                  </p>
                  <div className="flex gap-3">
                    <Button onClick={() => setIsAddNoteOpen(true)}>
                      <PenTool className="h-4 w-4 mr-2" />
                      Create Note
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddFileOpen(true)}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Content
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Homework Tab */}
          <TabsContent value="homework" className="mt-0">
            <Card className="glass-morphism">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="dark:text-white">Homework Assignments</CardTitle>
                <Button onClick={handleAddHomework}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Homework
                </Button>
              </CardHeader>
              <CardContent>
                {homeworks.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[300px]">Title</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {homeworks.map((hw) => (
                        <TableRow key={hw.id} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                          <TableCell className="font-medium dark:text-white">{hw.title}</TableCell>
                          <TableCell className="dark:text-slate-300">{hw.dueDate}</TableCell>
                          <TableCell>
                            <Badge
                              className={`${
                                hw.status === "not-started"
                                  ? "bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-300"
                                  : hw.status === "in-progress"
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
                                    : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                              } hover:bg-opacity-80 border-0`}
                            >
                              {hw.status === "not-started"
                                ? "Not Started"
                                : hw.status === "in-progress"
                                  ? "In Progress"
                                  : "Completed"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/class/${id}/homework/${hw.id}`)}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium mb-2 dark:text-white">No homework assignments yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">
                      Add your first homework assignment to get started
                    </p>
                    <Button onClick={handleAddHomework}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Homework
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="mt-0">
            <Card className="glass-morphism">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="dark:text-white">Notes</CardTitle>
                <div className="flex gap-2">
                  <Button onClick={() => setIsAddNoteOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Note
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => handleAiSummarize("Sample content for AI to summarize")}
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          AI Summarize
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Generate an AI summary of selected notes</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>
              <CardContent>
                {notes.length > 0 ? (
                  <div className="space-y-4">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                        onClick={() => router.push(`/class/${id}/note/${note.id}`)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium dark:text-white">{note.title}</h3>
                          <Badge
                            variant="outline"
                            className={`${
                              note.type === "markdown"
                                ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                                : note.type === "latex"
                                  ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800"
                                  : "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                            }`}
                          >
                            {note.type === "markdown" ? "Markdown" : note.type === "latex" ? "LaTeX" : "AI Summary"}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{note.content}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-slate-400 dark:text-slate-500">
                            Created: {note.dateCreated}
                            {note.lastEdited && note.dateCreated !== note.lastEdited
                              ? ` • Edited: ${note.lastEdited}`
                              : ""}
                          </p>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <PenTool className="h-3.5 w-3.5" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <Download className="h-3.5 w-3.5" />
                              <span className="sr-only">Download</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <PenTool className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium mb-2 dark:text-white">No notes yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">
                      Create your first note in Markdown or LaTeX
                    </p>
                    <Button onClick={() => setIsAddNoteOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Note
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Labs Tab */}
          <TabsContent value="labs" className="mt-0">
            <Card className="glass-morphism">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="dark:text-white">Labs</CardTitle>
                <Button onClick={handleAddLab}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lab
                </Button>
              </CardHeader>
              <CardContent>
                {labs.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[300px]">Title</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {labs.map((lab) => (
                        <TableRow key={lab.id} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                          <TableCell className="font-medium dark:text-white">{lab.title}</TableCell>
                          <TableCell className="dark:text-slate-300">{lab.dueDate}</TableCell>
                          <TableCell>
                            <Badge
                              className={`${
                                lab.status === "not-started"
                                  ? "bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-300"
                                  : lab.status === "in-progress"
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
                                    : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                              } hover:bg-opacity-80 border-0`}
                            >
                              {lab.status === "not-started"
                                ? "Not Started"
                                : lab.status === "in-progress"
                                  ? "In Progress"
                                  : "Completed"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => router.push(`/class/${id}/lab/${lab.id}`)}>
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Beaker className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium mb-2 dark:text-white">No labs yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">Add your first lab to get started</p>
                    <Button onClick={handleAddLab}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Lab
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="mt-0 space-y-6">
            <div className="flex justify-end mb-4">
              <Dialog open={isAddFileOpen} onOpenChange={setIsAddFileOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload File</DialogTitle>
                    <DialogDescription>
                      Upload PDF, Word documents, images, or other files for this class.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="file">Select File</Label>
                      <Input
                        id="file"
                        type="file"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setSelectedFile(e.target.files[0])
                          }
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-6">
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                          Drag and drop files here or click to browse
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          Supports PDF, DOCX, PPTX, JPG, PNG, and more
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddFileOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleFileUpload}>Upload</Button>
                    </DialogFooter>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="glass-morphism">
              <CardHeader>
                <CardTitle className="dark:text-white">All Files</CardTitle>
              </CardHeader>
              <CardContent>
                {files.length > 0 ? (
                  <div className="space-y-2">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium dark:text-white">{file.name}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-slate-500 dark:text-slate-400">{file.size}</p>
                              <span className="text-xs text-slate-300 dark:text-slate-600">•</span>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{file.dateUploaded}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <a href={file.url} target="_blank" rel="noopener noreferrer">
                              View
                            </a>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={file.url} download={file.name}>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <File className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium mb-2 dark:text-white">No files uploaded yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">
                      Upload PDFs, documents, or other files for this class
                    </p>
                    <Button onClick={() => setIsAddFileOpen(true)}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Create Note Dialog */}
      <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Create New Note</DialogTitle>
            <DialogDescription>Create a new note using Markdown or LaTeX formatting.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="note-title">Title</Label>
              <Input
                id="note-title"
                placeholder="Enter note title"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="note-content">Content</Label>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="note-type" className="text-sm">
                    Format:
                  </Label>
                  <select
                    id="note-type"
                    className="text-sm p-1 rounded border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                    value={newNote.type}
                    onChange={(e) => setNewNote({ ...newNote, type: e.target.value as "markdown" | "latex" })}
                  >
                    <option value="markdown">Markdown</option>
                    <option value="latex">LaTeX</option>
                  </select>
                </div>
              </div>
              <Textarea
                id="note-content"
                placeholder={
                  newNote.type === "markdown"
                    ? "# Heading\n\nWrite your notes in **Markdown** format.\n\n- List item 1\n- List item 2\n\n```\ncode block\n```"
                    : "\\documentclass{article}\n\\begin{document}\n\\section{Introduction}\nWrite your notes in $\\LaTeX$ format.\n\\end{document}"
                }
                className="min-h-[300px] font-mono"
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                AI can summarize your notes after you create them.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddNoteOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateNote}>Create Note</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Class Dialog */}
      <Dialog open={isEditClassOpen} onOpenChange={setIsEditClassOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
            <DialogDescription>Edit class details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-class-name">Class Name</Label>
              <Input
                id="edit-class-name"
                value={editClass.name}
                onChange={e => setEditClass({ ...editClass, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-class-code">Class Code</Label>
              <Input
                id="edit-class-code"
                value={editClass.code}
                onChange={e => setEditClass({ ...editClass, code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Class Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={editClass.color}
                  onChange={e => setEditClass({ ...editClass, color: e.target.value })}
                  className="w-10 h-10 rounded-full border-2 border-slate-200 cursor-pointer"
                  aria-label="Pick class color"
                  style={{ background: editClass.color }}
                />
                <span
                  className="px-3 py-1 rounded-full font-semibold"
                  style={{ background: editClass.color, color: '#fff', border: '1px solid #eee' }}
                >
                  Preview
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditClassOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              // Save logic: update class in context/store
              updateClass(classData.id, editClass)
              setIsEditClassOpen(false)
            }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
