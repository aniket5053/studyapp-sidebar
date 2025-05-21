"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useApp } from "@/context/app-context"

// Predefined color options
const colorOptions = [
  "#FFD6E0", // Pink
  "#C7CEEA", // Blue
  "#B5EAD7", // Green
  "#FFEF9F", // Yellow
  "#E2F0CB", // Light Green
  "#F0E6EF", // Purple
  "#FEC8D8", // Light Pink
  "#D4F0F0", // Teal
]

export function AddClassForm() {
  const [className, setClassName] = useState("")
  const [classCode, setClassCode] = useState("")
  const [selectedColor, setSelectedColor] = useState(colorOptions[0])
  const { addClassWorkspace } = useApp()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (className && classCode) {
      // Create new class
      addClassWorkspace({
        name: className,
        code: classCode,
        color: selectedColor,
        initial: className.charAt(0),
        tasks: 0,
        files: [],
        assignments: [],
      })

      // Navigate back to dashboard
      router.push("/")
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl border border-slate-100 shadow-sm p-6"
      >
        <h1 className="text-3xl font-bold font-display mb-6">Add New Class</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="class-name">Class Name</Label>
            <Input
              id="class-name"
              placeholder="e.g., Mathematics"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="class-code">Class Code</Label>
            <Input
              id="class-code"
              placeholder="e.g., MATH 101"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Class Color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={selectedColor}
                onChange={e => setSelectedColor(e.target.value)}
                className="w-10 h-10 rounded-full border-2 border-slate-200 cursor-pointer"
                aria-label="Pick class color"
                style={{ background: selectedColor }}
              />
              <span
                className="px-3 py-1 rounded-full font-semibold"
                style={{ background: selectedColor, color: '#fff', border: '1px solid #eee' }}
              >
                Preview
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit">Create Class</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/")}>
              Cancel
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
