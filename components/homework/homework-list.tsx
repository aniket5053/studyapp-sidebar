"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FileText, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { homeworkItems } from "@/lib/data"

export function HomeworkList() {
  const router = useRouter()

  const handleHomeworkClick = (id: string) => {
    router.push(`/homework/${id}`)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <motion.h1
          className="text-4xl font-bold font-display"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          homework
        </motion.h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-full">
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-100 shadow-sm p-6">
        <div className="space-y-4">
          {homeworkItems.map((hw) => (
            <motion.div
              key={hw.id}
              className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg cursor-pointer"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleHomeworkClick(hw.id)}
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-slate-400" />
                <span className="font-medium">{hw.name}</span>
              </div>
              <span className="text-sm text-slate-500">{hw.dueDate}</span>
            </motion.div>
          ))}
          <Button variant="ghost" size="sm" className="w-full justify-start text-slate-500">
            <Plus className="h-4 w-4 mr-2" />
            New page
          </Button>
        </div>
      </div>
    </div>
  )
}
