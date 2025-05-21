"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FileText, Plus, Sparkles, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useApp } from "@/context/app-context"

// Mock AI summaries
const mockSummaries = [
  {
    id: "summary1",
    title: "CMPE 260: Digital Logic Design",
    content:
      "This lecture covered the fundamentals of Boolean algebra and logic gates. Key concepts included truth tables, minimization techniques using Karnaugh maps, and the implementation of combinational logic circuits. The professor emphasized the importance of understanding how to convert between different representations of Boolean functions.",
    date: "September 5, 2024",
    class: "Computer Science",
  },
  {
    id: "summary2",
    title: "MATH 101: Calculus Limits",
    content:
      "Today's lecture focused on the concept of limits in calculus. We explored the formal epsilon-delta definition and various techniques for evaluating limits, including direct substitution, factoring, and the squeeze theorem. The professor also introduced the concept of one-sided limits and continuity.",
    date: "September 7, 2024",
    class: "Mathematics",
  },
  {
    id: "summary3",
    title: "BIO 110: Cell Structure",
    content:
      "This lecture provided an overview of eukaryotic cell structure and function. We discussed the various organelles including the nucleus, mitochondria, endoplasmic reticulum, and Golgi apparatus. The professor emphasized how the structure of each organelle relates to its specific function within the cell.",
    date: "September 10, 2024",
    class: "Biology",
  },
]

export function AISummariesView() {
  const [summaries, setSummaries] = useState(mockSummaries)
  const [isGenerateOpen, setIsGenerateOpen] = useState(false)
  const [newSummary, setNewSummary] = useState({
    title: "",
    content: "",
    classId: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedText, setUploadedText] = useState("")
  const { classes } = useApp()

  // Generate AI summary
  const generateSummary = () => {
    if (!uploadedText.trim() || !newSummary.classId) return

    setIsLoading(true)

    // Simulate AI processing
    setTimeout(() => {
      const generatedSummary = {
        id: `summary-${Date.now()}`,
        title: newSummary.title || `${classes.find((c) => c.id === newSummary.classId)?.name}: Lecture Summary`,
        content:
          "This AI-generated summary provides an overview of the key concepts covered in the lecture. The material includes important definitions, theoretical frameworks, and practical applications. Several examples were provided to illustrate the main points, and connections were made to previous topics in the course.",
        date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        class: classes.find((c) => c.id === newSummary.classId)?.name || "",
      }

      setSummaries([generatedSummary, ...summaries])
      setIsLoading(false)
      setIsGenerateOpen(false)
      setNewSummary({
        title: "",
        content: "",
        classId: "",
      })
      setUploadedText("")
    }, 2000)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold font-display dark:text-white">AI Summaries</h1>
          <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Summary
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Generate AI Summary</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title (Optional)</Label>
                  <Input
                    id="title"
                    placeholder="Enter a title for your summary"
                    value={newSummary.title}
                    onChange={(e) => setNewSummary({ ...newSummary, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class">Class</Label>
                  <select
                    id="class"
                    className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    value={newSummary.classId}
                    onChange={(e) => setNewSummary({ ...newSummary, classId: e.target.value })}
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
                  <Label htmlFor="content">Lecture Notes or Recording Transcript</Label>
                  <Textarea
                    id="content"
                    placeholder="Paste your lecture notes or recording transcript here..."
                    className="min-h-[200px]"
                    value={uploadedText}
                    onChange={(e) => setUploadedText(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                      Upload a file or paste your content above
                    </p>
                    <Button variant="outline" size="sm">
                      Choose File
                    </Button>
                  </div>
                </div>
                <Button onClick={generateSummary} className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Summary
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {summaries.length > 0 ? (
          <div className="space-y-6">
            {summaries.map((summary) => (
              <Card key={summary.id} className="glass-morphism">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <Sparkles className="h-5 w-5 text-primary" />
                    {summary.title}
                  </CardTitle>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500 dark:text-slate-400">{summary.date}</p>
                    <p className="text-sm font-medium text-primary">{summary.class}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{summary.content}</p>
                  <div className="flex justify-end mt-4">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Save to Notes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass-morphism">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Sparkles className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-medium mb-2 dark:text-white">No AI Summaries Yet</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                Generate your first AI summary by uploading lecture notes or a recording transcript
              </p>
              <Button onClick={() => setIsGenerateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Summary
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  )
}
