"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FileText, Plus, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useApp } from "@/context/app-context"

// Mock notes
const mockNotes = [
  {
    id: "note1",
    title: "CMPE 260: Lecture Notes - Week 1",
    content:
      "Introduction to Digital Logic Design\n- Boolean algebra basics\n- Logic gates: AND, OR, NOT, XOR\n- Truth tables\n- Karnaugh maps for minimization",
    date: "September 5, 2024",
    classId: "cs",
    tags: ["lecture", "important"],
  },
  {
    id: "note2",
    title: "MATH 101: Calculus Formulas",
    content:
      "Key Calculus Formulas:\n- Derivative of x^n = nx^(n-1)\n- Derivative of sin(x) = cos(x)\n- Derivative of e^x = e^x\n- Integral of x^n = x^(n+1)/(n+1) + C (where n ≠ -1)",
    date: "September 7, 2024",
    classId: "math",
    tags: ["formulas", "reference"],
  },
  {
    id: "note3",
    title: "BIO 110: Cell Structure Diagram",
    content:
      "Cell Structure Components:\n1. Cell membrane - selectively permeable barrier\n2. Nucleus - contains genetic material\n3. Mitochondria - powerhouse of the cell\n4. Endoplasmic reticulum - protein synthesis\n5. Golgi apparatus - protein packaging",
    date: "September 10, 2024",
    classId: "bio",
    tags: ["diagram", "study guide"],
  },
]

export function NotesView() {
  const [notes, setNotes] = useState(mockNotes)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    classId: "",
    tags: "",
  })
  const { classes } = useApp()

  // Create new note
  const createNote = () => {
    if (!newNote.title || !newNote.content) return

    const note = {
      id: `note-${Date.now()}`,
      title: newNote.title,
      content: newNote.content,
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      classId: newNote.classId,
      tags: newNote.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
    }

    setNotes([note, ...notes])
    setIsCreateOpen(false)
    setNewNote({
      title: "",
      content: "",
      classId: "",
      tags: "",
    })
  }

  // Filter notes based on search query
  const filteredNotes = notes.filter((note) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query) ||
      note.tags.some((tag) => tag.toLowerCase().includes(query)) ||
      (note.classId &&
        classes
          .find((c) => c.id === note.classId)
          ?.name.toLowerCase()
          .includes(query))
    )
  })

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold font-display dark:text-white">Notes</h1>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Note
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Note</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter note title"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class">Class (Optional)</Label>
                  <select
                    id="class"
                    className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    value={newNote.classId}
                    onChange={(e) => setNewNote({ ...newNote, classId: e.target.value })}
                  >
                    <option value="">Select a class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Enter your note content here..."
                    className="min-h-[200px]"
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    placeholder="e.g., lecture, important, study guide"
                    value={newNote.tags}
                    onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
                  />
                </div>
                <Button onClick={createNote} className="w-full dark:text-white">
                  Create Note
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative mb-6">
          <Input
            className="pl-10 glass-morphism"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
        </div>

        {filteredNotes.length > 0 ? (
          <div className="space-y-6">
            {filteredNotes.map((note) => (
              <Card key={note.id} className="glass-morphism">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <FileText className="h-5 w-5 text-slate-400" />
                    {note.title}
                  </CardTitle>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500 dark:text-slate-400">{note.date}</p>
                    {note.classId && (
                      <p
                        className="text-sm font-medium"
                        style={{ color: classes.find((c) => c.id === note.classId)?.color }}
                      >
                        {classes.find((c) => c.id === note.classId)?.name}
                      </p>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                    {note.content}
                  </pre>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {note.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-end mt-4">
                    <Button variant="outline" size="sm" className="dark:text-white">
                      <FileText className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass-morphism">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-medium mb-2 dark:text-white">No notes found</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                {searchQuery ? "No notes match your search query" : "Create your first note to get started"}
              </p>
              <Button onClick={() => setIsCreateOpen(true)} className="dark:text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Note
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  )
}
