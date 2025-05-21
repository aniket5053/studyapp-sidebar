"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Calendar, FileText, MoreHorizontal, Plus, Upload } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { homeworkDetail } from "@/lib/data"

export function HomeworkDetail({ id }: { id: string }) {
  const [comment, setComment] = useState("")
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const router = useRouter()

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (comment.trim()) {
      // In a real app, this would add the comment to a database
      setComment("")
      // Show a toast notification
      alert("Comment added!")
    }
  }

  const handleFileUpload = () => {
    // In a real app, this would upload the file
    setIsUploadOpen(false)
    // Show a toast notification
    alert("File uploaded!")
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl border border-slate-100 shadow-sm p-6"
      >
        <div className="flex justify-between items-start mb-8">
          <h1 className="text-4xl font-bold font-display">{homeworkDetail.title}</h1>
          <div className="flex gap-2">
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Completed Homework</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="file">Select File</Label>
                    <Input id="file" type="file" />
                  </div>
                  <Button onClick={handleFileUpload} className="w-full">
                    Upload
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium">Due Date</p>
                <p className="text-sm text-slate-500">{homeworkDetail.dueDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-5 w-5 flex items-center">
                <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-200 border-0">{homeworkDetail.subject}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Subject</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-5 w-5 flex items-center justify-center text-slate-400">
                <span className="text-lg">•</span>
              </div>
              <div>
                <p className="text-sm font-medium">Lecture Week</p>
                <p className="text-sm text-slate-500">{homeworkDetail.lectureWeek || "Empty"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-5 w-5 flex items-center justify-center text-slate-400">
                <span className="text-lg">•</span>
              </div>
              <div>
                <p className="text-sm font-medium">topics</p>
                <p className="text-sm text-slate-500">{homeworkDetail.topics || "Empty"}</p>
              </div>
            </div>

            <Button variant="outline" size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Add a property
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Comments</p>
              <form onSubmit={handleAddComment} className="flex gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-primary text-white text-xs">A</AvatarFallback>
                </Avatar>
                <Input
                  placeholder="Add a comment..."
                  className="h-8 text-sm"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <Button type="submit" size="sm" className="h-8">
                  Post
                </Button>
              </form>
            </div>
          </div>
        </div>

        <Card className="mb-4">
          <CardHeader className="bg-rose-100 text-rose-800">
            <CardTitle>Homework PDF</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {homeworkDetail.files
              .filter((file) => file.type === "homework")
              .map((file) => (
                <div key={file.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-md cursor-pointer">
                  <FileText className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-slate-500">{file.size}</p>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-rose-100 text-rose-800">
            <CardTitle>Completed Homework</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {homeworkDetail.files
              .filter((file) => file.type === "completed")
              .map((file) => (
                <div key={file.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-md cursor-pointer">
                  <FileText className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-slate-500">{file.size}</p>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
