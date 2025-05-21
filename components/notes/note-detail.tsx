"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Download, Edit, Sparkles, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useApp } from "@/context/app-context"
import ReactMarkdown from "react-markdown"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import "katex/dist/katex.min.css"

export function NoteDetail({ classId, noteId }: { classId: string; noteId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const { getClassById } = useApp()
  const classData = getClassById(classId)

  const [note, setNote] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAiSummarizing, setIsAiSummarizing] = useState(false)

  // Load note data
  useEffect(() => {
    const loadNote = () => {
      setIsLoading(true)

      // Get notes from localStorage
      const storedNotes = localStorage.getItem(`${classId}-notes`)
      if (storedNotes) {
        const notes = JSON.parse(storedNotes)
        const foundNote = notes.find((n: any) => n.id === noteId)
        if (foundNote) {
          setNote(foundNote)
        } else {
          toast({
            title: "Note not found",
            description: "The note you're looking for doesn't exist",
            variant: "destructive",
          })
          router.push(`/class/${classId}`)
        }
      } else {
        toast({
          title: "No notes found",
          description: "There are no notes for this class",
          variant: "destructive",
        })
        router.push(`/class/${classId}`)
      }

      setIsLoading(false)
    }

    loadNote()
  }, [classId, noteId, router, toast])

  // Handle note deletion
  const handleDeleteNote = () => {
    // Get notes from localStorage
    const storedNotes = localStorage.getItem(`${classId}-notes`)
    if (storedNotes) {
      const notes = JSON.parse(storedNotes)
      const updatedNotes = notes.filter((n: any) => n.id !== noteId)
      localStorage.setItem(`${classId}-notes`, JSON.stringify(updatedNotes))

      toast({
        title: "Note deleted",
        description: "Your note has been deleted successfully",
      })

      router.push(`/class/${classId}`)
    }
  }

  // Handle AI summarization
  const handleAiSummarize = () => {
    if (!note) return

    setIsAiSummarizing(true)

    // Simulate AI processing
    setTimeout(() => {
      // Get notes from localStorage
      const storedNotes = localStorage.getItem(`${classId}-notes`)
      if (storedNotes) {
        const notes = JSON.parse(storedNotes)

        // Create AI summary
        const summary = {
          id: `summary-${Date.now()}`,
          title: `AI Summary: ${note.title}`,
          content:
            "This AI-generated summary provides an overview of the key concepts covered in the note. The material includes important definitions, theoretical frameworks, and practical applications. Several examples were provided to illustrate the main points, and connections were made to previous topics.",
          type: "ai-summary",
          dateCreated: new Date().toLocaleDateString(),
        }

        // Add summary to notes
        localStorage.setItem(`${classId}-notes`, JSON.stringify([summary, ...notes]))

        setIsAiSummarizing(false)

        toast({
          title: "AI Summary generated",
          description: "Your note has been summarized by AI",
        })

        router.push(`/class/${classId}/note/${summary.id}`)
      }
    }, 2000)
  }

  // Handle note editing
  const handleEditNote = () => {
    router.push(`/class/${classId}/edit-note/${noteId}`)
  }

  // Handle note download
  const handleDownloadNote = () => {
    if (!note) return

    const content = note.type === "markdown" ? note.content : note.content
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${note.title}.${note.type === "latex" ? "tex" : "md"}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Note downloaded",
      description: `${note.title} has been downloaded successfully`,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400">Loading note...</p>
        </div>
      </div>
    )
  }

  if (!note || !classData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 dark:text-white">Note not found</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-4">The note you're looking for doesn't exist.</p>
          <Button onClick={() => router.push(`/class/${classId}`)}>Go back to class</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/class/${classId}`)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {classData.name}
          </Button>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold font-display dark:text-white">{note.title}</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadNote}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              {note.type !== "ai-summary" && (
                <Button variant="outline" size="sm" onClick={handleEditNote}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Created: {note.dateCreated}
              {note.lastEdited && note.dateCreated !== note.lastEdited ? ` • Edited: ${note.lastEdited}` : ""}
            </p>
            <span className="text-sm text-slate-300 dark:text-slate-600">•</span>
            <p className="text-sm font-medium text-primary">
              {note.type === "markdown" ? "Markdown" : note.type === "latex" ? "LaTeX" : "AI Summary"}
            </p>
          </div>
        </div>

        <Card className="glass-morphism mb-6">
          <CardContent className="p-6">
            <div className="prose dark:prose-invert max-w-none">
              {note.type === "markdown" ? (
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} className="break-words">
                  {note.content}
                </ReactMarkdown>
              ) : note.type === "latex" ? (
                <div className="font-mono whitespace-pre-wrap text-sm">{note.content}</div>
              ) : (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <p className="font-medium text-green-800 dark:text-green-300">AI Generated Summary</p>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{note.content}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {note.type !== "ai-summary" && (
          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle className="dark:text-white">AI Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Button onClick={handleAiSummarize} disabled={isAiSummarizing}>
                  {isAiSummarizing ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Summarizing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate AI Summary
                    </>
                  )}
                </Button>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Let AI create a concise summary of this note
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteNote}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
