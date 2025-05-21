import { StudyAppSidebar } from "@/components/sidebar/study-app-sidebar"
import { TasksBoard } from "@/components/tasks/tasks-board"

export default function TasksPage() {
  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <StudyAppSidebar />
      <main className="flex-1 overflow-auto">
        <TasksBoard />
      </main>
    </div>
  )
}
